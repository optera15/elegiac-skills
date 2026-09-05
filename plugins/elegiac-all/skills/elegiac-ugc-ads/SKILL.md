---
name: elegiac-ugc-ads
description: Create UGC- and creator-style video ads with Elegiac — talking-head spots, testimonial-format reads, phone-native ads with a recurring spokesperson. Use when the user asks for a UGC ad, creator-style video, or spokesperson content.
allowed-tools: Bash
argument-hint: "[product/offer + the ad's one idea]"
references:
  - ad-frameworks.md
  - voice-and-music.md
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac UGC Ads

UGC is a *grammar*, not a budget tier: handheld imperfection, available light, direct address, phone-native 9:16. The pipeline is script → spokesperson → voice → clip → lipsync.

Read `references/ad-frameworks.md` (script skeletons + disclosure rules) before writing. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`; its Rights and likeness rules govern real-person likeness and synthetic-persona disclosure.

## Non-negotiables

- Claims and stats come from the user — never invent results.

## Workflow

1. **Script first** (zero spend): pick a skeleton from `ad-frameworks.md` (problem→discovery→proof→CTA is the default), write it as speech — contractions, short sentences, hook in the first 2 seconds. Burn the hook as on-screen text too (sound-off viewing). Get approval.
2. **Spokesperson:** reuse an existing cast member, or create one (`create_character` → `generate_character_reference`) so every ad in the campaign uses the same face. A recurring spokesperson is the compounding asset here.
3. **Voice the script:** `generate_audio` speech with casual, conversational direction ("talking to a friend on FaceTime") — approve the read.
4. **The clip:** `generate_image` (spokesperson refs, UGC grammar: phone-camera look, real-room background, direct eyeline, 9:16) → `animate_image` with subtle handheld idle motion.
5. **Lipsync:** `generate_lipsync` clip + read. For 20-30s scripts, produce per-beat takes (hook / proof / CTA) and deliver as an ordered cut list.
6. Variants: change ONE axis per `ad-frameworks.md` (hook, benefit, CTA) — placements/resizes are not variants.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Per variant: the axis it tests ("Hook B: outcome-first"), the script, and the final video URL(s) in cut order. Note any disclosure obligations.

## Related skills

- Static ad sets and platform resizes → `elegiac-ad-variants` / `elegiac-campaign-pack`
- A persistent persona beyond ads → `elegiac-virtual-influencer`
- Polished product imagery in the spot → `elegiac-product-shots`
