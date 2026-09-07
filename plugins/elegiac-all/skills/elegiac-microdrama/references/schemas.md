# MicroDrama alpha schemas

These v1 JSON contracts are canonical local state for the skill-only alpha. Store them in the Production Kit. Board cards mirror their human-readable contents until dedicated episode artifacts exist. A resumed session reads these files first and trusts them over the conversation.

## Series manifest

```json
{
  "version": 1,
  "productionId": "production-id",
  "seriesBibleBoardId": "board-id",
  "show": "The Second Phone",
  "slug": "the-second-phone",
  "profile": { "name": "app-standard", "episodes": 60, "targetDurationSeconds": 75 },
  "delivery": { "width": 1080, "height": 1920, "fps": 30 },
  "locale": "en-IE",
  "rating": "TV-14",
  "collaboration": {
    "profile": "co-creator",
    "departments": { "dialogue": "director", "casting": "director", "edit": "co-creator" }
  },
  "look": {
    "styleLine": "Hyperrealistic art, extremely high-resolution details, photographic, realism pushed to extreme, fine texture, incredibly lifelike",
    "lookLine": "Shot on 35mm Kodak Ektar 100, 35mm Standard Wide, f/5.6, with soft desaturated pastel tones, a flat storybook aesthetic, and a high-key color wash of mint green and creamy pink.",
    "referenceImageUrls": [],
    "lightingKey": "late-afternoon Gulf sun, soft haze, warm key from screen left"
  },
  "pipeline": {
    "stillModel": { "keeper": "gpt-image-2", "keeperQuality": "medium", "keeperResolution": "2k", "keeperCredits": 15, "draft": "muse-image", "draftCredits": 3 },
    "motionModel": "grok-imagine-video-1-5",
    "lipsyncModel": "veed-lipsync-v2",
    "speechModel": "elevenlabs-v3",
    "musicModel": "minimax-music-3",
    "sfxModel": "elevenlabs-sfx-v2",
    "sourceSpec": { "width": 704, "height": 1280, "fps": 25 }
  },
  "voices": [
    { "role": "tessa", "characterId": "character-id", "voiceId": "elevenlabs-voice-id", "principal": true },
    { "role": "guard", "characterId": null, "voiceId": "elevenlabs-voice-id", "principal": false }
  ],
  "principals": [
    { "characterId": "character-id", "wardrobeAnatomy": "19, sun-tanned, smooth hands, short nails, no rings; grey hoodie with long sleeves pushed to the forearm" }
  ],
  "locations": [
    {
      "id": "loc-lot",
      "name": "County jail release lot",
      "conceptCardId": "card-id",
      "masterAssetId": "asset-id",
      "lightingKey": "late-afternoon Gulf sun, soft haze",
      "plates": [
        { "id": "loc-lot-wide", "position": "establishing wide from the fence", "assetId": "asset-id", "url": "https://…", "localPath": "assets/plates/loc-lot-wide.jpg" },
        { "id": "loc-lot-door", "position": "release door, reverse toward the lot", "assetId": "asset-id", "url": "https://…", "localPath": "assets/plates/loc-lot-door.jpg" },
        { "id": "loc-lot-hood", "position": "truck hood, camera at the grille", "assetId": "asset-id", "url": "https://…", "localPath": "assets/plates/loc-lot-hood.jpg" }
      ]
    }
  ],
  "vehiclesAndProps": [
    { "id": "veh-natalie-truck", "name": "Natalie's truck", "description": "early-nineties white Ford F-150, faded red pinstripe, dented tailgate", "plateAssetId": "asset-id", "url": "https://…" }
  ],
  "styleSystemIds": ["style-id"],
  "principalCharacterIds": ["character-id"],
  "branding": {
    "seriesMark": { "status": "typographic", "title": "THE SECOND PHONE", "fontFamily": "Bebas Neue" },
    "sting": { "status": "provided", "sourceOrigin": "elegiac", "sourceAssetId": "asset-id", "sourceLabel": "1 s brand sting", "localPath": "brand/sting.wav", "sha256": "64 lowercase hexadecimal characters", "durationSeconds": 1.1, "approved": true },
    "typography": { "display": "Bebas Neue", "captions": "Inter" },
    "palette": ["#0B0B0F", "#E4C46A", "#F3F1EA"],
    "ground": { "mode": "gradient", "colors": ["#0B0B0F", "#2A2418"], "angleDegrees": 20, "grain": 0.03 },
    "opening": { "episode1": { "mode": "splash", "durationSeconds": 1 }, "later": { "mode": "overlay-mark" } },
    "endCard": { "mode": "mark-and-sting", "blackoutSeconds": 0.25, "durationSeconds": 1, "nextText": "Next: Episode {n}" },
    "credits": { "mode": "none" }
  },
  "season": 1,
  "episodes": [],
  "openLoops": [],
  "revision": 1
}
```

