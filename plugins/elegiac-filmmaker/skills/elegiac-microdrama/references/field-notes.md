# Evidence and integration notes

Observations dated 14–19 September 2026; not guarantees or hardcoded prices. Check current schema/quotes before generation.

## Native scenelet pilot

Another League tested a 15-second, three-shot WAN 3.0 Standard scene using two character sheets, a landscape location master and two short solo ElevenLabs voice samples. WAN generated new dialogue using voice identity, not demonstrated waveform passthrough. The user approved voice resemblance, lip-sync, performances, pacing and internal edits, and preferred this to the old isolated-shot assembly.

An identical MiniMax comparison was judged too contrasty, less sharp, weaker in voice clarity/fidelity and wrong in one speaker assignment. It delivered about 15 seconds (H3 is not limited to five). An identical Seedance 2.0 attempt produced no video, returned generic invalid-input error and was refunded; the error did not prove a specific moderation cause. These tests motivate this workflow, not universal rankings.

The WAN first attempt was content-check rejected; an explicitly requested identical retry succeeded. Do not infer blanket reference bans or auto-retry moderation failures. Keep references and safety settings intact unless an authorized creative change is appropriate.

## Tool traps

Gateway behaviour below is current as of the 2026-09-19 agent-route closedown (skill 3.1.0); recheck `get_model_schema` and a live quote when in doubt.

- Model schema default resolution/aspect/duration may differ from this skill: explicitly send wan-3, standard, 720p, 9:16 and an explicit `duration`.
- **List parameters are JSON arrays.** `referenceImageUrls`, `referenceAudioUrls`, `referenceVideoUrls`, `castMemberIds`, `assetIds`, `galleryItemIds` and every other list are advertised as `type: array`; send real arrays. A bare comma-separated string still works, and a string starting with `[` is parsed as JSON. A malformed bracket string fails with `invalid_list_parameter` naming the entry; nothing is queued or charged. Object lists (`multiPromptShots`, `speakers`, `shots`, `keyframes`) also accept their JSON text.
- Live WAN references are numbered Image 1 / Audio 1 by array order. Adding a start image alongside references can shift numbering; omit it in this pack.
- **Quote with the real duration.** `quote_generation` takes `duration` as a number or numeric string, exactly like `generate_video`; WAN accepts any integer 2–30 and rejects (never clamps) anything else in both quote and generate. The quote's `pricedInputs { endpoint, provider, durationSeconds, resolution, qualityTier, mode }` shows what was priced: check `durationSeconds` equals the scenelet length before authorizing. `multiPromptShots` is rejected (`invalid_params`) for wan-3 and every non-Kling/non-Seedance model; shots live in one prompt with `duration` set to the total. There is no quote-only shots trick; a quote that priced the 5-second default is a wrong quote, not a cheaper one.
- **A quote is a free dry run.** It runs the full request validation (URL safety, reference caps, required params, model availability), so a successful quote means the identical `generate_video` call will be accepted. Quote the exact compiled payload, not a simplified one.
- **Model availability.** `list_models` / `get_model_schema` carry `availability: ready | worker_pending | unknown`. Only `ready` models can be generated; a quote or generate on a `worker_pending` model fails with `model_not_deployed` before any job or approval exists. Disclose and resolve an authorized alternative; do not silently reroute.
- **Every job carries `billing` and `registration`.** `get_job` / `wait_for_job` / `generate_*` return `billing { quotedCredits, deductedCredits, refundedCredits, netCredits, status: pending | settled | refund_pending | refunded | not_charged, transactionId?, refundTransactionId? }` and `registration { galleryItemId, productionId, productionGalleryItemId, productionAssetId, boardPlacement, registered }`; the MCP text adds `Billing:` and `Registered:` lines. Record both in the call sheet from the job, not from the quote. `registered: false` on a completed job is a delivery defect to report, not a reason to regenerate.
- **`requiresAction: true` means STOP polling.** The job is paused for operator reconciliation (`submission_unknown` / `recovery_required`); report jobId, idempotencyKey and the billing object to the owner and never resubmit. Jobs stuck at the provider beyond the per-operation ceiling (speech/SFX 10 min, music 20 min, image 15 min, video 30 min or more) are cancelled, failed and refunded automatically with error `provider_timeout`; a refund still requires the billing evidence on the job.
- Speech tails: `generate_audio` speech models (`elevenlabs-v3`, `gemini-3-1-flash-tts`) take `trailingSilenceMs` (0–2000, default 300) so the last word is not clipped. The trailing `...` in the prompt still works but is no longer required; do not use both on a sample you will measure against the 15-second cap.
- Scripted dialogue: send `promptExpansion: false` on WAN requests so the provider does not paraphrase exact lines (see wan-prompting.md). No provider flag disables music alone; "no score" is prompt-level.
- Standing permits: the approval page can save a permit covering this action, all video generation (`generate_video` + `animate_image` + `animate_board_frame`), all image generation, all audio generation or all paid generation, scoped to the production or client. The `permission_required` payload lists `coverageOptions`; tell the owner which coverage a scenelet loop needs before they approve.
- URLs must come from actual assets; never fabricate storage tokens.
- Pending/result-fetch errors do not authorize duplicate jobs. Keep IDs and reconcile unknown submissions.
- Probe actual media. Resolution labels, prompt timestamps and requested duration are not proof of output specs. Agent-route videos now get a real extracted poster frame (`thumbnailSource: extracted_frame`), but a poster is still not a voice or sync review.
- `list_assets` with `productionId` returns both the production asset library (app-added images such as location masters) and production gallery items, with `membership`, `productionAssetId`, `category` and `consistentCharacter`. Prefer `consistentCharacter: true` sheets for cast references.
- Board placement and production registration are reported on the job (`registration`); verify each rather than inferring from request fields.

## Creative lessons retained

Reuse location canon; document causal prop/seat state; write the emotional logic before camera directions; keep voice assignments unambiguous; check tails and both sides of every cut. Let a good scene play intact. Preserve native sound and do not solve every issue with more shots.

Source basis: current Elegiac WAN schema; [Alibaba WAN 3.0 guide](https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-guide); [fal WAN reference API](https://fal.ai/models/alibaba/wan-3.0/reference-to-video/api); user-reviewed production pilots. Exact audio-performance preservation remains unproven for the two-speaker multi-shot workflow.
