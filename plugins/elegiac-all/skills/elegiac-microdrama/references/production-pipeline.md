# Default clip pipeline

The default way to turn an approved episode plan into every clip a finished microdrama needs. It is tuned for an affordable, high-quality result without the user having to know anything about models. Use it unless the user explicitly asks for something else; a user who veers off (for example Seedance 2.0 multi-shot sequences with that model's own voices) gets a **pipeline override**, recorded in the call sheet and the episode blueprint, and everything outside the four stages below still applies.

One **cut** = one shot ID in the shot list. Every cut gets exactly one still and one clip; speaking cuts also get one dialogue stem and, when the mouth is on screen, one lipsync pass.

| Stage | Tool | Model | Output |
| --- | --- | --- | --- |
| 1 Dialogue | `generate_audio` | `elevenlabs-v3` | one MP3 stem per line per character |
| 2 Stills | `enhance_prompt` → `generate_shots` | `muse-image` at 9:16 | one framed, finished 9:16 still per cut |
| 3 Motion | `animate_image` | `grok-imagine-video-1-5` at 720p, image-to-video | one **non-speaking** 9:16 clip per cut |
| 4 Lipsync | `generate_lipsync` | `veed-lipsync-v2` | finished talking clip for cuts where the speaker's mouth is visible |

Run each stage as one homogeneous batch: quote it, get one approval (or a standing policy from the approval page), then start every job in the batch. Poll with `wait_for_job` / `wait_for_workflow`. Never start stage N+1 for a cut whose stage N output is unapproved. Every generation call carries `productionId` and `boardId` (the Episode Board): results then register in the Production **and** land on the board canvas automatically, so the board is the visual ledger of the episode without any manual `add_asset_to_board` calls.

## Stage 0 — prerequisites (no spend)

- Approved anchors in Elegiac memory: one Cast member per principal carrying a Consistent Character sheet (built with the concept → `create_character_on_board` → `make_board_character_consistent` → link-mode `promote_character_concept` chain in `new-show.md`, step 8), location plates per recurring location, hero props, StyleSystem.
- **One ElevenLabs Voice ID per principal**, stored in the series manifest / Character Bible (`voiceId`). Ask the user for their ElevenLabs voice IDs, or cast from the built-in voices and record the choice; reuse the same ID for that character in every episode. A missing voice ID blocks stage 1 for that character.
- A shot list where every cut carries: shot ID, duration target (whole seconds, 2–10), framing string (from `list_framings`), references (which cast/location/prop anchors), dialogue lines as performed, and `mouthVisible: true|false` for the speaking character.

## Stage 1 — dialogue stems (ElevenLabs V3)

- One `generate_audio` job per line (or per beat of a long line) per character: `audioCategory: "speech"`, `model: "elevenlabs-v3"`, `voice: "<that character's ElevenLabs voice id>"`, `prompt` = the line **as performed**. Never one block for a whole scene: stems are needed per cut for lipsync and editing.
- Write performances with 1–2 inline audio tags per line (`[whispers]`, `[sighs]`, `[laughs]`, `[sarcastic]`, `[crying]`), ellipses for hesitation, em-dash for interruption, CAPS for one stressed word (see `voice-and-music.md`). `stability: "natural"` by default; `"creative"` for bigger performances, `"robust"` for flat narration.
- For an exchange inside one cut, use `speakers: [{ text, voice }, …]` with each character's voice id so the exchange lands in one stem in order.
- Approve reads before motion. Note each stem's duration: it sets the minimum clip duration for that cut. Cost: 20 credits per 1,000 characters.

## Stage 2 — framed, finished stills (Muse Image, 9:16)

- Reframe first: one `enhance_prompt` call per scene with `shots: [{ id: "<shot id>", prompt: "<shot description>", framing: "<list_framings string>" }]` and the shared `referenceImageUrls` (location plate, cast references, props). Use each `enhancedPrompt` verbatim.
- Generate the scene with `generate_shots`: `model: "muse-image"`, `aspectRatio: "9:16"`, `productionId`, `boardId` (the Episode Board), `usageType: "shot"`, the same references (1–10 per shot; references switch Muse to its edit endpoint automatically). **Always pass `aspectRatio: "9:16"` explicitly** — Muse edits otherwise follow the references' framing. Flat 3 credits per still, so iterate here, not in motion.
- Because the call carries `productionId` + `boardId`, the finished stills are placed on the Episode Board canvas automatically as one labelled frame when the batch completes (`workflow.boardPlacement` confirms it). Do not call `add_workflow_results_to_board` afterwards; it would only report `alreadyPlaced`.
- Review every still for identity, wardrobe, props, geography, screen direction, lighting key, phone-size safe zones, and a clean first frame for motion. Repair or regenerate stills until approved; a still is the cheapest place to fix anything.

## Stage 3 — motion (Grok Imagine 1.5, 720p, non-speaking)

- One `animate_image` job per approved still: `model: "grok-imagine-video-1-5"`, `mode: "image-to-video"`, `startImageUrl: "<approved still URL>"`, `resolution: "720p"`, `duration` = the cut's target in whole seconds (at least the dialogue stem length plus 1 s of handle; 1–15), plus `productionId` and `boardId` so the clip lands on the Episode Board automatically (`result.boardPlacement`). Do not pass `aspectRatio`: image-to-video inherits the still's 9:16.
- The prompt is one camera move plus the character's behaviour for the beat, and it must always contain a non-speaking clause even when the character speaks in the finished scene: "no dialogue, no speech, no lip movement; natural listening/breathing behaviour; ambient sound only." Grok always renders audio, including implied dialogue, so unprompted mouths produce baked-in speech that lipsync cannot cleanly overwrite. The Grok audio track is discarded in the edit; stems, music, and SFX replace it.
- Cost: about 140 credits per 5 s at 720p (plus 2 per request), so roughly 170 credits for a 6 s cut. 1080p (about 250 per 5 s) is a premium option only when the user asks for it; the default master is rendered at 1080 × 1920 from 720 × 1280 sources and the call sheet discloses that.

## Stage 4 — lipsync (VEED Lipsync V2) for on-screen speech only

- For each speaking cut with `mouthVisible: true`: `generate_lipsync` with `model: "veed-lipsync-v2"`, `videoUrl` = the stage-3 clip, `audioUrl` = that cut's stem, `duration` = the clip's seconds (drives the quote), plus `productionId` and `boardId` so the finished talking clip is placed on the Episode Board automatically. Cost: 14 credits per second.
- VEED has no sync modes: clip and stem must be within about half a second of each other. Trim leading silence from the stem; if the clip is shorter than the stem, regenerate the clip at the right duration rather than accepting a cut-off line. Only fall back to `sync-lipsync-v2-pro` with `syncMode` when lengths cannot be matched.
- Cuts where the speaker is off screen, back to camera, in profile beyond ~30°, or covered: **no lipsync**. Lay the stem under the non-speaking clip in the edit (reaction shots and inserts are the cheapest way to carry dialogue).

## After the clips (optional, user's choice)

- Music: `generate_audio` with `audioCategory: "music"` (`minimax-music-3` or the Lyria default) from a brief per `voice-and-music.md`; SFX: `elevenlabs-sfx-v2`, one sound per job.
- Edit in HyperFrames (see `edit.md`) or a traditional NLE: stems and lipsynced clips in timeline order, Grok audio muted, captions from the approved dialogue, master at 1080 × 1920.

## Budget rule of thumb (verify with `quote_generation`)

| Cut type (6 s) | Still | Clip 720p | Lipsync | Speech | ≈ Credits |
| --- | --- | --- | --- | --- | --- |
| Speaking, mouth visible | 3 | 170 | 84 | 2–4 | ~260 |
| Speaking, mouth hidden / reaction | 3 | 170 | 0 | 2–4 | ~175 |
| Silent / insert | 3 | 170 | 0 | 0 | ~175 |

A 75 s App Standard episode of 12–14 cuts with about half of them lipsynced lands near 2,500–3,200 credits before music and SFX. Quote each stage as a batch; standing policies on `enhance_prompt`, `generate_shots`, `animate_image`, and `generate_lipsync` (capped at the batch quote) turn a scene into one approval per stage.

## Ledger fields per cut

Record these on the shot entry in the episode blueprint (see `schemas.md`): `voiceId`, `dialogueStemAssetId`, `framing`, `stillAssetId`, `clipAssetId`, `mouthVisible`, `lipsyncAssetId`, `pipeline` (`default` or `override` with the override model named). A resumed session reads these to skip finished stages instead of regenerating.
