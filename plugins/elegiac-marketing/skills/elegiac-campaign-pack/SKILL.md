---
name: elegiac-campaign-pack
description: Generate multi-asset campaign packs with Elegiac: hero stills, social variants, short videos, and platform-specific creative sets. Use when the user asks for a multi-format campaign, launch pack, or teaser pack.
allowed-tools: Bash
argument-hint: "[campaign brief]"
references:
  - platform-specs.md
  - ad-frameworks.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Campaign Pack

Use this skill for multi-deliverable creative production.

When sizing deliverables per platform, use `references/platform-specs.md`; when planning ad variant sets, use the axes in `references/ad-frameworks.md`. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Rules

- Ask only for missing essentials: audience/channel, product/project, and deliverables.
- Use the Elegiac MCP `generate_campaign_pack` tool; it quotes and requests permission once for the whole pack.
- The default pack is still-image only. Include motion only when the user explicitly asks for video, animation, trailer, teaser, reel, or moving deliverables.
- If the campaign should feature existing cast, call `list_characters` for the Production first and pass matching `castMemberIds` or `characterNames` into `generate_campaign_pack`.
- If the user asks to continue, extend, or reuse an earlier campaign, call `list_campaigns` or `list_workflow_runs` first and pass the matching `campaignId` into `generate_campaign_pack`.
- Favor cinematic and story-led output over generic ecommerce templates unless the user asks for commerce assets.

## Parameters

Call `generate_campaign_pack` with:

- `brief`: campaign/product/project brief.
- `title`: short campaign name.
- `audience`: target audience, if known.
- `brandPrompt`: brand memory or style guardrails, if known.
- `stylePrompt`: visual world, cinematography, palette, and continuity notes.
- `deliverables`: optional array of `{ title, type, channel, prompt, notes, aspectRatio }`.
  - For stills, omit `mediaType` or set `mediaType: "image"`.
  - For text-to-video, set `mediaType: "video"` or `operation: "video"`, plus optional `model`, `duration`, `videoResolution`/`resolution`, and `qualityTier`.
  - For image-to-video animation, set `mediaType: "animation"` or `operation: "animate"` and provide either `startImageUrl` or `startFromFrameIndex` pointing to an earlier still deliverable in the same pack.
- `deliverableCount`: how many deliverables to plan.
- `productionId`: when the user wants results saved into a Production.
- `campaignId`: when continuing an existing Campaign memory.
- `castMemberIds`: when campaign visuals should preserve production cast continuity.
- `resolution`, `model`, model-supported quality/tier controls, and `maxCredits` for stills.
- `videoResolution`, `videoDuration`, `qualityMode`, model-supported quality/tier controls, and per-deliverable `model` for motion deliverables.

Suggested first-pass pack:

1. Hero key visual, `16:9`.
2. Square social post, `1:1`.
3. Vertical story poster, `9:16`.
4. Wide banner, `21:9`.

Suggested conservative mixed pack:

1. Hero key visual, `mediaType: "image"`, `16:9`.
2. Motion teaser, `mediaType: "animation"`, `startFromFrameIndex: 1`, `16:9`, short duration.

The workflow starts dependency-free deliverables immediately after approval. Animation deliverables that depend on a generated earlier frame remain queued until `wait_for_workflow` sees the source still complete, then the animation child job starts.

Then:

```text
wait_for_workflow({ workflowId, timeoutSeconds: 55, intervalSeconds: 3 })
```

Report the pack grouped by deliverable, with inline images or video thumbnail/previews when the host supports them.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Related skills

- Film/series release packs with trailer pieces → `elegiac-trailer-kit`
- Locking the campaign's look first → `elegiac-style-explorer` / `elegiac-brand-memory`
- Weekly/monthly recurring content from the same campaign memory → `continue_campaign` via this skill
