# Voice, Music & SFX Direction

Direction language for Elegiac's audio generation (ElevenLabs V3 speech, music, SFX) and lipsync constraints.

## Voice casting vocabulary

Describe a voice on four axes — give all four when casting:

- **Age/weight:** "mid-30s, medium-low register" / "elderly, papery"
- **Texture:** warm, gravelly, breathy, bright, nasal, smoky, clipped
- **Energy:** intimate close-mic, conversational, projected, hushed urgency
- **Provenance:** regional/accent notes only when story-relevant; otherwise "neutral"

Example: "Female, late 40s, low warm register, slight rasp, intimate close-mic delivery, neutral accent."

## Performance direction (ElevenLabs V3)

V3 responds to inline audio tags and stage direction. Use sparingly — 1-2 tags per line:

- Emotion tags: `[whispers]`, `[sighs]`, `[laughs]`, `[sarcastic]`, `[excited]`, `[crying]`
- Pacing: ellipses … for hesitation; em-dash for interruption; short sentences read faster
- Emphasis: CAPS for a single stressed word (don't overuse)

Write the line *as performed*, not as written prose: "I told you— [sighs] …it doesn't matter now."

## Dialogue scene audio

- Generate each character's lines as separate speech jobs (separate voices), not one block — you'll need them per-shot for lipsync and editing.
- Keep takes short (one beat per job). Long takes drift in energy.
- Record a "room tone note" in the brief if the scene needs consistent acoustic space ("small tiled room, slight echo").

## Trailer / narration VO

Trailer register: slower than conversation, downward inflections, hard consonant endings. Direct it: "Measured trailer narration, deliberate pauses between sentences, low intensity rising on the final line."

## Music briefs

Structure: **genre anchor + instrumentation + tempo + emotional arc + duration + hits.**

> "Minimal post-rock score, clean electric guitar and soft synth pads, 70 bpm, melancholy building to cautious hope, 45 seconds, swell at 0:30, soft out."

- Anchor to a *genre tradition*, not an artist name.
- For trailer use, specify the silence: "hard drop to silence at 0:50 for two beats, then climax."
- Loopable social beds: "seamless loop, no intro/outro, consistent energy."

## SFX briefs

One sound per job, concrete and physical: "heavy wooden door slams, large empty hall reverb" / "rain on a car roof, interior perspective, steady." Ambient beds: name the space + 2-3 sources + "steady, no events."

## Lipsync constraints (VEED Lipsync V2, Sync Lipsync V2 Pro)

- **VEED Lipsync V2** (`veed-lipsync-v2`) is the microdrama default: `generate_lipsync` with `videoUrl` + `audioUrl`, flat 140 credits per call, and it **does** accept `syncMode` (`cut_off` default, plus `loop`, `bounce`, `silence`, `remap`).
- **Always give it more picture than audio.** Generate the clip at the stem's length plus a 1–2 s handle. The two failure modes are asymmetric and both are ugly: audio longer than video makes VEED **run the picture backwards** to fill the gap, and video longer than audio makes `cut_off` **truncate the picture** to the audio, throwing away any action after the line. Trailing silence inside the stem counts as audio in both directions.
- **Do not pad a stem to match the clip.** Padding is what manufactures the reversal above. Keep a padded copy for editorial handles if you want one, drive the lipsync with the tightest stem, and cut the finished shot on the last word. `syncMode: "silence"` does *not* pad — tested on exactly this case, it still trimmed to the audio length.
- **Let the source clip talk.** Older guidance said to generate clips non-speaking. That is wrong twice: video models ignore negations like "no lip movement" and render talking mouths anyway, and VEED overwrites the mouth region wholesale, so an already-articulating face gives it *better* geometry than a closed one. Write the motion prompt with no speech vocabulary at all, not even in the negative prompt, and let VEED do its job.
- **A lipsync is welded to the exact stem that drove it.** Re-read a line and the superseded take will silently drift the picture if the edit plays it. Match on asset id, never filename, and assert `|stem duration − lipsync duration| < 0.2 s` before rendering. Trimming a lipsynced shot means trimming picture and stem by the same amount.
- **When a long action clip carries a short line**, lipsync it and then splice locally with ffmpeg: VEED's head up to the end of the line, then the original clip from that point. Free, frame-accurate, and the action survives.
- Input video should be a clean talking-framing: MCU/CU, subject facing camera within ~30°, mouth unobstructed, minimal fast head motion.
- Generate the speech first, approve the read, *then* run lipsync — re-syncing is cheaper than re-voicing.
- VEED returns **25 fps** whatever went in; conform in the edit and disclose it.
- **There is no voice changer in Elegiac.** Every audio model is text-to-something; speech-to-speech conversion of a generated performance into a cast voice is not available through the connector. Do not design a pipeline around it.
- Real-person likeness + cloned/derived voice = consent required on **both** axes (see `elegiac-conventions.md`).

## Synthetic-voice disclosure

Ads and spokesperson content using synthetic voices/personas should be disclosed where platform policy requires (most paid placements now do). Flag this to the user when building ad audio; don't silently ship undisclosed synthetic testimonial reads.
