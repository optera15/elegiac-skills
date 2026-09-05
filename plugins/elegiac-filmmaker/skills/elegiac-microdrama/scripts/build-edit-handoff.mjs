#!/usr/bin/env node

import { stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadAndValidateManifest } from './validate-episode-manifest.mjs';

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
  return Number(value).toFixed(3).replace(/\.000$/, '');
}

function sourceLine(source, root, detail) {
  const absolute = resolve(root, source.localPath);
  const provenance = source.sourceOrigin === 'elegiac'
    ? `Elegiac asset ${source.sourceAssetId}`
    : `user source: ${source.sourceLabel}`;
  return `- ${absolute} — ${detail}; ${provenance}; sha256 ${source.sha256}`;
}

export function renderBrief(manifest, { root, manifestPath }) {
  const { flow, storyboard } = decideFlow(manifest.collaboration);
  const language = manifest.captions?.language ?? 'en';
  const aspect = `${manifest.canvas.width}x${manifest.canvas.height}`;
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
    `${manifest.outputProfile === 'draft-480' ? 'This is a draft-only output and must not be labeled final.' : `Render the declared ${aspect} output profile; disclose any lower-resolution source material.`}`,
    'Run HyperFrames checks, inspect representative frames, and obtain explicit final Studio preview approval before render.',
  ];

  return `---
workflow: general-video
flow: ${flow}
storyboard: ${storyboard}
message: ${yamlString(`${manifest.story.hook} → ${manifest.story.cliffhanger}`)}
destination: vertical-microdrama
aspect: ${aspect}
language: ${language}
length: ${seconds(manifest.targetDurationSeconds)}s
---

## Intent

Finish ${manifest.episodeId} of **${manifest.show}** as a native 9:16 scripted microdrama episode. The hook is “${manifest.story.hook}” The central turn is “${manifest.story.turn}” End on the caused cliffhanger: “${manifest.story.cliffhanger}”

## Assets

${sourceLines.join('\n')}

## Customizations

- Assemble clips in manifest order to ${seconds(manifest.targetDurationSeconds)} seconds at ${manifest.canvas.fps} fps.
- Cut plan:
${clipLines.map((line) => `  ${line}`).join('\n')}
- Burn in ${language} captions: ${manifest.captions?.burnIn === true ? 'yes' : 'no'}.
- Episode bug: ${manifest.graphics?.episodeBug ?? 'none'}.
- Cold-open title: ${manifest.graphics?.coldOpenTitle ?? 'none'}.
- End card: ${manifest.graphics?.endCard ?? 'none'}.
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
  if (!options.force) {
    try {
      await stat(options.output);
      console.error(`Refusing to overwrite existing ${options.output}; reconcile it first or rerun with --force`);
      process.exitCode = 1;
      return;
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  const brief = renderBrief(result.manifest, {
    root: options.root,
    manifestPath: relative(options.root, options.manifestPath).replaceAll('\\', '/'),
  });
  await writeFile(options.output, brief, 'utf8');
  console.log(`Wrote ${options.output}`);
  console.log(`${result.summary.clipCount} clips · ${result.summary.editDurationSeconds}s · ${result.summary.outputProfile}`);
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  await main();
}
