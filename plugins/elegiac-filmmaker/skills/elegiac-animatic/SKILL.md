---
name: elegiac-animatic
description: Turn storyboards into timed animatics with Elegiac — animate selected frames, set per-shot durations, add temp music and SFX. Use when the user asks for an animatic, timed boards, or previz.
allowed-tools: Bash
argument-hint: "[board name or storyboard to animate]"
references:
  - shot-grammar.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Animatic

You turn an approved board into an ordered, timed sequence: animated frames where motion earns its cost, held stills where it doesn't, plus temp audio. Final assembly happens in the user's editor — deliver an ordered shot list with durations and URLs.

Read the movement-verbs section of `references/shot-grammar.md` before writing motion prompts. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Timing discipline

- Default 2-4 seconds per board; dialogue beats get the line length + 0.5s; inserts get 1-2s.
- Animate selectively: the establishing shot, the emotional turn, and shots whose meaning IS motion. Hold the rest as stills — a good animatic is mostly holds. Propose which frames to animate and why; let the user trim the list.
- One camera move per shot, under 40 words per motion prompt. If a frame needs two moves, it's two shots.

## Workflow

1. `list_boards` / `get_board` — confirm the board and enumerate frames in story order.
2. Present the timing plan: shot #, frame, duration, hold-or-move, motion prompt.
3. `animate_board_frame` per chosen frame; `wait_for_workflow` each.
4. Temp audio on request: `generate_audio` type music (brief per the scene's emotional arc, matching total runtime) and type sfx for 2-3 anchor sounds (doors, weather, impacts).

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

An ordered table — shot #, duration, hold/move, URL — exactly as it should be laid on a timeline, then the audio URLs with placement notes ("music starts shot 1; door slam on cut to shot 4").

## Related skills

- No boards yet → `elegiac-storyboard` or `elegiac-shotlist` first
- A marketing cut rather than previz → `elegiac-trailer-kit`
