# Model Routing Guide

How to choose a model. Names and limits drift — `list_models` is the live source of truth and `get_model_schema` is authoritative for parameters. This file tells you *how to choose*, not exact IDs.

## Image models

| Model family | Reach for it when | Watch out |
|---|---|---|
| **GPT Image 2** (`gpt-image-2`, the catalog default) | Rendered text (titles, posters, thumbnails, UI), graphic design, layout-heavy compositions, general high fidelity; has an edit mode | Default for any deliverable with words on it. Override aspect presets with explicit width/height (e.g. 2400×1792 for 4:3 @2K) |
| **Nano Banana Pro / NB2 / NB2 Lite** (`nano-banana-pro`, `nano-banana-2`, `nano-banana-2-lite`) | Reference-driven work: character likeness from refs, restyles, composite-from-references, edits; NB2 is the board default; Lite is the 1K fast-draft tier | The continuity workhorse; pairs with cast reference images. Lite is 1K only |
| **Reve 2.1** (`reve`) | Typography-aware stills above 4K, multi-reference remixes (2–8 refs route to /remix, 1 ref to /edit) | Flat price regardless of size |
| **Seedream 5.0** (`seedream-50-pro`) | Stylized/editorial looks, fashion, bold color; multi-reference edits | Content policy is stricter on photoreal people refs. Old `seedream-50-lite` ids resolve here |
| **Kling Image v3 / Kling O1 Image** (`kling-image-v3`, `kling-o1-image`) | Cinematic stills up to 2K; O1 is reference-REQUIRED identity-preserving editing (up to 10 refs) | O1 has no text-to-image mode |
| **Grok Imagine 2.0** (`grok-imagine-2`) | Fast iteration with multi-reference editing up to 2K | Cheaper loose drafts; verify finals |
| **Grok Imagine Image** (`grok-imagine-t2i`) | Fastest cheap text-only drafts, exploration grids | Text-to-image only; not for finals |
| **Recraft V4** (`recraft-v4`) | Graphic design, vector-flavoured illustration, typography-friendly layouts | Text-to-image only (no refs) |
| **GPT 1.5** (`gpt-1-5`) | Transparent-background cutouts, quality-tiered stills | Text-to-image only |
| **Ideogram 4** (`ideogram-4`) | Heavy in-image text rendering | Agent surface runs the Fast tier only; hidden from the app UI since 2026-07 for safety-filter false positives on photoreal people — prefer GPT Image 2 / Recraft for text |

**Default routing:** text-on-image → GPT Image 2. Character continuity → Nano Banana with cast refs. Stylized → Seedream 5.0 / Reve. Identity-locked edits of an existing still → Kling O1 Image or Nano Banana Pro. Drafts → Nano Banana 2 Lite or Grok Imagine Image at 1K.

## Video models

