---
name: elegiac-board-workspace
description: Organize Elegiac outputs into Production Boards: scene boards, trailer-kit boards, character boards, pitch boards, and launch-kit boards. Use after generating or finding assets/workflows when the user wants results placed into a usable filmmaker work surface.
allowed-tools: Bash
argument-hint: "[production, board, workflow, or scene goal]"
references:
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Board Workspace

Use this skill when Elegiac results should become organized film work rather than loose gallery assets. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Rules

- Prefer append/template actions over arbitrary canvas positioning; pixel-perfect board manipulation is out of scope for MCP/CLI.
- Board writes mutate a Production and may require approval, but spend no provider credits — except `generate_storyboard_from_board`, `animate_board_frame`, and Board Character generation/variation, which spend credits like normal generation.
- Generate new media only when the user explicitly asks; this skill organizes existing assets and completed workflow outputs.
- For early creative development, use Brainstorm artifact cards (`creativeRoadmap`, `creativeDirection`, `moodboardCard`, `characterConcept`, location concept cards) before generating media.
- If the user starts from a fresh film/scene idea, prefer `create_scene_development_board` so the first pass creates the Production if needed and lays down the board, roadmap, direction, moodboard, location, storyboard plan, and character concepts in one no-provider-spend setup step.
- If the user already has a Production with approved Cast, Consistent Characters, character variations, and location/reference assets, prefer `create_scene_board_from_production_memory`. It resolves those existing assets first, creates exactly one board only after resolution succeeds, and spends no provider credits.
- When the user asks for a full one-prompt scene build, run `create_scene_development_board` first, then follow its `suggestedNextActions` in order on the same board: generate board characters, wait for them, make them consistent, wait for those jobs, create requested character variations, generate storyboard frames from the board, place workflow results back on the same board with `add_workflow_results_to_board`, and animate only if the user requested motion and approved the quote. The scene board is the work surface; create additional boards only when the user explicitly asks for them.
- For named character variations, use `create_board_character_variation` — it requires an existing Consistent Character board item and outputs a reference-sheet alternate image.
- Do not run `generate_storyboard_from_board` for a board with character concepts until the required Consistent Character board items exist, every required variant is present on the board, and any required location anchor is pinned. The gateway will block missing variants/location anchors before approval or credit spend.
- For board-native cast work, use Board Character actions when the user wants to generate a character directly on the board, convert it into a Consistent Character, or make controlled identity-preserving variations.
- For scene/trailer workflows, create a board or frame with a concrete filmmaker-native name like `Scene 12 Board`, `Trailer Kit`, `Character Pass`, or `Festival Launch Board`.
- After placing workflow outputs, inspect the board if the user needs confirmation of what was placed.
- To retire a board without losing its items, use `archive_board` / `restore_board` (pass `includeArchived: true` to `list_boards` to audit archived boards); `archive_production` / `restore_production` work the same way at the production level.

## MCP Workflow

Start with:

```text
list_boards({ productionId })
```

Create a board when no suitable board exists:

```text
create_board({ productionId, name: "Scene 12 Board", agentMode: "create" })
```

Place existing assets:

```text
add_asset_to_board({
  productionId,
  boardId,
  galleryItemIds: ["<gallery-item-id>"],
  layout: "grid"
})
```

Place completed workflow outputs:

```text
add_workflow_results_to_board({
  productionId,
  boardId,
  workflowId,
  layout: "storyboard",
  frameLabel: "Scene 12 Storyboard",
  includeSummaryNote: true
})
```

Fast path from a completed workflow:

```text
create_scene_board_from_workflow({
  workflowId,
  name: "Scene 12 Trailer Kit",
  layout: "storyboard",
  includeSummaryNote: true
})
```

If the workflow came from an existing Board, use this instead:

```text
add_workflow_results_to_board({
  productionId,
  boardId: "<origin-board-id>",
  workflowId,
  layout: "storyboard",
  includeSummaryNote: true
})
```

Brainstorm-to-production path:

```text
create_production({ name, description })
create_scene_development_board({ productionTitle, boardName, filmPremise, sceneBrief, characters })
create_brainstorm_board({ productionId, name: "Noir Short Brainstorm", brief })
add_creative_roadmap({ productionId, boardId, objective })
add_creative_direction({ productionId, boardId, title, pitch, referenceKeywords })
add_visual_style_board({ productionId, boardId, title, palette, keywords, toneNotes })
add_character_concept({ productionId, boardId, characterName, role, backstory, wardrobe, lookNotes })
add_location_concept({ productionId, boardId, title, logline, keywords, mood })
add_shot_list({ productionId, boardId, sceneName, shots: [{ slug, description, camera, duration }] })
update_board_artifact({ productionId, boardId, boardItemId, updates })  // PATCH an artifact card — never duplicate a card you can edit
promote_character_concept({ productionId, boardId, boardItemId })
promote_visual_style_to_style_system({ productionId, boardId, boardItemId })
generate_storyboard_from_board({ productionId, boardId, sceneBrief, frameCount, castMemberIds, maxCredits })
animate_board_frame({ productionId, boardId, boardItemId, prompt, maxCredits })
```

Existing-memory scene staging path:

```text
list_characters({ productionId, includeGalleryReferences: true })
list_assets({ productionId, mediaType: "image" })
create_scene_board_from_production_memory({
  productionId,
  boardName: "The Dojo",
  sceneBrief,
  characterNames: ["Sherry", "Kendall"],
  locationNames: ["Kyoto Dojo"],
  requiredCharacterVariants: [
    { characterName: "Sherry", label: "katana", hint: "katana" },
    { characterName: "Kendall", label: "katana", hint: "katana" }
  ],
  storyboardBeats
})
generate_storyboard_from_board({ productionId, boardId, sceneBrief, frameCount, maxCredits })
```

If `create_scene_board_from_production_memory` returns missing or ambiguous cast, variant, or location candidates, stop and ask the user to choose or create the missing memory. Do not create a fallback board, do not generate generic characters, and do not spend credits.

Board Character path:

```text
create_character_on_board({ productionId, boardId, characterName, description, maxCredits })
make_board_character_consistent({ productionId, boardId, boardItemId, maxCredits })
create_board_character_variation({ productionId, boardId, boardItemId, variationPrompt, variationLabel, maxCredits })
```

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Related skills

- Timed animatic from a finished board → `elegiac-animatic`
- Trailer-kit boards with beats and music → `elegiac-trailer-kit`
- Deck/lookbook boards → `elegiac-pitch-deck`
- Account-wide board hygiene → `elegiac-production-audit`
