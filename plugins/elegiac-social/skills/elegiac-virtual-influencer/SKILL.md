---
name: elegiac-virtual-influencer
description: Build and run a persistent synthetic persona that posts — virtual influencers with Elegiac: persona design, locked identity, content in the persona's voice, talking posts. Use when the user asks for a virtual influencer, AI persona, brand character for socials, or a synthetic spokesperson with a persistent identity.
allowed-tools: Bash
argument-hint: "[persona concept + the platforms it will live on]"
references:
  - voice-and-music.md
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Virtual Influencer

A virtual influencer is a **governed identity asset**: persona design + locked visual identity + voice + disclosure discipline. Elegiac's cast memory is the persistence layer — build it right once and every post inherits it.

Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`; its Rights and likeness rules govern real-person likeness and synthetic-persona disclosure, and they lead this skill.

## Governance first (non-negotiable)

- Record forbidden uses in the bible (e.g. "never political content, never medical claims") — treat them like a style system's negativePrompt: binding.

## Build (once)

1. **Persona document** (zero spend): name, bio, voice on the four axes (`voice-and-music.md`), visual signature, 3-4 content pillars, platform tone. Approve before generating.
2. **Identity:** `create_character` → `generate_character_reference` (identity sheet) → `generate_character_variants` (wardrobe/pose range) → `promote_character_variant` for keepers. Commit the persona doc + rights via `update_character_bible`.
3. **Look:** the persona's feed aesthetic as a style system (`create_style_system`) so posts match across months.

## Run (repeatable)

- Stills: `generate_image` with the persona's cast refs + style system, sized per `platform-specs.md`.
- Motion posts: `animate_image` from approved stills.
- Talking posts: `generate_audio` speech in the persona's cast voice → `generate_lipsync` on a clean talking clip.
- Batch a week at a time with one `maxCredits`; approve week 1 before generating week 2.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The persona document, the identity assets (labeled URLs), the cast member + style system ids, and the disclosure/rights summary. For content runs: posts grouped by pillar with platform sizes.

## Related skills

- Posting cadence and series continuity → `elegiac-content-calendar`
- The persona doing ad reads → `elegiac-ugc-ads`
- Deep identity/canon management → `elegiac-character-cast` / `elegiac-story-bible`
