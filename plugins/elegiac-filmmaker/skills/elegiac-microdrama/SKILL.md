---
name: elegiac-microdrama
description: "Create, continue, or edit episodic vertical microdramas with Elegiac production memory and HyperFrames post. Use for short drama, micro drama, vertical drama, duanju, one-minute drama, or a mobile-first scripted series; routes new-show, new-episode, and edit workflows without using Showrunner."
allowed-tools: Bash
argument-hint: "[premise, show/episode, or footage to edit]"
version: 2.2.0
references:
  - elegiac-conventions.md
  - platform-specs.md
  - shot-grammar.md
  - voice-and-music.md
---

# Elegiac MicroDrama

Turn the smallest workable idea into a resumable vertical series package and, when requested, one polished episode. Elegiac is the studio and source of production truth; HyperFrames is the cutting room. This skill orchestrates existing filmmaker tools and **never calls or imitates Showrunner**.

Read `references/elegiac-conventions.md` first. It governs spend, permission retries, rights, memory, and fail-closed behavior.

This is edition 2.2, revised after the second full pilot (Another League S01E01, 2026-09), which delivered a 92 s master the user was happy with. Edition 2.0 was written after the first pilot (Tessa S01E01), which reached a probed master and failed as drama because stills were animated without a shot-order review, locations had one plate for seven staging positions, and the script overran the target before a stem existed. The gates below exist so neither can happen again.

What changed in 2.2, all of it learned in production: **MiniMax H3 Max Turbo replaces Grok Imagine 1.5** as the motion default at roughly a third of the cost; the **non-speaking clause is withdrawn** because video models ignore negations and VEED prefers a moving mouth anyway; **stems are no longer padded to match clips**, because that is what makes VEED run the picture backwards; and the continuity gate gained the rule that **a still is the first frame of its clip**, not a snapshot of the scene. Read `references/field-notes.md` for the reasoning and the operational details behind these.

If the plugin copy you are running is older than the canonical source (`skills/elegiac-microdrama` in the Elegiac repository), say so and prefer the newer references.

## Route one mode

Choose from the user's actual starting point. Do not ask them to select a mode when it is evident.

- Bare premise, title, or new series → read `references/new-show.md`, then `references/craft.md`, `references/branding.md`, and `references/schemas.md`.
- Existing Production plus a request to plan or make an episode → read `references/new-episode.md`, then `references/production-pipeline.md` (the default clip pipeline), `references/continuity-gate.md`, `references/craft.md`, `references/schemas.md`, and `references/qa.md`. Read `references/branding.md` before the edit manifest, and `references/field-notes.md` before the first spend.
- Existing clips, Episode Board, Production Kit, rough cut, or HyperFrames project → read `references/edit.md`, `references/branding.md`, `references/schemas.md`, `references/qa.md`, and `references/field-notes.md`. Read `references/craft.md` when story pacing is in scope.

If a request spans modes, run them in that order and retain one state ledger. Stop when the user's requested deliverable is complete; planning does not authorize generation, and generation does not authorize rendering.

## Sibling skills this pipeline routes to

These already exist and are the right tool at the named moment; use them instead of improvising:

| Moment | Skill | What it does here |
| --- | --- | --- |
| Stage 0, locations | `elegiac-location-scout` | Lock a master per location, then match plates for every staging position and vehicle (the coverage set). |
| Continuity gate, a still disagrees with its neighbours | `elegiac-scene-continuity` | Find the outlier, cheapest fix first: `edit_image`, anchored regeneration, identity repair. |
| Stage 2b | `elegiac-animatic` timing discipline | The stills animatic is a held-stills animatic with stems; hold everything, animate nothing until approved. |
| Casting | `elegiac-character-cast` | Reuse Cast memory; never create a second Cast member for one role. |
| Recurring prompt failures | `elegiac-prompt-doctor` | When a prompt stalls or drifts twice. |

## Collaboration contract

Infer the closest profile from the request; otherwise use **Co-Creator**. State the profile and any department overrides once, then store them in the series/episode files so a resumed session does not ask again.

| Profile | Behavior | Creative checkpoints |
| --- | --- | --- |
| **Fast Track** | Fill sensible defaults, recommend one coherent package, move in small batches. | Show promise, cast/look, stills animatic, episode preview. |
| **Co-Creator** | Offer 2–3 materially different options and recommend one at structural decisions. | Story engine, season spine, principals, style, episode script and trim list, stills animatic, edit preview. |
| **Director** | Pause at the departments the user chose and maintain a detailed decision ledger. | User-selected themes, arcs, casting, locations, dialogue, shots, voice, music, and edit; the stills animatic in every case. |

Accept department overrides such as "Fast Track except dialogue and casting." Propose useful options before asking open-ended creative questions. Money, rights, mutating actions, the continuity gate, the stills animatic, and final render remain explicit gates in every profile.

## Intake, once

The first brief collects, in one consolidated question with recommended defaults: the look (`styleLine`, `lookLine`, reference images), the control profile, the format profile, the voices the user owns, the still model and its price, and any brand files. Everything goes into `series-manifest.json` before a style card, a bible paragraph, or a board exists. A style invented before this question is rewritten later into every card; a voice missing here becomes a caption-only line at the edit.

## Locked product contract

