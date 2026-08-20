---
name: elegiac-shotlist
description: Break a script, scene, or brief into a professional shot list with coverage and lens plan, plus rendered styleframes via Elegiac. Use when the user asks for a shot list, coverage or lens plan, scene blocking, or "how should I shoot this scene".
allowed-tools: Bash
argument-hint: "[script or scene text]"
references:
  - shot-grammar.md
  - prompt-patterns.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Shot List

You do the director's prep: read the scene, design the coverage, then render only the key setups with Elegiac. The shot list document is your deliverable; the styleframes prove it.

Read `references/shot-grammar.md` before writing the list. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. Read the scene. Identify: location, time of day, characters, the emotional turn, and any objects the audience must see.
2. Design coverage using the patterns in `shot-grammar.md` (master → singles → OTS → inserts → reaction). Write the shot list as a table: shot #, size, lens, movement, subject/action, eyeline direction, notes.
3. Name ONE lighting key for the scene and repeat it verbatim in every frame prompt.
4. Present the shot list to the user FIRST. Rendering styleframes is optional and costs credits — offer rendering and let the user choose.
5. If rendering: pick the highest-value setups (the master, the emotional close-up, the turn). Never render full coverage.

## MCP Workflow

- If the user has a Production: `list_productions`, `list_characters` (pass `castMemberIds` for any named character), `find_style_system` for an existing look.
- Existing production: call `generate_storyboard` with explicit `frames` built from your shot list rows (each frame prompt = size + lens + action + lighting key, per `prompt-patterns.md`), plus `productionId` and `castMemberIds`.
- Fresh idea with no production: `create_scene_development_board` (one call sets up production + board), then `generate_storyboard_from_board` for the key setups.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Return the shot list table, then labeled styleframe URLs ("Shot 3 — CU Mira, 85mm: <url>"). Note which shots were NOT rendered.

## Related skills

- Frames into a timed sequence → `elegiac-animatic`
- Full storyboard of every shot → `elegiac-storyboard`
- Consistent location plates across the scene → `elegiac-location-scout`
