#!/usr/bin/env node
// Compile only: no network, quote, generation, approval or credit spend.
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs, validatePlan, PERFORMANCE_FIELDS} from './check-scenelet-plan.mjs';

export function buildRequest(plan, sceneletId) {
  const s=plan.scenelets.find(s=>s.sceneletId===sceneletId);
  if (!s) throw Error('unknown scenelet');
  const names=new Map(s.characters.map(c=>[c.role,c.name || c.role]));
  const lines=[
    'Create a '+s.generationDurationSeconds+'-second, 9:16 cinematic scene with native sound.',
    s.kind==='insert' && s.shots.length===1 ? 'One continuous single-shot action; no internal cuts.' : 'One coherent scene with the ordered internal shots below.',
    '',
    'REFERENCE ROLES',
    ...s.imageReferences.map((r,i)=>'Image '+(i+1)+' is '+(r.role==='character' ? names.get(r.character)+"'s approved identity/wardrobe sheet. Multiple views depict ONE person; preserve identity, never reproduce panels, labels or backgrounds." : 'the approved '+r.role+' reference. Use its physical design, geography and light, not its layout or aspect ratio.') ),
    ...s.audioReferences.map((r,i)=>'Audio '+(i+1)+' is '+names.get(r.role)+"'s voice identity and emotional register. Use this voice for that character only."),
    "Use audio samples as voice references, not as dialogue to replay. Perform only the quoted script. Recompose landscape references naturally into full-height 9:16; no borders.",
    '',
    'STORY PURPOSE',s.purpose,'SETTING AND LOOK',s.setting,'OPENING STATE',s.startState,
    '',
    'CHARACTER INTENT AND PERFORMANCE',
    ...s.characters.flatMap(c=>[names.get(c.role)+(c.speaks?' — speaking role':' — non-speaking role'),...PERFORMANCE_FIELDS.map(k=>k+': '+c.performance[k])]),
    '',
    'ORDERED SHOTS',
  ];
  for (const [i,shot] of s.shots.entries()) {
    lines.push('SHOT '+(i+1)+' — '+shot.startSeconds+'–'+shot.endSeconds+' seconds', 'Framing: '+shot.framing,'Action: '+shot.action);
    for (const line of shot.dialogue) lines.push(names.get(line.speaker)+' ('+line.visibility+'; '+line.delivery+') says '+JSON.stringify(line.text), 'Listener: '+line.listener);
    if (!shot.dialogue.length) lines.push('No dialogue in this shot.');
    lines.push('Transition: '+shot.transition,'');
  }
  lines.push('ENDING STATE',s.endState,'SOUND AND CONTINUITY',
    'Perform each quoted line exactly once, in order, with its named speaker and assigned voice. Visible speech synchronizes to that speaker; listeners do not mouth another character\'s words. No invented lines, narrator, subtitles or captions. No overlapping speech unless the shot explicitly directs an interruption. Production sound only: no score, no underscore, no music bed unless explicitly specified in the approved scene direction. Clear dialogue over restrained location ambience.',
    'Preserve identities, wardrobe, prop count/ownership, physical geography and light across cuts. Complete the specified actions and emotional turn. Do not add reactions or camera moves that change the intended pacing.');
  return {
    model:'wan-3', mode:'reference-to-video', qualityTier:'standard', resolution:'720p', aspectRatio:'9:16',
    duration:String(s.generationDurationSeconds),generateAudio:true,promptExpansion:false,
    prompt:lines.join('\n'),referenceImageUrls:s.imageReferences.map(r=>r.url),referenceAudioUrls:s.audioReferences.map(r=>r.url),
    ...(plan.productionId?{productionId:plan.productionId}:{}),...(plan.boardId?{boardId:plan.boardId}:{}),
    name:plan.episodeId+' '+s.sceneletId+' — '+s.purpose, usageType:'shot'
  };
}
async function main() {
  try {
    const o=parseArgs(process.argv.slice(2),true), plan=JSON.parse(await readFile(o.file,'utf8'));
    const result=await validatePlan(plan,{...o,ready:true});
    if (!result.ok) {console.error(result.errors.join('\n'));process.exitCode=1;return;}
    const request=buildRequest(plan,o.sceneletId);
    await writeFile(resolve(o.output),JSON.stringify({status:'unsubmitted-needs-current-quote-and-authorization',sceneletId:o.sceneletId,request},null,2)+'\n',{flag:'wx'});
    console.log('Wrote unsubmitted request '+resolve(o.output)+'; inspect, quote, add cap/idempotency key and authorize before calling Elegiac.');
  } catch(e) {console.error(e.message);process.exitCode=2;}
}
if (resolve(process.argv[1] ?? '')===fileURLToPath(import.meta.url)) await main();
