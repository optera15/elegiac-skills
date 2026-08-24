---
name: elegiac-illustration
description: Create illustration work with Elegiac — editorial illustration, comic and graphic-novel pages, children's book art, album/zine art. Use when the user asks to illustrate something, wants a specific artistic medium (gouache, riso, woodcut, ligne claire), or a consistent illustrated series.
allowed-tools: Bash
argument-hint: "[what to illustrate + medium/style if known]"
references:
  - style-vocabulary.md
  - model-catalog.md
  - prompt-patterns.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Illustration

Illustration lives or dies on medium specificity and series consistency. Name a real medium and tradition, lock it, and every piece in the set inherits it.

Read `references/style-vocabulary.md` before naming the style. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. **Pin the medium** using the 6-axis format in `references/style-vocabulary.md` (medium, palette, light, texture, composition habit, era anchor). If the user's style is vague ("storybook-ish"), propose 2-3 named directions as 1K drafts first. Evoke traditions and visual traits — never prompt living artists' names or current franchises.
2. **Lock before the series.** One approved keeper → `create_style_system` (or promote from a board card). NegativePrompt carries the forbiddens ("no photorealism, no clean digital gradients").
3. **Series pattern:** keeper first, then remaining pieces via `generate_image` with {styleSystemId + the keeper in `referenceImageUrls`} → `wait_for_job` each. Recurring characters in comics/books need cast memory (`create_character` + references), or they'll drift by page 3.
4. **Local fixes via `edit_image`:** wrong object, off-palette corner, busy background — a surgical instruction on the approved piece rather than re-rolling it.
5. Route per `references/model-catalog.md`: stylized/painterly → Seedream 5.0 / Reve; pages needing lettering → text-capable model, verify spelling.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Labeled URLs in series order, the locked style system id/name, and a consistency note (what anchors held the set together).

## Related skills

- Finding the style first → `elegiac-style-explorer`
- Recurring character identity → `elegiac-character-cast`
- Sequential story pages with coverage logic → `elegiac-storyboard`
