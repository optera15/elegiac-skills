# MicroDrama alpha schemas

These v1 JSON contracts are canonical local state for the skill-only alpha. Store them in the Production Kit. Board cards mirror their human-readable contents until dedicated episode artifacts exist.

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
  "styleSystemIds": ["style-id"],
  "principalCharacterIds": ["character-id"],
  "season": 1,
  "episodes": [],
  "openLoops": [],
  "revision": 1
}
```

For every episode row store `episodeId`, number, title, promise, hook, turn, cliffhanger, `opens`, `advances`, `resolves`, Board ID, and status (`planned`, `boarded`, `generating`, `editing`, `final`, or `blocked`). Keep no more than three major unresolved audience loops.

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
    "locationIds": ["location-card-id"],
    "wardrobe": [], "props": [], "injuries": [], "lightingKey": "soft overcast daylight"
  },
  "scriptPath": "episodes/s01e01/script.md",
  "shotListPath": "episodes/s01e01/shot-list.md",
  "revision": 1,
  "status": "planned"
}
```

### Shot ledger (per cut, in `shot-list.md` front matter or a `shots[]` array on the blueprint)

```json
{
  "shotId": "S01E01-030",
  "durationSeconds": 6,
  "framing": "over the shoulder portrait with cinematic framing",
  "referenceAssetIds": ["cast-asset-id", "location-asset-id"],
  "speaker": "character-id",
  "voiceId": "elevenlabs-voice-id",
  "line": "I told you— [sighs] …it doesn't matter now.",
  "mouthVisible": true,
  "dialogueStemAssetId": null,
  "stillAssetId": null,
  "clipAssetId": null,
  "lipsyncAssetId": null,
  "pipeline": "default"
}
```

`pipeline` is `default` (see `production-pipeline.md`) or `override:<model id>` when the user chose another route for that cut. Asset ids fill in as stages complete; a resumed session skips any stage whose id is already set.

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
      "approved": true
    }
  ],
  "audio": { "dialogue": [], "music": [], "sfx": [] },
  "captions": {
    "language": "en",
    "sidecar": "episodes/s01e01/captions.srt",
    "sidecarSha256": "64 lowercase hexadecimal characters",
    "burnIn": true
  },
  "graphics": { "coldOpenTitle": null, "episodeBug": "S1 · EP1", "endCard": "Next: The Second Phone" },
  "story": { "hook": "...", "turn": "...", "cliffhanger": "..." }
}
```

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
    "width": 1080, "height": 1920, "fps": 30, "durationSeconds": 75,
    "videoCodec": "h264", "audioCodec": "aac"
  },
  "captions": { "srt": "...", "vtt": null, "burnedIn": true },
  "poster": { "path": "...", "sha256": "..." },
  "registration": { "status": "registered", "assetId": "asset-id", "boardId": "board-id" },
  "credits": { "quoted": null, "deducted": null, "refunded": null },
  "omissions": []
}
```

Use `registration.status: not_registered` with `assetId: null` when the current MCP cannot safely accept the master. Never infer actual spend from a quote; record provider/account results.
