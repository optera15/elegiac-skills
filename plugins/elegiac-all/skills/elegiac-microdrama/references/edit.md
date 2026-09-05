# Wizard: Edit a MicroDrama

## Supported inputs

An Elegiac Episode Board, `export_pack` result, exported Production Kit, local clips/stems, an existing HyperFrames project, or a rough episode needing pacing, captions, sound, titles, or continuity repair.

## Workflow

1. **Inventory read-only.** Resolve the script/blueprint and probe each file's duration, dimensions, frame rate, codec, audio streams, name, and source. Detect missing, duplicate, unapproved, or draft-only shots.
2. **Diagnose.** Separate story/pacing, picture continuity, performance/lipsync, framing/safe zones, dialogue intelligibility, music/SFX, captions, graphics/CTA, and delivery issues.
3. **Propose the cut.** Present ordered shots with trim, duration, transition, audio, and caption notes. Mark each item `editorial`, `asset substitution`, or `new generation`. Editing never silently authorizes generation.
4. **Freeze approved sources.** Export/download them into the Production Kit, retain Elegiac asset IDs or explicit user provenance, and compute SHA-256 hashes. HyperFrames may not fetch remote media during render.
5. **Prefer editorial repair.** Trim dead air; reframe; use approved inserts, reactions, still holds, J/L cuts, dialogue stems, ambience, and caption timing. Try a surgical image/audio fix before proposing regeneration. Quote any replacement separately.
6. **Write `edit-manifest.json`.** Use `schemas.md`; run the validator from the Production Kit root. Resolve every error before generating a handoff.
7. **Enter HyperFrames correctly.** For a fresh project, initialize it first, then build `BRIEF.md`; load the installed `hyperframes` entry skill and follow its `general-video` route. Fast Track maps to `flow: automation`; Co-Creator/Director or an edit department override maps to `flow: companion`. For an existing project, make only the requested edit and preserve its brief/state.
8. **Verify and approve.** Run HyperFrames checks, inspect shot/scene midpoints and first/last frames, watch once muted and once with sound, proof captions, confirm exact duration, and obtain explicit final Studio preview approval. Then render.
9. **Deliver.** Probe the master and return the declared output profile, SRT/VTT, poster, optional clean/textless master, edit/delivery manifests, hashes/source ledger, Board link, and explicit omissions. Upload/register only when a safe supported path exists.

## Fresh-project handoff

From the Production Kit root:

```bash
npx hyperframes init post/hyperframes --non-interactive --example=blank
node <installed-skill>/scripts/validate-episode-manifest.mjs episodes/s01e01/edit-manifest.json --root . --write-hashes
node <installed-skill>/scripts/build-edit-handoff.mjs episodes/s01e01/edit-manifest.json --root . --output post/hyperframes/BRIEF.md
```

The handoff builder is deterministic and spends no Elegiac credits. Run it only after the HyperFrames project exists because `BRIEF.md` is created after initialization.

## Current-alpha round-trip limit

`upload_asset` can register supported URL/base64 inputs, but a large rendered MP4 should not be base64-transferred merely to claim completion. When no secure large-media path is available, keep the verified master local, mark `registration.status` as `not_registered`, and tell the user exactly what remains.
