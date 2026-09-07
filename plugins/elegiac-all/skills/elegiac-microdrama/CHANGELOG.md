# elegiac-microdrama changelog

## 2.2.0 — 2026-09-08 — after the Another League S01E01 pilot

- **Motion default is MiniMax H3 Max Turbo at 768p** (`minimax-h3`, `qualityTier: "turbo"`, `duration` as a string, minimum `"5"`), about 10 credits per second against Grok Imagine 1.5's 28–50. True output 768 × 1344 at 24 fps. Grok 1.5 is now a per-shot repair option **at 1080p only**: its 720p tier is a smaller frame than H3's and conforms worse into the master.
- **The non-speaking clause is withdrawn.** Video models ignore negations — "no lip movement" produced talking mouths on H3 and fluent gibberish on Grok — and VEED overwrites the mouth region wholesale, so an articulating face syncs *better* than a closed one. Motion prompts now carry no speech vocabulary at all, in the prompt or the negative prompt, and name the room tone instead.
- **Stems are no longer padded to match clips.** Audio longer than picture makes VEED fill the gap by running the clip backwards; trailing room counts as audio. Generate the clip at stem length plus a handle, drive the lipsync with the tightest take, and cut every lipsynced shot on its last word. `pad-stem.sh` is demoted to a last resort. `syncMode: "silence"` does not pad; VEED v2 *does* expose `syncMode`, contrary to 2.0/2.1.
- **A lipsync is welded to the stem that drove it.** New rule and mechanical check: match stems by asset id, and assert `|stem − lipsync| < 0.2 s` before rendering. Trimming a lipsynced shot trims picture and stem equally.
- **Continuity gate section 0: a still is the first frame of its clip.** Never write a still as though a state change already happened; the change is performed inside a clip. New `state` check row. Matched OTS/reverse pairs are one geometry.
- **Branding:** generated wordmarks are a poor buy; illustrate a real moment with the cast sheets attached and crop the mark from it. Never use a blurred grab of the splash as the end-card ground. Verify a supplied "transparent" PNG actually has an alpha channel.
- **Edit house rules:** sub-composition asset paths are root-relative; alternate dialogue track indices; cue music rather than bedding it; drive the whole cut from one build script. Judge sound from a draft render, never from Studio, and never from a concat rough (it plays each clip's baked audio and hides stem bugs).
- **Still model default is GPT Image 2** at `quality: "medium"`, `resolution: "2k"`, 15 credits, replacing Nano Banana Pro at 25: it follows a long enhanced prompt more literally, holds identity from cast sheets, renders legible in-frame text, and costs less. Nano Banana Pro stays available as a per-show override. **Muse Image at 3 credits is hardened as the draft model** — cheap enough to run staging, blocking and composition loops freely before spending a keeper credit.
- **Character references have their own section** (`production-pipeline.md`, stage 2). `generate_shots` silently drops per-shot `referenceImageUrls` past the first at `source_frame_limit`, so cast must travel in `castMemberIds`, `referenceImageUrls` carries the plate and props, and batches are grouped by character. The symptom is a stranger in the wrong wardrobe, which reads as identity drift and sends you to the wrong fix. `enhance_prompt` is unaffected and takes up to 8 URLs; its own trap is a hand-typed Firebase token.
- New `references/field-notes.md`: model and connector gotchas, ffmpeg recipes, and how the notes actually arrive from a user.

## 2.1.0 — 2026-09-07 — performance and framing defaults

- **Handheld by default.** Every motion prompt opens with a handheld camera with subtle organic drift (no shaky-cam); a locked-off frame needs a narrative reason recorded on the shot (`cameraLock`).
- **Characters are never still.** Every motion prompt gives each figure two or three small natural behaviours (weight shifts, glances, nods and head shakes, shrugs, hand gestures) matched to the beat; reaction and insert cuts included.
- **Stems breathe.** Dialogue is performed with a beat before the first word and after the last, then normalised to a 0.3 s head and 0.4 s tail so cuts can J/L and nothing pops or clicks at a boundary. The stills animatic now places stems at the cut start (the stem carries its own lead).
- **Framing through the plugin.** Every still goes through `enhance_prompt` with a named `list_framings` entry recorded on the shot; free text only when nothing fits, with a reason; consecutive cuts vary in size or side.
- QA gains checks for all four.

## 2.0.0 — 2026-09-07 — after the Tessa S01E01 pilot

The first full run of the skill produced a probed 1080 × 1920 master that failed as drama on shot continuity, with ~4,300 credits spent. The audit (`post/audit/s01e01-process-audit.md` in the Tessa kit) found the causes were process, not models. This edition adds the gates that were missing and bakes in every tool rule that had to be learned the expensive way.

### New gates (no spend)

- **Coverage set** (stage 0): a plate per staging position and per recurring vehicle, pinned to every shot (`plateId`). One plate per location is no longer accepted.
- **Duration budget** at script stage: `scripts/check-shot-budget.mjs` estimates the story from the ledger, adds bookends, and fails over the target with a trim list, before any stem exists.
- **Continuity gate** (`references/continuity-gate.md`): a thirteen-point checklist run in shot order on every still, written to `shot.continuity`, with `reject` as a first-class state. Deviations are flagged, not adopted as canon. Absurd staging is a hard reject.
- **Stills animatic**: `scripts/build-stills-animatic.mjs` builds a HyperFrames stills-only cut with stems and bookends; the user watches it and says "animate". Stage 3 requires `animatic.approvedAt`.
- **Pilot motion batch** before the rest of stage 3.

### Pipeline rules now written down

- Still model and price stated in the call sheet (`pipeline.stillModel`); any departure is an override.
- Grok true output 704 × 1280 at 25 fps; non-speaking clause mandatory; observed pricing.
- VEED observed as a flat 140 per call; one visible face per speaking cut; O.S./VO over cutaways; reaction insert after every long line; padded drivers by `scripts/pad-stem.sh`, never base64 through the model.
- Prompt lint: no "lipsync"/"for <purpose>", no numeric ages, no skin-ageing adjectives on young characters, `wardrobeAnatomy` on inserts.
- Stall policy: `submission_unknown` over 10 minutes → fresh key, linted prompt, both ids reported.
- Batch polling; blueprint-first resumption; never refire a shot with an asset id.
- `generate_audio` parameter sheet; MiniMax as default underscore; Lyria's fixed lengths and failure mode; verify returned music length; beds normalised.
- No video-to-audio route exists; say so up front.

### Intake and casting

- One consolidated intake (`look.styleLine`, `look.lookLine`, references, profile, voices, still model) before any style card or board.
- A voice for every speaking role including bit parts; no caption-only lines.
- Foundation portraits and identity sheets are 4:3; `promote_character_concept` only with `castMemberId`.
- Episode board created only after the title is locked (no rename tool).

### Edit and branding

- Captions are a sidecar by default (`captions.burnIn: false`; the validator warns on `true`).
- Bookend template: full-bleed brand ground (`branding.ground`, never bare black), mark at 60–70 % width on transparency, fonts from the HyperFrames-supplied list; branding resolved before the first cut.
- House rules: dialogue from original stems, ducking by timeline tweens (automation lanes rejected by the validator via `mix.method`), one sub-composition per scene, normalised beds, `--low-memory-mode` renders, review proxy under 30 MB in deliverables.
- `build-edit-handoff.mjs` owns `BRIEF.md`: regenerates on every run, preserves `## Editor notes`.
- Validator: warns on burned-in captions and missing/black ground, errors on `clips[].continuityStatus` other than `pass` and on `mix.method: automation-lanes`.

### Schemas

- Series manifest: `look`, `pipeline`, `voices`, `principals[].wardrobeAnatomy`, `locations[].plates[]`, `vehiclesAndProps[]`, `branding.ground`.
- Blueprint: `durationBudget`, `animatic`, `editOrderOverride`; shot ledger gains `kind`, `plateId`, `faceCount`, `wardrobeAnatomy`, `stillModel`, `stemDurationSeconds`, `clipDurationSeconds`, `stillUrl`, `stillLocalPath`, `continuity`, `stuckJobIds`.
- Edit manifest: `sourceSpec`, `mix`, `clips[].continuityStatus`, `branding.ground`. Delivery manifest: `reviewProxy`, `sourceSpec`, `credits.stuck`, mix levels.

### Routing

`SKILL.md` names the sibling skills used at each stage: `elegiac-location-scout` (coverage sets), `elegiac-scene-continuity` (outlier repair), `elegiac-animatic` (timing discipline), `elegiac-character-cast`, `elegiac-prompt-doctor`.

## 1.x

Branding gate (`references/branding.md`), validator `branding` block, HyperFrames handoff builder, default clip pipeline.
