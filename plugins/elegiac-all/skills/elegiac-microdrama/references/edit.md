# Light assembly and finishing

## Scope

Accept Episode Boards, Production Kits, WAN scenelets or existing local edits. Edit-only work does not authorize new generations. Preserve legacy projects and their audio choices until explicitly migrated; version 1 manifests remain readable but must never silently adopt version 2 audio semantics.

## Workflow

1. Inventory selected takes and probe actual duration, dimensions, fps and audio streams. Freeze local sources with provenance/hashes. Resolve the selected usable range and its reviewed beginning/end state.
2. Prefer scenelet order and minimal clean boundary trims. Keep model-generated internal cuts intact unless the user requests an edit or a local defect can be repaired without changing intent. Do not force every line onto a separately generated single.
3. **Preserve native audio.** Version 2 clips carry audioMode native and one audioSource per episode: native. Picture trims use the matching native-audio range. Do not replace the generated dialogue with ElevenLabs voice-reference samples or play both. A native scenelet's audio already contains dialogue/ambience and possibly effects; avoid duplicate beds.
4. For an explicitly needed J/L edit, extract the SAME generated clip's audio losslessly or to a documented derivative, retain source hash and offsets, and mute only that clip's duplicated playback path. Record audioMode extracted and exactly one audio.native entry linked by sourceShotId (the cut's shotId), sourceSceneletId and sourceVideoSha256. This is a post edit of WAN sound, not external re-voicing. The standard validator supports aligned extracted tracks; advanced split edits need a dedicated reviewed edit contract, not falsified offsets.
5. Resolve compact branding using branding.md. The 60–90-second episode goal includes all bookends; targetDurationSeconds in version 2 is TOTAL, not story-only. Do not add unbudgeted intros.
6. Write version 2 edit-manifest.json, keeping separate generation/source and editorial durations. Each clip has stable cut ID (shotId retained for handoff compatibility), sourceSceneletId, probed sourceSpec including durationSeconds/hasAudio, in/out, audioMode, pass review and approved state. Source specs are measured per clip, not inherited from a model name.
7. Run validate-episode-manifest.mjs with actual files/hashes, then build-edit-handoff.mjs. Initialize a fresh HyperFrames project before writing its BRIEF; use installed hyperframes/general-video guidance only for assembly/finishing. An existing project gets only the requested changes.
8. Keep source video and its native audio synchronized through the framework's media timing. Use one sub-composition per scenelet when useful, local root-relative paths, deterministic timing, captions as sidecar by default and only the specified branding. Music/SFX are optional and must not mask native dialogue. Follow current HyperFrames audio guidance; do not impose an old global mute or old player workaround blindly.
9. Generate/verify captions from the actual accepted speech, matched to the approved script. Do not use captions to conceal a wrong line. Review all joins and full export with sound. If preview and export disagree, diagnose playback before replacing media.
10. Render the declared master, using low-memory rendering where supported/needed. Probe streams, exact total runtime and dimensions; disclose 720p-to-1080p conform. Deliver proxy, sidecar captions, poster, manifests, credit/registration status and omissions. No render-time remote media.

## Final Cut Pro handoff (optional)

When the editor cuts in Final Cut Pro instead of HyperFrames, write an FCPXML 1.11 timeline from the same validated version 2 manifest:

```bash
node <skill>/scripts/build-fcpxml.mjs episodes/s01e01/edit-manifest.json --root <kit> --output episodes/s01e01/S01E01.fcpxml
```

The script validates the manifest first (same rules as validate-episode-manifest.mjs; `--allow-unapproved` / `--skip-files` pass through) and refuses invalid input. It writes one project/sequence at the manifest canvas and fps (1080×1920 by default), one primary-storyline clip per manifest clip using the frozen localPath, inSeconds/outSeconds and, when present on every clip, timelineStartSeconds (else sequential), a Cross Dissolve for each transitionOutSeconds trimmed so the timeline runtime equals the manifest's story runtime, a marker at every clip start named by shotId, `audio.music[]` as a connected music lane with volume keyframes from `volumeKeyframes: [{ atSeconds, gainDb }]` (seconds on the story timeline) or a flat `gainDb`, and, for extracted-mode clips, the clip's embedded audio pulled down with the linked native track connected on its own lane. Bookends are not emitted; add the splash/blackout/end card from BRIEF.md in Final Cut. All times are whole-frame rationals (`<frames>/<fps>s`) at the canvas fps, so a fractional in/out point rounds to the nearest frame (up to half a frame per cut) and the reported runtime can differ from the manifest's by a few hundredths of a second.

Import with File → Import → XML, choosing the `.fcpxml` file; Final Cut relinks the `file://` media paths resolved from `--root`, so import from the same machine or relink to the copied kit. Re-run with `--force` after any manifest change; the FCPXML is derived, never hand-edited, and it does not replace the manifest as the edit's source of truth.

## Revisions

Apply available notes together; hold export when the user says more notes are coming. Preserve original takes, request payloads, credits and approvals. Rebuild timing/captions from one edit source of truth. A new generation needs its own quote and scoped authorization. Do not insert generic cutaways that create new geography or voice problems.

## Version 1 projects

The validator still accepts version 1 for editing historical work and keeps its story-only target calculation. A legacy handoff must follow recorded audioSource/audioMode rather than assume native sound. Migration is explicit and non-destructive (schemas.md). Do not invoke retired generation scripts or regenerate old shots just because the skill changed.
