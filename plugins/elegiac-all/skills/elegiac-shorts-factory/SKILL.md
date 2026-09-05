---
name: elegiac-shorts-factory
description: Create YouTube Shorts natively with Elegiac — hook-first vertical clips, loop-seam endings, talking Shorts, batched series with consistent style. Use when the user asks for YouTube Shorts, Shorts from an idea or board, vertical clips for a channel, or a Shorts series.
allowed-tools: Bash
argument-hint: "[topic/idea + how many Shorts]"
references:
  - youtube-creator.md
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Shorts Factory

Shorts-native creation — built 9:16 from the first frame, not cut down from a master. One idea per Short, hook inside the first second, ending that loops.

Read the Shorts mechanics in `references/youtube-creator.md` and the 9:16 safe areas in `references/platform-specs.md`. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. **Ideate first** (zero spend): from the topic, pitch N hook concepts — each one line: the first-second visual + the on-screen text question/claim. The user picks before anything generates. A concept that needs context is rejected: one idea per Short.
2. **Structure per Short:** hook (≤1s, mid-action) → payoff beats → **loop seam** (final frame composed to match the opening frame, so the auto-replay is invisible).
3. **Generate at 9:16 from the start:** `generate_video` for text-to-video, `animate_image` to animate a keyframe. Keep faces and on-screen text in the caption-safe middle 65%.
4. **Talking Shorts:** script the line (≤15s of speech), `generate_audio` speech, clean talking framing, `generate_lipsync` — same voice-first discipline as dialogue work.
5. **Series consistency:** lock the look as a style system; for recurring weekly batches run through campaign memory (`continue_campaign`) so week 4 matches week 1. Collect on a Shorts board in publish order.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Per Short: the hook line, the on-screen text, the URL, and a loop-seam note. For batches, publish order with the suggested caption/text overlay per Short.

## Related skills

- Re-versioning an EXISTING long-form master instead → `elegiac-platform-cutdowns`
- The posting cadence around the Shorts → `elegiac-content-calendar`
- Long-form companions → `elegiac-narrated-video`
