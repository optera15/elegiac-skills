# Default clip pipeline

The default way to turn an approved episode plan into every clip a finished microdrama needs. It is tuned for an affordable, high-quality result without the user having to know anything about models. Use it unless the user explicitly asks for something else; a user who veers off (for example Seedance 2.0 multi-shot sequences with that model's own voices) gets a **pipeline override**, recorded in the call sheet and the episode blueprint, and everything outside the stages below still applies.

One **cut** = one shot ID in the shot list. Every cut gets exactly one still and one clip; speaking cuts also get one dialogue stem and, when the mouth is on screen, one lipsync pass.

| Stage | Tool | Model | Output | Gate before the next stage |
| --- | --- | --- | --- | --- |
| 0 Coverage | `generate_image` | `nano-banana-pro` (or the show's still model) | plate set per location, one plate per recurring vehicle/prop | every ledger shot pinned to a plate |
| 1 Dialogue | `generate_audio` | `elevenlabs-v3` | one MP3 stem per line per character | stems measured, clip durations written |
| 2 Stills | `enhance_prompt` → `generate_shots` / `generate_image` | `muse-image` (3 cr) for staging loops, `nano-banana-pro` (25 cr) for keepers | one framed, finished 9:16 still per cut | **continuity gate**: every still PASS (see `continuity-gate.md`) |
| 2b Animatic | local script, no spend | `build-stills-animatic.mjs` → HyperFrames | stills-only cut with stems, watched by the user | the user says **"animate"** |
| 3 Motion | `animate_image` | `grok-imagine-video-1-5` at 720p, image-to-video | one **non-speaking** 9:16 clip per cut | pilot batch reviewed, then the rest |
| 4 Lipsync | `generate_lipsync` | `veed-lipsync-v2` | finished talking clip for cuts where the speaker's mouth is visible | edit |

Run each spend stage as one homogeneous batch: quote it, get one approval (or a standing policy from the approval page), then start every job in the batch. Never start stage N+1 for a cut whose stage N output is unapproved. **Stage 3 never starts while any still is `review` or `reject`.** This is the rule that Tessa S01E01 broke: 29 stills were declared good in one paragraph, 28 clips were fired the same turn, and the episode failed on staging that any shot-order review would have caught.

Every generation call carries `productionId` and `boardId` (the Episode Board): results register in the Production **and** land on the board canvas automatically, so the board is the visual ledger of the episode without any manual `add_asset_to_board` calls.

## Call-sheet disclosures (state these before the first quote)

- **Still model and per-still price.** The default keeper model is `nano-banana-pro` at 25 credits because it is the reference-driven continuity model; `muse-image` at 3 credits is for staging loops and drafts. Whatever is used, name it and its price in the call sheet and write it to `shot.stillModel`. A departure from the show's recorded still model is an override, never a silent swap. (Tessa: every still was Nano Banana Pro while the pipeline said Muse, and the user believed a cheap model had caused staging failures that were really missing plates and missing review.)
- **Grok true output.** Clips come back **704 × 1280 at 25 fps** with an always-on audio track, not the 720 × 1280 / 30 fps of the master. The master is a conform; say so.
- **VEED price.** Observed as a **flat 140 credits per call regardless of length** (2026-09). Quote it; if it is flat, a 2-second "You." costs the same as a 6-second line, so prefer fewer, longer speaking cuts and carry short interjections over reaction shots instead of lipsyncing them.
- **No video-to-audio route.** Elegiac has no Control Foley or similar model. Ambience is SFX loops (`elevenlabs-sfx-v2`), music is `minimax-music-3` or Lyria. Say this before the user plans around it.

## Stage 0 — prerequisites (no spend except plates)

- Approved anchors in Elegiac memory: one Cast member per principal carrying a Consistent Character sheet (built with the concept → `create_character_on_board` → `make_board_character_consistent` → link-mode `promote_character_concept` chain in `new-show.md`, step 8), hero props, StyleSystem.
- **One ElevenLabs Voice ID for every speaking role in the script**, principals and bit parts alike (a guard with one O.S. line included), stored in the series manifest / Character Bible (`voiceId`). Ask the user for voice IDs or cast from the built-in voices and record the choice; reuse the same ID for that role in every episode. A missing voice ID blocks stage 1 for that role; do not fall back to caption-only.
- **`styleLine` and `lookLine`** from the series manifest: the style line is appended verbatim to every image prompt; the look line to every location and composite prompt. If the manifest lacks them, ask once and write them before any still.
- **A coverage set per location, not a single plate.** Read the ledger, list every staging position the camera uses (Tessa: release door, truck hood, fence line, lot wide, passenger door, cab from the driver's side, cab from the passenger side = seven positions served by two plates), and generate one plate per position with the location master in `referenceImageUrls` and the verbatim lighting key. Give every recurring vehicle and hero prop its own plate so "Natalie's truck" is one truck with one colour, one era, one dent. Register each plate (`add_location_concept` or the board) and record it in `series-manifest.locations[].plates[]` with an id. Use the `elegiac-location-scout` lock-then-match pattern; it is the same operation.
- A shot list where every cut carries: shot ID, duration target (whole seconds, 2–10), framing string (from `list_framings`), `plateId` (the plate the still must derive from), references (cast/location/vehicle/prop anchors), dialogue lines as performed, `mouthVisible: true|false` for the speaking character, and for inserts a `wardrobeAnatomy` line copied from the cast bible (sleeve length, skin age, jewellery, nails, hands).
- **Duration budget passed.** `check-shot-budget.mjs` reports estimated story seconds (speaking cuts at stem estimate + 0.75 s handles, silent cuts at their target) against the profile target. Over budget means a trim list is agreed with the user **now**, before stems exist and while cutting a line is free.

## Stage 1 — dialogue stems (ElevenLabs V3)

- One `generate_audio` job per line (or per beat of a long line) per character: `audioCategory: "speech"`, `model: "elevenlabs-v3"`, `voice: "<that role's ElevenLabs voice id>"`, `prompt` = the line **as performed**. Never one block for a whole scene: stems are needed per cut for lipsync and editing. Do not split a line into fragments to fit a credit cap; ask for the cap to be raised, because stitched fragments read as seams.
- Write performances with 1–2 inline audio tags per line (`[whispers]`, `[sighs]`, `[laughs]`, `[sarcastic]`, `[crying]`), ellipses for hesitation, em-dash for interruption, CAPS for one stressed word (see `voice-and-music.md`). `stability: "natural"` by default; `"creative"` for bigger performances, `"robust"` for flat narration.
- For an exchange inside one cut, use `speakers: [{ text, voice }, …]` with each role's voice id so the exchange lands in one stem in order.
- **Every stem carries a pause before the first word and after the last.** Write the performance with a leading and trailing beat (an opening ellipsis or `[pause]`, a closing ellipsis) so the model breathes in before speaking and settles after; then normalise the file with ffmpeg so the first phoneme lands at 0.3 s and 0.4 s of room follows the last: `silenceremove` on the head, `adelay=300|300`, `apad=pad_dur=0.4`. A stem that starts on the consonant pops on the cut and gives the editor no J-cut room; a stem that ends on the last syllable clicks. `pad-stem.sh` applies the same head lead when it builds a lipsync driver, so the two stay aligned.
- Fire stems only after the ledger is locked (stage 0 budget passed). Measure every normalised stem (`ffprobe`) and write `stemDurationSeconds` (pauses included) and `clipDurationSeconds = ceil(stemDurationSeconds + 1)` to the ledger before stage 2. In the edit the stem sits at the cut's start with its own lead; no extra offset is needed. Cost: 20 credits per 1,000 characters.

## Stage 2 — framed, finished stills (9:16)

- **Frame with the plugin, not from memory.** Every still goes through "Enhance Prompt with Framing": call `list_framings` once per episode, choose one named framing per cut from its groups (`distance-zoom` for coverage size, `conversation-dialogue` for two-handers and reverses, `dramatic` for turns, spikes, and the cliffhanger), write it to `shot.framing`, then make one `enhance_prompt` call per scene with `shots: [{ id, prompt, framing }]` and the shared `referenceImageUrls` (the shot's **plate** first, then cast references, vehicle/prop plates). Free-text framing is allowed only when no listed framing fits, and the reason is noted on the shot. Use each `enhancedPrompt` verbatim, then append the style line (and look line for composites). A raw description sent straight to the image model produces a flat, centred, catalogue frame; the enhanced framing is where the shot gets its sophistication and punch, at 5 credits.
- Vary the framing across a scene on purpose: no two consecutive cuts share a framing unless the script repeats a beat; alternate size (wide → medium → close) and side (over-the-shoulder → reverse) so the animatic already cuts like a film.
- Generate with `generate_shots` or `generate_image`: the show's still model, `aspectRatio: "9:16"` explicitly, `productionId`, `boardId`, `usageType: "shot"`, the same references (1–10 per shot). **Always pass `aspectRatio: "9:16"`**: edits otherwise follow the references' framing.
- **Prompt lint before submission** (each of these stalled or corrupted a still in Tessa S01E01):
  - never the words "lipsync", "for lipsync", "for animation", or any "for <pipeline purpose>" phrase;
  - never a character's age as a number; describe age through the identity sheet reference only;
  - never "weathered", "sun-damaged", "wrinkled" or similar on a young character's skin, even for atmosphere;
  - inserts of hands or props carry the `wardrobeAnatomy` line verbatim ("bare tanned forearm, short navy polo sleeve, no cuff");
  - one plate id per prompt; a prompt that mentions a second location or vehicle is wrong.
- **Batch size is one staging position, not the episode.** Generate the cuts that share a plate together, run the continuity gate on them, then the next position. Iterate here: a still is the cheapest place to fix anything.
- **Stall policy.** A still that sits in `submission_unknown` for more than 10 minutes is not waited on for a whole stage: keep the stuck job id for operator reconciliation, lint the prompt again, and regenerate with a fresh idempotency key (`…-v2`). Report both ids.
- Because the call carries `productionId` + `boardId`, the finished stills are placed on the Episode Board canvas automatically. Do not call `add_workflow_results_to_board` afterwards.

## Stage 2 gate — continuity review and the stills animatic (no spend)

Run `continuity-gate.md` in full. In short:

1. Review every still **in shot order** against its plate, the previous still, the next still, and the identity sheet. Write `continuity.status` (`pass` / `reject` / `fix`) and the failing checks to the ledger. Any still that departs from its plate or ledger framing is a `reject` candidate until the neighbours are checked, however pleasing it is on its own. Absurd staging (a character in the wrong vehicle, an impossible viewpoint, a duplicate vehicle) is a `reject`, not a note.
2. Fix cheapest first (`elegiac-scene-continuity` ladder): `edit_image` on the outlier with the plate and the neighbour as references, then anchored regeneration, then identity repair.
3. Build the stills animatic: `build-stills-animatic.mjs` writes a HyperFrames composition that holds each still for `clipDurationSeconds` with the stems underneath, in edit order, with the bookends. Preview it. The user watches the whole episode as stills and either names fixes or says **"animate"**. Record `animatic.approvedAt` and the stills' hashes in the blueprint. Stage 3 reads that field; without it, stage 3 refuses.

## Stage 3 — motion (Grok Imagine 1.5, 720p, non-speaking)

- One `animate_image` job per approved still: `model: "grok-imagine-video-1-5"`, `mode: "image-to-video"`, `startImageUrl: "<approved still URL>"`, `resolution: "720p"`, `duration` = `clipDurationSeconds` (integer, 1–15), plus `productionId` and `boardId`. Do not pass `aspectRatio`: image-to-video inherits the still's 9:16.
- **Pilot batch first**: the 3–4 riskiest cuts (the most motion, the insert, the two-hander), reviewed, then the rest as one batch.
- The prompt has three parts, in this order, and every part is mandatory:
  1. **Camera: handheld by default.** "Handheld camera, subtle organic drift and breathing sway, no shake" plus the one move for the beat (a slow push, a drift left, a settle). A locked-off camera is the exception and needs a narrative reason written on the shot (`cameraLock: "static — surveillance POV"`); without one, the default is handheld. Obvious shaky-cam is as wrong as a tripod: the aim is a camera that is held by a person, so performances read as observed rather than posed.
  2. **Performance: the character is never still.** Write two or three small, specific, natural behaviours for the beat so the figure does not read as a mannequin: shifting weight from foot to foot, glancing off and back, a slow nod or a small head shake, a shrug, a hand gesture, fingers worrying a strap, a breath that lifts the shoulders, eyes tracking something off frame. Match them to the line's intent (a listener nods late; a liar looks away first). Reaction and insert cuts get the same treatment; even a hand on a door handle adjusts its grip.
  3. **The non-speaking clause**, verbatim, even when the character speaks in the finished scene: **"no dialogue, no speech, no lip movement; natural listening/breathing behaviour; ambient sound only."** Grok always renders audio, including implied dialogue, so unprompted mouths produce baked-in speech that lipsync cannot cleanly overwrite. The Grok audio track is discarded in the edit.

  Example: "Handheld camera with subtle organic drift, slow push toward her face. She shifts her weight onto her left foot, glances toward the gate and back, gives a small tired head shake and tightens her grip on the paper bag. No dialogue, no speech, no lip movement; natural listening/breathing behaviour; ambient sound only." Keep the whole prompt under 60 words; one move, two or three behaviours, the clause.
- Observed price: 3 s = 86, 4 s = 114 credits at 720p (about 28 per second plus 2 per request). 1080p is a premium option only when the user asks.

## Stage 4 — lipsync (VEED Lipsync V2) for on-screen speech only

- Lipsync only cuts with `mouthVisible: true` **and exactly one visible face**. A two-shot with both faces visible is never a speaking cut: VEED attributes the line to whichever mouth it likes. Restructure the ledger so every line plays on a single-face framing and reactions are their own cuts.
- `generate_lipsync` with `model: "veed-lipsync-v2"`, `videoUrl` = the stage-3 clip, `audioUrl` = a stem whose length matches the clip within 0.5 s, plus `productionId` and `boardId`.
- Length matching without pushing bytes through the model: `pad-stem.sh <stem> <clipSeconds>` writes the padded stem and a ready `upload_asset` argument file; upload by `mediaUrl` when the host can serve the file, otherwise let the script emit the base64 payload file for the upload call and never `Read` it into context. If neither is possible, use `sync-lipsync-v2-pro` with `syncMode` for that cut and record it as an override. Keep the original stem for the edit: the padded copy exists only to drive lipsync.
- Cuts where the speaker is off screen, back to camera, in profile beyond ~30°, or covered: **no lipsync**. Lay the stem under the non-speaking clip (a reaction shot or insert) in the edit. O.S. and VO lines always play over cutaways.
- A reaction insert after every long line and a cutaway on every line change gives the editor a place to hide any lipsync that reads wrong, at 3 credits per still and no lipsync.

## After the clips (optional, user's choice)

- **Music** (`generate_audio`, `audioCategory: "music"`): default `minimax-music-3`, `prompt` = brief per `voice-and-music.md` plus the sting motif, `musicDuration` = at least twice the story length or the model's maximum. Verify the returned duration with `ffprobe` before wiring; a short return is tiled with 2 s crossfades and disclosed. Lyria (`lyriaEndpoint: "pro"`) accepts only `targetDurationSeconds` ∈ {60, 90, 120, 150, 180}, treats any time phrase in the prompt ("first 10 seconds") as a duration request and rejects it, and has returned "No audio returned" with the credits parked; use it only when the user names it.
- **Ambience** (`audioCategory: "sfx"`, `model: "elevenlabs-sfx-v2"`): one loop per acoustic space, `sfxDuration` 12–22, `loop: true` (boolean), `prompt` = space + 2–3 sources + "steady, no events". Beds come back quiet (Tessa: −40 dB mean); the build script normalises them to the bed target, so do not compensate with gain in the prompt.
- **Sting**: `sfxDuration: 1`, `loop: false`, one hit, dry tail.
- `generate_audio` parameter sheet (the names that exist): `prompt`, `audioCategory`, `model`, `voice`, `speakers`, `stability`, `sfxDuration` (0.5–22), `loop` (boolean), `promptInfluence`, `musicDuration`, `lyriaEndpoint` (`clip` | `pro`), `targetDurationSeconds`, `structurePrompt`, `avoidInstructions`, `vocalMode`, `productionId`, `idempotencyKey`. There is **no** `text`, `boardId`, or `durationSeconds`. `get_model_schema` takes `model`, not `modelId`.
- Edit in HyperFrames (see `edit.md`): stems and lipsynced clips in timeline order, Grok audio muted, sidecar captions, master at 1080 × 1920.

## Polling and resumption

- Poll a batch, not a job: issue `wait_for_job` for every outstanding id in one turn (parallel tool calls), then report the diff. Do not wait 25 s per job in sequence for a 30-job stage.
- A `submission_unknown` job is charged and needs operator reconciliation; record the id, never resubmit with the same key, and apply the stall policy above.
- On resume (new session, after compaction, after a usage limit), read `episode-blueprint.json` first and skip every shot whose stage asset id is already set. Never refire a stem, still, or clip that has an asset id.

## Budget rule of thumb (verify with `quote_generation`)

`quote_generation` rejects `duration` for Grok and VEED in every form ("duration must be a string"); quote them through the first real call of the batch and stop retrying the quote tool.

| Cut type (4 s) | Plate share | Still | Clip 720p | Lipsync | Speech | ≈ Credits |
| --- | --- | --- | --- | --- | --- | --- |
| Speaking, one face | 2 | 25 | 114 | 140 | 2–4 | ~285 |
| Speaking, mouth hidden / reaction | 2 | 25 | 114 | 0 | 2–4 | ~145 |
| Silent / insert | 2 | 25 | 114 | 0 | 0 | ~140 |

A 75 s App Standard episode of 18–22 cuts with 8–10 of them lipsynced lands near 3,500–4,500 credits before music and ambience; Tessa S01E01 spent about 4,300 on 33 cuts with 18 lipsyncs. Fewer, longer speaking cuts are the lever. Quote each stage as a batch; standing policies on `enhance_prompt`, `generate_shots`, `animate_image`, and `generate_lipsync` (capped at the batch quote) turn a scene into one approval per stage.

## Ledger fields per cut

Record these on the shot entry in the episode blueprint (see `schemas.md`): `voiceId`, `plateId`, `wardrobeAnatomy`, `stillModel`, `dialogueStemAssetId`, `stemDurationSeconds`, `clipDurationSeconds`, `framing`, `stillAssetId`, `stillUrl`, `continuity` (`status`, `checks`, `reviewedAgainst`), `mouthVisible`, `faceCount`, `clipAssetId`, `lipsyncAssetId`, `pipeline` (`default` or `override:<model>`). A resumed session reads these to skip finished stages instead of regenerating.
