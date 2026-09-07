# MicroDrama quality gates

Apply gates proportional to the requested stopping point. A script-only request does not need render checks; a claimed finished episode needs every gate. Three gates are hard stops that no profile skips: the **duration budget** before stems, the **continuity gate and stills animatic** before motion, and the **preview approval** before render.

## Story

- First three seconds create a visual, verbal, or situational question.
- One dominant want/conflict drives the episode and something materially changes.
- Prior cliffhanger is honored promptly; hook, turn, spike, and caused cliffhanger are legible.
- `opens/advances/resolves` is coherent and the episode performs its season movement.
- **Duration budget passed at script stage**: `check-shot-budget.mjs` estimate within the profile target plus tolerance, or a trim list agreed with the user before stems. An overrun discovered at the edit is a process failure, not an "exception".

## Continuity and rights

- Identity, age, body, voice, wardrobe, injury, props, vehicles, location state, screen direction, time, and lighting match canon.
- Approved Cast/variant/location anchors exist before spend; every location used has a plate for every staging position in the ledger; every recurring vehicle has its own plate.
- Every shot carries `plateId` and every still derives from that plate.
- **Every still has `continuity.status: pass`** in the blueprint with the checklist in `continuity-gate.md` answered in shot order: plate, position, axis, vehicle, viewpoint, wardrobe, anatomy, props, light, face, frame, text, sense. No `review`, `fix`, or `reject` remains when stage 3 starts.
- **The stills animatic was watched and approved** (`animatic.approvedAt` set, still hashes match the files) before any clip was generated.
- A still that departs from its plate or framing was flagged, not adopted as canon, until the neighbours were checked.
- Face and voice rights are separately verified. Restricted or unresolved likenesses are not generated.
- Every local source has a traceable Elegiac asset ID or explicit user provenance and a matching hash.

## Picture

- Native 9:16 staging, not an accidental crop; faces, action, evidence, and titles survive phone-size safe-zone preview with the platform's own caption overlay in mind.
- No identity drift, anatomy failures (hands and skin age against the identity sheet), unreadable generated text, discontinuous plot objects, duplicate or swapped vehicles, frozen mouths, or unexplained axis jumps.
- The first and last frames of every clip work as still images; the pilot motion batch was inspected at first, mid, and last frame before the rest of stage 3.
- Every still was framed through `enhance_prompt` with a named `list_framings` entry recorded on the shot; consecutive cuts vary in size or side.
- Every clip's camera is handheld with subtle drift (no shaky-cam, no tripod look) unless the shot records a narrative reason for a locked frame; every character shows small natural behaviour (weight shifts, glances, nods, gestures) so no figure reads as a mannequin.
- Draft sources are not labeled premium finals; the call sheet disclosed the true source spec (704 × 1280 at 25 fps for the default pipeline).

## Sound and captions

- Dialogue is intelligible on phone speakers, music does not mask it, and no stream clips.
- Lipsync reads at normal playback and was applied only to cuts with exactly one visible speaking face. Room tone and ambience do not jump distractingly across cuts; beds were normalised before placement.
- Default-pipeline clips were generated non-speaking (no baked-in Grok dialogue or lip movement under the lipsync); Grok's own audio track is muted in the edit; every speaking cut has its own stem from the original ElevenLabs file, not a padded driver; lipsync drivers were padded by script, never by pushing bytes through the model.
- Each role, bit parts included, uses the same stored ElevenLabs Voice ID across every cut and episode. No line ships caption-only for want of a voice.
- Every stem was performed with a leading and trailing beat and normalised to a 0.3 s head and 0.4 s tail; no dialogue pops or clicks at a clip boundary and every cut has room for a J/L edit.
- Captions are a sidecar SRT that matches approved dialogue, timing, spelling, and speaker intent; they are burned in only on explicit request.
- Ducking and fades are timeline volume tweens; the Studio preview plays every track audibly. If a draft render was used as the review medium, say so.
- Music returned at the requested length or the tiling is disclosed; the underscore reuses the sting motif.
- The story works muted and gains value with sound.

