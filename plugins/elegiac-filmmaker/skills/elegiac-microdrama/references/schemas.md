# Version 2 scenelet contracts

Keep these JSON files in the Production Kit. Board artifacts mirror their revision; they do not replace the structured ledger. Helpers do not call Elegiac or spend credits.

## Series manifest

Use version 2 and preserve productionId, seriesBibleBoardId, show, slug, season, episode index, openLoops, collaboration, look/style IDs, branding and rights. Set:

```json
{
  "version": 2,
  "profile": {"episodes": 60, "minDurationSeconds": 60, "targetDurationSeconds": 75, "maxDurationSeconds": 90},
  "pipeline": {"videoModel": "wan-3", "qualityTier": "standard", "resolution": "720p", "aspectRatio": "9:16", "speechModel": "elevenlabs-v3", "audioStrategy": "voice-conditioned-native"},
  "delivery": {"width": 1080, "height": 1920, "fps": 30},
  "voices": [{"role": "dylan", "characterId": "cast-id", "voiceId": "assigned-elevenlabs-id"}]
}
```

Character memory holds approved sheet asset IDs/URLs, wardrobe and separate face/voice rights. Locations hold inspected masterAssetId/url, geography, light, time and optional justified variants. No plate per camera cut requirement. Image generation uses the selected live-supported reference-image model, not a hardcoded price. Branding uses branding.md, with resolved per-episode opening policy.

## Episode blueprint

Top-level fields:

- version: 2; episodeId: S01E03; productionId and boardId; title, revision, status.
- runtime: {minSeconds:60, targetSeconds:75, maxSeconds:90}; bookendSeconds: measured/planned nonnegative total.
- story: hook, conflict, turn, cliffhanger; loops: opens/advances/resolves; prior canon and collaboration.
- scenelets: ordered generation units. No shots[] at the top level.
- durationBudget: optional checker result. Review/authorization/credit state is never overwritten by a budget write.

Each scenelets[] entry:

| Field | Contract |
|---|---|
| sceneletId | Unique episode-prefixed ID, e.g. S01E03-SC010; IN015 for an insert |
| kind | scenelet or insert |
| generationDurationSeconds | Integer 10–30 for scenelet; 2–30 for insert |
| editDurationSeconds | Positive planned selected duration, <= generation duration; defaults to generation duration |
| purpose, setting | Story change and concrete place/time/look |
| startState, endState | Explicit relevant character/prop/location/vehicle state |
| characters | Every present character; see below; empty only for genuinely unpeopled inserts |
| imageReferences, audioReferences | Ordered attachment records; see below |
| shots | Nonempty ordered windows; contiguous from 0 to generation duration |
| speakerException | Nonempty explanation when more than two distinct dialogue speakers |
| nonSpeechSeconds | Optional estimated action/reaction allowance; default 1 per internal shot; not added to planned runtime |
| review | status pending/pass/reject, reviewer, evidence, timestamped defects |
| attempts | Append-only job/request/prompt hash/reference hashes, idempotency key, quote/cap, debit/refund, result asset/path/spec |
| selectedTakeId | Accepted attempt ID, or null; never implies acceptance merely because a job completed |

Each characters[] entry: role (stable unique ID), name, speaks boolean, voiceId when speaking; performance object with nonempty motivation, insecurity, suspicion, hiddenAgenda, mood, intent, feelings, attitude, emotionalArc, behavior, forbiddenMisread. Explicit "none" is valid where true; placeholders are not a creative pass. For a hands-only insert, still identify the owner and wardrobe/hand details.

Each shots[] entry: startSeconds, endSeconds, framing, action, transition, dialogue array. A single-shot insert has one window covering its duration. Each dialogue entry: unique id, speaker matching a character role, text (plain spoken words), delivery, visibility ("on-screen" or "off-screen"), listener (named behavior, or explicitly no listener). ElevenLabs-tagged readings may be stored separately as ttsText; only text is quoted in WAN's generated dialogue.

Each imageReferences[] entry: role ("character", "location", "prop", "vehicle" or "style"), character role ID when role=character, assetId, url, approved boolean. Ready requires a sheet reference for every present character and a location reference; genuinely unpeopled inserts still need location/prop context. Include sha256/localPath and rightsCleared for traceability; visual approval and rights must be checked before generation.

Each audioReferences[] entry: role (speaker ID), voiceId, assetId, url, localPath (inside kit), sha256, durationSeconds (actual uploaded file), approved, rightsCleared. Every speaking character must have a matching assigned voice reference in ready mode. Only speakers in this scene may have audio attached. Combined actual duration <=15 seconds; max five files. Image max ten; total <=20. This workflow's request builder does not accept reference videos or start/end frames.

## Preflight and request compilation

