---
name: elegiac-launch-kit
description: Build the full release package with Elegiac — poster, stills, trailer pieces, vertical teaser, thumbnails, and social set for a film/series launch or festival run. Use when the user asks for a launch kit, release kit, "everything I need for release week", or festival press kit visuals.
allowed-tools: Bash
argument-hint: "[the film/series + release context (festival, streaming, social)]"
references:
  - poster-key-art.md
  - trailer-structures.md
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Launch Kit

The capstone workflow: one film, every release asset, one coherent look. Sequencing is the whole skill — **key art locks first, everything else inherits it.**

Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`; read the component references as each stage needs them.

## The release-week checklist

Poster (one-sheet + social crops) · 3 production stills · trailer (or teaser cut) · 9:16 vertical teaser · thumbnail · social announcement set. Confirm with the user which subset they need and the deadline order.

## Sequencing (non-negotiable)

1. **Key art first** — the poster's archetype, palette, and title treatment become the campaign's visual law. If no style system exists, lock one here (`promote_visual_style_to_style_system`). Everything downstream passes this `styleSystemId`.
2. **Trailer pieces second** — title cards inherit the poster's title treatment (`references/trailer-structures.md`).
3. **Derivatives last** — stills, vertical teaser, thumbnails, and social set are generated against the locked style system + cast refs, sized per `references/platform-specs.md`.

## MCP Workflow

- A production at release already has assets — check `list_boards`, `list_workflow_runs`, `get_campaign` and generate only what's missing.
- Workspace: `create_board` ("<Title> — Launch Kit"); land every result with `add_workflow_results_to_board`.
- Batch the derivative set through the campaign pipeline for ONE aggregate quote: `compose_campaign_brief` → `plan_campaign_outputs` → approve → `execute_campaign_plan`, with `castMemberIds` + `styleSystemId`.
- Poster iterations via `edit_image`; trailer pieces per the trailer-kit flow.
- **Handoff:** `export_pack` on the launch-kit board (details → `elegiac-deliver-pack`).

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Assets grouped by checklist line with platform sizes, the locked style system id, and the export manifest (or local pack directory). Note anything intentionally skipped.

## Related skills

- The poster itself → `elegiac-key-art` · trailer pieces → `elegiac-trailer-kit`
- Platform versions of the trailer → `elegiac-platform-cutdowns`
- Final handoff details → `elegiac-deliver-pack`