## Branding

- The brand punctuation package is resolved from `series-manifest.branding` before the first cut: every element `provided`, `typographic`, or `waived` with a recorded reason; nothing was invented by HyperFrames.
- The cold hook lands inside the first three seconds; any Episode 1 splash is 0.5–2 s and later episodes use an overlay mark or nothing.
- No title sequence, theme song, "previously on", episode-title card, next-episode preview, production logos, or rolling credits anywhere.
- The cliffhanger frame is untouched until the hard cut; the end card is 0.5–1.5 s; the sting starts on the cut to black and ends inside the end card; only declared end matter (≤ 3 s) may follow.
- The bookends use the template ground (full-bleed brand colour, never bare black), the mark on transparency at 60–70 % frame width, and a font HyperFrames can supply; the mark reads at phone size; mark, sting, and typography hashes match the previous episode unless a rebrand is recorded.
- The master duration equals the story cut plus `bookendSeconds` from the validator.

## Technical and delivery

- `validate-episode-manifest.mjs` passes with file checks and hashes.
- HyperFrames `check` passes with no `timeline_track_too_dense` warning (scenes are sub-compositions); representative shot/scene midpoints and first/last frames are inspected.
- Full Studio preview (or a disclosed draft render) is watched muted and with sound, then explicitly approved before render.
- Render used `--low-memory-mode`; the output is probed for declared dimensions, duration, frame rate, streams, codecs, decodability, and no unintended black frames; the mix is measured.
- Master, SRT/VTT, poster, review proxy under 30 MB, edit manifest, delivery manifest, provenance, credits (quoted, deducted, refunded, stuck), Board link, and omissions are returned.
- Elegiac registration is either verified on the correct Episode Board or explicitly `not_registered`.
- Each principal is exactly one Cast member with an `isConsistentCharacter` sheet; `list_characters` shows no duplicate entries created by promoting a concept without `castMemberId`.
- Every approved still, clip, and stem shows on the Episode Board canvas (automatic placement from `productionId` + `boardId`; check `boardPlacement` on each job/workflow). A completed job whose `boardPlacement` is `skipped` or `error` is reported, never silently re-added.
- Jobs left in `submission_unknown` are listed with their ids and credits for operator reconciliation.

## Suggested acceptance scenarios

1. Bare true-crime premise in Director mode: useful proposals, retained override matrix, no premature spend.
2. Bare Fast Track premise: concise package and proof path, with quote, continuity, animatic, and render gates intact.
3. Existing unfinished Episode 7 Board: resume from the blueprint, do not create a duplicate, do not refire finished stages.
4. Animated office comedy: animation is treated as form, not forced into a romance template.
5. Edit-only local footage: no generation, deterministic handoff, preview, and approved render.
6. Wardrobe mismatch: cheapest editorial/surgical repair first; regeneration quoted separately.
7. Permission retry: identical parameters and idempotency key, exactly one job/charge.
8. Ambiguous Cast identity: stop before staging or spend.
9. Request for 80 finished episodes: full text spine plus one proof episode, not mass generation.
10. Oversized final upload: local delivery marked `not_registered`, never false success; a review proxy travels.
11. Edit request with no branding on file: one consolidated ask for mark, sting, typography, ground, and end-card policy with defaults and quotes; waivers recorded; the validator blocks until the block exists.
12. Episode 5 of a show with a package: mark and sting reused byte-for-byte, overlay-mark opening, no re-asking.
13. **A still returns with a second vehicle in the background**: `continuity.status: reject`, `edit_image` or regeneration from the plate, no clip generated until it passes.
14. **The script performs at 89 s against a 75 s target**: the budget script flags it at step 5 and a trim list is agreed before stems.
15. **A still stalls in `submission_unknown`**: the prompt is linted, regenerated with a fresh key after 10 minutes, and both ids are reported.
16. **The user says the preview has no voices**: the composition is checked for `data-automation` lanes; ducking is moved to timeline tweens.
