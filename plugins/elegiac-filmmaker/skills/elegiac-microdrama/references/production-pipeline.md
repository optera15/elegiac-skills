# WAN scenelet production

## 1. Plan fewer, stronger generation units

Read craft.md and schemas.md. Start around three scenelets, each 10–30 seconds, totaling 60–90 seconds with bookends, ideally 75. Example: 24 + 26 + 23 seconds of story plus 2 seconds of branding = 75. Generation lengths may be whole seconds while selected edit lengths are fractional. A 3-second drawer insert plus 22 + 26 + 22-second scenelets and 2-second bookends also totals 75.

Minimize generation count subject to clear dramatic arcs, natural pauses, readable action and preferably two speakers. A location/time jump, changed speaker pair, completed transfer or new objective can justify a boundary. Do not join midway through a word or critical gesture. A 30-second dense scene may be harder to control than two justified shorter units; the maximum is not a quota.

Each scenelet has a story purpose, complete opening/ending state, per-character performance brief, ordered dialogue and internal camera-shot windows. More than two speakers needs an explicit reason and a review plan; first consider moving a secondary line to an adjacent scenelet. Dialogue length is perform-timed separately from audio-reference file length.

## 2. Resolve a small reference pack

Reuse approved Cast records/sheets and assigned ElevenLabs Voice IDs. Verify separate face/voice rights and source IDs. Reuse inspected locations, not assets selected by names alone. Generate only missing anchors with a current supported image model and quote; no baked-in image model prices or blanket requirement for every camera angle.

Prefer a clean, spacious 16:9 location master when establishing a new environment. Full bleed, no white border, labels, collage or storyboard layout. Record geography, fixed objects, time/light, entrances, relevant vehicle identity and the action's walkable route. The video prompt explicitly recomposes for 9:16 rather than letterboxing the landscape reference. Additional views are justified only by critical unseen geometry, not by an old shot list.

Include character sheets only for people actually present, plus essential props/vehicles. A sheet's multiple views represent one character. Record reference roles and exact attachment order. Reference sheets are not mandatory opening frames. No default reference videos or old episode shot stills.

## 3. Prepare expressive voice references

Every speaking role has its assigned ElevenLabs Voice ID in series memory. Generate required dialogue/sample passages with generate_audio, model elevenlabs-v3, audioCategory speech, voice set to that ID; the default `trailingSilenceMs: 300` keeps the last word intact (raise it up to 2000 for a slow tail, and count the padding in the measured 15-second cap). Reuse an approved sample when identity, accent and emotional register fit. One clean solo sample per role is the starting point; extra samples must earn their input budget.

Use emotion/delivery tags deliberately and liberally at meaningful changes: [whispers], [sighs], [laughs], [sarcastic], [excited], [crying], with punctuation and selective emphasis. Choose tags that match the character's actual intention. A friendly line must not gain sarcasm just to sound expressive; do not stack contradictory tags. Audition because tag support and response vary. Translate the intended delivery into playable prose in the WAN prompt; tags are not words for WAN to speak.

Generate a coherent short passage for each role rather than obligatory one-job-per-line stems. If full dialogue readings are useful for writing/timing, keep those recordings but attach only clean representative excerpts. Do not attach an entire 30-second dialogue master. Never speed up voices, truncate phonemes or mix characters to meet the limit.

Measure the actual uploaded files with ffprobe: all attached audio combined <=15 seconds, including silence/headers as reported by the media duration. Roughly 3–6 seconds per speaker is a useful starting choice, not a provider minimum. Preserve original recordings and track clean excerpts with source ranges and hashes. No mandatory lead/tail padding. Check clicks, clipping, breaths and unwanted syllables by listening, not transcript alone.

WAN uses these samples as voice identity and emotional-register references, then generates the quoted scene dialogue. The script can exceed 15 spoken seconds within a 30-second output. This is not guaranteed original-audio passthrough; do not lay the samples over the result.

## 4. Preflight and submit

