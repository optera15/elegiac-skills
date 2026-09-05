# Prompt Patterns & Failure-Mode Fixes

Structures that make generations repeatable, and the cheapest-fix-first ladder when they go wrong.

## Still-image prompt skeleton

```
[shot size + lens] of [subject + one action], [setting], [lighting key],
[style/medium], [palette], [composition note]
```

Order matters: models weight early tokens. Framing first, subject second, style last. One action per subject — "she turns toward the window" not "she turns, smiles, and reaches."

## Continuity anchors

To keep a series coherent, repeat these *verbatim* across every prompt in the set:

- The **lighting key** sentence (see `shot-grammar.md`)
- The **palette** phrase ("desaturated greens, one warm practical")
- The **medium/style** phrase — or better, apply a style system by ID and don't restate style at all
- Character identity via **reference images** (cast refs), never via re-described appearance — text descriptions drift, references don't

The combination of {style system + cast refs + verbatim lighting key} is Elegiac's continuity stack. Use all three for any multi-frame work.

## Motion prompt skeleton (image-to-video)

```
[one camera move]. [one subject action]. [one atmosphere motion].
```

Keep under ~40 words. The start image already carries style — restating style in motion prompts causes drift. See `shot-grammar.md` for reliable moves.

## negativePrompt discipline

- A style system's `negativePrompt` is governance — pass it through untouched, never edit or "improve" it.
- Ad-hoc negatives: use sparingly, concrete nouns only ("text, watermark, extra fingers"); long negative lists degrade output.

## Failure modes → cheapest fix first

| Symptom | Fix ladder (stop at first success) |
|---|---|
| Ignored part of the prompt | 1) Move the ignored element earlier in the prompt 2) Cut competing clauses (prompt is overloaded) 3) Split into generate-then-edit |
| Mangled text/lettering | 1) Shorten to ≤4 words, quote them: title reads "DUSK" 2) Switch to a text-capable model (GPT Image 2) 3) Generate art clean + add text via edit pass |
| Hands/anatomy broken | 1) Reframe so hands are minor or occluded 2) Change the action verb (static poses break less) 3) Switch model family |
| Character looks different each frame | 1) Confirm cast reference images were actually passed 2) Reduce frame-to-frame wardrobe/lighting variation 3) Run make_board_character_consistent and regenerate from the consistent identity |
| Style drifting across a series | 1) Verify the same styleSystemId on every call 2) Add the verbatim continuity anchors 3) Generate keeper frame first, pass it as a reference to siblings |
| Motion is mush / morphing | 1) Simplify to one camera move 2) Shorten duration 3) Tier up the video model |
| Output too "AI-looking" | 1) Add medium specifics ("35mm film still, halation, grain") 2) Name a photographic/painterly tradition 3) Dial back contradictory style words |
| 422 / param rejected | 1) `get_model_schema` and diff your params against it — don't guess 2) Drop the rejected param (some models reject `aspect_ratio`, quality flags) |
| Content-policy rejection | 1) Check whether reference images are the trigger (photoreal people on strict models — see `model-catalog.md`) 2) Rephrase flagged nouns 3) Switch to a model family that accepts the refs |

## Draft-vs-final ladder

1K stills / 5s Seedance 2.0 Mini 480p video drafts (`qualityMode: "draft"`) → approve look → regenerate keepers only at 2K / final duration / 720p+ **with the same prompt + seed/idempotency discipline**, changing only resolution. Never iterate prompt wording at final quality.
