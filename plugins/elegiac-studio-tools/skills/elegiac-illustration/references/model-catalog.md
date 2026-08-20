# Model Routing Guide

How to choose a model. Names and limits drift — `list_models` is the live source of truth and `get_model_schema` is authoritative for parameters. This file tells you *how to choose*, not exact IDs.

## Image models

| Model family | Reach for it when | Watch out |
|---|---|---|
| **GPT Image 2** | Rendered text (titles, posters, thumbnails, UI), graphic design, layout-heavy compositions, general high fidelity | Default for any deliverable with words on it. Override aspect presets with explicit width/height (e.g. 2400×1792 for 4:3 @2K) |
| **Nano Banana Pro / NB2** | Reference-driven work: character likeness from refs, restyles, composite-from-references, edits | The continuity workhorse; pairs with cast reference images |
| **Imagen 4 Ultra** | Photoreal naturalism, landscapes, clean commercial photography look | Weaker at rendered text |
| **Seedream 4.5** | Stylized/editorial looks, fashion, bold color; has an edit variant | Content policy is stricter on photoreal people refs |
| **Flux 2 Pro** | Detail-rich illustration/concept-art energy; has an edit variant for instruction-based image edits | — |
| **Grok Image** | Fast loose drafts, exploration grids | Not for finals |

**Default routing:** text-on-image → GPT Image 2. Character continuity → Nano Banana with cast refs. Photoreal scenery → Imagen. Stylized → Seedream/Flux. Drafts → cheapest at 1K.

## Video models

| Model family | Reach for it when | Watch out |
|---|---|---|
| **Veo 3.1** | Premium cinematic text-to-video, coherent physics, native audio | Highest cost tier; use for hero shots |
| **Kling family** (2.5 Turbo → 2.6 Pro → V3 / O1 / O3 Omni) | Image-to-video animation of approved frames; reliable subject fidelity; accepts photoreal-person refs | Kling V3 I2V rejects `aspect_ratio` — don't pass it. Tier up only when draft motion fails |
| **Seedance 2.0 Mini** | Default low-cost Draft video and animation, quick previz, cheap motion tests | 480p/720p only; use `qualityMode: "draft"` or `--quality-mode draft` when no model is explicit |
| **Seedance 2.5** | Explicit-ask hero finish: native-audio T2V/I2V/R2V, quoted dialogue lip-sync, 4-30s takes at 480p/720p/1080p, start/end frames, and up to 50 multimodal refs (30 images / 10 videos / 10 audio) | Very expensive (~592 credits/5s at 720p, ~1,331 at 1080p; ~3,550/~7,980 for 30s). 1080p only on explicit ask. Video refs discount the rate but bill input seconds. Cite refs as `@Image1` / `@Video1` / `@Audio1`; never route here silently |
| **Seedance** | Strong all-purpose motion, action beats | Rejects photoreal-person reference images (content policy hides as a 422 on result) — use Kling when animating real-person likenesses |
| **Hailuo 2.3** | Expressive character motion, dance/gesture | — |
| **MiniMax H3** | Hero-tier 2K video with synchronized native audio (Hailuo-03): first/last keyframes, multimodal refs (9 images / 3 videos / 3 audio, cited as `@Image1`-style tokens) | Premium priced (~325 cr/5s base; extra image refs beyond 5 and ref-video seconds add cost); 2K only, 5-15s |
| **FLUX.3** | Shots driven by timed keyframes (up to 10 board/gallery images pinned to seconds — nothing else does this), first/last-frame interpolation, or extending an existing clip; native audio | Premium priced (~213 cr/5s at 720p, ~363 at 1080p; extend is ~2.4x that). Takes NO character/style reference images — describe subjects in the prompt. 5-20s. Extend sources must be 15s or under, and extend returns ONLY the new footage (not the source with the extension appended) |
| **Sora 2** | Complex multi-element scenes, long coherent takes | Check availability/cost; no duration restriction applies to Sora 2 character work |
| **Kling Avatar** | Presenter-style talking head from a still | For talking content also see lipsync below |

**Default routing:** animating an approved frame for professional output → Kling or another schema-supported start-image model. Text-to-video hero → Veo. Drafts/previz → `qualityMode: "draft"` so Elegiac routes omitted video models to Seedance 2.0 Mini at 5s/480p. Keep iteration on Mini; use Seedance 2.5 only when explicitly requested for a native-audio 30s hero finish or its high-capacity multimodal reference workflow.

## Audio models

| Model | Use |
|---|---|
| **ElevenLabs V3 (speech)** | VO, dialogue, narration — supports audio tags and performance direction (see `voice-and-music.md`) |
| **Music generation** | Score/temp music from a brief (genre, tempo, mood arc, duration) |
| **SFX generation** | Spot effects from short text descriptions |
| **Sync Lipsync V2 Pro** | Drives an existing video/still with a speech track (where exposed) |

## Cost discipline

- Cost scales with resolution (stills) and duration × resolution (video; per-5s base units). Quote with `quote_generation` before batches.
- Ladder: explore at 1K stills / 5s Seedance 2.0 Mini 480p video drafts (`qualityMode: "draft"`) → upgrade only the keepers to 2K / 720p+ / longer takes.
- Never re-roll a failed look more than twice on the same model — change the prompt structure (see `prompt-patterns.md`) or switch families.
