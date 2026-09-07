#!/usr/bin/env node

import { readFile, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeBookendSeconds, loadAndValidateManifest } from './validate-episode-manifest.mjs';

export const EDITOR_NOTES_HEADING = '## Editor notes';

/** Return the hand-written "## Editor notes" section of an existing BRIEF.md (heading included), or null. */
export async function readEditorNotes(path) {
  let existing;
  try {
    existing = await readFile(path, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
  const index = existing.indexOf(`\n${EDITOR_NOTES_HEADING}`);
  if (index === -1) return null;
  return existing.slice(index + 1).trimEnd();
}

function parseArgs(argv) {
  const options = { manifestPath: null, root: process.cwd(), output: null, force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') options.root = argv[++index];
    else if (arg === '--output') options.output = argv[++index];
    else if (arg === '--force') options.force = true;
    else if (!arg.startsWith('-') && !options.manifestPath) options.manifestPath = arg;
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!options.manifestPath || !options.output) {
    throw new Error('Usage: build-edit-handoff.mjs <edit-manifest.json> --root <production-kit-root> --output <hyperframes-project>/BRIEF.md');
  }
  options.root = resolve(options.root);
  options.manifestPath = resolve(options.manifestPath);
  options.output = resolve(options.output);
  if (basename(options.output) !== 'BRIEF.md') {
    throw new Error('--output must name a HyperFrames BRIEF.md file');
  }
  return options;
}

function yamlString(value) {
  return JSON.stringify(String(value));
}

function canonicalProfile(value) {
  return String(value ?? 'co-creator').trim().toLowerCase().replaceAll('_', '-').replaceAll(' ', '-');
}

function decideFlow(collaboration = {}) {
  const overall = canonicalProfile(collaboration.profile);
  const edit = canonicalProfile(collaboration.departments?.edit ?? overall);
  const companion = edit === 'director' || edit === 'co-creator' || overall === 'director' || overall === 'co-creator';
  return companion ? { flow: 'companion', storyboard: 'yes' } : { flow: 'automation', storyboard: 'no' };
}

function seconds(value) {
  return String(Number.parseFloat(Number(value).toFixed(3)));
}

function sourceLine(source, root, detail) {
  const absolute = resolve(root, source.localPath);
  const provenance = source.sourceOrigin === 'elegiac'
    ? `Elegiac asset ${source.sourceAssetId}`
    : `user source: ${source.sourceLabel}`;
  return `- ${absolute} — ${detail}; ${provenance}; sha256 ${source.sha256}`;
}

function describeMark(mark) {
  if (mark?.status === 'provided') return 'frozen series mark file (see Assets)';
  if (mark?.status === 'typographic') return `typographic lockup: render “${mark.title}” in ${mark.fontFamily}; no logo file exists`;
  return `waived (${mark?.reason ?? 'no reason recorded'}); show no series mark`;
}

function brandingLines(manifest) {
  const branding = manifest.branding ?? {};
  const opening = branding.opening ?? { mode: 'none' };
  const endCard = branding.endCard ?? { mode: 'none' };
  const credits = branding.credits ?? { mode: 'none' };
  const sting = branding.sting;
  const lines = [
    `Series mark: ${describeMark(branding.seriesMark)}.`,
    sting?.status === 'provided'
      ? `Sonic sting: frozen ${seconds(sting.durationSeconds)}s file (see Assets); the same file every episode.`
      : `Sonic sting: waived (${sting?.reason ?? 'no reason recorded'}); no sting, no theme music at the top or tail.`,
  ];
  if (branding.typography?.display || branding.typography?.captions) {
    lines.push(`Typography: display ${branding.typography.display ?? 'unspecified'}; captions ${branding.typography.captions ?? 'unspecified'}.`);
  }
  if (Array.isArray(branding.palette) && branding.palette.length > 0) lines.push(`Palette: ${branding.palette.join(', ')}.`);
  if (branding.ground?.mode) {
    const ground = branding.ground;
    const detail = ground.mode === 'gradient'
      ? `gradient ${(ground.colors ?? []).join(' → ')} at ${ground.angleDegrees ?? 20}°${ground.grain ? ` with ${Math.round(ground.grain * 100)} % grain` : ''}`
      : ground.mode === 'plate-blur' ? `blurred, darkened plate ${ground.plateId}` : 'brand texture';
    lines.push(`Bookend ground: full-bleed ${detail}; never bare black. Mark centred at 60–70 % of frame width on the splash and 55–65 % on the end card, placed as a transparent image (no blend modes).`);
  } else {
    lines.push('Bookend ground: not specified; use a full-bleed gradient of the first two palette colours. Never bare black. Mark at 60–70 % of frame width.');
  }
  if (opening.mode === 'splash') {
    lines.push(`Opening: ${seconds(opening.durationSeconds)}s series-mark splash, placed so the cold hook still lands inside the first three seconds of story; no other title card.`);
  } else if (opening.mode === 'overlay-mark') {
    lines.push('Opening: translucent series mark over the opening shot for its first 2–3 s, inside the phone-safe zone; adds no time; no title card.');
  } else {
    lines.push('Opening: none; the story starts on frame one and the platform UI carries identity.');
  }
  if (endCard.mode === 'none') {
    lines.push('Ending: the cliffhanger frame is the last frame; no end card.');
  } else {
    const parts = [
      `Ending: cliffhanger lands clean → hard cut${(endCard.blackoutSeconds ?? 0) > 0 ? ` to black for ${seconds(endCard.blackoutSeconds)}s` : ''} → ${seconds(endCard.durationSeconds)}s end card with the series mark`,
    ];
    if (endCard.mode === 'mark-and-sting') parts.push('; the sting starts on the cut to black and ends inside the end card');
    if (nonEmptyText(endCard.nextText)) parts.push(`; end-card text “${endCard.nextText}”`);
    parts.push('. No dip, dissolve, or music swell may begin before the last line lands.');
    lines.push(parts.join(''));
  }
  lines.push(credits.mode === 'end-matter'
    ? `Credits: ${seconds(credits.durationSeconds)}s of end matter after the end card, never rolling, never before the end card.`
    : 'Credits: none on screen; platform metadata carries them.');
  lines.push(`Bookends add ${seconds(computeBookendSeconds(branding))}s after the ${seconds(manifest.targetDurationSeconds)}s story cut.`);
  return lines;
}

function nonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function renderBrief(manifest, { root, manifestPath }) {
  const { flow, storyboard } = decideFlow(manifest.collaboration);
  const language = manifest.captions?.language ?? 'en';
  const aspect = `${manifest.canvas.width}x${manifest.canvas.height}`;
  const bookendSeconds = computeBookendSeconds(manifest.branding);
  const masterSeconds = Number((manifest.targetDurationSeconds + bookendSeconds).toFixed(3));
  const clipLines = manifest.clips.map((clip, index) => {
    const duration = clip.outSeconds - clip.inSeconds;
    const transition = clip.transitionOutSeconds ?? 0;
    return `${index + 1}. **${clip.shotId}** · ${clip.role ?? 'story'} · source ${seconds(clip.inSeconds)}–${seconds(clip.outSeconds)}s · edit ${seconds(duration)}s · transition overlap ${seconds(transition)}s`;
  });
  const sourceLines = manifest.clips.map((clip) => sourceLine(clip, root, `${clip.shotId} ${clip.role ?? 'story'} clip`));
  for (const kind of ['dialogue', 'music', 'sfx']) {
    for (const entry of manifest.audio?.[kind] ?? []) {
      sourceLines.push(sourceLine(entry, root, `${kind} ${entry.id}`));
    }
  }
  if (manifest.captions?.sidecar) {
    sourceLines.push(`- ${resolve(root, manifest.captions.sidecar)} — ${language} caption sidecar; sha256 ${manifest.captions.sidecarSha256}`);
  }
  if (manifest.branding?.seriesMark?.status === 'provided') {
    sourceLines.push(sourceLine(manifest.branding.seriesMark, root, 'series mark (brand punctuation, opening overlay/splash and end card)'));
  }
  if (manifest.branding?.sting?.status === 'provided') {
    sourceLines.push(sourceLine(manifest.branding.sting, root, `sonic sting ${seconds(manifest.branding.sting.durationSeconds)}s (starts on the cut to black under the end card)`));
  }

  const departments = Object.entries(manifest.collaboration?.departments ?? {})
    .map(([department, profile]) => `${department}: ${profile}`)
    .join(', ');
  const notes = [
    `Canonical edit manifest: ${manifestPath}`,
    `Production ${manifest.productionId ?? 'local-only'}; Episode Board ${manifest.boardId ?? 'local-only'}; edit revision ${manifest.revision}.`,
    `Collaboration: ${manifest.collaboration?.profile ?? 'co-creator'}${departments ? ` (${departments})` : ''}.`,
    'Use only the frozen local paths above. No render-time network requests, clocks, or unseeded randomness.',
    'Preserve shot IDs and source hashes in the composition/ledger. Do not replace or regenerate media without a separate user-approved Elegiac quote.',
    'Keep faces, plot evidence, titles, and captions inside phone-safe vertical zones.',
    'Branding is brand punctuation, not an intro: no title sequence, theme song, “previously on”, episode-title card, rolling credits, production logos, or next-episode preview. Use only the mark, sting, and end-card behaviour named above; do not invent placeholder branding.',
    'The cliffhanger is sacred: the last dramatic frame stays untouched until the hard cut; the end card and sting follow it, never overlap it.',
    'House audio rules: dialogue comes from the original stems listed above, never from a padded lipsync driver and never from the clip’s own track (mute every <video>); ducking and fades are GSAP timeline volume tweens on the main timeline, never data-automation lanes (they break Studio playback); normalise beds to about −24 dB mean before placement; music sits well under dialogue and fades out into the cut to black.',
    'House picture rules: one sub-composition per scene or location, not one monolithic index.html; captions are a sidecar unless “Burn in captions: yes” above; when burned in, use a single tested caption component whose container sets bottom:auto and height:auto so the .clip inset cannot stretch it; fonts only from the families HyperFrames can supply.',
    manifest.sourceSpec
      ? `Sources are ${manifest.sourceSpec.width}x${manifest.sourceSpec.height} at ${manifest.sourceSpec.fps} fps, conformed to the ${aspect} master at ${manifest.canvas.fps} fps; disclose this in delivery.`
      : `Render the declared ${aspect} output profile; disclose any lower-resolution source material.`,
    `${manifest.outputProfile === 'draft-480' ? 'This is a draft-only output and must not be labeled final.' : 'Render with --quality high --low-memory-mode (a vertical over 60 s otherwise needs more than 20 GB of frame scratch); quality values are draft, standard, high.'}`,
    'Run HyperFrames check --snapshots, inspect representative frames, and obtain explicit final Studio preview approval before render; if Studio playback is untrustworthy, review a --quality draft render and say so. Deliver a review proxy under 30 MB beside the master.',
  ];

  return `---
workflow: general-video
flow: ${flow}
storyboard: ${storyboard}
message: ${yamlString(`${manifest.story.hook} → ${manifest.story.cliffhanger}`)}
destination: vertical-microdrama
aspect: ${aspect}
language: ${language}
length: ${seconds(masterSeconds)}s
---

## Intent

Finish ${manifest.episodeId} of **${manifest.show}** as a native 9:16 scripted microdrama episode. The hook is “${manifest.story.hook}” The central turn is “${manifest.story.turn}” End on the caused cliffhanger: “${manifest.story.cliffhanger}”

## Assets

${sourceLines.join('\n')}

## Customizations

- Assemble clips in manifest order to a ${seconds(manifest.targetDurationSeconds)} second story cut at ${manifest.canvas.fps} fps; with branding bookends the master runs ${seconds(masterSeconds)} seconds.
- Cut plan:
${clipLines.map((line) => `  ${line}`).join('\n')}
- Burn in ${language} captions: ${manifest.captions?.burnIn === true ? 'yes' : 'no'}.
- Episode bug: ${manifest.graphics?.episodeBug ?? 'none'}.
- Cold-open title: ${manifest.graphics?.coldOpenTitle ?? 'none'}.
- End card: ${manifest.graphics?.endCard ?? 'none'}.
- Brand punctuation (series-level package, reused every episode):
${brandingLines(manifest).map((line) => `  - ${line}`).join('\n')}
- Build dialogue, music, and SFX as separate controllable tracks; preserve intelligibility on phone speakers.

## Notes

${notes.map((note) => `- ${note}`).join('\n')}
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

  const result = await loadAndValidateManifest(options.manifestPath, { root: options.root });
  if (result.errors.length > 0) {
    console.error('Cannot build HyperFrames handoff; edit manifest failed validation:');
    for (const error of result.errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }

  const hyperframesRoot = dirname(options.output);
  try {
    const project = await stat(join(hyperframesRoot, 'hyperframes.json'));
    if (!project.isFile()) throw new Error('not a file');
  } catch {
    console.error(`Cannot build handoff: initialize HyperFrames first; missing ${join(hyperframesRoot, 'hyperframes.json')}`);
    process.exitCode = 1;
    return;
  }
  // The builder owns BRIEF.md: it regenerates the file on every run (the manifest is the source of
  // truth) and carries forward only a hand-written "## Editor notes" section, so a rebuild after a
  // manifest change never needs --force and never loses the editor's notes.
  const editorNotes = await readEditorNotes(options.output);

  const brief = renderBrief(result.manifest, {
    root: options.root,
    manifestPath: relative(options.root, options.manifestPath).replaceAll('\\', '/'),
  }) + (editorNotes ? `\n${editorNotes}\n` : '');
  await writeFile(options.output, brief, 'utf8');
  console.log(`Wrote ${options.output}${editorNotes ? ' (editor notes preserved)' : ''}`);
  console.log(`${result.summary.clipCount} clips · ${result.summary.editDurationSeconds}s story + ${result.summary.bookendSeconds}s bookends = ${result.summary.masterDurationSeconds}s · ${result.summary.outputProfile}`);
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  await main();
}