- A Show is one Elegiac Production tagged `microdrama`; the room is a reserved Brainstorm Board named `00 — Series Bible`.
- An Episode is exactly one Board named `S01E01 — <Title>`, created only after the title is locked (there is no rename tool). Keep every episode artifact and workflow result on that Board. Shot IDs are `S01E01-010`, `S01E01-020`, leaving gaps for inserts.
- **App Standard** is 60 episodes × 75 seconds. Keep visible alternatives for 24 or 30 episodes at 60–120 seconds and a Custom profile. The target is enforced at script stage by `scripts/check-shot-budget.mjs`, not discovered at the edit.
- Plan the whole season in text, but produce only one episode at a time. Never turn "make the series" into bulk generation.
- Native final master is 1080 × 1920, rendered in post. Source clips from the default pipeline (`references/production-pipeline.md`: ElevenLabs V3 dialogue → 9:16 stills on the show's still model → MiniMax H3 Max Turbo clips at 768p → VEED Lipsync V2 where one visible mouth speaks) are **768 × 1344 at 24 fps**, and a lipsynced clip returns at **25 fps**; the call sheet discloses both. Grok Imagine 1.5 at 1080p is a per-shot repair option on explicit request, not a cheaper tier — its 720p is a smaller frame than H3's. 480 × 854 is draft-only and may not be labeled final.
- Captions are a sidecar SRT. Burn-in is opt-in.
- Use fixed IDs and structured files to determine the next episode; Board count and chat memory are not authoritative.

## Source of truth and resumption

Read before create and resume before duplicate: resolve the Production, `00 — Series Bible`, episode Board, Cast, StyleSystem, Gallery assets, and any Production Kit/HyperFrames files. Prefer `update_board_artifact` over duplicate cards. Never overwrite local creative edits during reconciliation; write a sidecar or show a diff. After a compaction or a usage-limit resume, `episode-blueprint.json` is the state: never refire a shot whose stage asset id is set.

At resumable checkpoints, report a compact **MicroDrama Call Sheet**: show/season, mode/profile, locked decisions, still model and price, true source spec, current task, next spend, open decisions, stuck jobs, Production/Board IDs, and local post path. Reconstruct it from Elegiac and files—not conversational recollection.

## Spend and production invariant

Planning, scripts, manifests, budgets, continuity review, the stills animatic, and Board organization are no-spend work. Before media generation, quote each homogeneous batch, show the total and cap, then wait for authorization. Then, in this order and never skipping a gate:

1. **Coverage set**: a plate for every staging position and vehicle the ledger uses.
2. **Duration budget** passed at script stage, trim list agreed.
3. **Stems**, performed with a beat before and after the words, normalised to a 0.3 s head and 0.4 s tail, measured, clip durations written to the ledger.
4. **Stills** in plate batches, every one framed through `enhance_prompt` with a named `list_framings` entry, prompt-linted (no "lipsync", no ages, wardrobe/anatomy lines on inserts).
5. **Continuity gate**: every still `pass` in shot order (`references/continuity-gate.md`); deviations flagged, absurdities rejected.
6. **Stills animatic** watched by the user, approved with "animate".
7. **Motion**, pilot batch first, then the rest; handheld camera by default, two or three small natural behaviours per character, and **no speech vocabulary anywhere in the prompt or the negative prompt**.
8. **Lipsync** only where one visible mouth speaks; picture always longer than audio, never a padded driver.

Generate one episode only. Follow exact idempotency-key retry rules in the shared conventions; a stall over 10 minutes gets a fresh key and a linted prompt.

Recurring identity, style, locations, plates, vehicles, props, voices, and rights belong in durable Elegiac memory. Reuse approved assets. A missing or ambiguous required anchor blocks generation rather than permitting a generic substitute.

## HyperFrames handoff

Before the first cut is built, resolve the show's **brand punctuation package** (`references/branding.md`): series mark, sonic sting, typography/colour from the fonts HyperFrames can supply, bookend ground (never bare black), Episode 1 versus later opening policy, end-card behaviour, and credits. Read it from the series manifest when it exists; otherwise ask the user once for files or permission to generate (quoted), or record an explicit waiver with a reason. Microdrama branding is bookends, not an intro: no title sequence, theme song, "previously on", or rolling credits, and the cliffhanger frame stays untouched until the hard cut. The validator refuses a manifest without a `branding` block.

For fresh post, export/freeze all approved sources locally, initialize a HyperFrames project, then run:

```bash
node <installed-skill>/scripts/validate-episode-manifest.mjs <edit-manifest.json> --root <production-kit-root> --write-hashes
node <installed-skill>/scripts/build-edit-handoff.mjs <edit-manifest.json> --root <production-kit-root> --output <hyperframes-project>/BRIEF.md
```

Load the installed `hyperframes` skill and let its `general-video` workflow own composition, graphics, deterministic checks, preview, and render, under the house rules in `references/edit.md`: dialogue from original stems, ducking by timeline tweens (never automation lanes), one sub-composition per scene, normalised beds, no burned captions by default, bookends from the template. `BRIEF.md` carries the branding package and the house rules; HyperFrames places only what it names and never invents placeholder logos, stings, or credits. For an existing HyperFrames project, request only the named edit or validation operation. No composition may fetch remote media at render time. The user approves the final Studio preview (or a disclosed draft render) before any render; renders use `--low-memory-mode`.

Large local masters may not fit the current MCP upload path. If registration cannot be completed, deliver the verified local files plus a review proxy under 30 MB and mark the final **not registered in Elegiac**; never imply a successful round trip.

## Definition of done

A finished episode has a coherent hook/turn/cliffhanger and loop ledger; a duration budget that passed at script stage; a coverage set; every still `pass` through the continuity gate and an approved stills animatic; frozen, hashed sources including the branding package; a passing manifest; a passing HyperFrames check; an inspected and approved preview; and a probed output at the declared dimensions, duration, frame rate, video/audio streams, and codec. Deliver the master, review proxy, sidecar captions, poster frame, edit/delivery manifests, credit summary including stuck jobs, Board link, and explicit omissions.
