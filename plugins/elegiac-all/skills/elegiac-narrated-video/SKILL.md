---
name: elegiac-narrated-video
description: Produce faceless narrated YouTube videos with Elegiac — script beats, narration, matched visuals, music bed, delivered as timed segments. Use when the user asks for a faceless video, video essay or explainer visuals, or "turn this script into a YouTube video".
allowed-tools: Bash
argument-hint: "[the script or topic + target length]"
references:
  - youtube-creator.md
  - voice-and-music.md
  - shot-grammar.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Narrated Video

The faceless-channel pipeline: script → narration → beat-matched visuals → music → timed segments, delivered with a timing manifest.

Read the originality rules and retention pacing in `references/youtube-creator.md` FIRST; narration direction in `references/voice-and-music.md`. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Originality guardrails (non-negotiable)

- **Original scripts required.** Never generate near-duplicate videos from a keyword-swapped template — that is exactly what YouTube's reused/mass-produced content policies demonetize. If the user brings a templated pipeline, say why it will fail and offer to make each script specific.
- Realistic synthetic content (AI visuals presented as real, synthetic narration as a real person) needs YouTube's altered-content disclosure — flag it.
- Quality bar: specific, scripted, designed beats. Generic stock-like visuals over monotone narration is the demonetization profile — push against it.

## Workflow

1. **Beat the script** (zero spend): break it into 15-45s beats. Per beat: narration text, the ONE visual that carries it, hold-or-move. Apply retention pacing — cold open from the strongest beat, pattern interrupt every 30-60s, cut every ~15s. Present the beat sheet.
2. **Narration first:** `generate_audio` type speech per section (directed per `voice-and-music.md`), and **approve the read before any video spend** — audio is cheap, the visuals that follow are not. Note each section's duration; it drives the timing manifest.
3. **Visuals per beat:** `generate_storyboard` with explicit frames (one per beat, style system + verbatim lighting key for series consistency). Animate only the beats whose meaning is motion (`animate_board_frame`, 5s) — most beats hold as stills.
4. **Music bed:** `generate_audio` type music matching total runtime and the script's emotional arc.
5. **Deliver:** collect on a board; `export_pack` for the files; hand over the **timing manifest** — beat #, narration text, audio segment, visual URL, duration, hold/move note — laid out exactly as it goes on a timeline.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The beat sheet, then the timing manifest with every asset URL in timeline order, plus disclosure notes if synthetic realism is involved. Final conform happens in the user's editor — state plainly what that includes (conform, slow push-ins on held stills, captions, final mix).

## Related skills

- Package the finished video (title/description/chapters) → `elegiac-video-packaging`
- A talking host instead of pure narration → `elegiac-dialogue-scene`
- Vertical companions → `elegiac-shorts-factory`
