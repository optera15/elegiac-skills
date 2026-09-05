#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBrief } from './build-edit-handoff.mjs';
import { loadAndValidateManifest } from './validate-episode-manifest.mjs';

const root = await mkdtemp(join(tmpdir(), 'elegiac-microdrama-'));

try {
  await mkdir(join(root, 'assets/video/s01e01'), { recursive: true });
  await mkdir(join(root, 'episodes/s01e01'), { recursive: true });
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
    story: { hook: 'A dead account likes a post.', turn: 'The phone is not his.', cliffhanger: 'Her phone rings.' },
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const first = await loadAndValidateManifest(manifestPath, { root, writeHashes: true });
  assert.deepEqual(first.errors, []);
  assert.equal(first.summary.editDurationSeconds, 75);
  assert.equal(first.summary.hashesWritten, 3);

  const persisted = JSON.parse(await readFile(manifestPath, 'utf8'));
  assert.match(persisted.clips[0].sha256, /^[a-f0-9]{64}$/);
  assert.match(persisted.captions.sidecarSha256, /^[a-f0-9]{64}$/);

  const second = await loadAndValidateManifest(manifestPath, { root });
  assert.deepEqual(second.errors, []);
  const brief = renderBrief(second.manifest, { root, manifestPath: 'episodes/s01e01/edit-manifest.json' });
  assert.match(brief, /workflow: general-video/);
  assert.match(brief, /flow: automation/);
  assert.match(brief, /aspect: 1080x1920/);
  assert.match(brief, /No render-time network requests/);

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

  persisted.clips[1].shotId = 'S01E01-010';
  await writeFile(manifestPath, `${JSON.stringify(persisted, null, 2)}\n`);
  const duplicate = await loadAndValidateManifest(manifestPath, { root });
  assert(duplicate.errors.some((error) => error.includes('duplicates S01E01-010')));

  console.log('manifest.test.mjs PASS');
} finally {
  await rm(root, { recursive: true, force: true });
}
