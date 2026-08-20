---
name: elegiac-product-shots
description: Generate product photography with Elegiac — hero shots, lifestyle scenes, flat-lays, macro details, marketplace images, seasonal restyles, PDP and social packs. Use when the user asks for product photography, hero or lifestyle shots, or "make my product look professional".
allowed-tools: Bash
argument-hint: "[product + where the images will run]"
references:
  - product-photo-modes.md
  - platform-specs.md
  - model-catalog.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Product Shots

Mode-driven product photography anchored on the REAL product. Brand continuity comes from the user's style system — that's what makes shot 50 match shot 1.

Read `references/product-photo-modes.md` before picking modes. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Honest pixels

The product pixels stay honest; the world around them is generated. Never let the model invent the product — material, color, proportions, and label must stay faithful to the references. If generation alters the product, fix or discard; never deliver a misrepresented product image for commercial use. Editing an approved shot keeps the product pixels honest — prefer `edit_image` over regenerating.

## Workflow

1. **Get the real product.** Ask for product photos and `upload_asset` them (2-4 angles ideal).
2. **Pick modes, don't interrogate.** Ask at most the two interview questions in `product-photo-modes.md` (where will it run / studio or in-the-world), then choose modes yourself and say which. Default packs: PDP pack (hero + macro + scale + lifestyle), social pack, campaign pack.
3. **Brand continuity:** `find_style_system` and apply the brand kit.
4. **Generate** hero first with the product refs in `referenceImageUrls`; approve; then batch the remaining modes; `wait_for_job` each.
5. **Restyle and fix with `edit_image`:** background swap, relight, season change with `imageUrl` = the approved shot — the core product-shot operation (e.g. "replace the background with a marble bathroom counter, morning window light; keep the bottle, label, and reflections unchanged").
6. **Size per destination** using `platform-specs.md` (marketplace main = pure white bg, product ~85%, no props/text).

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

URLs labeled by mode and destination ("Hero — PDP main, white seamless: <url>"), plus a fidelity note confirming honest pixels — the product matches the references.

## Related skills

- Ad variants from the approved shots → `elegiac-campaign-pack`
- Establishing the brand look first → `elegiac-style-explorer` / `elegiac-brand-memory`
