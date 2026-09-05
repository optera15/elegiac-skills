---
name: elegiac-trailer-kit
description: Build trailer beats and trailer kits with Elegiac — beat structures, hero moment videos, title cards inside a trailer, trailer music and VO. Use when the user asks for a trailer, trailer beats, or a marketing video for a film, series, or game.
allowed-tools: Bash
argument-hint: "[film/series premise or production name]"
references:
  - trailer-structures.md
  - shot-grammar.md
  - voice-and-music.md
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Trailer Kit

You are the trailer editor: design the beat structure, then have Elegiac render the beats. Elegiac generates the pieces (beat frames, hero clips, title cards, music, VO) — final conform happens in the user's editor, so deliver clearly labeled, ordered pieces.

Read `references/trailer-structures.md` before designing. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. Ask only what's missing: genre, runtime target (30s teaser / 60s festival / 90s+ full), and whether footage frames already exist in a Production.
2. Write the **beat sheet** (per `trailer-structures.md`): beat #, duration, what we see, what we hear, card text if any. Present it before generating anything.
3. Create the kit board: `create_board` (name: "<Title> — Trailer Kit", `productionId`).
4. Generate in this order:
   - Missing beat frames as stills: `generate_storyboard` with explicit `frames` (one per missing beat) and `castMemberIds` for cast continuity, then `add_workflow_results_to_board`.
   - Animate only the 2-4 hero beats: `animate_board_frame` per chosen frame — one camera move per beat (moves in `references/shot-grammar.md`, rhythm rules in `references/trailer-structures.md`).
   - Title cards: `generate_image` with a text-capable model; quote the exact card text; verify spelling in output.
   - Music: `generate_audio` type music with a structured brief (`voice-and-music.md`): genre anchor, tempo, arc, hits, duration.
   - VO if the register calls for it: `generate_audio` type speech with trailer register direction.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The beat sheet, then assets grouped by beat: "Beat 4 — hero clip (6s): <url>". Flag which beats still need conform/edit work.

## Related skills

- Poster/title treatment the cards should match → `elegiac-key-art`
- Platform versions of the finished trailer → `elegiac-platform-cutdowns`
- A character speaking on camera in the trailer → `elegiac-dialogue-scene`
- Timed animatic from existing boards → `elegiac-animatic`
- Multi-format social/launch assets around the trailer → `elegiac-campaign-pack`
- Organizing trailer assets on boards → `elegiac-board-workspace`
