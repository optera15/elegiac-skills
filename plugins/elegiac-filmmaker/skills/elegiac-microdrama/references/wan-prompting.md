# WAN 3.0 multi-shot prompt design

Read after the scenelet story and references are approved. This is a directing contract, not a bag of quality adjectives. One timestamped prompt string produces one coherent scenelet; no Kling multiPromptShots generation array.

## Prompt order

1. Duration, native 9:16 format, visual style, native sound; state whether this is one shot or several.
2. Numbered reference roles. Image 1 etc. map to the actual image array; Audio 1 etc. map separately to the audio array. Name the character for each. Sheet panels represent one identity, not an ensemble.
3. Story purpose and opening state. Explain what must change by the end and what must not happen.
4. Per-character inner logic from craft.md. Connect motivations, insecurities, suspicion/knowledge, hidden agendas or none, mood, tactics, feelings and attitudes to visible behavior and the intended emotional turn.
5. Ordered contiguous shot windows. Each contains framing, action, exact named dialogue, delivery, listener behavior and motivated transition.
6. Ending state and a short sound/continuity contract.

Use the minimum number of internal cuts that serves the scene. Roughly 3–5 internal shots can work for a 20–30-second scene, but this is not a requirement. A two-shot can carry several lines. Camera moves follow the beat, not a mandatory handheld or push-in policy. Do not ask for a continuous take and hard cuts simultaneously.

## Voice/reference discipline

The samples establish voice identity and useful emotional register; the prompt supplies the full script. Say explicitly not to repeat sample words unless in the script. Name the speaker at EVERY line, including off-screen speech. Say what the visible listener does and that the listener is not speaking that line. For more than two speakers, explain why the scene cannot be simplified and review attribution carefully.

Example ElevenLabs sample:
- Earnest embarrassment: "[sighs] She lent me a pencil. … In seventh grade."
- Warm surprise: "[softly] Okay. [light chuckle] You kept it safe."

These are illustrative delivery choices, not mandatory tags or a rewrite of approved dialogue. Audition tags; remove a chuckle if it makes kindness sound mocking. Use assigned Voice IDs, dry solo audio and measured excerpts. All files together <=15 seconds; the script can contain more than 15 seconds of dialogue in a longer scenelet.

Do not claim that WAN will preserve the sample waveform or exact timing. Never instruct both "copy this recording exactly" and "use only its voice characteristics."

## Example directing passage

```text
Create a 15-second 9:16 naturalistic dramatic-comedy scene with native sound.
Image 1 is Dylan's identity sheet; Image 2 is Logan's. Each sheet shows one
person in multiple views, not people to duplicate. Image 3 is the autumn
school-lot master. Compose vertically without borders.
Audio 1 is Dylan's voice; Audio 2 is Logan's. Use their voices to perform the
quoted script, not the recordings' words.

Dylan wants an ordinary favor to disguise an enormous emotional investment.
He fears looking ridiculous, hopes for contact with Sienna and has no scheme
to hurt Logan. He is sincere, tightly composed, not sneaky or petulant.
Logan wants to help and keep things easy. He suspects the crush, feels fond
amusement, has no hidden agenda and is not jealous. His warmth is essential.
One folded poem and pencil stay together with Dylan throughout. Logan has
intercepted Dylan before he can approach the car; neither advances toward it.

SHOT 1 — 0–6s: Waist-up two-shot. Logan settles beside Dylan, easy eye contact.
Logan asks casually, "You looking for Sienna?"
Dylan replies promptly, "She lent me a pencil."
Logan listens; Dylan protects the small bundle without waving it.

SHOT 2 — 6–10s: Cut to Logan's reaction.
Logan says warmly, "Okay." A small eyebrow lift invites explanation.
As it settles, Dylan says off-screen, "In seventh grade."
Hold on Logan listening with his mouth closed. No extra reaction angle.

SHOT 3 — 10–15s: Cut back to the two-shot. Dylan glances down.
Logan looks at the bundle and says kindly, "You kept it safe."
Dylan's brief, nonverbal embarrassed glance lands the joke. No added reply or long empty stare.
End with the same pencil/page in Dylan's hand and both men still together.

Natural American English, exact lines once and in order, no added dialogue.
Each voice stays with its named character. No music, narrator or subtitles.
Keep faces, wardrobe, prop ownership, geography and afternoon light stable.
```

The time windows are directional, not a promise of frame-accurate cuts. Read the words aloud and allow necessary action; do not pack the final line at the last instant.

## Boundary and insert prompts

For the next scenelet, begin from the selected take's ACTUAL end state. Carry location/light/wardrobe and knowledge forward, but do not silently accept a mistaken plot action. An ellipsis must be intentional and intelligible.

A drawer insert needs one action, not an artificial multi-shot sequence: whose hand (sheet identity and exact sleeve/jewelry), which desk/drawer (location), what it contains, what moves and the final object state. Use WAN with matching scene style, 9:16 and a short supported duration. A 3-second insert can end on a hand closing around the one pencil; do not invent a full exchange or new actor.

## Integration

Recheck get_model_schema("wan-3") before submissions. Explicit Standard/720p/9:16/duration/native audio avoids different service defaults. Current image/audio numbering is Image 1 / Audio 1; a start image alongside references can shift numbering, so omit it in this pack. No default video references. See production-pipeline.md for limits and field-notes.md for quote-validation issues.

The compiler builds the same sections from the blueprint, but cannot certify good acting direction. Review its text for contradictions, crowded shot windows, vague pronouns, speaker swaps and unintended emotion before spend.
