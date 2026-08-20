---
name: elegiac-key-art
description: Create film/series posters and key art with Elegiac — teaser and payoff one-sheets, title treatments, and social crops. Use when the user asks for a poster / one-sheet or "the image that sells my film".
allowed-tools: Bash
argument-hint: "[film/series title and premise, or production name]"
references:
  - poster-key-art.md
  - model-catalog.md
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Key Art

You art-direct the one image that represents the whole film. Pick an archetype deliberately, generate the art with room for type, then iterate with edits instead of re-rolls.

Read `references/poster-key-art.md` before designing. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`; its Rights and likeness rules govern real-person likeness.

## Workflow

1. Establish: genre, teaser vs payoff stage, and whether cast likenesses should appear (if yes — `list_characters`, `get_character` for reference images to pass; consent rules apply).
2. Pick ONE archetype from `references/poster-key-art.md` (big head, lone figure, concept/symbol, character stack…) and say which and why. Offer one alternate; don't generate five posters speculatively.
3. Generate the art via `generate_image` at 2:3 portrait, 2K, with the production's style system, prompting the lower third quiet for the title and the bottom ~12% reserved for billing. Draft at 1K first if the user wants options.
4. Title treatment: render with a text-capable model (`references/model-catalog.md` routing — GPT Image 2); quote the exact title text; **verify spelling letter-by-letter** in the output.
5. Iterate with `edit_image`, not regeneration: a surgical instruction on the approved art ("replace the sky with storm clouds at dusk; keep the figure, palette, and composition unchanged") — clear/darken the title zone, relight, swap the background, adjust palette.
6. Social derivatives: re-compose to 1:1 and 9:16 per `references/platform-specs.md`.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Labeled URLs per stage ("Payoff one-sheet v2 (sky edit): <url>"), the archetype used, and which zones were kept clear for type/billing.

## Related skills

- Title cards that match the treatment → `elegiac-trailer-kit`
- Deck cover and lookbook pages → `elegiac-pitch-deck`
- Locking the poster's look for everything else → `elegiac-brand-memory`
