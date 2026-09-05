#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFile, stat, writeFile } from 'node:fs/promises';
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

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
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

  if (source.approved !== true && !options.allowUnapproved) {
    errors.push(`${label}.approved must be true for a final handoff`);
  } else if (source.approved !== true) {
    warnings.push(`${label} is not approved`);
  }
  return 0;
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

  if (manifest.version !== 1) errors.push('version must equal 1');
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
        editDurationSeconds += visible - transition;
      }
      hashesWritten += await validateFrozenSource(clip, label, context);
    }
  }

  for (const kind of ['dialogue', 'music', 'sfx']) {
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
    }
  }

  if (!nonEmpty(manifest.captions?.language)) errors.push('captions.language must be a non-empty string');
  if (!nonEmpty(manifest.captions?.sidecar)) {
    warnings.push('captions.sidecar is absent; record this omission before delivery');
  } else {
    const captionPath = resolveLocalPath(manifest.captions.sidecar, options.root, 'captions', errors);
    if (captionPath && !options.skipFiles) {
      try {
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

  const roundedDuration = Number(editDurationSeconds.toFixed(3));
  if (finiteNumber(manifest.targetDurationSeconds) && finiteNumber(tolerance)) {
    const difference = Math.abs(roundedDuration - manifest.targetDurationSeconds);
    if (difference > tolerance) {
      errors.push(`edit duration ${roundedDuration}s differs from target ${manifest.targetDurationSeconds}s by more than ${tolerance}s`);
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
      console.log(`  ${result.summary.clipCount} clips · ${result.summary.editDurationSeconds}s · ${result.summary.outputProfile}`);
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
