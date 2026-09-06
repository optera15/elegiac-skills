# MicroDrama quality gates

Apply gates proportional to the requested stopping point. A script-only request does not need render checks; a claimed finished episode needs every gate.

## Story

- First three seconds create a visual, verbal, or situational question.
- One dominant want/conflict drives the episode and something materially changes.
- Prior cliffhanger is honored promptly; hook, turn, spike, and caused cliffhanger are legible.
- `opens/advances/resolves` is coherent and the episode performs its season movement.
- Performed dialogue plus reactions and edit breath fit the target duration.

## Continuity and rights

- Identity, age, body, voice, wardrobe, injury, props, location state, screen direction, time, and lighting match canon.
- Approved Cast/variant/location anchors exist before spend. Any deliberate change is written back as a delta.
- Face and voice rights are separately verified. Restricted or unresolved likenesses are not generated.
- Every local source has a traceable Elegiac asset ID or explicit user provenance and a matching hash.

## Picture

- Native 9:16 staging, not an accidental crop; faces, action, evidence, titles, and captions survive phone-size safe-zone preview.
- No identity drift, anatomy failures, unreadable generated text, discontinuous plot objects, frozen mouths, or unexplained axis jumps.
- The first and last frames work as still images. Draft sources are not labeled premium finals.

## Sound and captions

- Dialogue is intelligible on phone speakers, music does not mask it, and no stream clips.
- Lipsync reads at normal playback. Room tone and ambience do not jump distractingly across cuts.
- Default-pipeline clips were generated non-speaking (no baked-in Grok dialogue or lip movement under the lipsync); Grok's own audio track is muted in the edit; every speaking cut has its own stem; lipsync was applied only where the speaker's mouth is visible.
- Each character uses the same stored ElevenLabs Voice ID across every cut and episode.
- Captions match approved dialogue, timing, spelling, speaker intent, and safe zones.
- The story works muted and gains value with sound.

## Technical and delivery

- `validate-episode-manifest.mjs` passes with file checks and hashes.
- HyperFrames validation passes; representative shot/scene midpoints and first/last frames are inspected.
- Full Studio preview is watched muted and with sound, then explicitly approved before render.
- Render is probed for declared dimensions, duration, frame rate, streams, codecs, decodability, and no unintended black frames.
- Master, SRT/VTT, poster, edit manifest, delivery manifest, provenance, credits, Board link, and omissions are returned.
- Elegiac registration is either verified on the correct Episode Board or explicitly `not_registered`.
- Each principal is exactly one Cast member with an `isConsistentCharacter` sheet; `list_characters` shows no duplicate entries created by promoting a concept without `castMemberId`.
- Every approved still, clip, and stem shows on the Episode Board canvas (automatic placement from `productionId` + `boardId`; check `boardPlacement` on each job/workflow). A completed job whose `boardPlacement` is `skipped` or `error` is reported, never silently re-added.

## Suggested acceptance scenarios

1. Bare true-crime premise in Director mode: useful proposals, retained override matrix, no premature spend.
2. Bare Fast Track premise: concise package and proof path, with quote and render gates intact.
3. Existing unfinished Episode 7 Board: resume, do not create a duplicate.
4. Animated office comedy: animation is treated as form, not forced into a romance template.
5. Edit-only local footage: no generation, deterministic handoff, preview, and approved render.
6. Wardrobe mismatch: cheapest editorial/surgical repair first; regeneration quoted separately.
7. Permission retry: identical parameters and idempotency key, exactly one job/charge.
8. Ambiguous Cast identity: stop before staging or spend.
9. Request for 80 finished episodes: full text spine plus one proof episode, not mass generation.
10. Oversized final upload: local delivery marked `not_registered`, never false success.
