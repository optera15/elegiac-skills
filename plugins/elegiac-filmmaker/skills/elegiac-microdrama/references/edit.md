# Wizard: Edit a MicroDrama

## Supported inputs

An Elegiac Episode Board, `export_pack` result, exported Production Kit, local clips/stems, an existing HyperFrames project, or a rough episode needing pacing, captions, sound, titles, or continuity repair.

## Workflow

1. **Inventory read-only.** Resolve the script/blueprint and probe each file's duration, dimensions, frame rate, codec, audio streams, name, and source (`ffprobe`). Default-pipeline clips are **768 × 1344 at 24 fps** from H3 Max Turbo, and any VEED-lipsynced clip comes back at **25 fps**; note both and conform once in the composition. Detect missing, duplicate, unapproved, or draft-only shots, and any shot whose `continuity.status` is not `pass`.
2. **Diagnose.** Separate story/pacing, picture continuity, performance/lipsync, framing/safe zones, dialogue intelligibility, music/SFX, captions, graphics/CTA, and delivery issues. A picture-continuity problem found here means the continuity gate was skipped or failed; say so and route the still back through `continuity-gate.md` rather than trying to hide it in the cut.
3. **Propose the cut.** Present ordered shots with trim, duration, transition, audio, and caption notes, ending on the cliffhanger frame. Mark each item `editorial`, `asset substitution`, or `new generation`. If the story cut is over the profile target, the proposal includes a specific trim list, not a binary "accept the exception". Editing never silently authorizes generation.
4. **Freeze approved sources.** Export/download them into the Production Kit with `curl` (not a Python downloader; the local Python may lack a certificate store), retain Elegiac asset IDs or explicit user provenance, and compute SHA-256 hashes. HyperFrames may not fetch remote media during render.
5. **Prefer editorial repair.** Trim dead air; reframe; use approved inserts, reactions, still holds, J/L cuts, dialogue stems, ambience, and caption timing. Try a surgical image/audio fix before proposing regeneration. Quote any replacement separately.
6. **Resolve the brand punctuation package.** Run the pre-render branding checklist in `branding.md` **before the first cut is built**, so the bookends are built once: reuse `series-manifest.branding` when it exists; otherwise ask the user once for the series mark, sonic sting, typography/colour, bookend ground, opening and end-card policy, and any required credits, offering a recommended default and quoted generation for each, and record explicit waivers with reasons. Freeze provided or generated files into `brand/` and hash them. Do not proceed to the manifest with the package unresolved.
7. **Write `edit-manifest.json`.** Use `schemas.md`, including the `branding` block copied from the series package; `captions.burnIn` is `false` unless the user asked for burned-in captions. Run the validator from the Production Kit root. Resolve every error before generating a handoff.
8. **Enter HyperFrames correctly.** For a fresh project, initialize it first, then build `BRIEF.md`; load the installed `hyperframes` entry skill and follow its `general-video` route. Fast Track maps to `flow: automation`; Co-Creator/Director or an edit department override maps to `flow: companion`. For an existing project, make only the requested edit and preserve its brief/state. `build-edit-handoff.mjs` owns `BRIEF.md` and regenerates it on every run, preserving only an `## Editor notes` section if one exists.
9. **Compose to the house rules** (each one cost a rebuild on Tessa S01E01):
   - **Dialogue** comes from the original stems — the same take that drove each lipsync — placed at the cut's start plus the speech lead; a clip's own audio track is never used.
   - **Ducking and fades are timeline volume tweens** (`tl.to("#bed", { volume: … })`), never `data-automation` lanes. Automation lanes route the element through WebAudio in Studio, stutter the beds, and mute the native dialogue elements, so the preview cannot be trusted and the user hears no voices.
   - **One sub-composition per scene or location**, not one monolithic `index.html`: a single track with more than twenty timed elements trips `timeline_track_too_dense` and hides real warnings.
   - **Beds are normalised** to about −24 dB mean before placement (`ffmpeg -af loudnorm` or a measured gain), music sits around −20 dB below dialogue peaks, dialogue is untouched; ducking dips beds to roughly 45 % with 80 ms ramps. A generated bed shorter than the story is tiled with 2 s crossfades and disclosed.
   - **No burned-in captions by default.** The platform overlays its own; a caption pill in the picture is distracting and doubles the caption-zone risk. If burn-in is requested, use one tested caption component with `bottom:auto; height:auto; align-items:flex-start` on the container so the `.clip{inset:0}` rule cannot stretch it.
   - **Fonts** come from the list HyperFrames can supply from Google Fonts (Inter, Bebas Neue, JetBrains Mono, Space Grotesk, …); Inter Tight is not among them.
   - **Sub-composition asset paths are root-relative.** Inside `compositions/<scene>.html`, write `src="assets/…"`, never `src="../assets/…"`. Renders rewrite the parent traversal but Studio resolves it against the project root and 404s; `lint` fails it as `invalid_parent_traversal_in_asset_path`.
   - **Alternate the dialogue track indices.** Consecutive lines that abut by a few milliseconds raise `duplicate_audio_track` on a shared lane. Putting odd lines on one index and even lines on another silences the warning without changing a frame.
   - **Cue music, do not bed it.** Cut the cue to the exact gap between two shots with its fades baked into the file. It then physically cannot swell under the cliffhanger, and no timeline tween can be got wrong later.
   - **Drive the whole cut from one script.** Keep a single `post/build-cut.py` (or equivalent) whose top is a literal table of `(shot, source, in, out, role, dialogue, sfx)` and whose body regenerates `edit-manifest.json`, the captions and every composition file. Every note from the user then becomes a one-line change plus a rebuild, the trims stay reviewable in one place, and the manifest can never drift from the composition. This one habit carried Another League through eleven revisions of the cut without a single hand-edited HTML file.
   - **Bookends** follow the template in `branding.md`: full-bleed brand ground, mark at 60–70 % of frame width, no blend-mode tricks to hide a mark's own background (use a transparent PNG).
