#!/usr/bin/env node
// Build the stills animatic: a HyperFrames composition that holds every approved still for its cut
// length with the dialogue stems underneath and the branding bookends from the series manifest.
// It spends nothing and it is the last gate before motion credits.
//
//   node build-stills-animatic.mjs episodes/s01e01/episode-blueprint.json --root . --output post/animatic [--series series-manifest.json] [--allow-unreviewed]
//   npx hyperframes preview post/animatic --background --port 3022
//
// Inputs per shot (blueprint.shots[]): stillLocalPath (required), clipDurationSeconds | durationSeconds,
// stemLocalPath + stemDurationSeconds (speaking cuts), continuity.status. Assets are copied into
// <output>/assets so the composition never reaches outside its project.

import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { episodeBranding } from './check-shot-budget.mjs';

const SPEECH_LEAD = 0; // stems are normalised with their own 0.3 s head (production-pipeline.md, stage 1)
const PUSH = 1.03; // slow push-in so `hyperframes check` never sees a frozen timeline

function parseArgs(argv) {
  const options = { blueprintPath: null, root: process.cwd(), output: null, seriesPath: null, allowUnreviewed: false, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') options.root = argv[++index];
    else if (arg === '--output') options.output = argv[++index];
    else if (arg === '--series') options.seriesPath = argv[++index];
    else if (arg === '--allow-unreviewed') options.allowUnreviewed = true;
    else if (arg === '--json') options.json = true;
    else if (!arg.startsWith('-') && !options.blueprintPath) options.blueprintPath = arg;
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!options.blueprintPath || !options.output) {
    throw new Error('Usage: build-stills-animatic.mjs <episode-blueprint.json> --root <production-kit-root> --output <animatic-project-dir> [--series <series-manifest.json>] [--allow-unreviewed]');
  }
  options.root = resolve(options.root);
  options.blueprintPath = resolve(options.root, options.blueprintPath);
  options.output = resolve(options.root, options.output);
  options.seriesPath = resolve(options.root, options.seriesPath ?? 'series-manifest.json');
  return options;
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function s(value) {
  return String(Number.parseFloat(Number(value).toFixed(3)));
}

/** Relative luminance (0–1) of a #rrggbb colour; non-hex input counts as mid-grey. */
export function luminance(color) {
  const match = typeof color === 'string' ? color.trim().match(/^#([0-9a-f]{6})$/i) : null;
  if (!match) return 0.5;
  const value = Number.parseInt(match[1], 16);
  const channel = (c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * channel((value >> 16) & 0xff) + 0.7152 * channel((value >> 8) & 0xff) + 0.0722 * channel(value & 0xff);
}

function esc(text) {
  return String(text ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Apply an editOrderOverride: a full list reorders everything; a partial list replaces its own ids' slots in ledger order. */
export function applyEditOrder(shots, override) {
  if (!Array.isArray(override) || override.length === 0) return shots;
  const byId = new Map(shots.map((shot) => [String(shot.shotId).replace(/^.*-/, ''), shot]));
  const keys = override.map((id) => String(id).replace(/^.*-/, ''));
  if (keys.some((key) => !byId.has(key))) throw new Error(`editOrderOverride names a shot that is not in the ledger: ${override.join(', ')}`);
  if (keys.length === shots.length) return keys.map((key) => byId.get(key));
  const slots = new Set(keys);
  let cursor = 0;
  return shots.map((shot) => {
    const key = String(shot.shotId).replace(/^.*-/, '');
    if (!slots.has(key)) return shot;
    return byId.get(keys[cursor++]);
  });
}

async function sha256(path) {
  return createHash('sha256').update(await readFile(path)).digest('hex');
}

async function freeze(root, relPath, destDir, label) {
  if (!relPath) throw new Error(`${label} has no local path; freeze the file first`);
  const source = resolve(root, relPath);
  await stat(source).catch(() => { throw new Error(`${label}: ${relPath} does not exist under ${root}`); });
  await mkdir(destDir, { recursive: true });
  const target = join(destDir, basename(relPath));
  await copyFile(source, target);
  return { target, hash: await sha256(source) };
}

function groundCss(ground, palette) {
  const colors = ground?.colors?.length >= 2 ? ground.colors : [palette?.[0] ?? '#1b1b22', palette?.[1] ?? '#3a3040'];
  const angle = num(ground?.angleDegrees, 20);
  if (ground?.mode === 'plate-blur') {
    return `background: linear-gradient(${angle}deg, ${colors[0]}cc, ${colors[1]}cc);`;
  }
  return `background: linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]});`;
}

/** Accept the loose 1.x branding shape (file/assetId, palette as an object) as well as the 2.0 schema. */
export function normalizeBranding(branding) {
  if (!branding || typeof branding !== 'object') return branding ?? null;
  const out = structuredClone(branding);
  for (const key of ['seriesMark', 'sting']) {
    const element = out[key];
    if (element && typeof element === 'object') {
      if (!element.localPath && element.file) element.localPath = element.file;
      if (!element.status) element.status = element.localPath ? 'provided' : (element.title ? 'typographic' : 'waived');
    }
  }
  if (out.palette && !Array.isArray(out.palette) && typeof out.palette === 'object') out.palette = Object.values(out.palette);
  for (const key of ['display', 'captions']) {
    if (typeof out.typography?.[key] === 'string') out.typography[key] = out.typography[key].replace(/\s+\d{3}$/, '');
  }
  return out;
}

export function renderAnimatic({ blueprint, branding, cuts, bookends, assets, canvas, showName }) {
  const { width, height, fps } = canvas;
  const palette = branding?.palette ?? [];
  const lockupText = branding?.seriesMark?.title ?? showName ?? blueprint.show ?? 'SERIES';
  const display = branding?.typography?.display ?? 'Inter';
  const captions = branding?.typography?.captions ?? 'Inter';
  // Ink is chosen against the ground so the lockup and next-text always clear WCAG on the card.
  const groundColors = branding?.ground?.colors?.length >= 2 ? branding.ground.colors : [palette[0] ?? '#1b1b22', palette[1] ?? '#3a3040'];
  const groundIsLight = groundColors.reduce((sum, color) => sum + luminance(color), 0) / groundColors.length > 0.4;
  const ink = groundIsLight ? (palette.find((color) => luminance(color) < 0.2) ?? '#0B0B0F') : (palette.find((color) => luminance(color) > 0.6) ?? '#F3F1EA');
  const stingDuration = assets.stingDuration ? ` data-duration="${s(assets.stingDuration)}"` : '';
  const markWidthSplash = Math.round(width * 0.66);
  const markWidthEnd = Math.round(width * 0.6);

  // The shot label lives inside the still's own timed element so the review composition has one timed
  // element per cut (a second track of labels doubles the timeline density for no benefit).
  const stills = cuts.map((cut, index) => `<div id="s${index}" class="clip still" data-start="${s(cut.start)}" data-duration="${s(cut.hold)}" data-track-index="0" data-layout-allow-overflow><img id="s${index}-img" src="${esc(cut.stillSrc)}" alt=""><div class="label" data-layout-ignore><span>${esc(cut.shotId)} · ${esc(cut.kind)}${cut.speaker ? ` · ${esc(cut.speaker)}` : ''}</span></div></div>`);
  const labels = [];
  const stems = cuts.filter((cut) => cut.stemSrc).map((cut) => `<audio id="dlg-${esc(cut.shotId).replace(/^.*-/, '')}" src="${esc(cut.stemSrc)}" data-start="${s(cut.start + SPEECH_LEAD)}"${cut.stemDuration ? ` data-duration="${s(cut.stemDuration)}"` : ''} data-track-index="10" data-volume="1"></audio>`);

  const bookendMarkup = [];
  const tweens = [];
  const markImg = (id, widthPx) => assets.mark
    ? `<img id="${id}" src="${esc(assets.mark)}" alt="" style="width:${widthPx}px;height:auto">`
    : `<span id="${id}" class="lockup">${esc(lockupText)}</span>`;
  if (bookends.splash) {
    bookendMarkup.push(`<div id="splash" class="clip card" data-start="${s(bookends.splash.start)}" data-duration="${s(bookends.splash.duration)}" data-track-index="5">${markImg('splash-mark', markWidthSplash)}</div>`);
    tweens.push(`tl.fromTo("#splash-mark", { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "power3.out" }, ${s(bookends.splash.start)});`);
    if (assets.sting) bookendMarkup.push(`<audio id="sting-open" src="${esc(assets.sting)}" data-start="${s(bookends.splash.start)}"${stingDuration} data-track-index="11" data-volume="0.9"></audio>`);
  }
  if (bookends.endCard) {
    const { blackStart, blackout, cardStart, duration, nextText } = bookends.endCard;
    if (blackout > 0) bookendMarkup.push(`<div id="black" class="clip" data-start="${s(blackStart)}" data-duration="${s(blackout)}" data-track-index="5" style="background:#000"></div>`);
    bookendMarkup.push(`<div id="endcard" class="clip card" data-start="${s(cardStart)}" data-duration="${s(duration)}" data-track-index="5">${markImg('end-mark', markWidthEnd)}${nextText ? `<span class="next">${esc(nextText)}</span>` : ''}</div>`);
    tweens.push(`tl.fromTo("#end-mark", { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.22, ease: "power3.out" }, ${s(cardStart)});`);
    if (nextText) tweens.push(`tl.fromTo("#endcard .next", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" }, ${s(cardStart + 0.25)});`);
    if (assets.sting) bookendMarkup.push(`<audio id="sting-end" src="${esc(assets.sting)}" data-start="${s(blackStart)}"${stingDuration} data-track-index="11" data-volume="0.9"></audio>`);
  }
  for (const [index, cut] of cuts.entries()) {
    tweens.push(`tl.fromTo("#s${index}-img", { scale: 1 }, { scale: ${PUSH}, duration: ${s(cut.hold)}, ease: "none" }, ${s(cut.start)});`);
  }

  const total = bookends.total;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=${width}, height=${height}">
<title>${esc(blueprint.episodeId)} stills animatic</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
  /* The animatic is a review tool: local() declarations satisfy the font gate without a fetch; the master edit resolves real files. */
  @font-face { font-family: '${esc(display)}'; src: local('${esc(display)}'); }
  @font-face { font-family: '${esc(captions)}'; src: local('${esc(captions)}'); }
  @font-face { font-family: 'JetBrains Mono'; src: local('JetBrains Mono'), local('Menlo'); }
  body { margin:0; background:#000; font-family:${esc(captions)}, Inter, Helvetica, Arial, system-ui, sans-serif; }
  #root { position:relative; width:${width}px; height:${height}px; overflow:hidden; background:#000; }
  .clip { position:absolute; inset:0; }
  .still { overflow:hidden; background:#000; }
  .still img { display:block; width:${width}px; height:${height}px; object-fit:cover; transform-origin:50% 45%; }
  .label { position:absolute; left:0; right:0; bottom:${Math.round(height * 0.05)}px; display:flex; justify-content:center; pointer-events:none; }
  .label span { font-family:"JetBrains Mono", ui-monospace, Menlo, monospace; font-size:${Math.round(height * 0.014)}px; letter-spacing:2px; color:#fff; background:rgba(0,0,0,.55); padding:6px 14px; border-radius:8px; }
  .card { display:flex; flex-direction:column; align-items:center; justify-content:center; ${groundCss(branding?.ground, palette)} color:${esc(ink)}; text-align:center; font-family:${esc(display)}, Inter, Helvetica, Arial, system-ui, sans-serif; }
  .card .lockup { font-size:${Math.round(height * 0.11)}px; font-weight:800; letter-spacing:${Math.round(width * 0.012)}px; line-height:1; }
  .card .next { display:block; margin-top:${Math.round(height * 0.02)}px; font-family:${esc(captions)}, system-ui, sans-serif; font-size:${Math.round(height * 0.04)}px; letter-spacing:8px; font-weight:700; color:${esc(ink)}; opacity:.9; }
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-width="${width}" data-height="${height}" data-fps="${fps}" data-duration="${s(total)}">
${stills.join('\n')}
${labels.join('\n')}
${bookendMarkup.join('\n')}
${stems.join('\n')}
</div>
<script>
const tl = gsap.timeline({ paused: true });
${tweens.join('\n')}
window.__timelines = window.__timelines || {};
window.__timelines["main"] = tl;
</script>
</body>
</html>
`;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }
  const blueprint = JSON.parse(await readFile(options.blueprintPath, 'utf8'));
  let series = null;
  try { series = JSON.parse(await readFile(options.seriesPath, 'utf8')); } catch { series = null; }
  const episodeNumber = Number(String(blueprint.episodeId ?? '').match(/E(\d{2})$/)?.[1] ?? 1);
  const branding = normalizeBranding(episodeBranding(series, episodeNumber));
  const canvas ={ width: num(series?.delivery?.width, 1080), height: num(series?.delivery?.height, 1920), fps: num(series?.delivery?.fps, 30) };

  const ordered = applyEditOrder(Array.isArray(blueprint.shots) ? blueprint.shots : [], blueprint.editOrderOverride);
  if (ordered.length === 0) throw new Error('blueprint.shots is empty');
  const unreviewed = ordered.filter((shot) => shot.continuity?.status !== 'pass');
  if (unreviewed.length > 0 && !options.allowUnreviewed) {
    console.error(`Refusing to build: ${unreviewed.length} still(s) have not passed the continuity gate: ${unreviewed.map((shot) => `${shot.shotId} (${shot.continuity?.status ?? 'review'})`).join(', ')}`);
    console.error('Run the checklist in references/continuity-gate.md, or pass --allow-unreviewed for a work-in-progress look.');
    process.exitCode = 1;
    return;
  }

  const assetsDir = join(options.output, 'assets');
  const cuts = [];
  const stillHashes = {};
  let clock = 0;
  const splashDuration = branding?.opening?.mode === 'splash' ? num(branding.opening.durationSeconds, 1) : 0;
  let splash = null;
  for (const [index, shot] of ordered.entries()) {
    const still = await freeze(options.root, shot.stillLocalPath ?? shot.stillPath, join(assetsDir, 'stills'), `${shot.shotId} still`);
    stillHashes[shot.shotId] = still.hash;
    const hold = num(shot.clipDurationSeconds, num(shot.durationSeconds, 3));
    const cut = {
      shotId: shot.shotId,
      kind: shot.kind ?? (shot.line ? 'speak' : 'action'),
      speaker: shot.speaker ?? null,
      start: clock,
      hold,
      stillSrc: `assets/stills/${basename(still.target)}`,
      stemSrc: null,
      stemDuration: num(shot.stemDurationSeconds, 0) || null,
    };
    if (shot.stemLocalPath) {
      const stem = await freeze(options.root, shot.stemLocalPath, join(assetsDir, 'stems'), `${shot.shotId} stem`);
      cut.stemSrc = `assets/stems/${basename(stem.target)}`;
    }
    cuts.push(cut);
    clock += hold;
    if (index === 0 && splashDuration > 0) {
      splash = { start: clock, duration: splashDuration };
      clock += splashDuration;
    }
  }
  const storyEnd = clock;

  const assets = { mark: null, sting: null };
  if (branding?.seriesMark?.status === 'provided' && branding.seriesMark.localPath) {
    const mark = await freeze(options.root, branding.seriesMark.localPath, join(assetsDir, 'brand'), 'series mark');
    assets.mark = `assets/brand/${basename(mark.target)}`;
  }
  if (branding?.sting?.status === 'provided' && branding.sting.localPath) {
    const sting = await freeze(options.root, branding.sting.localPath, join(assetsDir, 'brand'), 'sting');
    assets.sting = `assets/brand/${basename(sting.target)}`;
    assets.stingDuration = num(branding.sting.durationSeconds, 1);
  }

  let endCard = null;
  let total = storyEnd;
  if (branding?.endCard?.mode && branding.endCard.mode !== 'none') {
    const blackout = num(branding.endCard.blackoutSeconds, 0);
    const duration = num(branding.endCard.durationSeconds, 1);
    const nextText = (branding.endCard.nextText ?? '').replace('{n+1}', String(episodeNumber + 1)).replace('{n}', String(episodeNumber + 1));
    endCard = { blackStart: storyEnd, blackout, cardStart: storyEnd + blackout, duration, nextText };
    total = storyEnd + blackout + duration;
  }
  if (branding?.credits?.mode === 'end-matter') total += num(branding.credits.durationSeconds, 0);

  const html = renderAnimatic({ blueprint, branding, cuts, bookends: { splash, endCard, total: Number(total.toFixed(3)) }, assets, canvas, showName: series?.show ?? null });
  await mkdir(options.output, { recursive: true });
  await writeFile(join(options.output, 'index.html'), html, 'utf8');
  const projectFile = join(options.output, 'hyperframes.json');
  try { await stat(projectFile); } catch {
    await writeFile(projectFile, `${JSON.stringify({ $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json', paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' }, media: { autoProxy: true } }, null, 2)}\n`, 'utf8');
  }
  const summary = {
    output: options.output,
    cuts: cuts.length,
    speakingCuts: cuts.filter((cut) => cut.stemSrc).length,
    storySeconds: Number(storyEnd.toFixed(3)),
    totalSeconds: Number(total.toFixed(3)),
    stillHashes,
    unreviewed: unreviewed.map((shot) => shot.shotId),
  };
  await writeFile(join(options.output, 'animatic-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  if (options.json) console.log(JSON.stringify(summary, null, 2));
  else {
    console.log(`Wrote ${join(options.output, 'index.html')}`);
    console.log(`  ${summary.cuts} stills (${summary.speakingCuts} with stems) · ${summary.storySeconds}s story · ${summary.totalSeconds}s with bookends`);
    if (unreviewed.length) console.log(`  WARNING ${unreviewed.length} unreviewed still(s) included (--allow-unreviewed)`);
    console.log('  Preview: npx hyperframes preview <output> --background --port 3022 ; on approval write blueprint.animatic = { approvedAt, stillHashes } from animatic-summary.json');
  }
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  await main();
}
