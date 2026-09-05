---
name: elegiac-ad-variants
description: Plan and generate ad variant sets with Elegiac — an A/B variant matrix that tests one message axis at a time, sized per platform. Use when the user asks for ad variants, an A/B test matrix, or "10 versions of this ad".
allowed-tools: Bash
argument-hint: "[product/offer + platforms + how many variants]"
references:
  - ad-frameworks.md
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Ad Variants

A variant set is an *experiment design*, not a pile of images. Vary one message axis per variant so results mean something; placements (resizes) are not variants.

Read `references/ad-frameworks.md` before planning; size everything per `references/platform-specs.md`. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. **Design the test** (zero spend): 1 control + 3-4 challengers, each differing on ONE axis (hook, benefit, emotion, format, CTA). Label every variant with its axis. Present the matrix before generating.
2. **Plan through campaign memory** so the set is reusable and the quote is aggregate: `compose_campaign_brief` (no spend) → `plan_campaign_outputs` with `targetChannels` and `maxCredits` (no spend, returns plan + quoted cost) → user approves → `execute_campaign_plan` → `wait_for_workflow`. Pass `castMemberIds` for a recurring spokesperson and the brand `styleSystemId` so variants stay on-brand.
3. **Deliverables per variant:** the platform's native sizes from `platform-specs.md` (Meta 1:1/4:5, Stories/TikTok 9:16, display 1.91:1). Static anatomy: one subject + ≤6-word headline + brand mark + CTA — headlines need a text-capable model; verify spelling.
4. **Follow-on flights:** when a winner emerges, `continue_campaign` with the winning axis as the new control — campaign memory keeps the look consistent across flights.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The test matrix (variant, axis, hypothesis), then URLs grouped by variant × placement ("Hook B — outcome-first, 9:16: <url>"). Remind the user which single axis each variant tests.

## Related skills

- UGC/talking-head ad formats → `elegiac-ugc-ads`
- Product imagery inside the ads → `elegiac-product-shots`
- One-off multi-format packs without a test design → `elegiac-campaign-pack`
