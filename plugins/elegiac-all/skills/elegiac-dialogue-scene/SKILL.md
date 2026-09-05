---
name: elegiac-dialogue-scene
description: Create talking-character scenes with Elegiac — voice casting, line reads, lipsync, dialogue coverage. Use when the user wants a character to speak ("make her say this line"), a talking head, a voiced scene, lipsync, voice casting, or dialogue between characters.
allowed-tools: Bash
argument-hint: "[who says what, in which scene]"
references:
  - voice-and-music.md
  - shot-grammar.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Dialogue Scene

The pipeline is: **voice → approve the read → shot → lipsync.** Audio is cheap, video is not — never lipsync an unapproved line read.

Read `references/voice-and-music.md` before casting or directing. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`; its Rights and likeness rules govern real-person likeness.

## Workflow

1. **Cast the voice.** Describe it on the four axes (age/weight, texture, energy, provenance). If the character exists in cast memory, `get_character` — the bible may already record a voice.
2. **Direct the line.** Write the line *as performed* (audio tags, pauses, emphasis per `references/voice-and-music.md`); `generate_audio` with `audioCategory: "speech"`, one beat per job → `wait_for_job`. Let the user approve the read.
3. **Make the performing shot.** A clean talking framing per the lipsync constraints: MCU/CU, subject facing camera within ~30°, mouth unobstructed. Use an existing clip, or `generate_image` (cast refs) → `animate_image` with minimal head motion ("subtle idle motion, she holds eye contact") → `wait_for_job`.
4. **Lipsync.** `generate_lipsync` with `videoUrl` = the approved clip, `audioUrl` = the approved read. Default `syncMode` cut_off; pass `duration` matching the audio length so the quote is honest. Shortcut when no performing clip exists: pass the approved still as `imageUrl` instead (routes to OmniHuman 1.5, optional `prompt` for performance direction) and skip step 3.
5. **Coverage for two-handers:** per `references/shot-grammar.md` — singles each speaker (each lipsynced to their own line), reaction holds for the listener, eyelines in opposite directions so it cuts.

Pass `productionId` on every generation so takes land in the production.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

Per take: the line, the voice description, and the final talking-video URL. For scenes, an ordered cut list (shot, line, duration, URL).

## Related skills

- The character and their voice canon → `elegiac-character-cast` / `elegiac-story-bible`
- Shot grammar for the coverage → `elegiac-shotlist`
- Spokesperson/ad reads → `elegiac-ugc-ads`
