#!/usr/bin/env node

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBrief } from './build-edit-handoff.mjs';
import { applyEditOrder, renderAnimatic } from './build-stills-animatic.mjs';
import { computeBudget } from './check-shot-budget.mjs';
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
  assert.match(gatedBrief, /never data-automation lanes/);
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

  // Duration budget: estimates from lines, adds bookends, fails over target with trim candidates.
  const blueprint = {
    episodeId: 'S01E01',
    targetDurationSeconds: 20,
    shots: [
      { shotId: 'S01E01-010', kind: 'establish', durationSeconds: 3 },
      { shotId: 'S01E01-020', kind: 'speak', line: 'I told you— [sighs] …it doesn’t matter now. None of it matters.', speaker: 'a' },
      { shotId: 'S01E01-030', kind: 'react', durationSeconds: 2 },
      { shotId: 'S01E01-040', kind: 'speak', line: 'Get in.', speaker: 'b', stemDurationSeconds: 0.9 },
      { shotId: 'S01E01-050', kind: 'insert', durationSeconds: 1.5 },
    ],
  };
  const series = { branding: gated.branding, profile: { targetDurationSeconds: 20 } };
  const pass = computeBudget(blueprint, series, 3);
  assert.equal(pass.status, 'pass');
  assert.equal(pass.bookendSeconds, 2.25);
  assert.equal(pass.rows[3].basis, 'stem');
  assert.equal(pass.rows[3].seconds, 1.65);
  assert.equal(pass.rows[1].basis, 'line');
  const fail = computeBudget({ ...blueprint, targetDurationSeconds: 8 }, series, 1);
  assert.equal(fail.status, 'fail');
  assert(fail.trimCandidates.some((candidate) => candidate.shotId === 'S01E01-030'));

  // Edit order override: partial lists reorder only their own slots.
  const ledger = ['180', '190', '200', '185', '205', '210'].map((id) => ({ shotId: `S01E01-${id}` }));
  const reordered = applyEditOrder(ledger, ['180', '190', '200', '185', '205']);
  assert.deepEqual(reordered.map((shot) => shot.shotId.slice(-3)), ['180', '190', '200', '185', '205', '210']);
  const swapped = applyEditOrder(ledger, ['200', '190']);
  assert.deepEqual(swapped.map((shot) => shot.shotId.slice(-3)), ['180', '200', '190', '185', '205', '210']);

  // Stills animatic renders a seekable composition with stems and bookends.
  const animaticHtml = renderAnimatic({
    blueprint: { episodeId: 'S01E01', title: 'Bail' },
    branding: { ...gated.branding, seriesMark: { status: 'typographic', title: 'TESSA', fontFamily: 'Inter' } },
    cuts: [
      { shotId: 'S01E01-010', kind: 'establish', speaker: null, start: 0, hold: 3, stillSrc: 'assets/stills/a.jpg', stemSrc: null, stemDuration: null },
      { shotId: 'S01E01-020', kind: 'speak', speaker: 'tessa', start: 4, hold: 2.5, stillSrc: 'assets/stills/b.jpg', stemSrc: 'assets/stems/b.mp3', stemDuration: 1.4 },
    ],
    bookends: { splash: { start: 3, duration: 1 }, endCard: { blackStart: 6.5, blackout: 0.25, cardStart: 6.75, duration: 1, nextText: 'NEXT · S1 EP2' }, total: 7.75 },
    assets: { mark: null, sting: 'assets/brand/sting.wav' },
    canvas: { width: 1080, height: 1920, fps: 30 },
  });
  assert.match(animaticHtml, /data-composition-id="main"[^>]*data-duration="7.75"/);
  assert.match(animaticHtml, /<audio id="dlg-020" src="assets\/stems\/b.mp3" data-start="4" data-duration="1.4"/);
  assert.match(animaticHtml, /id="splash" class="clip card" data-start="3"/);
  assert.match(animaticHtml, /class="lockup">TESSA</);
  assert.match(animaticHtml, /id="endcard" class="clip card" data-start="6.75" data-duration="1"/);
  assert.match(animaticHtml, /linear-gradient\(20deg, #0B0B0F, #E4C46A\)/);
  assert.match(animaticHtml, /window.__timelines\["main"\] = tl;/);
  assert(!animaticHtml.includes('data-automation'));

  persisted.clips[1].shotId = 'S01E01-010';
  await writeFile(manifestPath, `${JSON.stringify(persisted, null, 2)}\n`);
  const duplicate = await loadAndValidateManifest(manifestPath, { root });
  assert(duplicate.errors.some((error) => error.includes('duplicates S01E01-010')));

  console.log('manifest.test.mjs PASS');
} finally {
  await rm(root, { recursive: true, force: true });
}
