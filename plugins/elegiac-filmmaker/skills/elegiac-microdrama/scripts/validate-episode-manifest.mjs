#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { probe, containedPath } from './check-scenelet-plan.mjs';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUTPUT_PROFILES = new Map([
  ['master-1080', { width: 1080, height: 1920 }],
  ['fallback-720', { width: 720, height: 1280 }],
  ['draft-480', { width: 480, height: 854 }],
]);

const HASH_RE = /^[a-f0-9]{64}$/;
const REMOTE_RE = /^(?:https?:|data:|blob:)/i;
const COLLABORATION_PROFILES = new Set(['fast-track', 'co-creator', 'director']);
const MARK_STATUSES = new Set(['provided', 'typographic', 'waived']);
const STING_STATUSES = new Set(['provided', 'waived']);
const OPENING_MODES = new Set(['none', 'overlay-mark', 'splash']);
const END_CARD_MODES = new Set(['none', 'mark-only', 'mark-and-sting']);
const CREDIT_MODES = new Set(['none', 'end-matter']);
const GROUND_MODES = new Set(['gradient', 'texture', 'plate-blur']);

/** True for a hex colour whose channels are all under ~0x24, i.e. visually black. */
function isNearBlack(color) {
  const match = typeof color === 'string' ? color.trim().match(/^#([0-9a-f]{6})$/i) : null;
  if (!match) return false;
  const value = Number.parseInt(match[1], 16);
  return ((value >> 16) & 0xff) < 0x24 && ((value >> 8) & 0xff) < 0x24 && (value & 0xff) < 0x24;
}

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function inRange(value, min, max) {
  return finiteNumber(value) && value >= min && value <= max;
}

/** Seconds the branding bookends add after the story cut (splash + blackout + end card + end matter). */
export function computeBookendSeconds(branding) {
  if (!branding || typeof branding !== 'object') return 0;
  let total = 0;
  if (branding.opening?.mode === 'splash' && finiteNumber(branding.opening.durationSeconds)) total += branding.opening.durationSeconds;
  if (branding.endCard?.mode && branding.endCard.mode !== 'none') {
    if (finiteNumber(branding.endCard.blackoutSeconds)) total += branding.endCard.blackoutSeconds;
    if (finiteNumber(branding.endCard.durationSeconds)) total += branding.endCard.durationSeconds;
  }
  if (branding.credits?.mode === 'end-matter' && finiteNumber(branding.credits.durationSeconds)) total += branding.credits.durationSeconds;
  return Number(total.toFixed(3));
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function displayPath(path) {
  return path.replaceAll('\\', '/');
}

function resolveLocalPath(localPath, root, label, errors) {
  if (!nonEmpty(localPath)) {
    errors.push(`${label}.localPath must be a non-empty string`);
    return null;
  }
  if (REMOTE_RE.test(localPath)) {
    errors.push(`${label}.localPath must be frozen locally, not ${localPath}`);
    return null;
  }
  const absolute = resolve(root, localPath);
  const fromRoot = relative(root, absolute);
  if (fromRoot.startsWith('..') || isAbsolute(fromRoot)) {
    errors.push(`${label}.localPath escapes the declared root: ${localPath}`);
    return null;
  }
  return absolute;
}

async function sha256(path) {
  const contents = await readFile(path);
  return createHash('sha256').update(contents).digest('hex');
}

async function validateFrozenSource(source, label, context) {
  const { errors, options, root, warnings } = context;
  if (source?.approved !== true && !options.allowUnapproved) errors.push(`${label}.approved must be true for a final handoff`);
  else if (source?.approved !== true) warnings.push(`${label} is not approved`);
  if (!['elegiac', 'user'].includes(source?.sourceOrigin)) {
    errors.push(`${label}.sourceOrigin must be "elegiac" or "user"`);
  } else if (source.sourceOrigin === 'elegiac' && !nonEmpty(source.sourceAssetId)) {
    errors.push(`${label}.sourceAssetId is required for an Elegiac source`);
  } else if (source.sourceOrigin === 'user' && !nonEmpty(source.sourceLabel)) {
    errors.push(`${label}.sourceLabel is required for a user-supplied source`);
  }

  const absolute = resolveLocalPath(source?.localPath, root, label, errors);
  if (!absolute) return 0;

  if (options.skipFiles) {
    if (!HASH_RE.test(source.sha256 ?? '')) {
      errors.push(`${label}.sha256 must be 64 lowercase hexadecimal characters when --skip-files is used`);
    }
    return 0;
  }

  try {
    await containedPath(root, source.localPath);
    const info = await stat(absolute);
    if (!info.isFile()) {
      errors.push(`${label}.localPath is not a file: ${displayPath(relative(root, absolute))}`);
      return 0;
    }
  } catch {
    errors.push(`${label}.localPath does not exist: ${displayPath(relative(root, absolute))}`);
    return 0;
  }

  const actualHash = await sha256(absolute);
  if (!HASH_RE.test(source.sha256 ?? '')) {
    if (options.writeHashes) {
      source.sha256 = actualHash;
      return 1;
    }
    errors.push(`${label}.sha256 is missing or invalid; freeze the file and rerun with --write-hashes`);
  } else if (source.sha256 !== actualHash) {
    errors.push(`${label}.sha256 does not match ${displayPath(relative(root, absolute))}`);
  }

  return 0;
}

async function validateBranding(manifest, context) {
  const { errors, warnings } = context;
  const branding = manifest.branding;
  let hashesWritten = 0;
  if (!branding || typeof branding !== 'object' || Array.isArray(branding)) {
    errors.push('branding is required: resolve the brand punctuation package (references/branding.md) or waive each element with a reason');
    return 0;
  }

  const mark = branding.seriesMark;
  const markStatus = mark?.status;
  if (!MARK_STATUSES.has(markStatus)) {
    errors.push('branding.seriesMark.status must be provided, typographic, or waived');
  } else if (markStatus === 'provided') {
    hashesWritten += await validateFrozenSource(mark, 'branding.seriesMark', context);
  } else if (markStatus === 'typographic') {
    if (!nonEmpty(mark.title)) errors.push('branding.seriesMark.title is required for a typographic mark');
    if (!nonEmpty(mark.fontFamily)) errors.push('branding.seriesMark.fontFamily is required for a typographic mark');
  } else if (!nonEmpty(mark.reason)) {
    errors.push('branding.seriesMark.reason is required when the series mark is waived');
  }
  const markAvailable = markStatus === 'provided' || markStatus === 'typographic';

  const sting = branding.sting;
  const stingStatus = sting?.status;
  if (!STING_STATUSES.has(stingStatus)) {
    errors.push('branding.sting.status must be provided or waived');
  } else if (stingStatus === 'provided') {
    hashesWritten += await validateFrozenSource(sting, 'branding.sting', context);
    if (!inRange(sting.durationSeconds, 0.3, 3)) {
      errors.push('branding.sting.durationSeconds must be between 0.3 and 3 (a sonic signature, not a theme)');
    }
  } else if (!nonEmpty(sting.reason)) {
    errors.push('branding.sting.reason is required when the sting is waived');
  }
  const stingAvailable = stingStatus === 'provided';

  const opening = branding.opening;
  if (!OPENING_MODES.has(opening?.mode)) {
    errors.push('branding.opening.mode must be none, overlay-mark, or splash');
  } else {
    if (opening.mode !== 'none' && !markAvailable) {
      errors.push(`branding.opening.mode ${opening.mode} requires a series mark that is not waived`);
    }
    if (opening.mode === 'splash') {
      if (!inRange(opening.durationSeconds, 0.5, 2)) {
        errors.push('branding.opening.durationSeconds must be between 0.5 and 2 for a splash');
      }
      if (Number.isInteger(manifest.episode) && manifest.episode > 1) {
        warnings.push(`branding.opening.mode splash on episode ${manifest.episode}: episodes after the first normally use overlay-mark or none; record the reason`);
      }
    }
  }

  const endCard = branding.endCard;
  if (!END_CARD_MODES.has(endCard?.mode)) {
    errors.push('branding.endCard.mode must be none, mark-only, or mark-and-sting');
  } else if (endCard.mode !== 'none') {
    if (!markAvailable) errors.push(`branding.endCard.mode ${endCard.mode} requires a series mark that is not waived`);
    if (endCard.mode === 'mark-and-sting' && !stingAvailable) errors.push('branding.endCard.mode mark-and-sting requires a provided sting');
    if (!inRange(endCard.blackoutSeconds ?? 0, 0, 0.5)) errors.push('branding.endCard.blackoutSeconds must be between 0 and 0.5');
    if (!inRange(endCard.durationSeconds, 0.5, 1.5)) {
      errors.push('branding.endCard.durationSeconds must be between 0.5 and 1.5 (brand punctuation, not an outro)');
    }
    if (endCard.mode === 'mark-only' && stingAvailable) {
      warnings.push('branding.endCard.mode is mark-only although a sting is provided; the reveal → sting → mark conditioning is weaker');
    }
    if (endCard.nextText !== undefined && endCard.nextText !== null && !nonEmpty(endCard.nextText)) {
      errors.push('branding.endCard.nextText must be a non-empty string when present');
    }
  }

  const credits = branding.credits ?? { mode: 'none' };
  if (!CREDIT_MODES.has(credits?.mode)) {
    errors.push('branding.credits.mode must be none or end-matter');
  } else if (credits.mode === 'end-matter') {
    if (!inRange(credits.durationSeconds, 0.5, 3)) errors.push('branding.credits.durationSeconds must be between 0.5 and 3 for end matter');
    warnings.push('branding.credits.mode end-matter: keep credits after the end card and outside the dramatic flow; confirm the requirement is contractual');
  }

  if (!markAvailable && opening?.mode === 'none' && endCard?.mode === 'none') {
    warnings.push('branding carries no series identity in the episode; the platform UI and key art must carry it');
  }

  const usesCard = opening?.mode === 'splash' || (endCard?.mode && endCard.mode !== 'none');
  if (usesCard) {
    const ground = branding.ground;
    if (!ground || !GROUND_MODES.has(ground.mode)) {
      warnings.push('branding.ground is missing: bookends need a full-bleed brand ground (gradient, texture, or plate-blur); a small mark on bare black reads as unfinished');
    } else if (ground.mode === 'gradient') {
      const colors = Array.isArray(ground.colors) ? ground.colors : [];
      if (colors.length < 2) errors.push('branding.ground.colors needs two colours for a gradient');
      else if (colors.every(isNearBlack)) warnings.push('branding.ground gradient is all near-black; use at least one palette colour so the mark has a ground to sit on');
    } else if (ground.mode === 'plate-blur' && !nonEmpty(ground.plateId)) {
      errors.push('branding.ground.plateId is required for plate-blur');
    }
  }

  return hashesWritten;
}

function validateArgs(argv) {
  const options = {
    manifestPath: null,
    root: process.cwd(),
    writeHashes: false,
    skipFiles: false,
    allowUnapproved: false,
    json: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') options.root = argv[++index];
    else if (arg === '--write-hashes') options.writeHashes = true;
    else if (arg === '--skip-files') options.skipFiles = true;
    else if (arg === '--allow-unapproved') options.allowUnapproved = true;
    else if (arg === '--json') options.json = true;
    else if (!arg.startsWith('-') && !options.manifestPath) options.manifestPath = arg;
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!options.manifestPath) {
    throw new Error('Usage: validate-episode-manifest.mjs <edit-manifest.json> [--root <dir>] [--write-hashes] [--json]');
  }
  if (options.writeHashes && options.skipFiles) {
    throw new Error('--write-hashes and --skip-files cannot be combined');
  }
  options.root = resolve(options.root);
  options.manifestPath = resolve(options.manifestPath);
  return options;
}

export async function loadAndValidateManifest(manifestPath, suppliedOptions = {}) {
  const options = {
    root: resolve(suppliedOptions.root ?? process.cwd()),
    writeHashes: suppliedOptions.writeHashes ?? false,
    skipFiles: suppliedOptions.skipFiles ?? false,
    allowUnapproved: suppliedOptions.allowUnapproved ?? false,
  };
  const absoluteManifestPath = resolve(manifestPath);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(absoluteManifestPath, 'utf8'));
  } catch (error) {
    return { manifest: null, errors: [`Cannot read valid JSON from ${absoluteManifestPath}: ${error.message}`], warnings: [], summary: null };
  }

  const errors = [];
  const warnings = [];
  const context = { errors, warnings, root: options.root, options };
  let hashesWritten = 0;

  const manifestFromRoot = relative(options.root, absoluteManifestPath);
  if (manifestFromRoot.startsWith('..') || isAbsolute(manifestFromRoot)) {
    errors.push('edit manifest must be inside the declared production-kit root');
  }

  if (![1, 2].includes(manifest.version)) errors.push('version must equal 1 or 2');
  const native = manifest.version === 2;
  if (native && manifest.audioSource !== 'native') errors.push('version 2 requires audioSource native; do not replace WAN sound with voice samples');
  if (native && (manifest.audio?.dialogue?.length ?? 0) > 0) errors.push('version 2 audio.dialogue must be empty; use generated native audio, not voice references');
  if (!nonEmpty(manifest.show)) errors.push('show must be a non-empty string');
  if (!Number.isInteger(manifest.season) || manifest.season < 1) errors.push('season must be a positive integer');
  if (!Number.isInteger(manifest.episode) || manifest.episode < 1) errors.push('episode must be a positive integer');
  if (!Number.isInteger(manifest.revision) || manifest.revision < 1) errors.push('revision must be a positive integer');

  if (!COLLABORATION_PROFILES.has(manifest.collaboration?.profile)) {
    errors.push('collaboration.profile must be fast-track, co-creator, or director');
  }
  if (manifest.collaboration?.departments !== undefined) {
    if (!manifest.collaboration.departments || typeof manifest.collaboration.departments !== 'object' || Array.isArray(manifest.collaboration.departments)) {
      errors.push('collaboration.departments must be an object');
    } else {
      for (const [department, profile] of Object.entries(manifest.collaboration.departments)) {
        if (!nonEmpty(department) || !COLLABORATION_PROFILES.has(profile)) {
          errors.push(`collaboration.departments.${department || '<empty>'} must be fast-track, co-creator, or director`);
        }
      }
    }
  }

  const episodeMatch = typeof manifest.episodeId === 'string' ? manifest.episodeId.match(/^S(\d{2})E(\d{2})$/) : null;
  if (!episodeMatch) {
    errors.push('episodeId must match S01E01');
  } else if (Number(episodeMatch[1]) !== manifest.season || Number(episodeMatch[2]) !== manifest.episode) {
    errors.push('episodeId must agree with season and episode');
  }

  const expectedCanvas = OUTPUT_PROFILES.get(manifest.outputProfile);
  if (!expectedCanvas) {
    errors.push(`outputProfile must be one of: ${[...OUTPUT_PROFILES.keys()].join(', ')}`);
  } else if (manifest.canvas?.width !== expectedCanvas.width || manifest.canvas?.height !== expectedCanvas.height) {
    errors.push(`${manifest.outputProfile} requires ${expectedCanvas.width}x${expectedCanvas.height}`);
  }
  if (![24, 25, 30].includes(manifest.canvas?.fps)) errors.push('canvas.fps must be 24, 25, or 30');
  if (!finiteNumber(manifest.targetDurationSeconds) || manifest.targetDurationSeconds <= 0) {
    errors.push('targetDurationSeconds must be a positive number');
  }
  const tolerance = manifest.durationToleranceSeconds ?? 0.5;
  if (!finiteNumber(tolerance) || tolerance < 0 || tolerance > 2) {
    errors.push('durationToleranceSeconds must be between 0 and 2');
  }

  if (!Array.isArray(manifest.clips) || manifest.clips.length === 0) {
    errors.push('clips must contain at least one approved source');
  }

  const shotIds = new Set();
  let editDurationSeconds = 0;
  if (Array.isArray(manifest.clips)) {
    for (const [index, clip] of manifest.clips.entries()) {
      const label = `clips[${index}]`;
      if (!nonEmpty(clip?.shotId) || !new RegExp(`^${manifest.episodeId ?? 'INVALID'}-\\d{3}$`).test(clip.shotId)) {
        errors.push(`${label}.shotId must match ${manifest.episodeId ?? 'the episode'}-010`);
      } else if (shotIds.has(clip.shotId)) {
        errors.push(`${label}.shotId duplicates ${clip.shotId}`);
      } else {
        shotIds.add(clip.shotId);
      }
      if (!finiteNumber(clip?.inSeconds) || clip.inSeconds < 0) errors.push(`${label}.inSeconds must be >= 0`);
      if (!finiteNumber(clip?.outSeconds) || clip.outSeconds <= clip.inSeconds) errors.push(`${label}.outSeconds must be greater than inSeconds`);
      const transition = clip?.transitionOutSeconds ?? 0;
      if (!finiteNumber(transition) || transition < 0) errors.push(`${label}.transitionOutSeconds must be >= 0`);
      if (index === manifest.clips.length - 1 && transition !== 0) errors.push(`${label}.transitionOutSeconds must be 0 on the last clip`);
      if (finiteNumber(clip?.inSeconds) && finiteNumber(clip?.outSeconds) && clip.outSeconds > clip.inSeconds && finiteNumber(transition)) {
        const visible = clip.outSeconds - clip.inSeconds;
        if (transition >= visible) errors.push(`${label}.transitionOutSeconds must be shorter than the clip edit`);
        const next = manifest.clips[index + 1];
        if (next && transition >= next.outSeconds - next.inSeconds) errors.push(`${label}.transitionOutSeconds must fit the next clip too`);
        editDurationSeconds += visible - transition;
      }
      if (clip?.continuityStatus === undefined) {
        (native ? errors : warnings).push(`${label}.continuityStatus is absent; record the selected take's continuity review`);
      } else if (clip.continuityStatus !== 'pass') {
        errors.push(`${label}.continuityStatus is "${clip.continuityStatus}"; only reviewed accepted sources may be cut`);
      }
      hashesWritten += await validateFrozenSource(clip, label, context);
      if (native) {
        if (!new RegExp(`^${manifest.episodeId}-(SC|IN)\\d{3}$`).test(clip?.sourceSceneletId ?? '')) errors.push(`${label}.sourceSceneletId is required`);
        if (!['native', 'extracted'].includes(clip?.audioMode)) errors.push(`${label}.audioMode must be native or extracted`);
        const spec = clip?.sourceSpec;
        if (!spec || ![spec.width, spec.height, spec.fps, spec.durationSeconds].every(x => finiteNumber(x) && x > 0) || spec.hasAudio !== true) errors.push(`${label}.sourceSpec requires measured width/height/fps/durationSeconds and hasAudio true`);
        if (finiteNumber(spec?.durationSeconds) && clip.outSeconds > spec.durationSeconds + 0.001) errors.push(`${label} source range exceeds measured duration`);
        if (!options.skipFiles) {
          try {
            const path = await containedPath(options.root, clip.localPath);
            const info = probe(path), video = info.streams?.find(s => s.codec_type === 'video');
            const audio = info.streams?.find(s => s.codec_type === 'audio');
            const duration = Number(video?.duration ?? info.format?.duration);
            const [n, d] = String(video?.r_frame_rate ?? '0/1').split('/').map(Number);
            if (!video || !audio) errors.push(`${label} must contain both video and native audio streams`);
            if (video && (spec?.width !== video.width || spec?.height !== video.height || Math.abs((spec?.fps ?? 0) - n/d) > 0.01 || Math.abs((spec?.durationSeconds ?? 0) - duration) > 0.05)) errors.push(`${label}.sourceSpec disagrees with ffprobe`);
            if (clip.outSeconds > duration + 0.001) errors.push(`${label} source range exceeds actual video duration`);
          } catch (e) { errors.push(`${label} media probe failed: ${e.message}`); }
        }
      }
    }
  }

  if (manifest.mix !== undefined) {
    if (!manifest.mix || typeof manifest.mix !== 'object' || Array.isArray(manifest.mix)) {
      errors.push('mix must be an object');
    } else if (!native && manifest.mix.method === 'automation-lanes') {
      errors.push('mix.method automation-lanes is rejected: data-automation volume lanes route beds through WebAudio in Studio and silence native dialogue; use timeline-tweens');
    } else if (!native && manifest.mix.method !== undefined && manifest.mix.method !== 'timeline-tweens') {
      errors.push('mix.method must be timeline-tweens');
    } else if (native && manifest.mix.method !== undefined && !nonEmpty(manifest.mix.method)) {
      errors.push('mix.method must be a non-empty description of the current finishing implementation');
    }
  }
  if (manifest.sourceSpec !== undefined) {
    const spec = manifest.sourceSpec;
    if (!spec || !finiteNumber(spec.width) || !finiteNumber(spec.height) || !finiteNumber(spec.fps)) {
      errors.push('sourceSpec must carry width, height, and fps');
    } else if (spec.width < (manifest.canvas?.width ?? 0) || spec.fps !== manifest.canvas?.fps) {
      warnings.push(`sourceSpec ${spec.width}x${spec.height}@${spec.fps} is conformed to the ${manifest.canvas?.width}x${manifest.canvas?.height}@${manifest.canvas?.fps} master; disclose the upscale/frame-rate conversion in delivery`);
    }
  }

  for (const kind of ['dialogue', 'native', 'music', 'sfx']) {
    const entries = manifest.audio?.[kind] ?? [];
    if (!Array.isArray(entries)) {
      errors.push(`audio.${kind} must be an array`);
      continue;
    }
    const ids = new Set();
    for (const [index, entry] of entries.entries()) {
      const label = `audio.${kind}[${index}]`;
      if (!nonEmpty(entry?.id)) errors.push(`${label}.id must be a non-empty string`);
      else if (ids.has(entry.id)) errors.push(`${label}.id duplicates ${entry.id}`);
      else ids.add(entry.id);
      if (!finiteNumber(entry?.inSeconds) || entry.inSeconds < 0) errors.push(`${label}.inSeconds must be >= 0`);
      if (!finiteNumber(entry?.outSeconds) || entry.outSeconds <= entry.inSeconds) errors.push(`${label}.outSeconds must be greater than inSeconds`);
      if (!finiteNumber(entry?.timelineStartSeconds) || entry.timelineStartSeconds < 0) errors.push(`${label}.timelineStartSeconds must be >= 0`);
      hashesWritten += await validateFrozenSource(entry, label, context);
      if (native && kind === 'native' && !options.skipFiles) {
        try {
          const path = await containedPath(options.root, entry.localPath);
          const info = probe(path), stream = info.streams?.find(s => s.codec_type === 'audio');
          const duration = Number(stream?.duration ?? info.format?.duration);
          if (!stream || !finiteNumber(duration) || duration <= 0) errors.push(`${label} must contain measurable native audio`);
          else if (entry.outSeconds > duration + 0.001) errors.push(`${label} extraction range exceeds actual audio duration`);
        } catch (e) { errors.push(`${label} audio probe failed: ${e.message}`); }
      }
    }
  }

  if (native) {
    const tracks = Array.isArray(manifest.audio?.native) ? manifest.audio.native : [];
    let start = 0;
    for (const clip of manifest.clips ?? []) {
      const matching = tracks.filter(a => a.sourceShotId === clip.shotId);
      if (clip.audioMode === 'native' && matching.length) errors.push(`${clip.shotId}: native audio would play twice`);
      if (clip.audioMode === 'extracted') {
        if (matching.length !== 1) errors.push(`${clip.shotId}: extracted audio requires exactly one linked native track`);
        else {
          const a = matching[0];
          if (a.sourceSceneletId !== clip.sourceSceneletId || a.sourceVideoSha256 !== clip.sha256) errors.push(`${clip.shotId}: extracted audio source lineage mismatch`);
          if (a.inSeconds !== clip.inSeconds || a.outSeconds !== clip.outSeconds || Math.abs(a.timelineStartSeconds-start)>0.001) errors.push(`${clip.shotId}: extracted audio must preserve aligned source/timeline timing; advanced split edits require a reviewed custom contract`);
        }
      }
      start += clip.outSeconds-clip.inSeconds-(clip.transitionOutSeconds ?? 0);
    }
    for (const track of tracks) if (!manifest.clips?.some(c => c.shotId===track.sourceShotId && c.audioMode==='extracted')) errors.push('audio.native has an unlinked or duplicate playback source');
  }

  if (!nonEmpty(manifest.captions?.language)) errors.push('captions.language must be a non-empty string');
  if (manifest.captions?.burnIn === true) {
    warnings.push('captions.burnIn is true: burned-in captions are opt-in (the platform overlays its own); confirm the user asked for them');
  }
  if (!nonEmpty(manifest.captions?.sidecar)) {
    warnings.push('captions.sidecar is absent; record this omission before delivery');
  } else {
    const captionPath = resolveLocalPath(manifest.captions.sidecar, options.root, 'captions', errors);
    if (captionPath && !options.skipFiles) {
      try {
        await containedPath(options.root, manifest.captions.sidecar);
        const info = await stat(captionPath);
        if (!info.isFile()) throw new Error('not a file');
        const actualHash = await sha256(captionPath);
        if (!HASH_RE.test(manifest.captions.sidecarSha256 ?? '')) {
          if (options.writeHashes) {
            manifest.captions.sidecarSha256 = actualHash;
            hashesWritten += 1;
          } else {
            errors.push('captions.sidecarSha256 is missing or invalid; rerun with --write-hashes');
          }
        } else if (manifest.captions.sidecarSha256 !== actualHash) {
          errors.push('captions.sidecarSha256 does not match the caption file');
        }
      } catch {
        errors.push(`captions.sidecar does not exist: ${manifest.captions.sidecar}`);
      }
    } else if (options.skipFiles && !HASH_RE.test(manifest.captions.sidecarSha256 ?? '')) {
      errors.push('captions.sidecarSha256 must be valid when --skip-files is used');
    }
  }

  for (const key of ['hook', 'turn', 'cliffhanger']) {
    if (!nonEmpty(manifest.story?.[key])) errors.push(`story.${key} must be a non-empty string`);
  }

  hashesWritten += await validateBranding(manifest, context);
  const bookendSeconds = computeBookendSeconds(manifest.branding);

  const roundedDuration = Number(editDurationSeconds.toFixed(3));
  const masterDuration = Number((roundedDuration + bookendSeconds).toFixed(3));
  if (native) {
    const range = manifest.runtimeRange ?? { minSeconds: 60, maxSeconds: 90 };
    if (!finiteNumber(range.minSeconds) || !finiteNumber(range.maxSeconds) || range.minSeconds <= 0 || range.minSeconds > range.maxSeconds) errors.push('runtimeRange must be positive min <= max');
    if ((range.minSeconds !== 60 || range.maxSeconds !== 90) && !nonEmpty(range.reason)) errors.push('custom runtimeRange requires reason');
    if (masterDuration < range.minSeconds || masterDuration > range.maxSeconds) errors.push('total master runtime including bookends falls outside runtimeRange');
  }
  if (finiteNumber(manifest.targetDurationSeconds) && finiteNumber(tolerance)) {
    const comparisonDuration = native ? masterDuration : roundedDuration;
    const difference = Math.abs(comparisonDuration - manifest.targetDurationSeconds);
    if (difference > tolerance) {
      errors.push(`${native ? 'master' : 'edit'} duration ${comparisonDuration}s differs from target ${manifest.targetDurationSeconds}s by more than ${tolerance}s`);
    }
  }

  if (options.writeHashes && hashesWritten > 0 && errors.length === 0) {
    await writeFile(absoluteManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  return {
    manifest,
    errors,
    warnings,
    summary: {
      episodeId: manifest.episodeId ?? null,
      outputProfile: manifest.outputProfile ?? null,
      canvas: manifest.canvas ?? null,
      clipCount: Array.isArray(manifest.clips) ? manifest.clips.length : 0,
      editDurationSeconds: roundedDuration,
      targetDurationSeconds: manifest.targetDurationSeconds ?? null,
      bookendSeconds,
      masterDurationSeconds: Number((roundedDuration + bookendSeconds).toFixed(3)),
      hashesWritten,
      root: options.root,
    },
  };
}

async function main() {
  let options;
  try {
    options = validateArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 2;
    return;
  }

  const result = await loadAndValidateManifest(options.manifestPath, options);
  if (options.json) {
    console.log(JSON.stringify({ ok: result.errors.length === 0, ...result }, null, 2));
  } else {
    console.log(`${result.errors.length === 0 ? 'PASS' : 'FAIL'} ${result.summary?.episodeId ?? options.manifestPath}`);
    if (result.summary) {
      console.log(`  ${result.summary.clipCount} clips · ${result.summary.editDurationSeconds}s story + ${result.summary.bookendSeconds}s bookends = ${result.summary.masterDurationSeconds}s · ${result.summary.outputProfile}`);
      if (result.summary.hashesWritten) console.log(`  wrote ${result.summary.hashesWritten} source hash(es)`);
    }
    for (const warning of result.warnings) console.log(`  warning: ${warning}`);
    for (const error of result.errors) console.error(`  error: ${error}`);
  }
  if (result.errors.length > 0) process.exitCode = 1;
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  await main();
}
