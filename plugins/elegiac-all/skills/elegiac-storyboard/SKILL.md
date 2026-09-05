---
name: elegiac-storyboard
description: Create storyboards with Elegiac — turn scripts and scene briefs into sequenced frames. Use when the user asks for storyboard frames, visual beats, script breakdowns, shot sequencing, or animating selected frames.
allowed-tools: Bash
argument-hint: "[script, scene, or production brief]"
references:
  - shot-grammar.md
  - prompt-patterns.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Storyboard

Turn story material into frames and motion. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`. Write frame prompts using the shot sizes, lens language, and lighting keys in `references/shot-grammar.md`; keep multi-frame continuity with the anchors in `references/prompt-patterns.md`.

## Calling generate_storyboard

Prefer `generate_storyboard` over manually calling `generate_image` repeatedly. Pass:

- `title`
- `script` (the scene/brief text) or explicit `frames`
- `frameCount`, `aspectRatio`, `resolution`, and total `maxCredits` — sized per the conventions Spending and Defaults rules
- `productionId` when the user names or selects a Production
- `castMemberIds` when reusing production cast; `characterNames` only when ids are not known

To animate an approved frame, call `animate_image` with the frame URL as `startImageUrl` and a single-motion prompt.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Related skills

- Full coverage planning with lens choices before boarding → `elegiac-shotlist`
- Turning finished boards into a timed sequence → `elegiac-animatic`
- Matched location plates across the scene → `elegiac-location-scout`
- Frames that don't match each other → `elegiac-scene-continuity`
