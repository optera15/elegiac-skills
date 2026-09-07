#!/usr/bin/env node
// Perform-time the shot ledger before any stem exists.
//
//   node check-shot-budget.mjs episodes/s01e01/episode-blueprint.json --root . [--series series-manifest.json] [--tolerance 3] [--write] [--json]
//
// Speaking cuts are estimated from the measured stem when one exists, otherwise from the line at
// WORDS_PER_SECOND plus HANDLE_SECONDS; every other cut uses its durationSeconds target. Branding
// bookends come from the series manifest (episode 1 vs later opening policy). The result is written
// to blueprint.durationBudget with --write. Exit code 1 when over budget so a pipeline can gate on it.

import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeBookendSeconds } from './validate-episode-manifest.mjs';

export const WORDS_PER_SECOND = 2.6;
export const HANDLE_SECONDS = 0.75;
const TAG_RE = /\[[^\]]+\]/g;

function parseArgs(argv) {
  const options = { blueprintPath: null, root: process.cwd(), seriesPath: null, tolerance: 3, write: false, json: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') options.root = argv[++index];
    else if (arg === '--series') options.seriesPath = argv[++index];
    else if (arg === '--tolerance') options.tolerance = Number(argv[++index]);
    else if (arg === '--write') options.write = true;
    else if (arg === '--json') options.json = true;
    else if (!arg.startsWith('-') && !options.blueprintPath) options.blueprintPath = arg;
    else throw new Error(`Unknown or incomplete argument: ${arg}`);
  }
  if (!options.blueprintPath) {
    throw new Error('Usage: check-shot-budget.mjs <episode-blueprint.json> [--root <dir>] [--series <series-manifest.json>] [--tolerance <s>] [--write] [--json]');
  }
  options.root = resolve(options.root);
  options.blueprintPath = resolve(options.root, options.blueprintPath);
  options.seriesPath = resolve(options.root, options.seriesPath ?? 'series-manifest.json');
  return options;
}

export function estimateLineSeconds(line) {
  const words = String(line ?? '').replace(TAG_RE, ' ').split(/\s+/).filter(Boolean).length;
  const pauses = (String(line ?? '').match(/…|—|\.\.\./g) ?? []).length;
  return Number((words / WORDS_PER_SECOND + pauses * 0.35).toFixed(2));
}

export function estimateShot(shot) {
  const kind = shot.kind ?? (shot.line ? 'speak' : 'action');
  if (kind === 'speak' || (shot.line && shot.line.trim())) {
    const stem = Number(shot.stemDurationSeconds);
    const spoken = Number.isFinite(stem) && stem > 0 ? stem : estimateLineSeconds(shot.line);
    return { seconds: Number((spoken + HANDLE_SECONDS).toFixed(2)), basis: Number.isFinite(stem) && stem > 0 ? 'stem' : 'line' };
  }
  return { seconds: Number(shot.durationSeconds ?? 0), basis: 'target' };
}

export function episodeBranding(series, episodeNumber) {
  const branding = series?.branding;
  if (!branding) return null;
  const opening = episodeNumber > 1 ? branding.opening?.later : branding.opening?.episode1;
  return { ...branding, opening: opening ?? branding.opening ?? { mode: 'none' } };
}

export function computeBudget(blueprint, series, tolerance) {
  const shots = Array.isArray(blueprint.shots) ? blueprint.shots : [];
  const rows = shots.map((shot) => ({ shotId: shot.shotId, kind: shot.kind ?? (shot.line ? 'speak' : 'action'), ...estimateShot(shot) }));
  const estimatedStorySeconds = Number(rows.reduce((sum, row) => sum + row.seconds, 0).toFixed(2));
  const episodeNumber = Number(String(blueprint.episodeId ?? '').match(/E(\d{2})$/)?.[1] ?? 1);
  const bookendSeconds = computeBookendSeconds(episodeBranding(series, episodeNumber));
  const targetSeconds = Number(blueprint.targetDurationSeconds ?? series?.profile?.targetDurationSeconds ?? 75);
  const over = Number((estimatedStorySeconds - targetSeconds).toFixed(2));
  const status = over > tolerance ? 'fail' : 'pass';
  const trimCandidates = status === 'fail'
    ? [
      ...rows.filter((row) => row.kind === 'react' || row.kind === 'insert').map((row) => ({ shotId: row.shotId, saves: row.seconds, why: `${row.kind} cut` })),
      ...rows.filter((row) => row.kind === 'speak' && row.seconds > 4.5).map((row) => ({ shotId: row.shotId, saves: Number((row.seconds - 3.5).toFixed(2)), why: 'long line; shorten or split across a reaction' })),
    ].sort((a, b) => b.saves - a.saves)
    : [];
  return {
    estimatedStorySeconds,
    bookendSeconds,
    estimatedMasterSeconds: Number((estimatedStorySeconds + bookendSeconds).toFixed(2)),
    targetSeconds,
    toleranceSeconds: tolerance,
    overBySeconds: over,
    status,
    speakingCuts: rows.filter((row) => row.kind === 'speak').length,
    cuts: rows.length,
    rows,
    trimCandidates,
  };
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
  try {
    series = JSON.parse(await readFile(options.seriesPath, 'utf8'));
  } catch {
    series = null;
  }
  const budget = computeBudget(blueprint, series, options.tolerance);

  if (options.write) {
    blueprint.durationBudget = {
      estimatedStorySeconds: budget.estimatedStorySeconds,
      bookendSeconds: budget.bookendSeconds,
      targetSeconds: budget.targetSeconds,
      toleranceSeconds: budget.toleranceSeconds,
      status: budget.status,
      trimList: blueprint.durationBudget?.trimList ?? [],
      trimCandidates: budget.trimCandidates,
      checkedAt: new Date().toISOString(),
    };
    await writeFile(options.blueprintPath, `${JSON.stringify(blueprint, null, 2)}\n`, 'utf8');
  }

  if (options.json) {
    console.log(JSON.stringify({ ok: budget.status === 'pass', ...budget }, null, 2));
  } else {
    console.log(`${budget.status.toUpperCase()} ${blueprint.episodeId ?? options.blueprintPath}`);
    console.log(`  ${budget.cuts} cuts (${budget.speakingCuts} speaking) · est. ${budget.estimatedStorySeconds}s story + ${budget.bookendSeconds}s bookends = ${budget.estimatedMasterSeconds}s · target ${budget.targetSeconds}s ± ${budget.toleranceSeconds}s`);
    for (const row of budget.rows) console.log(`  ${row.shotId}  ${row.kind.padEnd(9)} ${String(row.seconds).padStart(6)}s  (${row.basis})`);
    if (budget.status === 'fail') {
      console.log(`  over by ${budget.overBySeconds}s; settle a trim list with the user before generating stems. Candidates:`);
      for (const candidate of budget.trimCandidates.slice(0, 8)) console.log(`    - ${candidate.shotId}: saves ~${candidate.saves}s (${candidate.why})`);
    }
  }
  if (budget.status === 'fail') process.exitCode = 1;
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  await main();
}
