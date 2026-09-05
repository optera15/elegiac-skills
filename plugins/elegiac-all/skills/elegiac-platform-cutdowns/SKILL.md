---
name: elegiac-platform-cutdowns
description: Re-version an existing master with Elegiac — vertical versions, 30/15/6-second ladders, platform-native re-compositions of a hero spot or trailer. Use when the user asks to "cut this down", make a vertical/TikTok/Shorts version, a 6s bumper, or platform sizes of an existing video.
allowed-tools: Bash
argument-hint: "[the master asset + target platforms]"
references:
  - platform-specs.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Platform Cutdowns

**Honest framing first:** Elegiac is not an editor — it cannot trim or crop an existing video file. What it CAN do is *regenerate platform-native versions* from the same boards, references, prompts, and style system that made the master. That's usually better than a crop anyway: a 9:16 version should be re-composed, not amputated.

Read the duration ladders and safe areas in `references/platform-specs.md`. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. **Find the master's DNA** (zero spend): `get_workflow_run` / `get_board` for the source — its prompts, references, style system, and cast. The cutdown inherits all of it.
2. **Cut the idea, not the timeline.** Per the ladder in `platform-specs.md`: 30s keeps one act and one promise; 15s keeps one moment + CTA; 6s is one image, one line, logo. Write the cutdown plan and present it.
3. **Regenerate per spec:** `generate_video` (or `animate_image` from the master's hero frame) at the target aspect/duration, re-centering the subject for vertical (faces move to center-frame upper third), keeping captions inside the platform's safe area.
4. **Park results with the master:** `add_workflow_results_to_board` on the same board so the family stays together.
5. If the user needs the actual master FILE trimmed, say so plainly and deliver the regenerated natives plus a cut plan their editor can apply.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

URLs grouped by platform with the spec each satisfies ("TikTok 9:16, 14s, caption-safe: <url>") and a note on what idea each rung kept.

## Related skills

- Shorts built natively rather than cut down → `elegiac-shorts-factory`
- The master itself → `elegiac-trailer-kit` / `elegiac-campaign-pack`
- Message-level variants rather than sizes → `elegiac-ad-variants`