10. **Verify and approve.** Run `hyperframes check --snapshots` at hero timestamps, inspect shot/scene midpoints and first/last frames, watch once muted and once with sound, proof the sidecar captions in the preview, confirm the story cut and the bookends (cliffhanger frame untouched, end card 0.5–1.5 s, sting inside the end card, nothing after it but declared end matter), and obtain explicit final Studio preview approval. **Judge sound from a draft render, never from Studio.** A microdrama timeline carries thirty-odd audio elements and the Studio player stutters badly under that load; on Another League the user reported "choppy unlistenable audio" from a preview whose render was clean. Say this before handing over a preview link, and attach a `--quality draft` render (about two minutes for 90 s) whenever the note is about sound or timing. Do not ship a mix nobody has heard.
    - **A concat rough is not a proof of sync.** A rough assembled by stitching the lipsync files plays each clip's own baked audio, so it will look perfect while the real edit — which takes dialogue from separate stems — drifts. Build the rough from the same source list the edit manifest will use, or treat it as picture-only.
11. **Render.** Always with the low-memory flag for a vertical over 60 s; frame capture otherwise needs more than 20 GB of scratch:

    ```bash
    HYPERFRAMES_BROWSER_PATH="<chrome>" npx hyperframes render post/hyperframes --quality high --low-memory-mode --output deliverables/s01e01/<show>_S01E01_<title>_1080x1920_master.mp4
    ```

    Quality values are `draft`, `standard`, `high`. Probe the output (`ffprobe`), measure the mix (`volumedetect`), and pull the poster frame.
12. **Deliver.** Probe the master and return the declared output profile, SRT/VTT, poster, a **review proxy under 30 MB** (`--quality draft` or an ffmpeg CRF 30 transcode, so it can travel through chat and phone attachments), optional clean/textless master, edit/delivery manifests, hashes/source ledger, Board link, and explicit omissions. Upload/register only when a safe supported path exists.

## Fresh-project handoff

From the Production Kit root:

```bash
npx hyperframes init post/hyperframes --non-interactive --example=blank
node <installed-skill>/scripts/validate-episode-manifest.mjs episodes/s01e01/edit-manifest.json --root . --write-hashes
node <installed-skill>/scripts/build-edit-handoff.mjs episodes/s01e01/edit-manifest.json --root . --output post/hyperframes/BRIEF.md
```

The handoff builder is deterministic and spends no Elegiac credits. Run it only after the HyperFrames project exists because `BRIEF.md` lives inside it. Re-run it after every manifest change; it overwrites the generated sections and keeps `## Editor notes`.

## Current-alpha round-trip limit

`upload_asset` can register supported URL/base64 inputs, but a large rendered MP4 should not be base64-transferred merely to claim completion. When no secure large-media path is available, keep the verified master local, mark `registration.status` as `not_registered`, and tell the user exactly what remains. The review proxy is what travels; the master stays on disk.
