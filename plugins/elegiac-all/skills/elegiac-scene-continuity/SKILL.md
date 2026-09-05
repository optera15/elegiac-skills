---
name: elegiac-scene-continuity
description: Diagnose and fix continuity across Elegiac frames — mismatched wardrobe, drifting lighting, inconsistent props, a character or location that looks different between shots. Use when frames don't match or the user wants a scene kept consistent.
allowed-tools: Bash
argument-hint: "[board or frames with the continuity problem]"
references:
  - shot-grammar.md
  - prompt-patterns.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Scene Continuity

You are the script supervisor: find which frame is the outlier, decide the cheapest fix, and repair without breaking what already works. Diagnosis is free — spend credits only on the actual fix.

Read the continuity-anchors section of `references/prompt-patterns.md` and the lighting-keys section of `references/shot-grammar.md` first. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Diagnosis (zero spend)

1. `get_board` — view all frames in story order. Check, per the continuity checklist: wardrobe, props, eyelines/screen direction, lighting key & time of day, lens/framing consistency, character identity.
2. Identify the **continuity master** (the approved frame the scene should match) and the outlier(s). The majority is usually right — re-roll only the outlier.
3. Inspect what was actually generated: `get_workflow_run` / `get_job` show the real prompts and references sent. Most drift traces to a missing cast reference, a missing styleSystemId, or a lighting key that wasn't repeated verbatim.

## Fix ladder (cheapest first)

1. **Surgical edit** — `edit_image` on the outlier: "change the jacket to the black flight jacket worn in the other frames; keep pose, lighting, and background unchanged." Best for wardrobe/prop/background fixes.
2. **Anchored regeneration** — regenerate only the outlier via `generate_image` with the continuity master in `referenceImageUrls` + cast refs + verbatim lighting key + styleSystemId.
3. **Identity repair** — if the character drifts across MANY frames, the identity is the problem, not the frames: `make_board_character_consistent`, then regenerate affected frames from the consistent identity. `create_board_character_variation` for controlled changes (new wardrobe across all panels).

Fix one frame, confirm it cuts together, then batch the rest.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The diagnosis (what's inconsistent, which frame is the outlier, root cause), the fix applied, and before/after URLs per repaired frame.

## Related skills

- Preventing drift in new scenes → `elegiac-storyboard` / `elegiac-shotlist` (continuity stack)
- Character identity foundation → `elegiac-character-cast`
- Recurring prompt failures → `elegiac-prompt-doctor`