| Model family | Reach for it when | Watch out |
|---|---|---|
| **Veo 3.1** (`veo-3-1`) | Premium cinematic text-to-video, coherent physics, always-on native audio, first/last frame, reference images | Highest cost tier; use for hero shots |
| **Kling 3.0 Turbo** (`kling-3-turbo`) | Fast, cheaper Kling T2V/I2V with audio always on; `qualityTier` standard (720p) or pro (1080p); up to 6 storyboard shots via `multiPromptShots` (≤15s total) | No end frame, no references, 3-15s. Use it for iteration before stepping up to `kling-3` |
| **Kling 3.0 / Kling O3 / Kling O1** (`kling-3` — the catalog default, `kling-o3`, `kling-o1`) | Image-to-video animation of approved frames; reliable subject fidelity; accepts photoreal-person refs. `kling-3` takes `qualityTier` standard/pro/4k; O3 adds reference-to-video; O1 is the silent animate default with optional end frame | Kling V3 I2V rejects `aspect_ratio` — don't pass it. Tier up only when draft motion fails |
| **Seedance 2.0 Mini** (`seedance-2-mini`) | Default low-cost Draft video and animation, quick previz, cheap motion tests | 480p/720p only; use `qualityMode: "draft"` or `--quality-mode draft` when no model is explicit |
| **Seedance 2.0** (`seedance-2`) | Strong all-purpose motion, action beats, native audio; `qualityTier: "fast"` for the cheaper tier, Pro reaches 4K | Rejects photoreal-person reference images (content policy hides as a 422 on result) — use Kling when animating real-person likenesses |
| **Seedance 2.5** | Explicit-ask hero finish: native-audio T2V/I2V/R2V, quoted dialogue lip-sync, 4-30s takes at 480p/720p/1080p, start/end frames, and up to 50 multimodal refs (30 images / 10 videos / 10 audio) | Very expensive (~592 credits/5s at 720p, ~1,331 at 1080p; ~3,550/~7,980 for 30s). 1080p only on explicit ask. Video refs discount the rate but bill input seconds. Cite refs as `@Image1` / `@Video1` / `@Audio1`; never route here silently |
| **MiniMax H3** | Hero-tier 2K video with synchronized native audio (Hailuo-03): first/last keyframes, multimodal refs (9 images / 3 videos / 3 audio, cited as `@Image1`-style tokens) | Premium priced (~325 cr/5s base; extra image refs beyond 5 and ref-video seconds add cost); 2K only, 5-15s |
| **FLUX.3** | Shots driven by timed keyframes (up to 10 board/gallery images pinned to seconds — nothing else does this), first/last-frame interpolation, or extending an existing clip; native audio | Premium priced (~213 cr/5s at 720p, ~363 at 1080p; extend is ~2.4x that). Takes NO character/style reference images — describe subjects in the prompt. 5-20s. Extend sources must be 15s or under, and extend returns ONLY the new footage (not the source with the extension appended) |
| **LTX-2.5** | The economy native-audio option: cheap iteration WITH sound, first→last-frame transitions on a budget, multi-shot prose (2-4 cuts described in one prompt, total locked to 10s), and audio-to-video — pass one audio clip and the output follows it, a cheap way to turn a still plus a voice track into a talking clip (OmniHuman 1.5 via `generate_lipsync` is the dedicated avatar route) | Two tiers that both render 720p/1080p, so the tier is never inferred from the resolution: Fast (default, ~90 cr/5s at 720p and ~130 at 1080p, 6-20s even durations, reaches 1440p/2160p) and Pro (~120/~170, capped at 10s and 1080p). Takes NO character/style reference images. Audio-to-video is billed per second of the INPUT clip and needs its measured length declared (`audioDurationSeconds`) — 2-20s on Fast, 2-10s on Pro |
| **WAN 3.0** (`wan-3`; `wan3`, `wan 3.0`, `alibaba wan`) | Long native-audio takes: any integer 2-30s at 480p/720p/1080p on T2V/I2V/R2V, first+last frames, and up to 20 multimodal refs (10 images / 5 videos / 5 audio, cited as `@Image1` / `@Video1` / `@Audio1`). Multi-shot is prose in ONE prompt — up to 6 cuts distributed across a 30s take, no shots array. The pick when the ask is a long clip WITH sound, or a reference set that includes video or audio | Two tiers that both render every resolution, so the tier is never inferred from it: Standard (default, ~63 cr/5s at 480p, ~125 at 720p, ~250 at 1080p) and Prime (~85 / ~175 / ~350, roughly 1.4x). Unlike the other multi-ref heroes, Standard needs NO explicit ask — but Prime does. Cost is linear in length: 30s at Prime 1080p is ~2,100 credits, so quote before committing to long or 1080p takes. Reference video and reference audio are each capped at 15s combined |
| **Luma Ray 3.2** (`luma-ray-3-2`) | Silent cinematic T2V in wide formats (21:9, 4:3, 3:4 …) and start→end-frame transitions; 540p is the cheapest rung in the catalog | No audio, no references; 5 or 10s (I2V is always 5s); 1080p costs 4× 540p |
| **Gemini Omni Flash** (`gemini-omni-flash`) | Cheap 10s 720p clip with generated audio from text, one start image, or up to 6 reference images | Fixed 10s/720p/16:9 or 9:16; billed as a 300-credit hold settled down to delivered seconds; no end frame |
| **Pixverse C1** (`pixverse-c1`) | Transitions between two frames, reference-to-video, optional audio at 720p/1080p | Mid-priced; pick `qualityTier` 720p for drafts |
| **Happy Horse** (`happy-horse`) | Cheap T2V/I2V/R2V with a built-in safety checker | Conservative filter — expect rejections on edgy content |
| **Grok Imagine 1.5 Video** (`grok-imagine-video-1-5`; bare `grok-imagine` resolves here) | Multi-reference reference-to-video with always-on audio | R2V caps at 720p. The 1.0 model (`grok-imagine-video`) is legacy — reachable by explicit id only |

