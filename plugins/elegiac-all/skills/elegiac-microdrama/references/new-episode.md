# Wizard: Create a New Episode

## Outcome

Create or resume one canon-consistent Episode Board and, if requested and authorized, one finished episode. Do not duplicate Production memory, Boards, artifacts, or already completed beats.

## Workflow

1. Resolve the Production from the known ID or `list_productions`. Read `00 — Series Bible`, the series manifest/spine, prior episode Board, Cast, StyleSystem, relevant locations/assets, and local Production Kit state.
2. Determine the canonical next episode from structured metadata. If that Board exists unfinished, resume it. Never infer the episode solely from Board count.
3. Reconcile a continuity brief: previous cliffhanger; answer owed now; character, relationship, wardrobe, injury, prop, location, time, and lighting state; open loops; episode movement; prohibited contradictions.
4. Draft the episode promise: hook, dominant want/conflict, two escalations, turn, spike/decision, caused cliffhanger, and `opens/advances/resolves`. Reject a plan that merely stalls.
5. Write and perform-time the script. Default to one scene and the selected profile's duration. Give the opening three seconds and final five seconds special scrutiny. Stop here if the user asked only for a plan or script.
6. Create exactly one canonically named Board only if it does not exist. When approved Cast/location anchors exist, stage with `create_scene_board_from_production_memory`; otherwise use the appropriate existing Board creation tools. Ambiguous or missing required identity blocks spend.
7. Add or update blueprint, creative direction, script revision, shot list, storyboard beats, sources, and edit-manifest view. Use `update_board_artifact` instead of duplicate cards.
8. Quote/cap a 3–6-frame still proof. Check identity, wardrobe, props, geography, screen direction, lighting, phone-size composition, hook, and cliffhanger. Curate or surgically repair before motion.
9. Quote and generate only approved clips/audio. Keep takes tied to shot IDs, record rejections, generate dialogue by line/beat, approve voices before lipsync, and reuse style/cast IDs.
10. Export/freeze sources and construct the hashed edit manifest. Build the HyperFrames handoff; run checks, inspect representative frames/contact sheet, review with sound and muted, and obtain final preview approval before render.
11. Probe the rendered output and close the ledger: loops resolved/advanced/opened, character/location deltas, exact next-episode handoff, credits, files, and Elegiac registration state.

## Resumption rules

- The highest revision of a canonical artifact wins only when its lineage is explicit; never overwrite an edited local file silently.
- Completed source jobs are reused. A retry after permission or transport failure uses the identical call and idempotency key.
- A title change does not change `SxxExx`; an episode number change is a migration that must update Board, shot, asset, manifest, and filename references together.
- If the previous episode is unfinished or its cliffhanger is unknown, expose that gap before inventing continuity.
