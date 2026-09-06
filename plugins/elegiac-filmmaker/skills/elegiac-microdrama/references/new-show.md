# Wizard: Create a New MicroDrama

## Outcome

Create or deliberately reuse one Elegiac Production, establish a complete no-spend season design and durable series memory, create one production-ready Episode 1 Board, and—only when the user continues through cost and review gates—finish Episode 1.

## Workflow

1. **Interpret the seed.** Restate it as protagonist + desire + obstacle + contradiction + renewable engine. Surface a concrete ethical, rights, or logic risk without turning harmless fiction into a compliance interview.
2. **Set control once.** Record Fast Track, Co-Creator, or Director and department overrides. Infer audience, locale, rating, channel, App Standard/Creator/Custom profile, and budget where safe; ask only unknowns that materially alter the result.
3. **Run a concept round.** Offer three compact directions varying one meaningful axis—tone, relationship, setting, or engine—and recommend one. “None of these” and direct authorship remain available.
4. **Lock the show promise.** Title candidates, logline, audience promise, theme, primary genre, emotional engine, trope package, visual form, and a one-sentence “why Episode 2?”
5. **Create the workspace.** Call `list_productions` first. After the applicable user checkpoint, call `create_production` with `microdrama`, genre/form, and locale tags; then `create_brainstorm_board` as `00 — Series Bible`, `add_creative_roadmap`, and `add_creative_direction`. Do not use Showrunner.
6. **Build the bible.** Write world rules, principal wants/wounds/secrets/arcs, relationships, recurring locations/props, dialogue rules, prohibited clichés/content, rating, and rights. Cast a voice per principal and store its ElevenLabs Voice ID as `voiceId` (ask the user for their voice IDs or pick from the built-in voices); the same ID is reused for that character in every episode. Mirror durable facts with character tools and Board artifacts.
7. **Plan the whole season in text.** Use the selected profile and the six movements in `craft.md`. For every episode store promise, hook, turn, cliffhanger, and `opens/advances/resolves`. Do not generate a season of media.
8. **Develop recurring memory cheaply.** Use `add_visual_style_board`, `add_character_concept`, and `add_location_concept` for text-first mood, cast, location, and hero-prop development. Quote a small casting/look proof only when useful. Promote approved character and style artifacts so later episodes reuse IDs rather than copied prompt prose.
9. **Create one Episode Board.** Name it `S01E01 — <Title>` and use `create_scene_development_board` or `create_scene_board_from_production_memory` when its required anchors resolve safely. Add/update the blueprint, script, `add_shot_list` artifact, anchors, and storyboard plan. During the alpha, structured local files plus roadmap/direction cards hold details not represented by a dedicated MCP artifact.
10. **Prove the episode.** Quote/cap 3–6 key vertical frames; default to four. Review hook image, cliffhanger image, identity, wardrobe, geography, lighting, text zones, and safe zones. Repair stills before motion.
11. **Produce only Episode 1.** Follow `production-pipeline.md`: dialogue stems, framed 9:16 stills for every cut, non-speaking Grok Imagine 1.5 clips at 720p, VEED lipsync only where the mouth is visible; music/SFX afterwards if wanted. Use one action/camera instruction per clip. Run cheap drafts before keeper motion; preserve exact quote, deduction/refund, and idempotency facts.
12. **Finish through the edit contract.** Export/freeze the selected assets, validate and hash the edit manifest, build `BRIEF.md`, and route the fresh narrative edit to HyperFrames `general-video`. The user approves the final Studio preview before render.
13. **Close the loop.** Probe and package the render. Register it on the Episode Board only when the current upload path safely supports it. Update episode/loop status and return Production/Board links, local master, captions, poster, manifests, credits, omissions, and the proposed Episode 2 handoff.

## Alpha storage contract

Treat current Board cards as rendered views of the canonical local `series-manifest.json`, `episode-blueprint.json`, and `edit-manifest.json`. Label their revision in the card title/body. Update an existing card when possible. A future structured artifact must be able to ingest these files without reinterpreting prose.

## Fast Track presentation

Do not force review of 60 rows. Show the show promise, movement map, principal cast/look, Episodes 1–10, and Episode 1 package; write all 60 promises to the production files. Cost and render approvals still pause.
