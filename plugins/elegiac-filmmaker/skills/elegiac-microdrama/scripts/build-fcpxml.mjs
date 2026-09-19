#!/usr/bin/env node

// Writes a Final Cut Pro FCPXML 1.11 timeline from a version 2 edit manifest.
// Dependency-free Node ESM, like its siblings. Never calls Elegiac, never spends credits, never touches media bytes.
//
// Mapping (see references/edit.md, "Final Cut Pro handoff"):
//   - one event/project/sequence at the manifest canvas (default 1080x1920) and fps;
//   - one asset per clip localPath and one asset-clip in the primary storyline per manifest clip, using inSeconds/outSeconds
//     and timelineStartSeconds when present (else sequential); transitionOutSeconds becomes a Cross Dissolve straddling the cut,
//     trimmed so the timeline runtime equals the manifest's story runtime (sum of visible ranges minus overlaps);
//   - a marker at every clip start named by shotId;
//   - audio.music[] as connected clips on lane -1 (role music), with volume keyframes from audio.music[].volumeKeyframes
//     ([{ atSeconds, gainDb }], atSeconds on the story timeline) or a flat gainDb;
//   - extracted-mode clips get their own audio pulled down and the linked audio.native track on lane -2 (role dialogue).
// Branding bookends (splash, blackout, end card, end matter) are not emitted; the editor adds them from BRIEF.md.
//
// All times are rational strings at frame granularity: "<frames>/<fps>s".

import { writeFile } from 'node:fs/promises';
import { basename, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadAndValidateManifest } from './validate-episode-manifest.mjs';

export const FCPXML_VERSION = '1.11';
const CROSS_DISSOLVE_UID = 'FxPlug:4731E73A-8DAC-4113-9A30-AE85B1761265';
const DEFAULT_CANVAS = Object.freeze({ width: 1080, height: 1920, fps: 30 });

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

/** Whole frames at the sequence rate; the FCPXML never carries sub-frame times. */
export function toFrames(seconds, fps) {
  return Math.round((finiteNumber(seconds) ? seconds : 0) * fps);
}

/** Rational time string "<frames>/<fps>s"; zero is written as "0s" as Final Cut does. */
export function rational(frames, fps) {
  if (frames === 0) return '0s';
  return `${frames}/${fps}s`;
}

function decibels(value) {
  const number = finiteNumber(value) ? value : 0;
  return `${Number(number.toFixed(2))}dB`;
}

function resolveMediaUrl(localPath, root, label) {
  if (typeof localPath !== 'string' || localPath.trim() === '') throw new Error(`${label}.localPath must be a non-empty string`);
  if (/^(?:https?:|data:|blob:)/i.test(localPath)) throw new Error(`${label}.localPath must be a frozen local file, not ${localPath}`);
  const absolute = resolve(root, localPath);
  const fromRoot = relative(root, absolute);
  if (fromRoot.startsWith('..') || isAbsolute(fromRoot)) throw new Error(`${label}.localPath escapes the declared root: ${localPath}`);
  return pathToFileURL(absolute).href;
}

function sourceDurationSeconds(entry) {
  if (finiteNumber(entry?.sourceSpec?.durationSeconds) && entry.sourceSpec.durationSeconds > 0) return entry.sourceSpec.durationSeconds;
  if (finiteNumber(entry?.durationSeconds) && entry.durationSeconds > 0) return entry.durationSeconds;
  return entry?.outSeconds ?? 0;
}

/**
 * Build the FCPXML document for a version 2 edit manifest.
 * `root` resolves the frozen localPath values into file:// URLs. Returns { xml, summary }.
 */
