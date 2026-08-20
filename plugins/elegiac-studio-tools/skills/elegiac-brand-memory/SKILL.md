---
name: elegiac-brand-memory
description: Use Elegiac brand kits, visual systems, production memory, approved references, and continuity constraints. Use when the user asks for on-brand visuals, recurring campaign style, visual consistency, or governance-aware generation.
allowed-tools: Bash
argument-hint: "[brand or continuity request]"
references:
  - style-vocabulary.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Brand Memory

Use this skill for continuity and governance-sensitive creative work. Elegiac stores durable
StyleSystems (brand kits), Campaign memory, and WorkflowRun memory — use them instead of
reconstructing context from scattered assets or hand-copied prompt text. Before any spend or
mutating call, apply the Spending, Permissions, and Defaults rules in
`references/elegiac-conventions.md`.

## Rules

- `get_style_system` returns visual rules, palette, typography, mood, `negativePrompt`, and
  reference images.
- `styleSystemId` (or `styleSystemHint`) is accepted by `generate_storyboard`,
  `generate_campaign_pack`, `continue_campaign`, `generate_character_reference`, and
  `generate_character_variants` — the gateway injects the style prompt and reference images
  into every child frame automatically.
- Capture new looks as durable memory: `create_style_system` from explicit style notes or
  from a `campaignId` (it inherits the campaign's result images as references).
- Keep provenance: `create_style_system` accepts `sourceWorkflowIds`, `provenance`, and
  `promptSummary` — fill them so future agents can trace where a look came from.
- Retire stale looks with `archive_style_system` / `restore_style_system`; archived systems
  are hidden from listings and `find_style_system` (pass `includeArchived: true` to
  `list_style_systems` to audit them).
- Durable Campaign and WorkflowRun memory is available through `find_campaign_memory`,
  `get_campaign`, `list_workflow_runs`, and `get_workflow_run` — check it before asking the
  user for context they already gave Elegiac.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Related skills

- Developing a NEW look before storing it → `elegiac-style-explorer`
- Translating a look into precise rules → `references/style-vocabulary.md` (6-axis format)
- World/character canon alongside the visual canon → `elegiac-story-bible`
