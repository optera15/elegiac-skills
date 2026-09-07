# elegiac-microdrama changelog

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
