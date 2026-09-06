---
name: elegiac-microdrama
description: "Create, continue, or edit episodic vertical microdramas with Elegiac production memory and HyperFrames post. Use for short drama, micro drama, vertical drama, duanju, one-minute drama, or a mobile-first scripted series; routes new-show, new-episode, and edit workflows without using Showrunner."
allowed-tools: Bash
argument-hint: "[premise, show/episode, or footage to edit]"
references:
  - elegiac-conventions.md
  - platform-specs.md
  - shot-grammar.md
  - voice-and-music.md
---

# Elegiac MicroDrama

Turn the smallest workable idea into a resumable vertical series package and, when requested, one polished episode. Elegiac is the studio and source of production truth; HyperFrames is the cutting room. This skill orchestrates existing filmmaker tools and **never calls or imitates Showrunner**.

Read `references/elegiac-conventions.md` first. It governs spend, permission retries, rights, memory, and fail-closed behavior.

## Route one mode

Choose from the user's actual starting point. Do not ask them to select a mode when it is evident.

- Bare premise, title, or new series → read `references/new-show.md`, then `references/craft.md` and `references/schemas.md`.
- Existing Production plus a request to plan or make an episode → read `references/new-episode.md`, then `references/production-pipeline.md` (the default clip pipeline), `references/craft.md`, `references/schemas.md`, and `references/qa.md`.
- Existing clips, Episode Board, Production Kit, rough cut, or HyperFrames project → read `references/edit.md`, `references/schemas.md`, and `references/qa.md`. Read `references/craft.md` when story pacing is in scope.

If a request spans modes, run them in that order and retain one state ledger. Stop when the user's requested deliverable is complete; planning does not authorize generation, and generation does not authorize rendering.

## Collaboration contract

Infer the closest profile from the request; otherwise use **Co-Creator**. State the profile and any department overrides once, then store them in the series/episode files so a resumed session does not ask again.

| Profile | Behavior | Creative checkpoints |
| --- | --- | --- |
| **Fast Track** | Fill sensible defaults, recommend one coherent package, move in small batches. | Show promise, cast/look, episode preview. |
| **Co-Creator** | Offer 2–3 materially different options and recommend one at structural decisions. | Story engine, season spine, principals, style, episode script, edit preview. |
| **Director** | Pause at the departments the user chose and maintain a detailed decision ledger. | User-selected themes, arcs, casting, locations, dialogue, shots, voice, music, and edit. |

Accept department overrides such as “Fast Track except dialogue and casting.” Propose useful options before asking open-ended creative questions. Money, rights, mutating actions, and final render remain explicit gates in every profile.

## Locked product contract

- A Show is one Elegiac Production tagged `microdrama`; the room is a reserved Brainstorm Board named `00 — Series Bible`.
- An Episode is exactly one Board named `S01E01 — <Title>`. Keep every episode artifact and workflow result on that Board. Shot IDs are `S01E01-010`, `S01E01-020`, leaving gaps for inserts.
- **App Standard** is 60 episodes × 75 seconds. Keep visible alternatives for 24 or 30 episodes at 60–120 seconds and a Custom profile.
- Plan the whole season in text, but produce only one episode at a time. Never turn “make the series” into bulk generation.
- Native final master is 1080 × 1920, rendered in post. Source clips from the default pipeline (`references/production-pipeline.md`: ElevenLabs V3 dialogue → Muse Image 9:16 stills → Grok Imagine 1.5 non-speaking 720p clips → VEED Lipsync V2 where the mouth is visible) are 720 × 1280 and the call sheet discloses that; 1080p clips are a premium option on explicit request. 480 × 854 is draft-only and may not be labeled final.
- Use fixed IDs and structured files to determine the next episode; Board count and chat memory are not authoritative.

## Source of truth and resumption

Read before create and resume before duplicate: resolve the Production, `00 — Series Bible`, episode Board, Cast, StyleSystem, Gallery assets, and any Production Kit/HyperFrames files. Prefer `update_board_artifact` over duplicate cards. Never overwrite local creative edits during reconciliation; write a sidecar or show a diff.

At resumable checkpoints, report a compact **MicroDrama Call Sheet**: show/season, mode/profile, locked decisions, current task, next spend, open decisions, Production/Board IDs, and local post path. Reconstruct it from Elegiac and files—not conversational recollection.

## Spend and production invariant

Planning, scripts, manifests, and Board organization are no-spend work. Before media generation, quote each homogeneous batch, show the total and cap, then wait for authorization. Start with 3–6 vertical proof stills and repair stills before motion. Then produce clips through the default pipeline in `references/production-pipeline.md`, one stage-batch at a time (dialogue stems, framed stills, non-speaking motion, lipsync only where the mouth is visible), unless the user names a different model or route — record that as a pipeline override. Generate one episode only. Follow exact idempotency-key retry rules in the shared conventions.

Recurring identity, style, locations, props, voices, and rights belong in durable Elegiac memory. Reuse approved assets. A missing or ambiguous required anchor blocks generation rather than permitting a generic substitute.

## HyperFrames handoff

For fresh post, export/freeze all approved sources locally, initialize a HyperFrames project, then run:

```bash
node <installed-skill>/scripts/validate-episode-manifest.mjs <edit-manifest.json> --root <production-kit-root> --write-hashes
node <installed-skill>/scripts/build-edit-handoff.mjs <edit-manifest.json> --root <production-kit-root> --output <hyperframes-project>/BRIEF.md
```

Load the installed `hyperframes` skill and let its `general-video` workflow own composition, captions/graphics, deterministic checks, preview, and render. For an existing HyperFrames project, request only the named edit or validation operation. No composition may fetch remote media at render time. The user approves the final Studio preview before any render.

Large local masters may not fit the current MCP upload path. If registration cannot be completed, deliver the verified local files and mark the final **not registered in Elegiac**; never imply a successful round trip.

## Definition of done

A finished episode has a coherent hook/turn/cliffhanger and loop ledger; approved continuity; frozen, hashed sources; a passing manifest; a passing HyperFrames check; an inspected and approved preview; and a probed output at the declared dimensions, duration, frame rate, video/audio streams, and codec. Deliver the master, captions, poster frame, edit/delivery manifests, credit summary, Board link, and explicit omissions.