For every episode row store `episodeId`, number, title, promise, hook, turn, cliffhanger, `opens`, `advances`, `resolves`, Board ID, and status (`planned`, `budgeted`, `boarded`, `stills`, `animatic-approved`, `generating`, `editing`, `final`, or `blocked`). Keep no more than three major unresolved audience loops.

`look.styleLine` is appended verbatim to every image prompt; `look.lookLine` to every location and composite prompt. `pipeline.stillModel` is what the call sheet states; a still generated on another model is an override recorded on the shot. `voices` covers every speaking role, bit parts included. `locations[].plates[]` is the coverage set the ledger pins to; `vehiclesAndProps[]` gives every recurring vehicle and hero prop its own reference so it is one object across the season.

`branding` is the show's brand punctuation package (`branding.md`), resolved once and reused in every episode. `seriesMark.status` is `provided` (a frozen file), `typographic` (HyperFrames renders `title` in `fontFamily`), or `waived` with a `reason`; `sting.status` is `provided` or `waived`. `ground` describes the bookend surface (`gradient`, `texture`, or `plate-blur` with a `plateId`); bare black is not a mode. Provided elements are frozen sources with the same fields as clips. `opening.episode1` and `opening.later` hold the per-episode opening policy that each edit manifest copies.

## Episode blueprint

```json
{
  "version": 1,
  "productionId": "production-id",
  "boardId": "board-id",
  "episodeId": "S01E01",
  "title": "The Second Phone",
  "targetDurationSeconds": 75,
  "seasonMovement": "deliver-premise",
  "previousCliffhanger": null,
  "answerOwed": null,
  "story": {
    "hook": "The dead woman's account likes a new post.",
    "wantConflict": "The friends race to seize the widower's phone before he notices them.",
    "turn": "The phone is not his.",
    "spike": "One friend calls its only saved number.",
    "cliffhanger": "The other friend's phone rings."
  },
  "loops": { "opens": ["second-phone-owner"], "advances": ["widower-lie"], "resolves": [] },
  "continuity": {
    "characterIds": ["character-id"],
    "styleSystemId": "style-id",
    "locationIds": ["loc-lot"],
    "vehicleIds": ["veh-natalie-truck"],
    "wardrobe": [], "props": [], "injuries": [], "lightingKey": "soft overcast daylight"
  },
  "durationBudget": {
    "estimatedStorySeconds": 74.2,
    "bookendSeconds": 2.25,
    "targetSeconds": 75,
    "toleranceSeconds": 3,
    "status": "pass",
    "trimList": [],
    "checkedAt": "2026-09-07T10:00:00Z"
  },
  "animatic": {
    "previewPath": "post/animatic",
    "approvedAt": "2026-09-07T12:30:00Z",
    "stillHashes": { "S01E01-010": "64 lowercase hexadecimal characters" }
  },
  "editOrderOverride": null,
  "scriptPath": "episodes/s01e01/script.md",
  "shotListPath": "episodes/s01e01/shot-list.md",
  "shots": [],
  "revision": 1,
  "status": "planned"
}
```

`durationBudget` is written by `check-shot-budget.mjs` at script stage and must be `pass` (or carry an agreed `trimList` that brings it to pass) before stage 1. `animatic.approvedAt` is written when the user approves the stills animatic and is required by stage 3; `stillHashes` lets a later session detect a still changed after approval. `editOrderOverride` is an optional array of shot ids in timeline order when the edit departs from ledger order.

### Shot ledger (per cut, the `shots[]` array on the blueprint)

