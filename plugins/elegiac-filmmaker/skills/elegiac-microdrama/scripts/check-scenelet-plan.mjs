#!/usr/bin/env node
// No-spend structural and media preflight for version 2 scenelet plans.
import { readFile, realpath, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PERFORMANCE_FIELDS = ['motivation', 'insecurity', 'suspicion', 'hiddenAgenda', 'mood', 'intent', 'feelings', 'attitude', 'emotionalArc', 'behavior', 'forbiddenMisread'];
const text = x => typeof x === 'string' && x.trim().length > 0;
const number = x => typeof x === 'number' && Number.isFinite(x);
const positive = x => number(x) && x > 0;
const hashRE = /^[a-f0-9]{64}$/;
const round = x => Number(x.toFixed(3));
const list = x => Array.isArray(x) ? x : [];
function publicUrl(x) { try { const u = new URL(x); return ['http:', 'https:'].includes(u.protocol) && !!u.hostname; } catch { return false; } }
export async function containedPath(root, path) {
  if (!text(path) || /^(https?:|data:|blob:)/i.test(path)) throw Error('requires a local file');
  const base = await realpath(root), full = await realpath(resolve(base, path));
  const rel = relative(base, full);
  if (rel === '..' || rel.startsWith('../') || isAbsolute(rel)) throw Error('path escapes root');
  return full;
}
export function probe(path) {
  return JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', path], {encoding:'utf8'}));
}
export function estimateSpeechSeconds(dialogue) {
  return list(dialogue).reduce((sum, line) => sum + String(line?.text ?? '').replace(/\[[^\]]*\]/g, '').split(/\s+/).filter(Boolean).length / 2.6, 0);
}
export async function validatePlan(plan, {root=process.cwd(), ready=false, sceneletId=null}={}) {
  const errors=[], warnings=[], rows=[];
  if (plan?.version !== 2) errors.push('version must be 2; preserve the legacy blueprint and explicitly migrate its story to scenelets');
  if (!/^S\d{2}E\d{2}$/.test(plan?.episodeId ?? '')) errors.push('episodeId must match S01E03');
  const units=list(plan?.scenelets);
  if (!units.length) errors.push('scenelets must be a nonempty array');
  if (sceneletId && !units.some(s=>s?.sceneletId===sceneletId)) errors.push('requested sceneletId is absent');
  const runtime=plan?.runtime ?? {minSeconds:60,targetSeconds:75,maxSeconds:90};
  if (![runtime.minSeconds,runtime.targetSeconds,runtime.maxSeconds].every(positive) || runtime.minSeconds>runtime.targetSeconds || runtime.targetSeconds>runtime.maxSeconds) errors.push('runtime requires positive min <= target <= max');
  if ((runtime.minSeconds!==60 || runtime.maxSeconds!==90) && !text(runtime.reason)) errors.push('custom runtime window requires runtime.reason');
  if (!number(plan?.bookendSeconds) || plan.bookendSeconds<0) errors.push('bookendSeconds must be explicit and nonnegative');
  const unitIds=new Set(), lineIds=new Set();
  for (const [index, raw] of units.entries()) {
    const s=raw ?? {}, label=s.sceneletId ?? 'scenelets['+index+']';
    const strict=ready && (!sceneletId || sceneletId===s.sceneletId);
    if (!text(s.sceneletId) || !new RegExp('^'+plan.episodeId+'-(SC|IN)\\d{3}$').test(s.sceneletId)) errors.push(label+': invalid sceneletId');
    if (unitIds.has(s.sceneletId)) errors.push(label+': duplicate sceneletId');
    unitIds.add(s.sceneletId);
    if (!['scenelet','insert'].includes(s.kind)) errors.push(label+': kind must be scenelet or insert');
    const dur=s.generationDurationSeconds, edit=s.editDurationSeconds ?? dur;
    if (!Number.isInteger(dur) || dur<(s.kind==='insert'?2:10) || dur>30) errors.push(label+': generation duration outside allowed range');
    if (!positive(edit) || edit>dur) errors.push(label+': edit duration must be positive and no longer than generation');
    for (const k of ['purpose','setting','startState','endState']) if (!text(s[k])) errors.push(label+': missing '+k);
    const characters=list(s.characters), roleMap=new Map();
    for (const c of characters) {
      if (!text(c?.role) || roleMap.has(c.role)) errors.push(label+': missing/duplicate character role');
      roleMap.set(c?.role,c);
      if (typeof c?.speaks!=='boolean') errors.push(label+': character speaks must be boolean');
      for (const k of PERFORMANCE_FIELDS) if (!text(c?.performance?.[k])) errors.push(label+': '+c?.role+' performance.'+k+' required');
      if (strict && c?.speaks && !text(c.voiceId)) errors.push(label+': assigned voiceId required for '+c.role);
    }
    const shots=list(s.shots), speakers=new Set();
    if (!shots.length) errors.push(label+': shots must contain at least one window');
    let cursor=0, speech=0;
    for (const shot of shots) {
      if (!number(shot?.startSeconds) || !positive(shot?.endSeconds) || shot.startSeconds!==cursor || shot.endSeconds<=shot.startSeconds || shot.endSeconds>dur) errors.push(label+': shot windows must be contiguous, positive and within generation duration');
      cursor=shot?.endSeconds;
      for (const k of ['framing','action','transition']) if (!text(shot?.[k])) errors.push(label+': shot '+k+' required');
      if (!Array.isArray(shot?.dialogue)) errors.push(label+': each shot requires dialogue array (empty for no speech)');
      for (const line of list(shot?.dialogue)) {
        if (!text(line?.id) || lineIds.has(line.id)) errors.push(label+': missing/duplicate dialogue id');
        lineIds.add(line?.id); speakers.add(line?.speaker);
        if (!roleMap.get(line?.speaker)?.speaks) errors.push(label+': dialogue speaker missing or marked non-speaking: '+line?.speaker);
        for (const k of ['text','delivery','listener']) if (!text(line?.[k])) errors.push(label+': dialogue '+k+' required');
        if (!['on-screen','off-screen'].includes(line?.visibility)) errors.push(label+': dialogue visibility required');
      }
      const seconds=estimateSpeechSeconds(shot?.dialogue); speech+=seconds;
      if (seconds>shot?.endSeconds-shot?.startSeconds) warnings.push(label+': spoken words may exceed their shot window; perform-time the passage');
    }
    if (cursor!==dur) errors.push(label+': shot windows must cover the requested duration');
    if (speakers.size>2 && !text(s.speakerException)) errors.push(label+': prefer <=2 speakers; split naturally or record speakerException');
    if (speakers.size>2) warnings.push(label+': more than two speakers; review attribution carefully');
    for (const c of characters) if (c?.speaks && !speakers.has(c.role)) errors.push(label+': speaking role has no scripted lines: '+c.role);
    const imgs=list(s.imageReferences), auds=list(s.audioReferences);
    if (!Array.isArray(s.imageReferences) || !Array.isArray(s.audioReferences)) errors.push(label+': imageReferences/audioReferences arrays required');
    if (imgs.length>10 || auds.length>5 || imgs.length+auds.length>20) errors.push(label+': reference count exceeds WAN limits');
    if (s.referenceVideoUrls?.length || s.startImageUrl || s.endImageUrl) errors.push(label+': builder supports sheets/location/audio only; remove unsupported extra reference modes or use an explicit reviewed custom request');
    let audioTotal=0;
    for (const ref of imgs) {
      if (!['character','location','prop','vehicle','style'].includes(ref?.role)) errors.push(label+': invalid image reference role');
      if (ref?.role==='character' && !roleMap.has(ref.character)) errors.push(label+': sheet reference character is absent');
      if (strict && (!publicUrl(ref?.url) || !text(ref?.assetId) || ref?.approved!==true || ref?.rightsCleared!==true)) errors.push(label+': image reference needs URL, assetId, approval and rights clearance');
    }
    if (strict) {
      if (!imgs.some(r=>r?.role==='location')) errors.push(label+': approved location reference required');
      for (const c of characters) if (!imgs.some(r=>r?.role==='character' && r.character===c?.role)) errors.push(label+': missing character sheet for '+c?.role);
      for (const role of speakers) if (!auds.some(r=>r?.role===role && r?.voiceId===roleMap.get(role)?.voiceId)) errors.push(label+': missing assigned voice reference for '+role);
    }
    for (const ref of auds) {
      if (!positive(ref?.durationSeconds)) errors.push(label+': audio duration must be measured and positive');
      else audioTotal+=ref.durationSeconds;
      if (!speakers.has(ref?.role)) errors.push(label+': audio reference must belong to a scripted speaker');
      if (roleMap.get(ref?.role)?.voiceId && ref?.voiceId!==roleMap.get(ref.role).voiceId) errors.push(label+': voiceId mismatch for '+ref?.role);
      if (strict) {
        if (!publicUrl(ref?.url) || !text(ref?.assetId) || ref?.approved!==true || ref?.rightsCleared!==true || !hashRE.test(ref?.sha256 ?? '')) errors.push(label+': audio reference needs URL, assetId, approval, rights and hash');
        try {
          const p=await containedPath(root,ref.localPath);
          const actualHash=createHash('sha256').update(await readFile(p)).digest('hex');
          if (actualHash!==ref.sha256) errors.push(label+': audio reference hash changed');
          const info=probe(p), actual=Number(info.format?.duration);
          if (!info.streams?.some(x=>x.codec_type==='audio') || !positive(actual)) throw Error('no measurable audio');
          if (!positive(ref.durationSeconds) || Math.abs(actual-ref.durationSeconds)>0.05) errors.push(label+': audio reference duration disagrees with ffprobe');
          if (positive(ref.durationSeconds)) audioTotal+=actual-ref.durationSeconds;
        } catch(e) { errors.push(label+': audio file preflight: '+e.message); }
      }
    }
    if (audioTotal>15+1e-6) errors.push(label+': combined audio references exceed 15 seconds');
    const allowance=s.nonSpeechSeconds ?? shots.length;
    if (!number(allowance) || allowance<0) errors.push(label+': nonSpeechSeconds must be nonnegative');
    if (speech+allowance>dur) warnings.push(label+': dialogue/action may be too dense; shorten text or regroup, not voice samples');
    rows.push({sceneletId:s.sceneletId,generationSeconds:dur,editSeconds:edit,speakers:speakers.size,audioReferenceSeconds:round(audioTotal),estimatedSpeechSeconds:round(speech)});
  }
  const storySeconds=rows.reduce((n,r)=>n+(positive(r.editSeconds)?r.editSeconds:0),0);
  const totalSeconds=round(storySeconds+(number(plan?.bookendSeconds)?plan.bookendSeconds:0));
  if (totalSeconds<runtime.minSeconds || totalSeconds>runtime.maxSeconds) errors.push('total episode runtime including bookends is outside the runtime window');
  if (Math.abs(totalSeconds-runtime.targetSeconds)>3) warnings.push('total differs from ideal target by more than 3 seconds; review pacing');
  if (units.length>4) warnings.push('more than four generation units; consider consolidation without sacrificing story');
  return {ok:errors.length===0,errors,warnings,summary:{storySeconds:round(storySeconds),bookendSeconds:plan?.bookendSeconds,totalSeconds,targetSeconds:runtime.targetSeconds,generations:units.length,rows}};
}
export function parseArgs(argv, builder=false) {
  const o={root:process.cwd(),ready:false,json:false,write:false,sceneletId:null};
  for (let i=0;i<argv.length;i++) {
    const a=argv[i];
    if (['--root','--scenelet','--output'].includes(a)) { if (!argv[i+1] || argv[i+1].startsWith('--')) throw Error('missing value for '+a); o[a==='--scenelet'?'sceneletId':a.slice(2)]=argv[++i]; }
    else if (a==='--ready') o.ready=true;
    else if (a==='--json') o.json=true;
    else if (a==='--write' && !builder) o.write=true;
    else if (!a.startsWith('-') && !o.file) o.file=a;
    else throw Error('unknown argument '+a);
  }
  if (!o.file || (builder && (!o.sceneletId || !o.output))) throw Error('Usage: '+(builder?'build-scenelet-request':'check-scenelet-plan')+'.mjs <blueprint.json> --root <kit> '+(builder?'--scenelet <id> --output <new.json>':'[--ready] [--scenelet <id>] [--json] [--write]'));
  o.root=resolve(o.root); o.file=resolve(o.file); return o;
}
async function main() {
  try {
    const o=parseArgs(process.argv.slice(2)), plan=JSON.parse(await readFile(o.file,'utf8'));
    const result=await validatePlan(plan,o);
    if (o.write && result.ok) { plan.durationBudget={...result.summary,status:'pass',checkedAt:new Date().toISOString()}; await writeFile(o.file,JSON.stringify(plan,null,2)+'\n'); }
    console.log(o.json?JSON.stringify(result,null,2):[(result.ok?'PASS':'FAIL')+' '+plan.episodeId,JSON.stringify(result.summary),...result.errors,...result.warnings.map(w=>'warning: '+w)].join('\n'));
    if (!result.ok) process.exitCode=1;
  } catch(e) { console.error(e.message);process.exitCode=2; }
}
if (resolve(process.argv[1] ?? '')===fileURLToPath(import.meta.url)) await main();
