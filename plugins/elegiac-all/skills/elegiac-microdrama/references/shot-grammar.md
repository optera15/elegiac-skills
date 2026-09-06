# Shot Grammar & Lens Language

How to translate story intent into frame prompts and motion prompts that AI image/video models execute reliably.

The complete curated framing vocabulary (about 430 strings in 15 groups) is available live through `list_framings`; pass one string as the `framing` of an `enhance_prompt` shot rather than paraphrasing it.

## Shot sizes (and what they say)

| Size | Abbrev | Use it when |
|---|---|---|
| Extreme wide | EWS | Establish geography, isolate a figure in a world, scale and loneliness |
| Wide | WS | Establish a location or full-body action; opening a scene |
| Full | FS | Whole body, physicality, costume reads |
| Medium wide | MWS / cowboy | Groups, body language with environment context |
| Medium | MS | Default conversation shot; waist up |
| Medium close-up | MCU | Chest up; dialogue with rising stakes |
| Close-up | CU | Face fills frame; emotion is the subject |
| Extreme close-up | ECU | Eyes, hands, objects; tension, decision, detail-as-plot |
| Insert | — | An object the audience must register (note, weapon, screen) |

Prompt pattern: lead with the size — "Close-up of MIRA, ..." — models obey the first framing cue most strongly.

## Lens language (emotional, not technical)

| Focal length | Feel | Say it as |
|---|---|---|
| 18–24mm | Immersive, distorted intimacy or vast space; unease up close | "wide-angle 24mm, slight distortion, immersive" |
| 35mm | Documentary-honest, classic coverage | "35mm, natural perspective" |
| 50mm | Neutral, human-eye, unobtrusive | "50mm, natural framing" |
| 85mm | Portrait compression, flattering, isolating | "85mm portrait lens, soft compressed background" |
| 135mm+ | Voyeuristic distance, compressed traffic/crowds, surveillance feel | "long telephoto, heavily compressed background" |
| Macro | Object worlds, texture-as-story | "macro detail shot" |

Add depth-of-field intent explicitly: "shallow depth of field, background melts to bokeh" vs "deep focus, everything sharp."

## Camera movement verbs (image-to-video safe)

Image-to-video models execute simple, single movements well and combinations poorly. One movement per shot.

**Reliable:** slow push-in / dolly-in, slow pull-back, lateral tracking left/right, slow pan, slow tilt up/down, static with subject motion, handheld drift, orbit (quarter turn max), crane/boom up or down.

**Unreliable (avoid or simplify):** whip pans, snap zooms, dolly zoom (Vertigo), more than one move chained ("push in then pan"), fast 360 orbits, complex foreground occlusion passes.

Motion prompt pattern: `[camera move], [subject action], [atmosphere motion]` — e.g. "Slow push-in. She lowers the letter. Curtains breathe in the draft."

## Coverage patterns

Standard scene coverage to propose when breaking down a dialogue scene:

1. **Master** — wide, whole scene plays
2. **Singles** — MCU each speaker
3. **OTS pair** — over-the-shoulder both directions
4. **Inserts** — objects/hands referenced in dialogue
5. **Reaction** — the listener at the scene's turn

For action: master, then move-by-move mediums, then a detail (impact/hands), then a re-orienting wide.

## Screen direction & eyelines

- **180° rule:** keep the camera on one side of the action axis; characters in conversation look in *opposite* horizontal directions across cuts ("looking frame-left" / "looking frame-right"). Specify eyeline direction in every dialogue frame prompt or generated coverage will not cut together.
- A character exiting frame-right enters the next shot frame-left.
- Break the axis deliberately only on a story turn, and bridge it with a neutral (on-axis or overhead) shot.

## Lighting keys (continuity-critical vocabulary)

Name the key once per scene and repeat it verbatim in every frame prompt of that scene:

- "low-key single-source tungsten, hard shadows" (noir/interrogation)
- "soft toplight, overcast daylight through windows" (naturalistic drama)
- "golden hour backlight, lens flare, warm haze" (romantic/elegiac)
- "cold blue ambient + practical neon accents" (night city)
- "firelight flicker, warm low key" (period/intimate)

Time-of-day is part of the key. "Day" vs "dusk" vs "night, practicals only" must be stated, not implied.

## Transitions

When sequencing boards/animatics, note the intended cut: hard cut (default), match cut (name the matching shape/action), cross-dissolve (time passing), smash cut (contrast joke/shock), J-cut (audio leads). Only match cuts and dissolves change what you generate — the outgoing and incoming frames must share composition.
