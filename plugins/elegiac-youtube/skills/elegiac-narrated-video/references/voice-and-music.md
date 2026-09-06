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

- **VEED Lipsync V2** (`veed-lipsync-v2`) is the microdrama default: `generate_lipsync` with `videoUrl` + `audioUrl`, 14 credits per second, no sync modes — clip and stem must be within about half a second of each other, so generate the clip at the stem's length plus a 1 s handle. Source clips should be generated **non-speaking** (no dialogue, no lip movement in the video prompt) so the sync has nothing to fight.

- Input video should be a clean talking-framing: MCU/CU, subject facing camera within ~30°, mouth unobstructed, minimal fast head motion.
- Generate the speech first, approve the read, *then* run lipsync — re-syncing is cheaper than re-voicing.
- Match clip and audio durations; trim audio leading silence.
- Real-person likeness + cloned/derived voice = consent required on **both** axes (see `elegiac-conventions.md`).

## Synthetic-voice disclosure

Ads and spokesperson content using synthetic voices/personas should be disclosed where platform policy requires (most paid placements now do). Flag this to the user when building ad audio; don't silently ship undisclosed synthetic testimonial reads.
