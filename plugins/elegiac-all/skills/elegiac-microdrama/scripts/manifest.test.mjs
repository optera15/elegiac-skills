#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBrief } from './build-edit-handoff.mjs';
import { validatePlan, PERFORMANCE_FIELDS } from './check-scenelet-plan.mjs';
import { buildRequest } from './build-scenelet-request.mjs';
import { createHash } from 'node:crypto';
import { loadAndValidateManifest } from './validate-episode-manifest.mjs';

const root = await mkdtemp(join(tmpdir(), 'elegiac-microdrama-'));

try {
  await mkdir(join(root, 'assets/video/s01e01'), { recursive: true });
  await mkdir(join(root, 'episodes/s01e01'), { recursive: true });
  await mkdir(join(root, 'brand'), { recursive: true });
  await writeFile(join(root, 'brand/sting.wav'), 'sting');
  await writeFile(join(root, 'assets/video/s01e01/a.mp4'), 'clip-a');
  await writeFile(join(root, 'assets/video/s01e01/b.mp4'), 'clip-b');
  await writeFile(join(root, 'episodes/s01e01/captions.srt'), '1\n00:00:00,000 --> 00:00:02,000\nLook.\n');

  const manifestPath = join(root, 'episodes/s01e01/edit-manifest.json');
  const manifest = {
    version: 1,
    productionId: 'prod-1',
    boardId: 'board-1',
    show: 'The Second Phone',
    season: 1,
    episode: 1,
    episodeId: 'S01E01',
    revision: 1,
    collaboration: { profile: 'fast-track', departments: {} },
    outputProfile: 'master-1080',
    canvas: { width: 1080, height: 1920, fps: 30 },
    targetDurationSeconds: 75,
    durationToleranceSeconds: 0,
    clips: [
      {
        shotId: 'S01E01-010', sourceOrigin: 'elegiac', sourceAssetId: 'asset-a', sourceLabel: 'Hook',
        localPath: 'assets/video/s01e01/a.mp4', inSeconds: 0, outSeconds: 40, transitionOutSeconds: 1,
        role: 'cold_hook', approved: true,
      },
      {
        shotId: 'S01E01-020', sourceOrigin: 'user', sourceLabel: 'User-supplied reveal',
        localPath: 'assets/video/s01e01/b.mp4', inSeconds: 0, outSeconds: 36, transitionOutSeconds: 0,
        role: 'cliffhanger', approved: true,
      },
    ],
    audio: { dialogue: [], music: [], sfx: [] },
    captions: { language: 'en', sidecar: 'episodes/s01e01/captions.srt', burnIn: true },
    graphics: { coldOpenTitle: null, episodeBug: 'S1 · EP1', endCard: 'Next episode' },
    branding: {
      seriesMark: { status: 'typographic', title: 'THE SECOND PHONE', fontFamily: 'Bebas Neue' },
      sting: {
        status: 'provided', sourceOrigin: 'elegiac', sourceAssetId: 'asset-sting', sourceLabel: 'Brand sting',
        localPath: 'brand/sting.wav', durationSeconds: 1.1, approved: true,
      },
      opening: { mode: 'splash', durationSeconds: 1 },
      endCard: { mode: 'mark-and-sting', blackoutSeconds: 0.25, durationSeconds: 1, nextText: 'Next: Episode 2' },
      credits: { mode: 'none' },
    },
    story: { hook: 'A dead account likes a post.', turn: 'The phone is not his.', cliffhanger: 'Her phone rings.' },
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const first = await loadAndValidateManifest(manifestPath, { root, writeHashes: true });
  assert.deepEqual(first.errors, []);
  assert.equal(first.summary.editDurationSeconds, 75);
  assert.equal(first.summary.bookendSeconds, 2.25);
  assert.equal(first.summary.masterDurationSeconds, 77.25);
  assert.equal(first.summary.hashesWritten, 4);

  const persisted = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.match(persisted.clips[0].sha256, /^[a-f0-9]{64}$/);
  assert.match(persisted.captions.sidecarSha256, /^[a-f0-9]{64}$/);
  assert.match(persisted.branding.sting.sha256, /^[a-f0-9]{64}$/);

  const second = await loadAndValidateManifest(manifestPath, { root });
  assert.deepEqual(second.errors, []);
  const brief = renderBrief(second.manifest, { root, manifestPath: 'episodes/s01e01/edit-manifest.json' });
  assert.match(brief, /workflow: general-video/);
  assert.match(brief, /flow: automation/);
  assert.match(brief, /aspect: 1080x1920/);
  assert.match(brief, /length: 77.25s/);
  assert.match(brief, /No render-time network requests/);
  assert.match(brief, /Brand punctuation/);
  assert.match(brief, /typographic lockup: render “THE SECOND PHONE” in Bebas Neue/);
  assert.match(brief, /sonic sting 1.1s/);
  assert.match(brief, /1s series-mark splash/);
  assert.match(brief, /hard cut to black for 0.25s → 1s end card with the series mark; the sting starts on the cut to black/);
  assert.match(brief, /The cliffhanger is sacred/);
  assert.match(brief, /brand\/sting.wav — sonic sting/);

  const hyperframesRoot = join(root, 'post/hyperframes');
  const outputPath = join(hyperframesRoot, 'BRIEF.md');
  await mkdir(hyperframesRoot, { recursive: true });
  await writeFile(join(hyperframesRoot, 'hyperframes.json'), '{}\n');
  execFileSync(process.execPath, [
    join(dirname(fileURLToPath(import.meta.url)), 'build-edit-handoff.mjs'),
    manifestPath,
    '--root', root,
    '--output', outputPath,
  ]);
  assert.match(await readFile(outputPath, 'utf8'), /workflow: general-video/);

  // Branding gate: a manifest without the package fails closed.
  const unbranded = structuredClone(persisted);
  delete unbranded.branding;
  await writeFile(manifestPath, `${JSON.stringify(unbranded, null, 2)}\n`);
  const missingBranding = await loadAndValidateManifest(manifestPath, { root });
  assert(missingBranding.errors.some((error) => error.startsWith('branding is required')));

  // Branding rules: outro-length end card, theme-length sting, sting mode without a sting, splash after episode 1.
  const badBranding = structuredClone(persisted);
  badBranding.branding.endCard.durationSeconds = 3;
  badBranding.branding.sting.durationSeconds = 8;
  await writeFile(manifestPath, `${JSON.stringify(badBranding, null, 2)}\n`);
  const badResult = await loadAndValidateManifest(manifestPath, { root });
  assert(badResult.errors.some((error) => error.includes('endCard.durationSeconds must be between 0.5 and 1.5')));
  assert(badResult.errors.some((error) => error.includes('sting.durationSeconds must be between 0.3 and 3')));

  const waivedSting = structuredClone(persisted);
  waivedSting.branding.sting = { status: 'waived', reason: 'no sting yet' };
  await writeFile(manifestPath, `${JSON.stringify(waivedSting, null, 2)}\n`);
  const waivedResult = await loadAndValidateManifest(manifestPath, { root });
  assert(waivedResult.errors.some((error) => error.includes('mark-and-sting requires a provided sting')));
  waivedSting.branding.endCard.mode = 'mark-only';
  await writeFile(manifestPath, `${JSON.stringify(waivedSting, null, 2)}\n`);
  const markOnly = await loadAndValidateManifest(manifestPath, { root });
  assert.deepEqual(markOnly.errors, []);
  assert.equal(markOnly.summary.hashesWritten, 0);
  assert.match(renderBrief(markOnly.manifest, { root, manifestPath: 'episodes/s01e01/edit-manifest.json' }), /Sonic sting: waived \(no sting yet\)/);

  const laterEpisode = structuredClone(persisted);
  laterEpisode.episode = 2;
  laterEpisode.episodeId = 'S01E02';
  laterEpisode.clips.forEach((clip, index) => { clip.shotId = `S01E02-0${index + 1}0`; });
  await writeFile(manifestPath, `${JSON.stringify(laterEpisode, null, 2)}\n`);
  const laterResult = await loadAndValidateManifest(manifestPath, { root });
  assert.deepEqual(laterResult.errors, []);
  assert(laterResult.warnings.some((warning) => warning.includes('splash on episode 2')));

  // 2.0 gates: burned-in captions warn, missing ground warns, continuity status and mix method gate.
  assert(first.warnings.some((warning) => warning.includes('captions.burnIn is true')));
  assert(first.warnings.some((warning) => warning.includes('branding.ground is missing')));
  assert(first.warnings.some((warning) => warning.includes('continuityStatus is absent')));

  const gated = structuredClone(persisted);
  gated.captions.burnIn = false;
  gated.branding.ground = { mode: 'gradient', colors: ['#0B0B0F', '#E4C46A'], angleDegrees: 20, grain: 0.03 };
  gated.clips.forEach((clip) => { clip.continuityStatus = 'pass'; });
  gated.mix = { bedTargetDb: -24, duckToFraction: 0.45, duckRampSeconds: 0.08, method: 'timeline-tweens' };
  gated.sourceSpec = { width: 704, height: 1280, fps: 25 };
  await writeFile(manifestPath, `${JSON.stringify(gated, null, 2)}\n`);
  const gatedResult = await loadAndValidateManifest(manifestPath, { root });
  assert.deepEqual(gatedResult.errors, []);
  assert(!gatedResult.warnings.some((warning) => warning.includes('captions.burnIn')));
  assert(!gatedResult.warnings.some((warning) => warning.includes('branding.ground')));
  assert(gatedResult.warnings.some((warning) => warning.includes('sourceSpec 704x1280@25 is conformed')));
  const gatedBrief = renderBrief(gatedResult.manifest, { root, manifestPath: 'episodes/s01e01/edit-manifest.json' });
  assert.match(gatedBrief, /Bookend ground: full-bleed gradient #0B0B0F → #E4C46A at 20°/);
  assert.match(gatedBrief, /Legacy sound contract/);
  assert.match(gatedBrief, /Burn in en captions: no/);
  assert.match(gatedBrief, /Sources are 704x1280 at 25 fps/);

  const rejected = structuredClone(gated);
  rejected.clips[0].continuityStatus = 'reject';
  rejected.mix.method = 'automation-lanes';
  rejected.branding.ground = { mode: 'gradient', colors: ['#000000', '#101010'] };
  await writeFile(manifestPath, `${JSON.stringify(rejected, null, 2)}\n`);
  const rejectedResult = await loadAndValidateManifest(manifestPath, { root });
  assert(rejectedResult.errors.some((error) => error.includes('continuityStatus is "reject"')));
  assert(rejectedResult.errors.some((error) => error.includes('mix.method automation-lanes is rejected')));
  assert(rejectedResult.warnings.some((warning) => warning.includes('gradient is all near-black')));

  // The handoff builder owns BRIEF.md: rebuilds without --force and keeps editor notes.
  await writeFile(manifestPath, `${JSON.stringify(gated, null, 2)}\n`);
  await writeFile(outputPath, `${await readFile(outputPath, 'utf8')}\n## Editor notes\n\n- keep the hood insert\n`);
  execFileSync(process.execPath, [
    join(dirname(fileURLToPath(import.meta.url)), 'build-edit-handoff.mjs'),
    manifestPath,
    '--root', root,
    '--output', outputPath,
  ]);
  const rebuilt = await readFile(outputPath, 'utf8');
  assert.match(rebuilt, /Bookend ground: full-bleed gradient/);
  assert.match(rebuilt, /## Editor notes\n\n- keep the hood insert/);
  assert.equal(rebuilt.split('## Editor notes').length, 2);

  // Version 2 fixtures use real, tiny generated media: no external services.
  const sceneFile = join(root, 'assets/video/s01e01/native.mp4');
  execFileSync('ffmpeg', ['-v','error','-f','lavfi','-i','color=c=blue:s=32x48:r=24','-f','lavfi','-i','anullsrc=r=48000:cl=mono','-t','25','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac',sceneFile]);
  const audioFile=join(root,'sample.wav');
  execFileSync('ffmpeg',['-v','error','-f','lavfi','-i','sine=frequency=220:sample_rate=48000','-t','4',audioFile]);
  const digest=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
  const audioHash=await digest(audioFile);
  const makeUnit=(n,d=25)=>({
    sceneletId:'S01E01-SC0'+n+'0',kind:'scenelet',generationDurationSeconds:d,
    purpose:'A guarded request becomes an honest admission.',setting:'An autumn campus approach, warm soft light.',
    startState:'Both stand on the path; Dylan holds one folded page and pencil.',
    endState:'Both remain together; Dylan retains the bundle.',
    characters:['dylan','logan'].map(role=>({role,name:role,speaks:true,voiceId:role+'-voice',
      performance:Object.fromEntries(PERFORMANCE_FIELDS.map(k=>[k,'Restrained, sincere interaction; '+k+' follows established canon.']))})),
    imageReferences:[...['dylan','logan'].map(role=>({role:'character',character:role,assetId:role+'-sheet',url:'https://example.test/'+role+'.png',approved:true,rightsCleared:true})),{role:'location',assetId:'lot',url:'https://example.test/lot.png',approved:true,rightsCleared:true}],
    audioReferences:['dylan','logan'].map(role=>({role,voiceId:role+'-voice',assetId:role+'-audio',url:'https://example.test/'+role+'.wav',localPath:'sample.wav',sha256:audioHash,durationSeconds:4,approved:true,rightsCleared:true})),
    shots:[{startSeconds:0,endSeconds:d,framing:'Waist-up two-shot',action:'A question is answered; both remain on the path.',transition:'End on a complete reaction.',
      dialogue:[{id:'line'+n+'a',speaker:'logan',text:'You looking for Sienna?',delivery:'Warm, casual',visibility:'on-screen',listener:'Dylan listens.'},{id:'line'+n+'b',speaker:'dylan',text:'She lent me a pencil.',delivery:'Earnest',visibility:'on-screen',listener:'Logan listens without speaking.'}]}]
  });
  const plan={version:2,episodeId:'S01E01',productionId:'prod-1',boardId:'board-1',runtime:{minSeconds:60,targetSeconds:75,maxSeconds:90},bookendSeconds:0,scenelets:[makeUnit(1),makeUnit(2),makeUnit(3)]};
  const check=async p=>validatePlan(p,{root,ready:true});
  assert.equal((await check(plan)).ok,true);
  assert.equal((await check(plan)).summary.totalSeconds,75);
  const invalidPlan=async (change,match)=>{const p=structuredClone(plan);change(p);const r=await check(p);assert.equal(r.ok,false);assert(r.errors.some(e=>e.includes(match)),r.errors.join('; '));};
  await invalidPlan(p=>p.version=1,'migrate');
  await invalidPlan(p=>p.scenelets[0].audioReferences.forEach(r=>r.durationSeconds=8),'duration disagrees');
  // Declared lengths count in planning; actual lengths count in readiness.
  const tooLong=structuredClone(plan);tooLong.scenelets[0].audioReferences.forEach(r=>r.durationSeconds=8);
  assert((await validatePlan(tooLong)).errors.some(e=>e.includes('exceed 15')));
  await invalidPlan(p=>p.scenelets[0].audioReferences[0].voiceId='other','voiceId mismatch');
  await invalidPlan(p=>delete p.scenelets[0].audioReferences[0].durationSeconds,'measured');
  await invalidPlan(p=>p.scenelets[0].audioReferences[0].sha256='0'.repeat(64),'hash changed');
  await invalidPlan(p=>p.scenelets[0].audioReferences[0].approved=false,'approval');
  await invalidPlan(p=>p.scenelets[0].audioReferences[0].rightsCleared=false,'rights');
  await invalidPlan(p=>p.scenelets[0].imageReferences=[],'location reference');
  await invalidPlan(p=>p.scenelets[0].generationDurationSeconds=31,'duration outside');
  await invalidPlan(p=>p.scenelets[0].generationDurationSeconds=9,'duration outside');
  await invalidPlan(p=>p.scenelets[0].shots[0].startSeconds=1,'contiguous');
  await invalidPlan(p=>p.scenelets[0].shots[0].endSeconds=24,'cover');
  await invalidPlan(p=>p.scenelets[0].shots[0].dialogue[0].speaker='absent','speaker missing');
  await invalidPlan(p=>delete p.scenelets[0].characters[0].performance.hiddenAgenda,'hiddenAgenda');
  await invalidPlan(p=>p.scenelets[0].characters.push(null),'character role');
  await invalidPlan(p=>p.scenelets[0].imageReferences.push(null),'image reference');
  await invalidPlan(p=>p.scenelets[0].audioReferences.push(null),'audio duration');
  await invalidPlan(p=>p.scenelets[0].shots[0].dialogue.push(null),'dialogue id');
  await invalidPlan(p=>p.scenelets[0].sceneletId=p.scenelets[1].sceneletId,'duplicate sceneletId');
  await invalidPlan(p=>p.bookendSeconds=20,'outside the runtime window');
  await invalidPlan(p=>p.scenelets[0].editDurationSeconds=26,'edit duration');
  await invalidPlan(p=>p.scenelets[0].startImageUrl='https://example.test/start.png','unsupported extra');
  const three=structuredClone(plan), third=structuredClone(three.scenelets[0].characters[0]);
  third.role='sienna';third.voiceId='sienna-voice';three.scenelets[0].characters.push(third);
  three.scenelets[0].shots[0].dialogue.push({id:'third',speaker:'sienna',text:'Wait.',delivery:'Quiet urgency',listener:'The men pause.',visibility:'off-screen'});
  assert((await validatePlan(three)).errors.some(e=>e.includes('speakerException')));
  three.scenelets[0].speakerException='A brief off-screen intervention is essential to the reveal.';
  assert.equal((await validatePlan(three)).ok,true);
  const scoped=structuredClone(plan);scoped.scenelets[1].audioReferences=[];scoped.scenelets[1].imageReferences=[];
  assert.equal((await validatePlan(scoped,{root,ready:true,sceneletId:'S01E01-SC010'})).ok,true);
  const insert=structuredClone(plan);insert.scenelets[0]={...makeUnit(1,3),sceneletId:'S01E01-IN015',kind:'insert'};
  insert.scenelets[0].characters.forEach(c=>c.speaks=false);insert.scenelets[0].shots[0].dialogue=[];insert.scenelets[0].audioReferences=[];
  insert.scenelets[1]=makeUnit(2,30);insert.scenelets[2]=makeUnit(3,30);
  assert.equal((await check(insert)).ok,true);
  const longDialogue=structuredClone(plan);longDialogue.scenelets[0]=makeUnit(1,30);
  longDialogue.scenelets[0].shots[0].dialogue[0].text=Array(45).fill('word').join(' ');
  const longCheck=await check(longDialogue);assert.equal(longCheck.ok,true);assert(longCheck.summary.rows[0].estimatedSpeechSeconds>15);
  const payload=buildRequest(plan,'S01E01-SC010');
  assert.equal(payload.model,'wan-3');assert.equal(payload.duration,'25');assert.equal(payload.generateAudio,true);
  assert.deepEqual(payload.referenceAudioUrls,plan.scenelets[0].audioReferences.map(r=>r.url));
  assert(!('multiPromptShots' in payload));assert(!('maxCredits' in payload));
  assert(payload.prompt.includes('hiddenAgenda:'));assert(payload.prompt.includes('logan (on-screen; Warm, casual) says "You looking for Sienna?"'));
  const bp=join(root,'blueprint.json'), draftRequest=join(root,'request.json');
  await writeFile(bp,JSON.stringify(plan));
  execFileSync(process.execPath,[join(dirname(fileURLToPath(import.meta.url)),'build-scenelet-request.mjs'),bp,'--root',root,'--scenelet','S01E01-SC010','--output',draftRequest]);
  assert.equal(JSON.parse(await readFile(draftRequest,'utf8')).status,'unsubmitted-needs-current-quote-and-authorization');
  assert.throws(()=>execFileSync(process.execPath,[join(dirname(fileURLToPath(import.meta.url)),'build-scenelet-request.mjs'),bp,'--root',root,'--scenelet','S01E01-SC010','--output',draftRequest],{stdio:'pipe'}));

  const modern=structuredClone(gated);modern.version=2;modern.audioSource='native';
  modern.branding={seriesMark:{status:'waived',reason:'Platform carries identity'},sting:{status:'waived',reason:'No sting requested'},opening:{mode:'none'},endCard:{mode:'none'},credits:{mode:'none'}};
  modern.audio={dialogue:[],native:[],music:[],sfx:[]};
  modern.clips=[1,2,3].map(n=>({shotId:'S01E01-0'+n+'0',sourceSceneletId:'S01E01-SC0'+n+'0',sourceOrigin:'elegiac',sourceAssetId:'native-take',sourceLabel:'WAN scenelet',localPath:'assets/video/s01e01/native.mp4',sha256:undefined,inSeconds:0,outSeconds:25,transitionOutSeconds:0,continuityStatus:'pass',approved:true,audioMode:'native',sourceSpec:{width:32,height:48,fps:24,durationSeconds:25,hasAudio:true}}));
  delete modern.sourceSpec;
  await writeFile(manifestPath,JSON.stringify(modern));
  const modernResult=await loadAndValidateManifest(manifestPath,{root,writeHashes:true});
  assert.deepEqual(modernResult.errors,[]);assert.equal(modernResult.summary.masterDurationSeconds,75);
  const nativeManifest=modernResult.manifest;
  const nativeBrief=renderBrief(nativeManifest,{root,manifestPath});
  assert(nativeBrief.includes('preserve WAN generated dialogue'));assert(!nativeBrief.includes('mute every'));
  assert(nativeBrief.includes('length: 75s'));assert(nativeBrief.includes('storyboard: no'));
  const invalidEdit=async (change,match,options={})=>{const m=structuredClone(nativeManifest);change(m);await writeFile(manifestPath,JSON.stringify(m));const r=await loadAndValidateManifest(manifestPath,{root,...options});assert(r.errors.some(e=>e.includes(match)),r.errors.join('; '));};
  await invalidEdit(m=>m.clips[0].audioMode='muted','audioMode');
  await invalidEdit(m=>m.audio.dialogue=[{}],'audio.dialogue must be empty');
  await invalidEdit(m=>m.clips[0].outSeconds=26,'source range');
  await invalidEdit(m=>m.clips[0].sourceSpec.fps=30,'disagrees with ffprobe');
  await invalidEdit(m=>m.clips[0].continuityStatus='pending','continuityStatus');
  await invalidEdit(m=>m.clips[0].approved=false,'approved must be true',{skipFiles:true});
  await invalidEdit(m=>m.clips[0].transitionOutSeconds=25,'shorter');
  await invalidEdit(m=>m.audio.native=[{...m.clips[0],id:'duplicate',sourceShotId:m.clips[0].shotId,timelineStartSeconds:0}],'play twice');
  await invalidEdit(m=>m.clips[0].audioMode='extracted','exactly one');
  const extracted=structuredClone(nativeManifest), firstClip=extracted.clips[0];
  const extractionFile=join(root,'native-extraction.wav');
  execFileSync('ffmpeg',['-v','error','-i',sceneFile,'-vn','-c:a','pcm_s16le',extractionFile]);
  firstClip.audioMode='extracted';
  extracted.audio.native=[{id:'native-010',sourceOrigin:'user',sourceLabel:'Full-source WAN audio extraction',localPath:'native-extraction.wav',sha256:await digest(extractionFile),approved:true,inSeconds:0,outSeconds:25,timelineStartSeconds:0,sourceShotId:firstClip.shotId,sourceSceneletId:firstClip.sourceSceneletId,sourceVideoSha256:firstClip.sha256}];
  extracted.mix.method='current-framework-reviewed-method';
  await writeFile(manifestPath,JSON.stringify(extracted));
  assert.deepEqual((await loadAndValidateManifest(manifestPath,{root})).errors,[]);
  extracted.audio.native[0].localPath='sample.wav';extracted.audio.native[0].sha256=audioHash;
  await writeFile(manifestPath,JSON.stringify(extracted));
  assert((await loadAndValidateManifest(manifestPath,{root})).errors.some(e=>e.includes('extraction range exceeds')));
  await invalidEdit(m=>m.branding={...m.branding,endCard:{mode:'mark-only',durationSeconds:1}},'master duration');
  const totalWithBrand=structuredClone(nativeManifest);
  totalWithBrand.branding={...gated.branding};totalWithBrand.clips[2].outSeconds=22.75;
  await writeFile(manifestPath,JSON.stringify(totalWithBrand));
  const totalResult=await loadAndValidateManifest(manifestPath,{root});
  assert.deepEqual(totalResult.errors,[]);assert.equal(totalResult.summary.masterDurationSeconds,75);
  assert.equal(totalResult.summary.editDurationSeconds,72.75);

  // Root confinement survives symlinks, and modified frozen bytes fail.
  await symlink('/etc/hosts',join(root,'escape'));
  await invalidEdit(m=>m.clips[0].localPath='escape','does not exist');
  await invalidEdit(m=>m.clips[0].sha256='0'.repeat(64),'sha256 does not match');

  persisted.clips[1].shotId = 'S01E01-010';
  await writeFile(manifestPath, `${JSON.stringify(persisted, null, 2)}\n`);
  const duplicate = await loadAndValidateManifest(manifestPath, { root });
  assert(duplicate.errors.some((error) => error.includes('duplicates S01E01-010')));

  console.log('manifest.test.mjs PASS');
} finally {
  await rm(root, { recursive: true, force: true });
}
