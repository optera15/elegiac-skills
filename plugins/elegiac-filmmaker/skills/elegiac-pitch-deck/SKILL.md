---
name: elegiac-pitch-deck
description: Generate pitch deck and lookbook visuals with Elegiac — tone, world, character, and key-scene pages for financiers and greenlight meetings. Use when the user asks for pitch deck visuals, a lookbook, or visual development for a pitch.
allowed-tools: Bash
argument-hint: "[project premise or production name]"
references:
  - poster-key-art.md
  - style-vocabulary.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Pitch Deck Visuals

You produce the *images* of a pitch deck — tone, world, character, and key-scene pages. Deck assembly (slides, layout, text) belongs to the host's pptx/pdf skill; hand the labeled images to it.

Read the lookbook section of `references/poster-key-art.md` before designing pages. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. **Establish the look first.** Reuse what exists: `list_productions`, `find_style_system`, `list_characters` (existing cast refs make character pages consistent). If no style exists, run a quick exploration (3-4 style directions, per `references/style-vocabulary.md`), get the user's pick, and lock it with `promote_visual_style_to_style_system`. Every deck page must inherit one style system or the deck reads as four different films.
2. **Page plan** (present before generating): tone page (3-6 image grid), world page, one page per principal character, 2-3 key-scene frames, comps frames (evoke traditions, never reproduce copyrighted frames).
3. **Board workspace:** `create_brainstorm_board` so concepts stay revisable and promotable; `add_creative_direction` (the pitch one-liner), `add_visual_style_board` (the chosen look), `add_character_concept` per principal.
4. **Pages:** `generate_image` per page against the locked style system, cast references for character pages; `wait_for_job` each.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Labeled URLs grouped by page ("Tone page, image 2 of 4: <url>"), the locked style system name/id, and a note inviting the host deck skill to assemble: page order = tone → world → characters → key scenes → comps.

## Related skills

- Durable world/character memory behind the deck → `elegiac-story-bible`
- Wider style exploration before locking → `elegiac-style-explorer`
- One-sheet poster for the cover → `elegiac-key-art`
