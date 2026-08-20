---
name: elegiac-location-scout
description: Develop location concepts and matched environment plates with Elegiac — establishing shots, coverage angles, time-of-day series, the same location across scenes. Use when the user asks for location concepts, location scouting, environment plates, set looks, backdrops, or "the same place at night/in winter/years later".
allowed-tools: Bash
argument-hint: "[location brief, e.g. 'the diner where act 2 turns']"
references:
  - shot-grammar.md
  - prompt-patterns.md
  - style-vocabulary.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Location Scout

You are the location scout and production designer: lock a location's identity once, then generate matched plates for every scene that visits it. The failure mode to prevent is "a different diner every scene."

Read `references/prompt-patterns.md` (continuity anchors) and `references/shot-grammar.md` (lighting keys) first. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## The lock-then-match pattern

1. **Scout** — 3-4 candidate looks for the location via `generate_image` at 1K draft, varied on one axis each (era, condition, mood); `wait_for_job` each. User picks one.
2. **Lock** — register the winner: `add_location_concept` with a precise logline (dramatic function + the 6-axis look description from `references/style-vocabulary.md`), and keep the winning image as the location's master reference. `create_brainstorm_board` first if no concept board exists.
3. **Match** — every future plate regenerates via `generate_image` at 2K, 16:9, with: the master image in `referenceImageUrls` + the verbatim lighting key (per `references/prompt-patterns.md`) + the production's style system. Vary only what the scene varies (time of day, season, weather, damage).

Scene boards that use the location: `create_scene_board_from_production_memory` pulls the plates into scene work.

## Plate types to offer

Establishing wide (day + night versions), coverage angles (the 2-3 backgrounds dialogue will play against), detail/insert textures, and condition variants (pristine/derelict, summer/winter) when the story spans time.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Labeled plate URLs grouped by location and variant ("Diner — establishing, night: <url>"), plus the location's locked description so future sessions can match it.

## Related skills

- The location registry lives in → `elegiac-story-bible`
- Scenes staged inside the location → `elegiac-storyboard` / `elegiac-shotlist`
