# Acceptance gates

Apply checks to the requested deliverable. Planning-only does not need render checks. User checkpoints follow recorded authorization; technical review still applies.

## Before generation

- Hook, conflict, turn, cliffhanger and loop changes agree with canon.
- Scenelets are logical 10–30-second units; shorter inserts have a purpose. Total including branding is 60–90 seconds, ideally 75. Generation count is deliberately low, not one per line.
- Each present character has a playable intent brief, including knowledge/suspicion, hidden agenda or none, emotional change and forbidden misread.
- Prefer <=2 speaking roles per scenelet; exceptions are justified rather than treated as a hard model cap.
- Reference sheets/location anchors are inspected and approved. Rights and assigned Voice IDs are resolved. Only necessary references are attached in known order.
- All attached audio files are measured, isolated by speaker, expressive but clean, and sum to <=15 seconds. This cap is not confused with the dialogue/script duration.
- Ordered shot windows cover the requested generation duration; exact dialogue and speaker/listener assignments are explicit. Standalone action inserts need no multiple-shot structure.
- Current WAN schema and exact settings checked; model `availability` is `ready`; quote succeeded on the exact payload with `pricedInputs.durationSeconds` equal to the scenelet length; quoted total/cap and authorization recorded. No implicit premium tier/model substitution. Request builder is no-spend.
- check-scenelet-plan.mjs --ready passes with actual local audio files.

## Before take acceptance

- Listen/watch complete result, including last words, reactions, internal cuts and tail.
- Match identity, voice, exact words, speaker assignment and intent. Two visible faces are permitted; the wrong face speaking is not.
- Confirm native lip-sync, clarity, no invented lines/music/captions, no clipping.
- Check internal geometry, hands/props/vehicle logic, light and ending state.
- Record measured specs, actual transcript, usable range, defects and review evidence. Thumbnails do not certify voices or sync. A script/tool pass cannot certify artistic quality.
- Reconcile jobs and credit debits/refunds from each job's `billing` line (`quotedCredits`, `deductedCredits`, `refundedCredits`, `status`); failed generation does not imply a refund until `status` is `refunded` or `not_charged`. A `refund_pending` or `requiresAction` job is listed as unresolved, not as settled.
- Each accepted take's `registration` line shows `registered: true` with a `productionGalleryItemId`; otherwise record it as not_registered for delivery.

## Before delivery

- Accepted scenelets remain coherent at joins; state changes are motivated.
- Native audio preserved exactly once and aligned to picture; voice samples never substituted. Extraction derivatives retain same-source provenance/timing.
- Version 2 total runtime includes bookends. Measured source specs and final conform are disclosed; no padding/stretching to hide an over/under-run.
- Frozen paths/hashes, review/approval and source ranges pass manifest validation.
- Captions follow actual approved words/timing; burn-in is opt-in.
- Compact branding resolved/reused; no invented logo/sting or long intro.
- HyperFrames check and exported preview reviewed with sound; output probed and decodable. Report any axis not reviewed.
- Master/proxy/captions/poster/manifests/Board link delivered as requested. Registration verified from job `registration` lines or explicitly not_registered; unresolved debits/jobs listed with their `billing.status`.

## Behavioral regression scenarios

1. 75-second episode: three scenelets plus bookends budgeted before spend.
2. Two speakers with 8-second samples each: reject 16-second combined input; select clean shorter excerpts, not faster playback.
3. 30-second scripted conversation with two 4-second voice samples: valid reference budget; do not split merely because dialogue exceeds 15 seconds.
4. Three speaking roles: recommend a natural split or record a specific exception; never silently drop a role.
5. Drawer insert: short single-shot WAN clip with cast hand/wardrobe and location/prop continuity; no compulsory multi-shot plan.
6. Wrong speaker in a beautiful take: reject for dialogue attribution, not visual pass.
7. Resume with selected accepted take or unknown job: no duplicate spend.
8. Native audio in final edit: audible once; reference recordings excluded.
9. Modified audio reference after measurement: detect hash/duration change and reopen readiness.
10. Explicit autonomous finishing: continue within authorization without repeated milestone approval.
11. Legacy project: preserve old files/history; explicit version migration, no automatic audio switch.
12. Requested 30 seconds delivered shorter: use measured usable range and revise budget; do not claim requested spec as actual.
