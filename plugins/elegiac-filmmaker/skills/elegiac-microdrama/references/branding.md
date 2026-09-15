# Compact series branding

Reuse the show's approved package. Bookends are punctuation, not an intro sequence, and count inside the 60–90-second episode runtime (ideally 75 seconds). The scenelet pilot does not need a new logo or sting; resolve branding before final assembly, not before proving performance.

## Package and timing

- seriesMark: provided frozen transparent image, typographic title/font, or explicitly waived with reason.
- sting: provided frozen audio (0.3–3 seconds) or explicitly waived with reason.
- typography/palette: reuse approved style and fonts available in the current renderer. Never invent placeholder brand assets.
- opening: none, overlay-mark (no added runtime), or splash (0.5–2 seconds). Later episodes normally use none/overlay. A splash must not delay the first-three-second hook or interrupt dialogue inside a scenelet.
- endCard: none, mark-only or mark-and-sting, 0.5–1.5 seconds; optional blackout 0–0.5. Let the cliffhanger land before the cut; no fade or sting masks its final words.
- credits: none unless required; short end-matter 0.5–3 seconds, after the dramatic ending, never a rolling sequence.
- ground: approved full-bleed gradient, texture or plate treatment. Check readability at phone size and real alpha on provided marks. Do not fake transparency with blend modes.

Store the resolved package in series-manifest.branding; copy the correct episode1/later opening into edit-manifest.branding. Provided sources use provenance, localPath, sha256 and approved fields. Typographic marks require title/fontFamily; waivers require reasons. Changes between episodes are recorded rebrands, not accidental drift.

## Workflow

Read existing files before asking. Consolidate missing brand decisions into one question only when they affect the requested deliverable. Generate missing media only when authorized and quoted with the currently supported model. Inspect/approve/freeze it; do not generalize a past model price or one rejected logo into a universal rule.

Use restrained, legible composition: mark around 60–70% frame width on a splash, smaller on an end card, with approved palette/font. Choose sting timing so its tail stays inside the allocated bookend. Do not add themes, recaps, next-episode trailers or episode-title cards that interrupt story unless the user explicitly changes the format.

validate-episode-manifest.mjs reports story + bookends = master. Version 2 compares this TOTAL with targetDurationSeconds; version 1 retains historical story-only semantics. The preview is the assembled native-audio scenelets with branding, not a prerequisite stills animatic.
