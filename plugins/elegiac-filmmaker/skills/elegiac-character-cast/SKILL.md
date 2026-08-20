---
name: elegiac-character-cast
description: Reuse, inspect, and plan generation around Elegiac production cast memory. Use when the user asks to use a named character, keep cast continuity, or make a character appear in new scenes or media.
allowed-tools: Bash
argument-hint: "[character or cast request]"
references:
  - prompt-patterns.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Character Cast

Use this skill to preserve character and cast continuity. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`; its Rights and likeness rules govern real-person likeness.

## Rules

- Prefer production cast member ids over free-text character descriptions when a storyboard or campaign needs continuity.
- Preparing a character from selected assets can also start a billable starter-reference workflow; pass explicit `generateStarterReference:true` when the user wants that one-call path.

## MCP Workflow

Use `list_characters` to inspect reusable cast memory:

- Include `productionId` when the user is working inside a Production; this returns production cast members and reference assets.
- Omit `productionId` only when looking for recent global character/consistent-character gallery items.

Use `create_character` to add a production cast member:

- `productionId`
- `characterName`
- `roleType`: `lead`, `supporting`, `extra`, or `voice`
- `galleryItemIds`: optional existing image references
- `notes`: continuity notes such as wardrobe, silhouette, identity cues, or constraints

Use `create_or_enrich_character` when the user selects existing Gallery/Production images and wants Elegiac to build cast memory from them:

- `productionId`
- optional `castMemberId`: enriches that cast member; omit it to create a new cast member
- `galleryItemIds`, `productionGalleryItemIds`, or `productionAssetIds` (plural list params; a comma-separated string also works)
- optional `characterName`, `roleType`, `actorName`, `notes`
- optional `characterBible`, `rights`, and `provenance` to override the deterministic starter fields

This tool infers a starter Character Bible, applies conservative rights defaults, records source provenance, and attaches the selected owned image assets as references.

Use `prepare_character_from_assets` when the user wants the one-call intake flow from selected Gallery/Production images:

- It accepts the same source asset fields as `create_or_enrich_character`.
- With `generateStarterReference:false` or omitted, it is metadata-only and returns the prepared cast member.
- With `generateStarterReference:true`, it quotes and starts a `character_reference` workflow for the prepared cast member under the same approval.
- Use `promoteGeneratedReference:true` only when the user explicitly wants the completed starter reference auto-attached to the cast member after `wait_for_workflow` sees it complete.

Use `get_character` before changing an existing cast member when you need the current reference images, notes, or role.

Use `update_character` for metadata-only changes:

- `productionId`
- `castMemberId`
- optional `characterName`, `roleType`, `actorName`, `notes`

Use `update_character_bible` for durable creative memory and governance:

- `productionId`
- `castMemberId`
- `characterBible`: optional `logline`, `personality`, `backstory`, `motivation`, `visualContinuity`, `wardrobe`, `voice`, `relationships`, and `constraints`
- `rights`: optional `status`, `consentStatus`, `likenessType`, `commercialUse`, `owner`, `source`, `license`, `usageRestrictions`, `consentNotes`, and `expiresAt`
- `provenance`: optional `source`, `sourceGalleryItemIds`, `sourceWorkflowIds`, `sourceJobIds`, `createdByClient`, `model`, `promptSummary`, and `notes`

Set `rights.consentStatus` to `granted` only when the user has explicitly confirmed consent; when rights are unclear for a real-person or actor likeness, use `needs_review`/`needs_consent`. Cast-backed generation fails closed when a character is marked `restricted`, `needs_review`, `needs_consent`, or `revoked`.

Use `add_character_reference` to attach additional owned Gallery images to a cast member:

- `productionId`
- `castMemberId`
- `galleryItemIds` (required; plural list param)

To retire a cast member without losing their references or bible, use `archive_character` / `restore_character` (pass `includeArchived: true` to `list_characters` to audit archived cast).

For storyboards and campaign packs, pass `castMemberIds` or `characterNames` to `generate_storyboard` / `generate_campaign_pack` so Elegiac can use the cast's owned reference images and inject cast continuity into every child frame.

Use `generate_character_reference` when the user wants an image-conditioned starter reference or identity sheet for one existing cast member:

- Always pass `productionId` and one `castMemberId` or `characterName`.
- The cast member must already have at least one owned image reference; use `create_or_enrich_character` first when starting from selected Gallery/Production assets.
- Use `referenceTypes` for outputs such as `starter_identity_sheet`, `portrait_reference`, or `full_body_reference`.
- Include `stylePrompt`, `wardrobePrompt`, `posePrompt`, or `scenePrompt` for creative constraints.
- After the user chooses a completed starter image, call `add_character_reference` with its Gallery item id to make it durable cast memory.

Use `make_gallery_character_consistent` when the user has a one-off Gallery character image (not yet a Consistent Character) they want canonized headlessly:

- Pass the source `galleryItemId` (from `list_assets`); optionally `alternateImageId`, `characterName`, `characterPanelBackground`, `maxCredits`.
- Defaults to `style: preserve-style` — the source render IS the character, art style included. Only pass `photorealistic` when the user explicitly wants a live-action conversion.
- The result is a NEW gallery item (7-panel identity sheet) marked consistent with the source image attached as its "Original" alternate; the source item is untouched. Spends image credits and requires approval.

Use `generate_character_variants` when the user wants controlled looks, poses, profiles, expression studies, or wardrobe variants for one existing cast member:

- Always pass `productionId` and one `castMemberId` or `characterName`.
- Use `variantTypes` for common controlled outputs such as `portrait`, `profile`, `wardrobe`, `pose`, `expression`, or `scene_look`.
- Use `variants` only when the user gives explicit variant prompts.
- Include `stylePrompt`, `wardrobePrompt`, `posePrompt`, or `scenePrompt` for creative constraints.
- If the workflow is `partial`, do not rerun the whole batch. Inspect failed frames and call `retry_character_variant` with the `workflowId` plus `frameIndex` or `jobId`; it quotes/spends only the single replacement image.
- To make a completed variant part of durable cast memory, call `promote_character_variant` with the `workflowId` plus `frameIndex`/`jobId`/`galleryItemId`, or with `productionId`, `castMemberId`, and `galleryItemId`.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Related skills

- Deep character canon (arcs, rights, world rules) → `elegiac-story-bible`
- Character continuity inside multi-frame scenes → `elegiac-storyboard` / `elegiac-shotlist`
- Identity references failing to match → fix ladder in `references/prompt-patterns.md`