export function buildFcpxml(manifest, { root = process.cwd(), name } = {}) {
  if (!manifest || typeof manifest !== 'object') throw new Error('manifest must be an object');
  const absoluteRoot = resolve(root);
  const fps = finiteNumber(manifest.canvas?.fps) ? manifest.canvas.fps : DEFAULT_CANVAS.fps;
  const width = finiteNumber(manifest.canvas?.width) ? manifest.canvas.width : DEFAULT_CANVAS.width;
  const height = finiteNumber(manifest.canvas?.height) ? manifest.canvas.height : DEFAULT_CANVAS.height;
  if (!Number.isInteger(fps) || fps <= 0) throw new Error('canvas.fps must be a positive integer');
  const clips = Array.isArray(manifest.clips) ? manifest.clips : [];
  if (clips.length === 0) throw new Error('clips must contain at least one clip');
  const projectName = name ?? ([manifest.show, manifest.episodeId].filter(Boolean).join(' ') || 'Elegiac episode');

  let nextId = 1;
  const id = () => `r${nextId++}`;
  const resources = [];
  const formatId = id();
  resources.push(`    <format id="${formatId}" name="Elegiac ${width}x${height} ${fps}p" frameDuration="${rational(1, fps)}" width="${width}" height="${height}"/>`);
  let dissolveId = null;
  const assetIds = new Map();
  const assetFor = (entry, label, { hasVideo, hasAudio }) => {
    const url = resolveMediaUrl(entry?.localPath, absoluteRoot, label);
    const key = `${url}|${hasVideo ? 'v' : ''}${hasAudio ? 'a' : ''}`;
    if (assetIds.has(key)) return assetIds.get(key);
    const assetId = id();
    assetIds.set(key, assetId);
    const duration = rational(toFrames(sourceDurationSeconds(entry), fps), fps);
    const attributes = [
      `id="${assetId}"`,
      `name="${escapeXml(basename(entry.localPath))}"`,
      'start="0s"',
      `duration="${duration}"`,
      `hasVideo="${hasVideo ? 1 : 0}"`,
      `hasAudio="${hasAudio ? 1 : 0}"`,
    ];
    if (hasVideo) attributes.push(`format="${formatId}"`, 'videoSources="1"');
    if (hasAudio) attributes.push('audioSources="1"', 'audioChannels="2"', 'audioRate="48000"');
    resources.push(`    <asset ${attributes.join(' ')}>\n      <media-rep kind="original-media" src="${escapeXml(url)}"/>\n    </asset>`);
    return assetId;
  };

  // Primary storyline placement in frames. Sequential by default; explicit timelineStartSeconds wins when present on every clip.
  const explicit = clips.every((clip) => finiteNumber(clip?.timelineStartSeconds));
  const placed = [];
  let cursor = 0;
  for (const [index, clip] of clips.entries()) {
    const label = `clips[${index}]`;
    if (!finiteNumber(clip?.inSeconds) || !finiteNumber(clip?.outSeconds) || clip.outSeconds <= clip.inSeconds) {
      throw new Error(`${label} needs inSeconds < outSeconds`);
    }
    const inFrames = toFrames(clip.inSeconds, fps);
    const visible = toFrames(clip.outSeconds, fps) - inFrames;
    const transition = explicit ? 0 : toFrames(clip.transitionOutSeconds ?? 0, fps);
    if (transition < 0 || transition >= visible) throw new Error(`${label}.transitionOutSeconds must be shorter than the clip`);
    const previous = placed[index - 1];
    const leading = previous ? previous.transition - Math.floor(previous.transition / 2) : 0;
    const trailing = Math.floor(transition / 2);
    const start = inFrames + leading;
    const duration = visible - leading - trailing;
    if (duration <= 0) throw new Error(`${label} is consumed entirely by its transitions`);
    const offset = explicit ? toFrames(clip.timelineStartSeconds, fps) : cursor;
    if (explicit && previous && offset < previous.offset + previous.duration) {
      throw new Error(`${label}.timelineStartSeconds overlaps the previous clip; the primary storyline cannot overlap`);
    }
    placed.push({ clip, label, index, offset, start, duration, transition, inFrames, visible });
    cursor = offset + duration;
  }
  const storyFrames = cursor;
  const anchor = placed[0];
  // Register clip assets first so resource ids follow storyline order (r2, r3, ...) before any connected audio.
  for (const item of placed) {
    item.assetId = assetFor(item.clip, item.label, { hasVideo: true, hasAudio: item.clip.sourceSpec?.hasAudio !== false });
  }

  // Connected audio: music on lane -1, extracted native dialogue on lane -2. Child offsets are in the anchor clip's local time.
  const toAnchorLocal = (timelineFrames) => anchor.start + (timelineFrames - anchor.offset);
  const connected = [];
  const music = Array.isArray(manifest.audio?.music) ? manifest.audio.music : [];
  for (const [index, entry] of music.entries()) {
    const label = `audio.music[${index}]`;
    if (!finiteNumber(entry?.inSeconds) || !finiteNumber(entry?.outSeconds) || entry.outSeconds <= entry.inSeconds) {
      throw new Error(`${label} needs inSeconds < outSeconds`);
    }
    const assetId = assetFor(entry, label, { hasVideo: false, hasAudio: true });
    const timelineStart = toFrames(entry.timelineStartSeconds ?? 0, fps);
    const inFrames = toFrames(entry.inSeconds, fps);
    const duration = toFrames(entry.outSeconds, fps) - inFrames;
    const keyframes = Array.isArray(entry.volumeKeyframes) ? entry.volumeKeyframes : [];
    let volume = '';
    if (keyframes.length > 0) {
      const points = keyframes
        .map((keyframe, keyframeIndex) => {
          if (!finiteNumber(keyframe?.atSeconds) || !finiteNumber(keyframe?.gainDb)) {
            throw new Error(`${label}.volumeKeyframes[${keyframeIndex}] needs atSeconds and gainDb`);
          }
          const local = inFrames + (toFrames(keyframe.atSeconds, fps) - timelineStart);
          return { local, gainDb: keyframe.gainDb };
        })
        .sort((a, b) => a.local - b.local)
        .map(({ local, gainDb }) => `            <keyframe time="${rational(local, fps)}" value="${decibels(gainDb)}"/>`);
      volume = `\n        <adjust-volume amount="${decibels(keyframes[0].gainDb)}">\n          <param name="amount">\n            <keyframeAnimation>\n${points.join('\n')}\n            </keyframeAnimation>\n          </param>\n        </adjust-volume>`;
    } else if (finiteNumber(entry.gainDb)) {
      volume = `\n        <adjust-volume amount="${decibels(entry.gainDb)}"/>`;
    }
    const clipName = escapeXml(entry.name ?? entry.sourceLabel ?? entry.id ?? basename(entry.localPath));
    connected.push(`      <asset-clip ref="${assetId}" lane="-1" offset="${rational(toAnchorLocal(timelineStart), fps)}" name="${clipName}" start="${rational(inFrames, fps)}" duration="${rational(duration, fps)}" audioRole="music">${volume}\n      </asset-clip>`);
  }
  const nativeTracks = Array.isArray(manifest.audio?.native) ? manifest.audio.native : [];
  for (const item of placed) {
    if (item.clip.audioMode !== 'extracted') continue;
    const track = nativeTracks.find((entry) => entry?.sourceShotId === item.clip.shotId);
    if (!track) throw new Error(`${item.label} is extracted-mode but has no linked audio.native track`);
    const assetId = assetFor(track, `audio.native(${item.clip.shotId})`, { hasVideo: false, hasAudio: true });
    const inFrames = toFrames(track.inSeconds, fps) + (item.start - item.inFrames);
    connected.push(`      <asset-clip ref="${assetId}" lane="-2" offset="${rational(toAnchorLocal(item.offset), fps)}" name="${escapeXml(track.id ?? item.clip.shotId)} native audio" start="${rational(inFrames, fps)}" duration="${rational(item.duration, fps)}" audioRole="dialogue"/>`);
  }

  const spine = [];
  for (const item of placed) {
    const { clip } = item;
    const assetId = item.assetId;
    const clipName = escapeXml(clip.name ?? clip.sourceLabel ?? clip.shotId);
    const shotId = escapeXml(clip.shotId ?? `clip-${item.index + 1}`);
    const body = [];
    if (clip.audioMode === 'extracted') body.push('      <adjust-volume amount="-96dB"/>');
    if (item === anchor) body.push(...connected);
    body.push(`      <marker start="${rational(item.start, fps)}" duration="${rational(1, fps)}" value="${shotId}"/>`);
    spine.push(`    <asset-clip ref="${assetId}" offset="${rational(item.offset, fps)}" name="${clipName}" start="${rational(item.start, fps)}" duration="${rational(item.duration, fps)}">\n${body.join('\n')}\n    </asset-clip>`);
    if (item.transition > 0) {
      dissolveId ??= id();
      const cut = item.offset + item.duration;
      const transitionOffset = cut - Math.floor(item.transition / 2);
      spine.push(`    <transition name="Cross Dissolve" offset="${rational(transitionOffset, fps)}" duration="${rational(item.transition, fps)}">\n      <filter-video ref="${dissolveId}" name="Cross Dissolve"/>\n    </transition>`);
    }
  }
  if (dissolveId) resources.push(`    <effect id="${dissolveId}" name="Cross Dissolve" uid="${CROSS_DISSOLVE_UID}"/>`);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="${FCPXML_VERSION}">
  <resources>
${resources.join('\n')}
  </resources>
  <library>
    <event name="${escapeXml(projectName)}">
      <project name="${escapeXml(projectName)}">
        <sequence format="${formatId}" duration="${rational(storyFrames, fps)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">
          <spine>
${spine.map((line) => line.replace(/^/gm, '        ')).join('\n')}
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>
`;

  return {
    xml,
    summary: {
      projectName,
      fps,
      width,
      height,
      clipCount: placed.length,
      musicCount: music.length,
      markerCount: placed.length,
      storyDurationSeconds: Number((storyFrames / fps).toFixed(3)),
      storyDurationFrames: storyFrames,
    },
  };
}

function parseArgs(argv) {
  const options = { manifestPath: null, root: process.cwd(), output: null, force: false, allowUnapproved: false, skipFiles: false, name: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') options.root = argv[++index];
    else if (arg === '--output') options.output = argv[++index];
    else if (arg === '--name') options.name = argv[++index];
    else if (arg === '--force') options.force = true;
    else if (arg === '--allow-unapproved') options.allowUnapproved = true;
    else if (arg === '--skip-files') options.skipFiles = true;
    else if (!arg.startsWith('-') && !options.manifestPath) options.manifestPath = arg;
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!options.manifestPath || !options.output) {
    throw new Error('Usage: build-fcpxml.mjs <edit-manifest.json> --root <production-kit-root> --output <episode>.fcpxml [--name <project name>] [--force] [--allow-unapproved] [--skip-files]');
  }
  if (!options.output.endsWith('.fcpxml')) throw new Error('--output must end in .fcpxml');
  options.root = resolve(options.root);
  options.manifestPath = resolve(options.manifestPath);
  options.output = resolve(options.output);
  return options;
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
  const validation = await loadAndValidateManifest(options.manifestPath, {
    root: options.root,
    allowUnapproved: options.allowUnapproved,
    skipFiles: options.skipFiles,
  });
  if (validation.errors.length > 0) {
    console.error(`Refusing to build a timeline from an invalid manifest (${validation.errors.length} error(s)):`);
    for (const error of validation.errors) console.error(`  error: ${error}`);
    process.exitCode = 1;
    return;
  }
  if (validation.manifest.version !== 2) {
    console.error('build-fcpxml.mjs requires a version 2 edit manifest; migrate first (references/schemas.md)');
    process.exitCode = 1;
    return;
  }
  try {
    const { xml, summary } = buildFcpxml(validation.manifest, { root: options.root, name: options.name ?? undefined });
    await writeFile(options.output, xml, { encoding: 'utf8', flag: options.force ? 'w' : 'wx' });
    console.log(`Wrote ${relative(process.cwd(), options.output) || options.output}: ${summary.clipCount} clips, ${summary.musicCount} music cues, ${summary.markerCount} markers, ${summary.storyDurationSeconds}s at ${summary.fps} fps (${summary.width}x${summary.height}). Bookends are not included; add them in Final Cut from BRIEF.md.`);
    for (const warning of validation.warnings) console.log(`  warning: ${warning}`);
  } catch (error) {
    if (error?.code === 'EEXIST') console.error(`${options.output} already exists; pass --force to overwrite`);
    else console.error(error.message);
    process.exitCode = 1;
  }
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  await main();
}
