# Default clip pipeline

The default way to turn an approved episode plan into every clip a finished microdrama needs. It is tuned for an affordable, high-quality result without the user having to know anything about models. Use it unless the user explicitly asks for something else; a user who veers off (for example Seedance 2.0 multi-shot sequences with that model's own voices) gets a **pipeline override**, recorded in the call sheet and the episode blueprint, and everything outside the stages below still applies.

One **cut** = one shot ID in the shot list. Every cut gets exactly one still and one clip; speaking cuts also get one dialogue stem and, when the mouth is on screen, one lipsync pass.

| Stage | Tool | Model | Output | Gate before the next stage |
| --- | --- | --- | --- | --- |
| 0 Coverage | `generate_image` | `gpt-image-2` medium 2K (or the show's still model) | plate set per location, one plate per recurring vehicle/prop | every ledger shot pinned to a plate |
| 1 Dialogue | `generate_audio` | `elevenlabs-v3` | one MP3 stem per line per character | stems measured, clip durations written |
| 2 Stills | `enhance_prompt` → `generate_shots` / `generate_image` | `muse-image` (3 cr) for staging loops, `gpt-image-2` medium 2K (15 cr) for keepers | one framed, finished 9:16 still per cut | **continuity gate**: every still PASS (see `continuity-gate.md`) |
| 2b Animatic | local script, no spend | `build-stills-animatic.mjs` → HyperFrames | stills-only cut with stems, watched by the user | the user says **"animate"** |
| 3 Motion | `animate_image` | `minimax-h3` `qualityTier: turbo` at 768p, image-to-video | one 9:16 clip per cut, at stem length + handle | pilot batch reviewed, then the rest |
| 4 Lipsync | `generate_lipsync` | `veed-lipsync-v2` | finished talking clip for cuts where the speaker's mouth is visible | edit |

Run each spend stage as one homogeneous batch: quote it, get one approval (or a standing policy from the approval page), then start every job in the batch. Never start stage N+1 for a cut whose stage N output is unapproved. **Stage 3 never starts while any still is `review` or `reject`.** This is the rule that Tessa S01E01 broke: 29 stills were declared good in one paragraph, 28 clips were fired the same turn, and the episode failed on staging that any shot-order review would have caught.

Every generation call carries `productionId` and `boardId` (the Episode Board): results register in the Production **and** land on the board canvas automatically, so the board is the visual ledger of the episode without any manual `add_asset_to_board` calls.

## Call-sheet disclosures (state these before the first quote)

- **Still model and per-still price.** The default keeper is **`gpt-image-2` at `quality: "medium"`, `resolution: "2k"`, 15 credits**: it follows a long enhanced prompt more literally than the alternatives, holds identity well from cast sheets, renders legible in-frame text, and costs less than Nano Banana Pro's 25. `nano-banana-pro` remains available when a show wants it, as an override. **`muse-image` at 3 credits is the draft model** and it is genuinely cheap enough to use freely: run staging, blocking and composition loops there and only spend a keeper credit once the frame is right. Whatever is used, name it and its price in the call sheet and write it to `shot.stillModel`. A departure from the show's recorded still model is an override, never a silent swap. (Tessa: every still was Nano Banana Pro while the pipeline said Muse, and the user believed a cheap model had caused staging failures that were really missing plates and missing review.)
- **H3 true output.** Clips come back **768 × 1344 at 24 fps** with a native audio track the edit discards; a VEED-lipsynced clip returns at **25 fps**. The master is a conform of both; say so.
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
- **Every stem carries a pause before the first word and after the last.** Write the performance with a leading and trailing beat (an opening ellipsis or `[pause]`, a closing ellipsis) so the model breathes in before speaking and settles after; then normalise the file with ffmpeg so the first phoneme lands at 0.3 s and 0.4 s of room follows the last: `silenceremove` on the head, `adelay=300|300`, `apad=pad_dur=0.4`. A stem that starts on the consonant pops on the cut and gives the editor no J-cut room; a stem that ends on the last syllable clicks. This normalised file is the **editorial** stem. Do not hand it to VEED as-is if its length now exceeds the clip: trailing room reads as audio and VEED fills the missing picture by running the clip backwards (see stage 4). Either generate the clip long enough to cover the padded stem plus a handle — the usual answer, since H3's minimum is 5 s — or drive the lipsync with the unpadded take. Never pad a stem *up* to a clip length.
- Fire stems only after the ledger is locked (stage 0 budget passed). Measure every normalised stem (`ffprobe`) and write `stemDurationSeconds` (pauses included) and `clipDurationSeconds = ceil(stemDurationSeconds + 1)` to the ledger before stage 2. In the edit the stem sits at the cut's start with its own lead; no extra offset is needed. Cost: 20 credits per 1,000 characters.

## Stage 2 — framed, finished stills (9:16)

- **Frame with the plugin, not from memory.** Every still goes through "Enhance Prompt with Framing": call `list_framings` once per episode, choose one named framing per cut from its groups (`distance-zoom` for coverage size, `conversation-dialogue` for two-handers and reverses, `dramatic` for turns, spikes, and the cliffhanger), write it to `shot.framing`, then make one `enhance_prompt` call per scene with `shots: [{ id, prompt, framing }]` and the shared `referenceImageUrls` (the shot's **plate** first, then cast references, vehicle/prop plates). Free-text framing is allowed only when no listed framing fits, and the reason is noted on the shot. Use each `enhancedPrompt` verbatim, then append the style line (and look line for composites). A raw description sent straight to the image model produces a flat, centred, catalogue frame; the enhanced framing is where the shot gets its sophistication and punch, at 5 credits.
- Vary the framing across a scene on purpose: no two consecutive cuts share a framing unless the script repeats a beat; alternate size (wide → medium → close) and side (over-the-shoulder → reverse) so the animatic already cuts like a film.
- Generate with `generate_shots` or `generate_image`: the show's still model, `aspectRatio: "9:16"` explicitly, `productionId`, `boardId`, `usageType: "shot"`, and the references. **Always pass `aspectRatio: "9:16"`**: edits otherwise follow the references' framing.

### Attaching character references (the failure that looks like model drift)

`generate_shots` does **not** carry a full per-shot reference list. Give each shot its own `referenceImageUrls` array and everything after the first entry is silently dropped at `source_frame_limit`; the job succeeds, the still comes back, and the character in it is a stranger in the wrong clothes. On Another League this produced two rejected keepers before the cause was found, and it reads exactly like identity drift, so it sends you to re-roll the still or repair the character sheet instead of fixing the call.

The rule for every batch:

- **Cast goes through `castMemberIds`**, never through `referenceImageUrls`. That is the parameter the tool actually honours per shot.
- **`referenceImageUrls` carries the place**, not the people: the shot's pinned plate first, then the vehicle or prop plate.
- **Batch by character.** One `generate_shots` call per character (or per character pairing) so a single `castMemberIds` set is right for every shot in it. Mixed-cast batches are where this goes wrong.
- **`enhance_prompt` is not affected** and takes references normally: up to 8 URLs, shared across the call or per shot in the `shots[]` form. Pass it the same plate and cast sheet URLs you intend to generate with, so the framing is written against the real faces and the real room. Its own trap is different — a hand-typed Firebase URL. Those tokens are per-asset and cannot be guessed; copy them from the tool result or the manifest, or the job fails on a URL that looks fine.
- After the first batch of a new character, **check identity and wardrobe against the sheet before firing the rest**. This is cheap at 3 credits on the draft model and expensive after twenty keepers.
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

## Stage 3 — motion (MiniMax H3 Max Turbo, 768p)

- One `animate_image` job per approved still: `model: "minimax-h3"`, `qualityTier: "turbo"`, `resolution: "768p"`, `mode: "image-to-video"`, `startImageUrl: "<approved still URL>"`, `duration` = `clipDurationSeconds` **as a string, minimum `"5"`**, plus `productionId` and `boardId`. Do not pass `aspectRatio`: image-to-video inherits the still's 9:16. True output is **768 × 1344 at 24 fps** with a native audio track the edit discards.
- **Price is why this is the default.** H3 Max Turbo is about 10 credits per second (60 for 6 s). Grok Imagine 1.5 is 226 credits for 8 s at 720p and 402 at 1080p — three to five times as much per second. Another League S01E01 spent ~1,300 credits on 21 H3 Turbo clips; the same episode on Grok 1080p would have passed 8,000.
- **Grok at 720p is a downgrade, not a saving.** 720p vertical is 720 × 1280, *smaller* than H3's 768 × 1344, so it conforms worse into a 1080 × 1920 master. If Grok is used at all, use 1080p (1088 × 1920, effectively native) and only as a per-shot repair — for example a speaking single whose VEED lipsync fell apart on the H3 take. Record it as a `pipelineOverride` on that shot, not a policy change. Grok's `duration` is a **string** enum ("1".."15") and `quote_generation` rejects it in every form; omit `duration` when quoting and read the real number off the job.
- **Pilot batch first**: the 3–4 riskiest cuts (the most motion, the insert, the two-hander), reviewed, then the rest as one batch.
- The prompt has three parts, in this order, and every part is mandatory:
  1. **Camera: handheld by default.** "Handheld camera, subtle organic drift and breathing sway, no shake" plus the one move for the beat (a slow push, a drift left, a settle). A locked-off camera is the exception and needs a narrative reason written on the shot (`cameraLock: "static — surveillance POV"`); without one, the default is handheld. Obvious shaky-cam is as wrong as a tripod: the aim is a camera that is held by a person, so performances read as observed rather than posed.
  2. **Performance: the character is never still.** Write two or three small, specific, natural behaviours for the beat so the figure does not read as a mannequin: shifting weight from foot to foot, glancing off and back, a slow nod or a small head shake, a shrug, a hand gesture, fingers worrying a strap, a breath that lifts the shoulders, eyes tracking something off frame. Match them to the line's intent (a listener nods late; a liar looks away first). Reaction and insert cuts get the same treatment; even a hand on a door handle adjusts its grip.
  3. **Never mention speech.** No "dialogue", "speech", "talking", "mouth", "lips" or "silent" anywhere — not in the prompt and **not in the negative prompt**. Name the ambient sound of the room instead ("ambient room tone of a quiet school parking lot: light breeze, distant birdsong").

     This reverses edition 2.0's non-speaking clause, which was wrong twice over. First, these models do not honour negations: a clause reading "no lip movement" produced talking mouths anyway, on H3 *and* on Grok, and on Grok the characters spoke fluent gibberish. Second, the clause was solving a problem that does not exist. **Baked mouth motion helps VEED rather than fighting it**: VEED overwrites the mouth region wholesale, and a face already articulating gives it better geometry to work from than a closed, static mouth. Assume every clip will contain some mouth movement, write the prompt as if the model will never obey a negative, and let VEED overwrite it.

  Example: "Handheld camera with subtle organic drift, slow push toward her face. She shifts her weight onto her left foot, glances toward the gate and back, gives a small tired head shake and tightens her grip on the paper bag. Ambient room tone of a windy street corner: distant traffic, a flag line ticking." Keep the whole prompt under 60 words; one move, two or three behaviours, the room tone.
- Observed price: H3 Max Turbo 6 s = 60 credits at 768p (10 per second). For comparison, Grok Imagine 1.5 is ~28 per second at 720p and ~50 at 1080p.

## Stage 4 — lipsync (VEED Lipsync V2) for on-screen speech only

- Lipsync only cuts with `mouthVisible: true` **and exactly one visible face**. A two-shot with both faces visible is never a speaking cut: VEED attributes the line to whichever mouth it likes. Restructure the ledger so every line plays on a single-face framing and reactions are their own cuts.
- `generate_lipsync` with `model: "veed-lipsync-v2"`, `videoUrl` = the stage-3 clip, `audioUrl` = the stem, plus `productionId` and `boardId`. VEED v2 **does** take `syncMode` through the MCP (`cut_off` default, plus `loop`, `bounce`, `silence`, `remap`); edition 2.0 said it had none.

### The one rule that governs every lipsync: video ≥ audio

VEED reconciles a length mismatch by damaging one side, and which side depends on the direction:

- **Audio longer than video → VEED fills the picture by running it backwards.** The subject's head reverses through poses it already held. This is subtle enough to survive a rough cut and obvious in a render. It is the single most common defect in this pipeline.
- **Video longer than audio → `cut_off` truncates the picture to the audio length.** A 6 s clip in which a character says one word and then slams a car door comes back 2.4 s long, with the door slam gone.

Consequences to build into the plan:

1. **Generate the clip at stem length plus a 1–2 s handle**, so picture is always the longer side. With H3's 5 s minimum this is usually free.
2. **Trailing silence in the stem counts as audio.** A stem with 1.5 s of room after the last word will pull 1.5 s of reversed picture into the output. Measure the actual speech end with an RMS envelope, do not trust the file length.
3. **Do not feed a padded stem to VEED.** Padding to match the clip is what edition 2.0 recommended and it manufactures the reversal above. Keep the 0.3 s head and 0.4 s tail on the *editorial* stem; drive the lipsync with the tightest version.
4. **`syncMode: "silence"` does not pad.** It was tried on exactly this case and still trimmed the output to the audio length. Do not plan around it.
5. **When a long action clip carries a short line**, do not stretch either side. Lipsync it, then splice locally with ffmpeg: VEED's head up to the end of the line, then the original clip from that point on. Zero credits, frame-accurate, and the action survives. Record the splice path in the ledger as the edit source.
6. **Cut the finished shot on the last word.** Trimming the shot's out-point to the end of speech plus a short beat removes any residual reversal and tightens the episode. On Another League this alone removed 3.1 s of dead tail across three shots.

### The stem that drove the lipsync is the only stem that stays in sync

A VEED result is welded to the exact audio file it was given. When a line is re-read, the old take stays on disk and will silently drift the picture if the edit plays it. Because `cut_off` trims the output to the driver, **the lipsync file's own duration is that stem's length**, which makes the check mechanical: assert `|stem duration − lipsync duration| < 0.2 s` for every lipsynced cut before rendering, and refuse to build otherwise. Store the driving `dialogueStemAssetId` next to `lipsyncAssetId` in the ledger and match on the id, never on the filename.

Trimming a lipsynced shot has the same constraint: **trim picture and stem by the same amount**. If the picture starts 0.5 s into the take, the stem must start 0.5 s in too.

- VEED returns **25 fps** whatever the input frame rate. H3 delivers 24. Conform once in the composition rather than per clip, and disclose it in the delivery manifest.
- Cuts where the speaker is off screen, back to camera, in profile beyond ~30°, or covered: **no lipsync**. Lay the stem under the un-synced clip (a reaction shot or insert) in the edit. O.S. and VO lines always play over cutaways.
- A reaction insert after every long line and a cutaway on every line change gives the editor a place to hide any lipsync that reads wrong, at 3 credits per still and no lipsync.

## After the clips (optional, user's choice)

- **Music** (`generate_audio`, `audioCategory: "music"`): default `minimax-music-3`, `prompt` = brief per `voice-and-music.md` plus the sting motif, `musicDuration` = at least twice the story length or the model's maximum. Verify the returned duration with `ffprobe` before wiring; a short return is tiled with 2 s crossfades and disclosed. **`musicDuration` is a ceiling, not a request, and the shortfall is not always refunded**: Another League asked for 180 s, received 23.6 s, and was billed the full 90 credits with no refund seen in the balance. Budget for one length, plan the cue for whatever arrives, and check `get_account_status` if a refund was promised. Given that, prefer designing music as one or two placed cues rather than a wall-to-wall bed — a 15 s cue under the episode's turn is better drama than a 23 s loop tiled across 90 s, and it survives a short return. Lyria (`lyriaEndpoint: "pro"`) accepts only `targetDurationSeconds` ∈ {60, 90, 120, 150, 180}, treats any time phrase in the prompt ("first 10 seconds") as a duration request and rejects it, and has returned "No audio returned" with the credits parked; use it only when the user names it.
- **Ambience** (`audioCategory: "sfx"`, `model: "elevenlabs-sfx-v2"`): one loop per acoustic space, `sfxDuration` 12–22, `loop: true` (boolean), `prompt` = space + 2–3 sources + "steady, no events". Beds come back quiet (Tessa: −40 dB mean); the build script normalises them to the bed target, so do not compensate with gain in the prompt.
- **Sting**: `sfxDuration: 1`, `loop: false`, one hit, dry tail.
- `generate_audio` parameter sheet (the names that exist): `prompt`, `audioCategory`, `model`, `voice`, `speakers`, `stability`, `sfxDuration` (0.5–22), `loop` (boolean), `promptInfluence`, `musicDuration`, `lyriaEndpoint` (`clip` | `pro`), `targetDurationSeconds`, `structurePrompt`, `avoidInstructions`, `vocalMode`, `productionId`, `idempotencyKey`. There is **no** `text`, `boardId`, or `durationSeconds`. `get_model_schema` takes `model`, not `modelId`.
- Edit in HyperFrames (see `edit.md`): stems and lipsynced clips in timeline order, every clip's native audio muted, sidecar captions, master at 1080 × 1920.

## Polling and resumption

- Poll a batch, not a job: issue `wait_for_job` for every outstanding id in one turn (parallel tool calls), then report the diff. Do not wait 25 s per job in sequence for a 30-job stage.
- A `submission_unknown` job is charged and needs operator reconciliation; record the id, never resubmit with the same key, and apply the stall policy above.
- On resume (new session, after compaction, after a usage limit), read `episode-blueprint.json` first and skip every shot whose stage asset id is already set. Never refire a stem, still, or clip that has an asset id.

## Budget rule of thumb (verify with `quote_generation`)

`quote_generation` rejects `duration` for Grok and VEED in every form ("duration must be a string", then rejects the string too); quote them through the first real call of the batch and stop retrying the quote tool.

| Cut type (6 s) | Plate share | Still (GPT Image 2) | Clip H3 Turbo 768p | Lipsync | Speech | ≈ Credits |
| --- | --- | --- | --- | --- | --- | --- |
| Speaking, one face | 2 | 15 | 60 | 140 | 2–4 | ~220 |
| Speaking, mouth hidden / reaction | 2 | 15 | 60 | 0 | 2–4 | ~80 |
| Silent / insert | 2 | 15 | 60 | 0 | 0 | ~77 |

A 75 s App Standard episode of 18–22 cuts with 8–10 of them lipsynced lands near **2,000–2,800 credits** on H3 Turbo before music and ambience. Another League S01E01 spent about 4,600 video and 230 image credits across 21 cuts, but roughly a third of that was re-work the gates in this file now prevent: four motion re-rolls, six re-lipsyncs, one Grok repair shot at 492, and 100 image credits stuck in failed Reve jobs. Fewer, longer speaking cuts are still the lever. Quote each stage as a batch; standing policies on `enhance_prompt`, `generate_shots`, `animate_image`, and `generate_lipsync` (capped at the batch quote) turn a scene into one approval per stage.

## Ledger fields per cut

Record these on the shot entry in the episode blueprint (see `schemas.md`): `voiceId`, `plateId`, `wardrobeAnatomy`, `stillModel`, `dialogueStemAssetId`, `stemDurationSeconds`, `clipDurationSeconds`, `framing`, `stillAssetId`, `stillUrl`, `continuity` (`status`, `checks`, `reviewedAgainst`), `mouthVisible`, `faceCount`, `clipAssetId`, `lipsyncAssetId`, `pipeline` (`default` or `override:<model>`). A resumed session reads these to skip finished stages instead of regenerating.
