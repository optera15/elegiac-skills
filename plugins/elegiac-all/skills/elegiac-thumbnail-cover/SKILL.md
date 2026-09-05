---
name: elegiac-thumbnail-cover
description: Create a single click-worthy thumbnail or cover image with Elegiac — YouTube thumbnail, podcast cover, playlist or episode art. Use when the user asks for a thumbnail, cover art, or "something people will click".
allowed-tools: Bash
argument-hint: "[video/podcast topic + the surface it's for]"
references:
  - platform-specs.md
  - model-catalog.md
  - youtube-creator.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Thumbnail & Cover

Small-canvas design: everything must read at thumbnail size. Composition rules beat style rules here.

Read the stills table in `references/platform-specs.md` for exact pixel specs and legibility floors. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Composition rules (apply without being asked)

- **One subject + one emotion + ≤4 words.** A face with a strong expression outperforms scenery; if a face is used and it's the creator's, get their reference images (consent rules apply to real likenesses).
- **The 168px test** (YouTube) / **55px test** (podcast): mentally shrink the design — if the text or subject vanishes, simplify. High contrast subject-vs-background, no fine detail.
- Avoid the bottom-right corner on YouTube (duration badge).
- Series consistency: same layout grammar + palette per episode, one variable element. Lock it as a style system so episode 40 matches episode 1.

## Workflow

1. Confirm the surface (YouTube / podcast / banner / playlist) and pull its exact spec from `platform-specs.md`. Pull creator likeness refs with `list_characters` / `get_character`, and an existing series look with `find_style_system`.
2. Propose 2 draft concepts (one face-led, one object/symbol-led) with `generate_image` → `wait_for_job`. User picks.
3. Final at the surface's full resolution and exact aspect ratio with a **text-capable model** (`model-catalog.md`: GPT Image 2 for rendered text). Quote the exact overlay words; verify spelling in the output.
4. Fix text zones or swap backgrounds with `edit_image` ("clear the left third and darken it for title text; keep the face and palette unchanged") rather than re-rolling an approved composition.
5. For a series: promote the winning look via `promote_visual_style_to_style_system` (or `create_style_system`) and reuse by id.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Report per the conventions Reporting rules, plus the overlay text used and the series style system id if one was locked.

For YouTube thumbnails, also apply the thumbnail–title complementarity rule in `references/youtube-creator.md` — the thumbnail must not repeat the title's words.

## Related skills

- The channel-wide thumbnail template → `elegiac-youtube-channel-kit`
- Title + description the thumbnail pairs with → `elegiac-video-packaging`
- Month of covers in one pass → `elegiac-campaign-pack` / `elegiac-content-calendar` workflows
- Locking the series look → `elegiac-brand-memory`
