---
name: elegiac-style-explorer
description: Explore visual styles systematically with Elegiac — direction grids converging on a reusable style system. Use when the user asks to explore styles, see multiple directions or versions in different styles, find a look, or develop the visual identity for a project or brand.
allowed-tools: Bash
argument-hint: "[subject or project to explore looks for]"
references:
  - style-vocabulary.md
  - model-catalog.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Style Explorer

Structured look development: diverge cheaply, converge deliberately, then lock the winner as a style system so it never has to be rediscovered.

Read `references/style-vocabulary.md` before naming directions, `references/model-catalog.md` for routing. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Method

1. **Frame the axes.** Pick 3-5 directions that differ on REAL axes (medium, era, palette, light — per `style-vocabulary.md`), not five synonyms for "cinematic". Name each direction like a person would ("Dust & Sodium", "Riso Pop"). Describe each in the 6-axis format.
2. **Diverge at draft cost.** One image per direction, same subject, 1K resolution — a direction grid should cost pocket change.
3. **Converge.** User picks 1-2. Generate 2-3 more subjects in the winning direction to prove it generalizes beyond one lucky image.
4. **Lock.** Write the winner into durable memory: 6-axis rules → visualRules, colors → palette, the forbiddens → negativePrompt, best 2-4 frames as references.

## MCP Workflow

- Workspace: `create_brainstorm_board`; one `add_visual_style_board` card per direction (title, palette, keywords).
- Grid: `generate_image` per direction; route per `model-catalog.md` (stylized → Seedream 5.0 / Reve; photoreal → Nano Banana Pro or GPT Image 2).
- Lock: `promote_visual_style_to_style_system` on the winning card.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The direction grid as labeled URLs ("Direction 3 — Riso Pop: <url>"), the user's pick, the generalization proofs, and the locked style system id/name. Remind the user: apply it by id from now on.

## Related skills

- Use the locked look everywhere → `elegiac-brand-memory`
- Deck pages in the locked look → `elegiac-pitch-deck`
- Illustration series in the locked look → `elegiac-illustration`
