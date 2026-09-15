# Create or resume one episode

1. Resolve Production, Series Bible, series-manifest.json, previous episode and episode-blueprint.json. Inspect Cast sheets, assigned Voice IDs, rights, location masters, look and branding. Reconcile local edits without overwriting them. Resume the existing Board/jobs rather than duplicating them.
2. Identify the answer owed by the prior cliffhanger, dominant conflict and this episode's material change. Preserve opens/advances/resolves and canon.
3. Write a performable script, then group it into the smallest sensible set of 10–30-second scenelets; aim for a 75-second total within 60–90, including branding. Prefer two speaking roles per scenelet. Account for action/reaction time, not just words. Budget short standalone WAN inserts separately.
4. For each scenelet write beginning/end state and each character's complete performance brief (craft.md). State what must not change and how the scene moves the story. Stop here for a planning-only request.
5. Create exactly one SxxExx — Title Board after resolving its title; keep stable scenelet IDs such as S01E03-SC010 and insert IDs such as S01E03-IN015. Mirror the current local blueprint and scenelet plan; do not commission a storyboard merely to populate the Board.
6. Reuse or create only missing sheets/location/critical prop anchors. Approve and measure expressive ElevenLabs solo voice samples; combined attached duration <=15 seconds per generation. Full dialogue lives in the WAN prompt. Follow production-pipeline.md.
7. Run check-scenelet-plan.mjs at planning stage, then with --ready before generation. Compile each request, inspect it, quote the scoped batch and generate one representative scenelet first when needed. No stills/animatic approval stage.
8. Review actual performances, sound, cuts and continuity. Accept a take and its ending state before dependent work; continue authorized work without redundant permission questions. Record defects precisely and quote only justified replacements.
9. Freeze accepted clips, build version 2 edit-manifest.json and preserve native audio. Total runtime includes compact branding. Finish through edit.md and qa.md; update next-episode canon and deliver billing/registration truthfully.

## Resume and migration

Read scenelets[].attempts and selectedTakeId. Asset ID alone proves delivery, not acceptance. Retain failed/unknown jobs, caps, refunds and prior versions. Do not overwrite an episode's legacy blueprint: create an explicit version 2 revision and preserve old shot/take lineage as history. Never reinterpret old stems as the new scene's audio automatically. Missing prior continuity or a requested pause is surfaced; it is not filled by invented canon.
