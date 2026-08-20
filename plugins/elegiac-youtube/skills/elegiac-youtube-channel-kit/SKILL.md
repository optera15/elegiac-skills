---
name: elegiac-youtube-channel-kit
description: Build the complete YouTube channel identity set with Elegiac — banner, avatar, watermark, thumbnail template, end-screen background, and intro/outro bumper as one coherent kit. Use when the user asks for channel identity, "set up my YouTube channel", "rebrand my channel", or banner and avatar.
allowed-tools: Bash
argument-hint: "[channel name + what it's about]"
references:
  - youtube-creator.md
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac YouTube Channel Kit

One channel, one look, six surfaces. The kit's job is coherence: the banner, avatar, watermark, thumbnail template, end screen, and bumper must read as the same brand at every size from 2560px to 32px.

Read the channel-surfaces table in `references/youtube-creator.md` and the pixel specs in `references/platform-specs.md` first. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. **Lock the look first.** `find_style_system` for an existing brand, or develop one (2-3 directions at 1K draft) and `create_style_system`. Every surface inherits this `styleSystemId` — the kit fails if surfaces are designed independently.
2. **Generate surfaces in legibility order** (hardest constraint first), each via `generate_image` at its exact spec (exact aspect/resolution, styleSystemId):
   - **Avatar** (800×800, must survive the 98px and 32px circle test — one bold shape/letterform). The avatar mark, simplified, becomes the watermark (150×150).
   - **Banner** (2560×1440; all critical content inside the 1546×423 safe area). Channel name text needs a text-capable model — verify spelling.
   - **Thumbnail template:** a composition grammar (face zone, text zone, palette, one variable element), generated as 2-3 examples. **Promote the winner via `promote_visual_style_to_style_system`** so `elegiac-thumbnail-cover` reproduces it per-episode by id forever.
   - **End-screen background** (1920×1080): right/center-right kept visually quiet for YouTube's video cards, lower-left for subscribe, branding in the left third.
3. **Bumper:** brand still → `animate_image` (5-8s, one simple motion: logo settle, light sweep). Audio sting via `generate_audio` type sfx on request.
4. **Edit approved compositions with `edit_image`** — clear a text zone, recolor, simplify for small sizes.
5. Collect everything on a "Channel Kit" board (`create_board` + `add_workflow_results_to_board`); `export_pack` for the final handoff.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Each surface as a labeled URL with its spec ("Banner, 2560×1440, safe-area verified: <url>"), the locked style system ids (brand + thumbnail template), and the export pack location.

## Related skills

- Per-episode thumbnails from the locked template → `elegiac-thumbnail-cover`
- Titles/descriptions for the videos themselves → `elegiac-video-packaging`
- The channel's recurring host persona → `elegiac-virtual-influencer`
