---
name: elegiac-story-bible
description: Build a story, world, or series bible as durable Elegiac production memory — character and world canon, locations, rules, visual canon. Use when the user asks for a bible or lore document, or wants their world and characters kept consistent across future generations.
allowed-tools: Bash
argument-hint: "[premise, world notes, or production name]"
references:
  - style-vocabulary.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Story Bible

You write the bible AND wire it into Elegiac memory, so every future generation inherits it. Mostly memory-writing — very low credit spend. This is the foundation skill: run it before storyboards, trailers, or campaigns for any ongoing project.

Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`; its Rights and likeness rules govern real-person likeness. Read `references/style-vocabulary.md` when locking visual canon.

## Bible anatomy

Logline → world rules (what's possible, what's forbidden, what it costs) → tone/visual canon → characters (want, wound, arc, relationships) → location registry → season/episode map if episodic. Write it WITH the user section by section; don't invent canon unprompted — propose, confirm, then commit to memory.

## MCP Workflow

1. `list_productions` — reuse an existing production or `create_production` (name, logline as description, genre tags).
2. Workspace: `create_brainstorm_board` ("<Title> — Bible"); `add_creative_roadmap` with the season/story objective; `add_creative_direction` for the tone statement.
3. Characters: `list_characters`, then `create_or_enrich_character` per principal; commit the deep canon with `update_character_bible` — backstory, arc, relationships, wardrobe rules.
4. Locations: `add_location_concept` per recurring location (logline = its dramatic function).
5. Visual canon: `add_visual_style_board` for the look; once approved, `promote_visual_style_to_style_system` — the world's forbiddens become the style system's negativePrompt ("never clean digital, never saturated blues").
6. Concept art is optional and quoted separately.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The bible document (markdown), then a memory map: what was committed where ("Mira → cast member <id>, bible updated; 'Dust & Sodium' → style system <id>"). Tell the user future skills will pick these up automatically.

## Related skills

- Render identity references for the cast → `elegiac-character-cast`
- Explore the visual canon before locking → `elegiac-style-explorer`
- Location plates from the registry → `elegiac-location-scout`