**Default routing:** animating an approved frame for professional output → Kling or another schema-supported start-image model. Text-to-video hero → Veo. Drafts/previz → `qualityMode: "draft"` so Elegiac routes omitted video models to Seedance 2.0 Mini at 5s/480p. Keep iteration on Mini; use Seedance 2.5 only when explicitly requested for a native-audio 30s hero finish or its high-capacity multimodal reference workflow. Silent drafts stay on Mini, but when the iteration needs sound, LTX-2.5 Fast is the cheap with-audio pass — and LTX-2.5 Pro at 10s or under is a reasonable finish when the shot does not need a hero model. Past LTX-2.5's 20s ceiling — or when the reference set contains video or audio — WAN 3.0 Standard is the mid-cost long-take option and does not need to be asked for by name; save `qualityTier: "prime"` for when the user says Prime.

Not on the agent surface (app-only, do not route here): LTX-2.3, WAN 2.2/2.6 (the older WAN families — WAN 3.0 above IS routable, and a bare "WAN" resolves to none of them), Hailuo 2.3, Pixverse V6, Vidu, Kling Avatar, Topaz/SeedVR upscalers. `list_models` is authoritative if this drifts.

## Audio models

| Model | Use |
|---|---|
| **ElevenLabs v3** (`elevenlabs-v3`) / **Gemini 3.1 Flash TTS** (`gemini-3-1-flash-tts`) | VO, dialogue, narration — ElevenLabs supports audio tags and performance direction (see `voice-and-music.md`) |
| **MiniMax Music 3** (`minimax-music-3`) / **ElevenLabs Music v1** / **Gemini Lyria 3** | Score/temp music from a brief (genre, tempo, mood arc, duration); Lyria is the bare default |
| **ElevenLabs SFX v2** (`elevenlabs-sfx-v2`) | Spot effects from short text descriptions |
| **Sync Lipsync V2 Pro** (`sync-lipsync-v2-pro`) / **VEED Lipsync V2** (`veed-lipsync-v2`) | `generate_lipsync` with `videoUrl`: drive an existing talking-framing video with a speech track |
| **OmniHuman 1.5** (`omnihuman-1-5`) | `generate_lipsync` with `imageUrl`: animate one still portrait to a speech/music track (optional `prompt` for performance direction, 720p/1080p); billed per audio second — the headless way to make a talking clip from a still |

## Cost discipline

- Cost scales with resolution (stills) and duration × resolution (video; per-5s base units). Quote with `quote_generation` before batches.
- Ladder: explore at 1K stills / 5s Seedance 2.0 Mini 480p video drafts (`qualityMode: "draft"`) → upgrade only the keepers to 2K / 720p+ / longer takes. When the draft has to carry audio, LTX-2.5 Fast is the cheapest rung that has it.
- Never re-roll a failed look more than twice on the same model — change the prompt structure (see `prompt-patterns.md`) or switch families.
