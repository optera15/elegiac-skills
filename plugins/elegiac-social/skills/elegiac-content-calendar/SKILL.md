---
name: elegiac-content-calendar
description: Plan and produce recurring social content with Elegiac — visual continuity across weeks of posts. Use when the user asks for a content calendar, "a month of posts", or a recurring series.
allowed-tools: Bash
argument-hint: "[brand/persona + platforms + cadence]"
references:
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Content Calendar

The hard problem isn't making 20 images — it's making week 4 match week 1. Elegiac's campaign memory is the answer: one campaign, continued weekly, inheriting the same look every time.

Size per `references/platform-specs.md`. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. **Plan the calendar** (zero spend): 3-4 content pillars × posting days = the grid. Themed series get a fixed visual template (same composition grammar, one variable). Present the calendar document first.
2. **Anchor the memory:** `find_campaign_memory` / `find_style_system` — reuse the brand campaign if it exists; otherwise the first batch establishes it (`compose_campaign_brief` → `plan_campaign_outputs` → `execute_campaign_plan`).
3. **Week at a time:** generate week 1, get approval on the look, then `continue_campaign` with `brief: "Week N: <pillar mix>"` for each following week (`wait_for_workflow` each) — a wrong look compounds across 20 posts.
4. **Recurring faces** (a persona, a founder): pass `castMemberIds` so the person is identical across the month.
5. **Boards as the calendar surface:** one board per week/month, posts placed in publish order via `add_workflow_results_to_board`.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The calendar grid (day, pillar, post concept), then URLs grouped by week in publish order with platform sizes. Note the campaignId so next month continues the same memory.

## Related skills

- Shorts in the calendar, built natively → `elegiac-shorts-factory`
- The recurring persona → `elegiac-virtual-influencer`
- Episode/video thumbnails in the calendar → `elegiac-thumbnail-cover`
- The brand look behind it all → `elegiac-brand-memory`