```bash
node <skill>/scripts/check-scenelet-plan.mjs episodes/s01e03/episode-blueprint.json --root . --json
node <skill>/scripts/check-scenelet-plan.mjs episodes/s01e03/episode-blueprint.json --root . --ready --scenelet S01E03-SC010
node <skill>/scripts/build-scenelet-request.mjs episodes/s01e03/episode-blueprint.json --root . --scenelet S01E03-SC010 --output episodes/s01e03/sc010-request-draft.json
```

Planning validates structure/runtime and declared reference limits; ready additionally requires approved references/rights/Voice IDs and probes/hashes local audio. --scenelet scopes readiness to one unit while the whole episode's structural runtime still checks. Future scenelets need not have all voice assets ready to begin the first one. Missing duration is not zero.

The compiler writes model, mode, standard tier, 720p, 9:16, duration string, native audio, prompt, arrays and Production/Board IDs. It refuses overwrite by default. It deliberately supplies no pricingQuoteId, maxCredits or idempotencyKey: the operator adds the current quoted cap/key and persists the exact final submitted payload, rather than treating a draft as authorized. A successful compile is not artistic approval.

## Version 2 edit manifest

Retain the version 1 frozen-source and branding fields below, with these changes:

- version:2; audioSource:"native"; targetDurationSeconds is TOTAL master target, including bookends. Default runtime window 60–90; a custom runtimeRange needs a reason.
- clips[] represents selected scenelet ranges, normally one per scenelet. shotId remains a unique S01E03-010 cut ID for handoff compatibility; sourceSceneletId identifies the generation unit. Reuse can have separate cut IDs without another generation.
- Every clip requires continuityStatus:"pass", approved:true, audioMode:"native" (or documented "extracted"), sourceSpec:{width,height,fps,durationSeconds,hasAudio:true}, plus sourceOrigin, sourceAssetId/sourceLabel, localPath, sha256, inSeconds/outSeconds and transitionOutSeconds (default 0).
- Native scene audio is used exactly once. audio.dialogue stays empty. audio.native is empty for native-mode clips; extracted-mode clips link one aligned extraction by sourceShotId (the cut's shotId), sourceSceneletId, sourceVideoSha256 and the same source in/out plus timelineStartSeconds. Preserve the full source audio timebase, including material outside the selected range; the validator probes the extraction's available duration. Do not place voice references in audio.native.
- audio.music and audio.sfx are optional frozen sources. Captions default burnIn:false and use actual speech timing.
- sourceSpec is recorded per clip and checked against ffprobe; no assumed global model frame dimensions.

A minimal episode uses three selected 25-second native clips and no bookends, or three shorter ranges plus the bookend package. Fields common to all edit manifests: show, season, episode, episodeId, revision, collaboration.profile (fast-track/co-creator/director), outputProfile, canvas, targetDurationSeconds, durationToleranceSeconds (0–2), clips, audio, captions, branding, story.hook/turn/cliffhanger.

Frozen sources use sourceOrigin elegiac + sourceAssetId, or user + meaningful sourceLabel; localPath, sha256 and approved. All media paths must stay inside --root after resolving symlinks. --write-hashes fills missing hashes only after otherwise successful validation; it never accepts changed bytes silently. --skip-files is a structural test only, not a final media verification.

Output profiles: master-1080 (1080×1920), fallback-720 (720×1280; valid 720p finish with source disclosure), draft-480 (480×854; not final). Canvas fps:24/25/30. Validate actual clip source ranges, native audio presence and declared media specs. File hashes cannot certify subjective review.

Timeline math: story = sum(out-in) - sum(transition overlaps); master = story + branding bookends. Last overlap is zero and every overlap fits both neighbors. Version 2 compares master to target, not story. In extracted mode, timelineStartSeconds is on the story timeline; the composition offsets both picture and sound equally for any splash.

Branding required: seriesMark provided/typographic/waived(reason); sting provided/waived(reason); opening none/overlay-mark/splash (0.5–2s); endCard none/mark-only/mark-and-sting (0.5–1.5s, blackout0–0.5); credits none/end-matter (0.5–3s). Provided elements use frozen-source fields. Use the chosen brand ground; do not invent media. Bookends are included in the runtime budget.

## Migration, delivery and resumption

Version 1 edit manifests remain supported for historical edit-only work with their story-only duration target; handoff audio behavior must be explicit. The new generation planner rejects version 1 blueprints with an actionable migration message. It never automatically converts per-shot stems or marks old media rejected.

Copy/revision existing manifests before migration. Preserve old files, shot IDs, jobs, approvals and financial history; create scenelets from the approved story, not mechanically from old shot lists. Select reuse only after explicit review. Do not overwrite selected takes or credits during a build.

Delivery records actual master path/hash/dimensions/fps/duration/codecs, per-source specs, proxy, sidecar captions, poster, registration.status (registered/not_registered), asset/Board IDs, quoted/deducted/refunded credits, unresolved jobs and omissions. Never infer successful registration or refunds.