```json
{
  "shotId": "S01E01-030",
  "kind": "speak",
  "durationSeconds": 4,
  "framing": "over the shoulder portrait with cinematic framing",
  "plateId": "loc-lot-hood",
  "referenceAssetIds": ["cast-asset-id", "plate-asset-id", "vehicle-asset-id"],
  "speaker": "tessa",
  "voiceId": "elevenlabs-voice-id",
  "line": "I told you— [sighs] …it doesn't matter now.",
  "mouthVisible": true,
  "faceCount": 1,
  "wardrobeAnatomy": null,
  "stillModel": "gpt-image-2",
  "dialogueStemAssetId": null,
  "stemDurationSeconds": null,
  "clipDurationSeconds": null,
  "stillAssetId": null,
  "stillUrl": null,
  "stillLocalPath": null,
  "continuity": {
    "status": "review",
    "checks": {},
    "reviewedAgainst": { "plateId": "loc-lot-hood", "previousShotId": "S01E01-020", "nextShotId": "S01E01-040" },
    "note": null,
    "reviewedAt": null
  },
  "clipAssetId": null,
  "lipsyncAssetId": null,
  "stuckJobIds": [],
  "pipeline": "default"
}
```

`kind` is `speak`, `react`, `insert`, `establish`, or `action`. `plateId` names the plate in `series-manifest.locations[].plates[]` the still must derive from. `faceCount` is the number of visible faces the framing allows; a `speak` cut with `faceCount` other than 1 is invalid for lipsync and must be restaged. `wardrobeAnatomy` is required on `insert` cuts that show skin or clothing and is copied verbatim into the prompt. `continuity.status` is `review` until the gate runs, then `pass`, `fix`, or `reject`; stage 3 requires `pass`. `stuckJobIds` keeps `submission_unknown` ids for operator reconciliation. `pipeline` is `default` (see `production-pipeline.md`) or `override:<model id>` when the user chose another route for that cut. Asset ids fill in as stages complete; a resumed session skips any stage whose id is already set.

## Edit manifest

All file paths are local to `root` passed to the scripts. Remote URLs and paths outside that root are invalid. Run the validator with `--write-hashes` once sources are frozen; subsequent validation detects changed media.

```json
{
  "version": 1,
  "productionId": "production-id",
  "boardId": "board-id",
  "show": "The Second Phone",
  "season": 1,
  "episode": 1,
  "episodeId": "S01E01",
  "revision": 3,
  "collaboration": { "profile": "co-creator", "departments": { "edit": "director" } },
  "outputProfile": "master-1080",
  "canvas": { "width": 1080, "height": 1920, "fps": 30 },
  "sourceSpec": { "width": 704, "height": 1280, "fps": 25 },
  "targetDurationSeconds": 75,
  "durationToleranceSeconds": 0.5,
  "clips": [
    {
      "shotId": "S01E01-010",
      "sourceOrigin": "elegiac",
      "sourceAssetId": "asset-id",
      "sourceLabel": "Cold hook close-up",
      "localPath": "assets/video/s01e01/s01e01-010-t01.mp4",
      "sha256": "64 lowercase hexadecimal characters",
      "inSeconds": 0.2,
      "outSeconds": 4.8,
      "transitionOutSeconds": 0,
      "role": "cold_hook",
      "continuityStatus": "pass",
      "approved": true
    }
  ],
  "audio": { "dialogue": [], "music": [], "sfx": [] },
  "mix": { "bedTargetDb": -24, "duckToFraction": 0.45, "duckRampSeconds": 0.08, "method": "timeline-tweens" },
  "captions": {
    "language": "en",
    "sidecar": "episodes/s01e01/captions.srt",
    "sidecarSha256": "64 lowercase hexadecimal characters",
    "burnIn": false
  },
  "graphics": { "coldOpenTitle": null, "episodeBug": "S1 · EP1", "endCard": "Next: The Second Phone" },
  "branding": {
    "seriesMark": { "status": "provided", "sourceOrigin": "user", "sourceLabel": "Series logo, transparent PNG", "localPath": "brand/series-mark.png", "sha256": "64 lowercase hexadecimal characters", "approved": true },
    "sting": { "status": "provided", "sourceOrigin": "elegiac", "sourceAssetId": "asset-id", "sourceLabel": "1 s brand sting", "localPath": "brand/sting.wav", "sha256": "64 lowercase hexadecimal characters", "durationSeconds": 1.1, "approved": true },
    "typography": { "display": "Bebas Neue", "captions": "Inter" },
    "palette": ["#0B0B0F", "#E4C46A", "#F3F1EA"],
    "ground": { "mode": "gradient", "colors": ["#0B0B0F", "#2A2418"], "angleDegrees": 20, "grain": 0.03 },
    "opening": { "mode": "splash", "durationSeconds": 1 },
    "endCard": { "mode": "mark-and-sting", "blackoutSeconds": 0.25, "durationSeconds": 1, "nextText": "Next: Episode 2" },
    "credits": { "mode": "none" }
  },
  "story": { "hook": "...", "turn": "...", "cliffhanger": "..." }
}
```