Read wan-prompting.md. Current integration contract (recheck live): wan-3, qualityTier standard, resolution 720p, aspectRatio 9:16, an explicit integer `duration` (number or numeric string; any integer 2–30, rejected rather than clamped outside that range), generateAudio true, promptExpansion false for scripted dialogue. Reference-to-video takes ordered image/audio arrays sent as real JSON arrays, never comma-joined strings. Standard supports 2–30 seconds; scenelets normally 10–30, standalone inserts 2–9 when sufficient. Single-shot inserts use the same WAN family and visual language, not another model.

Reference limits: images <=10; audio <=5 and <=15 seconds combined; videos <=5 and <=15 seconds combined; <=20 files overall. This workflow omits video references. A startImageUrl added to references shifts image numbering and does not promise a hard opening-frame lock; omit it by default.

Run check-scenelet-plan.mjs --ready after references are approved and measured. Build the payload with build-scenelet-request.mjs, inspect the generated prompt and arrays, then quote those exact settings with `quote_generation`: pass the same integer `duration` as the request (never `multiPromptShots`, which WAN rejects) and confirm `pricedInputs.durationSeconds` equals the scenelet length. The quote is a free dry run of the full request validation, so a passing quote means the identical generate call is admissible; a `model_not_deployed` error means the worker is behind the catalog and the scenelet must wait or use an authorized alternative. The builder never submits, polls or invents a quote/permission grant. Store prompt revision, reference IDs/hashes, actual request, quote, cap and idempotency key before submission.

Call generate_video once per authorized scenelet. Supply productionId, and boardId only where the current tool supports it. Read `registration` and `billing` off the returned job; do not infer board persistence merely from request fields. Do not send Kling's multiPromptShots to WAN: multiple shots live in ONE prompt string.

On the first `permission_required` of an episode, tell the owner the approval page can save a standing permit for this action, all video generation (`generate_video`, `animate_image`, `animate_board_frame`), all audio generation or all paid generation, scoped to the production or client and optionally capped; one approval then covers the authorized scenelet batch. The payload's `coverageOptions` lists what is offered.

Use one representative scenelet as the first take of a new setup, not an additional disposable generation by default. Continue through authorized work after review. Dependent scenelets wait until the prior ending state is accepted; independent scenes may be generated together within the approved batch cap.

## 5. Review, retain or repair

Use continuity-gate.md and qa.md. Watch with sound at normal speed, inspect internal cuts, both speakers, off-screen lines and final state. A contact sheet is only a visual sample, not a voice/lip-sync pass. Record requested versus measured duration/spec, usable range, exact transcript deviations and timestamped defects.

Keep an accepted complete scenelet intact. Minor head/tail trims are fine if they preserve story and native sync. If a scene has wrong intent, identity, voice or speaker assignment, revise the performance/reference ambiguity and propose a scoped new take. Do not automatically reconstruct it from singles or external lip-sync. One failed take is evidence about that take, not universal model failure.

Keep job, debit, refund and delivery state separate: each job's `billing` object is the debit/refund record and `registration` the delivery record. Poll the same job in bounded windows; wait expiry is pending. If `requiresAction` is true, stop polling, report jobId/idempotencyKey/billing to the owner and never resubmit. Jobs stalled at the provider past the video ceiling (30 minutes or more) fail with `provider_timeout` and are refunded automatically. A generic rejection does not identify which reference offended. Do not disable safety checks or remove required cast to force a result. New creative attempts require scope/budget authorization and fresh keys; transport/permission retries reuse the identical call.

## 6. Light finishing

Keep WAN's native dialogue/ambience synced with picture. No automatic score; if separate score is planned, request no generated score and add only the approved cue later. Use native ambience first; extra SFX/beds are optional, not mandatory per-scene jobs. Derive caption timing from delivered spoken words, verify against script, and correct performance errors rather than concealing them with captions.

Read edit.md for minimal assembly and branding.md for compact bookends. Budget target is TOTAL episode runtime. Probe master dimensions/audio/duration; a 1080p export from 720p sources is a conform, not native 1080p generation.
