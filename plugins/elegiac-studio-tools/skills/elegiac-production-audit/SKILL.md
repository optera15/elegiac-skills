---
name: elegiac-production-audit
description: Audit an Elegiac account read-only — credits, productions, boards, cast, style systems, campaigns, and what to clean up or archive. Use when the user asks to audit their account, review what they have, find what's eating credits, clean up productions, or asks "what's in my Elegiac / what should I archive".
allowed-tools: Bash
argument-hint: "[optional: a specific production to audit]"
references:
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Production Audit

A zero-spend, read-only sweep of the user's Elegiac state, ending in a tidy report and optional cleanup proposals. **Never archive anything without an explicit per-item confirmation.**

Apply the Fail-closed and Reporting rules in `references/elegiac-conventions.md`.

## Sweep order

1. `get_account_status` — credits, plan.
2. `list_productions`, and per production: `list_boards`, `list_characters`, `list_campaigns`, `list_assets`.
3. `list_style_systems` (account-wide), `list_workflow_runs` for recent generation activity.

## What to flag

- **Orphans:** assets in no production; boards with zero items; productions with no activity in the workflow history.
- **Unused memory:** cast members never referenced by any workflow run; style systems duplicating each other (similar titles/palettes — recommend keeping the most recently used).
- **Unpromoted keepers:** brainstorm artifacts (character concepts, visual styles) that were approved-in-conversation but never promoted to durable memory.
- **Spend patterns:** which workflows consumed the most credits recently; repeated failed/retried runs worth investigating.
- **Stale drafts:** boards/campaigns untouched across many newer runs.

## Cleanup protocol

Present findings as a table: item, type, why flagged, recommendation (keep / promote / archive). Only call `archive_board` / `archive_character` / `archive_style_system` / `archive_production` after the user confirms each item or explicitly says "archive all flagged". Report what was archived and how to restore (`restore_*`).

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Account summary (credits, counts), then the findings table, then recommendations. End with: nothing was changed (or the exact list of confirmed archives).

## Related skills

- Promote flagged keepers properly → `elegiac-board-workspace` / `elegiac-brand-memory`
- Re-engage a stale project → `elegiac-story-bible`