`branding` is required. It is the episode's copy of the series package (`branding.md`), so the manifest validates on its own:

- `seriesMark.status`: `provided` (frozen file, same fields as a clip), `typographic` (`title` + `fontFamily`), or `waived` (`reason`).
- `sting.status`: `provided` (frozen file plus `durationSeconds` 0.3–3) or `waived` (`reason`).
- `ground.mode`: `gradient`, `texture`, or `plate-blur`; the validator warns when it is missing or when a gradient's colours are all near-black.
- `opening.mode`: `none`, `overlay-mark`, or `splash` (`durationSeconds` 0.5–2; a splash on an episode after the first is a warning). `overlay-mark` and `splash` need a mark that is not waived.
- `endCard.mode`: `none`, `mark-only`, or `mark-and-sting`; when not `none`, `blackoutSeconds` 0–0.5 and `durationSeconds` 0.5–1.5, optional `nextText`. `mark-and-sting` needs a provided sting; both mark modes need a mark that is not waived.
- `credits.mode`: `none` or `end-matter` (`durationSeconds` 0.5–3, warned as end matter outside the dramatic flow).

`captions.burnIn` defaults to `false`; the validator warns when it is `true` so a burned-in delivery is always a recorded choice. `clips[].continuityStatus` is copied from the blueprint and must be `pass`. `sourceSpec` records the true source dimensions and frame rate so the delivery discloses the conform. `mix` records the levels and the ducking method the composition must use (`timeline-tweens`; `automation-lanes` is rejected because it breaks the Studio preview).

Bookends are added after the story cut: `bookendSeconds = splash + blackout + endCard + endMatter`. `targetDurationSeconds` still describes the story cut; the master runs `targetDurationSeconds + bookendSeconds`, which the validator reports as `masterDurationSeconds`.

Allowed output profiles are exactly:

- `master-1080` → 1080 × 1920; default finished master.
- `fallback-720` → 720 × 1280; finished only when the budget/model limitation is disclosed.
- `draft-480` → 480 × 854; never a final.

Clip order is timeline order. Edit duration is `Σ(outSeconds − inSeconds) − Σ(transitionOutSeconds)`. The last transition must be zero. Shot IDs must be unique and match the episode. Each clip must be approved for final handoff.

Audio entries, when present, use `id`, `sourceOrigin`, optional `sourceAssetId`, `sourceLabel`, `localPath`, `sha256`, `inSeconds`, `outSeconds`, `timelineStartSeconds`, and `approved`. `sourceOrigin: elegiac` requires an asset ID; `sourceOrigin: user` requires a meaningful source label.

## Delivery manifest

```json
{
  "version": 1,
  "episodeId": "S01E01",
  "editRevision": 3,
  "renderedAt": "ISO-8601 timestamp",
  "master": {
    "path": "deliverables/the-second-phone-s01e01-master-1080x1920-v003.mp4",
    "sha256": "...",
    "width": 1080, "height": 1920, "fps": 30, "durationSeconds": 77.25,
    "videoCodec": "h264", "audioCodec": "aac",
    "mixMeanDb": -19.5, "mixPeakDb": -1.0
  },
  "reviewProxy": { "path": "deliverables/…-proxy.mp4", "sha256": "...", "bytes": 24000000 },
  "sourceSpec": { "width": 704, "height": 1280, "fps": 25, "note": "default pipeline sources conformed to the master" },
  "captions": { "srt": "...", "vtt": null, "burnedIn": false },
  "poster": { "path": "...", "sha256": "..." },
  "registration": { "status": "registered", "assetId": "asset-id", "boardId": "board-id" },
  "credits": { "quoted": null, "deducted": null, "refunded": null, "stuck": [] },
  "omissions": []
}
```

`master.durationSeconds` is the story cut plus branding bookends (`masterDurationSeconds` from the validator), not `targetDurationSeconds` alone. `reviewProxy` is a file under 30 MB that can travel through chat and phone attachments. `credits.stuck` lists `submission_unknown` job ids and their credits awaiting operator reconciliation. Use `registration.status: not_registered` with `assetId: null` when the current MCP cannot safely accept the master. Never infer actual spend from a quote; record provider/account results.
