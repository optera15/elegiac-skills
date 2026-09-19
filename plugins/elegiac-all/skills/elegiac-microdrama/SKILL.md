---
name: elegiac-microdrama
description: "Create, continue, or edit vertical microdramas with WAN 3.0 native-audio scenelets, Elegiac cast/location memory and light HyperFrames finishing. Use for episodic mobile-first scripted drama, from a series premise to the next episode or an existing edit; never uses Showrunner."
allowed-tools: Bash
argument-hint: "[premise, show/episode, or footage to edit]"
version: 3.1.0
references:
  - elegiac-conventions.md
  - platform-specs.md
---

# Elegiac MicroDrama — scenelet-first

Make an episode from a few coherent performed scenes, not independently animated stills. WAN 3.0 generates picture, dialogue, lip-sync, performance, internal cuts and production sound together. HyperFrames assembles approved scenelets and finishes the episode; it does not reconstruct every exchange from singles.

## Route the user's scope

- New series: read [new-show.md](references/new-show.md) and [craft.md](references/craft.md).
- Plan/produce an episode: read [new-episode.md](references/new-episode.md), [production-pipeline.md](references/production-pipeline.md) and [schemas.md](references/schemas.md). Before generation read [wan-prompting.md](references/wan-prompting.md) and [continuity-gate.md](references/continuity-gate.md).
- Existing footage/edit: read [edit.md](references/edit.md), [schemas.md](references/schemas.md) and [qa.md](references/qa.md). Editing does not authorize replacement generation.
- Before delivery read [branding.md](references/branding.md) and [qa.md](references/qa.md). [field-notes.md](references/field-notes.md) records observations, not guarantees.

Read shared references/elegiac-conventions.md before spend (source repository: ../references/elegiac-conventions.md; packaged plugin: bundled into this skill). Live schemas and quotes outrank static model tables. This scenelet workflow supersedes shared legacy per-shot/lip-sync advice; use this skill's voice-reference guidance instead of routing through the shared voice-and-music production workflow.

## Production contract

- Default episode: **60–90 seconds total, ideally 75, including bookends**. Plan logical **10–30-second scenelets**, usually about three, with the fewest generations that preserve the story. A scenelet is one generation with several internal shots. Do not split at every line or mechanically make three 30-second clips.
- Prefer **at most two speaking roles per scenelet**, including off-screen speech. This is a reliability preference, not a technical limit. Split naturally or record a justified exception; do not erase a story-critical role. Non-speaking cast do not count as speakers.
- Default all new episode video to **WAN 3.0 (wan-3), Standard, 720p, 9:16, native audio**. One-off inserts/actions also use WAN, with single-shot prompts and shorter durations when appropriate. Set the model explicitly so generic draft routing cannot substitute another engine. Prime, higher resolution or another engine requires the user's choice and current quote.
- Inputs: approved character sheets, inspected location masters, essential prop/vehicle anchors and expressive ElevenLabs voice references using assigned Voice IDs. **No per-cut still generation, mandatory stills animatic, separate silent-motion stage or external lip-sync stage.** Keep historical media and records; this workflow does not authorize deleting them.
- **15 seconds is the combined duration of attached audio-reference files per request, not the scene's dialogue limit.** Measure files including silence. WAN performs the full quoted script using the reference voices; exact ElevenLabs waveform/timing reuse is not promised. Use isolated role-specific samples, not a mixed exchange.
- Preserve generated native audio with picture. Never routinely replace it with voice-reference recordings, mute all sources or buy another lip-sync pass.

## Working sequence

1. Resume Production, Series Bible, Episode Board and manifests before creating anything. One show is one Production, one episode is one Board. Fixed episode/scenelet IDs and job/asset IDs govern resumption, not chat memory or Board count. Never use Showrunner.
2. Write hook, want/conflict, turn and caused cliffhanger. Group beats at natural changes of objective, location, speaker pair or completed action. Budget the total runtime before spend; distinguish generation duration, selected edit range and master runtime.
3. For every character in each scenelet specify motivation, insecurity, suspicion/knowledge, hidden agenda (or none), mood, intent/tactic, feelings, attitude, emotional change, playable behavior and forbidden misread. Do not leave room for invented jealousy, cruelty, attraction or knowledge that contradicts canon.
4. Reuse or create only needed character sheets and location anchors. A 16:9 location master often provides useful geography and movement space; output remains natively composed in 9:16. Inspect references. Resolve missing identity, voice rights and critical geography rather than substituting.
5. Write dialogue as performed. Generate needed solo samples with ElevenLabs V3 and assigned Voice IDs, using expressive beat-specific tags liberally where they serve the intended tone. Audition and measure; reuse suitable approved samples instead of generating every line separately by habit.
6. Assemble one rigorous timestamped multi-shot prompt per scenelet: reference roles, named speakers, exact quoted dialogue, listener behavior, motivated cuts, opening/ending states. Run scripts/check-scenelet-plan.mjs. scripts/build-scenelet-request.mjs compiles the reviewed plan into an **unsubmitted** MCP payload.
7. Quote the intended request/batch, show total and cap, and apply scoped authorization. Prove a new setup with one representative scenelet, then continue the approved episode. An already approved representative take avoids a redundant pilot. Review actual sound, acting, edits and continuity—not thumbnail beauty—before accepting a take.
8. Assemble accepted scenelets with native audio, minimal boundary trims and required bookends/captions. Preserve organic internal edits. Probe and review the export; deliver provenance and billing/registration state.

## Collaboration and persistence

Default to Co-Creator; retain Fast Track, Co-Creator or Director and department overrides from the series. Ask only unresolved questions that materially change the result. Creative checkpoints are script/scenelet plan, new cast/location/voice choices, representative scenelet and episode preview—not an animatic gate. Respect requested pauses and authorization to finish without repeated milestone questions. Technical review is never waived; tool permission_required is an actual boundary.

Planning does not authorize spend. Quote new scope; reuse authorization within scope. Pending jobs keep their IDs. Unknown submissions need reconciliation, not replacement. Intentional new takes get fresh idempotency keys; unchanged approval/transport retries reuse the original. No automatic engine switches or unlimited rerolls.

Maintain a compact call sheet: episode/profile, total runtime budget, scenelet IDs/status, actual source specs, ordered references/Voice IDs, decisions, next quote, outstanding jobs, Production/Board IDs and local edit path. Version 2 manifests carry scenelets; schemas.md explains migration without deleting version 1 history.

## Handoff and done

Before generation: run check-scenelet-plan.mjs with --ready. For finishing:

```bash
node <skill>/scripts/validate-episode-manifest.mjs <edit-manifest.json> --root <kit> --write-hashes
node <skill>/scripts/build-edit-handoff.mjs <edit-manifest.json> --root <kit> --output <initialized-hyperframes-project>/BRIEF.md
node <skill>/scripts/build-fcpxml.mjs <edit-manifest.json> --root <kit> --output <kit>/episodes/s01e01/S01E01.fcpxml   # optional Final Cut Pro timeline
```

Done means reviewed story, scenelet joins, speaker/voice assignment, acting and native sync; measured source specs; passing manifest and HyperFrames check; inspected export and any required user review. Deliver master (normally a disclosed 1080×1920 conform of 720p sources), proxy, sidecar captions, poster, manifests, billing and Board link. Report omissions/unregistered media. Stop at the requested deliverable; never mass-produce a season.
