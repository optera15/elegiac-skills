---
name: elegiac-video-packaging
description: Package YouTube videos for clicks and search — titles, descriptions, chapters, tags, video SEO. Use when the user asks what to call a video, for a title and description, tags and chapters, or to "package my video".
allowed-tools: Bash
argument-hint: "[the video: link, board, script, or summary]"
references:
  - youtube-creator.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Video Packaging

The metadata layer: title + thumbnail + description + chapters + tags, written as one unit. This is knowledge work — **near-zero credit spend**; the only optional cost is rendering the thumbnail.

Read the packaging section of `references/youtube-creator.md` first. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. **Understand the video** (zero spend): from the user's summary/script, or from Elegiac memory — `get_board` / `get_workflow_run` for a video produced here. Identify: the searchable keyword, the emotional core, the strongest moment.
2. **Titles:** 3-5 options across different patterns (outcome / negative / versus / number+noun / question), each ≤60 characters with the keyword front-loaded. Mark your recommendation and why.
3. **Thumbnail concept — complementarity rule:** the thumbnail must NOT repeat the title's words; it sells the emotion/situation, the title supplies the missing fact. Write the thumbnail brief alongside the chosen title. Rendering it is optional spend — hand to `elegiac-thumbnail-cover` patterns (text-capable model, 1280×720, 168px legibility).
4. **Description:** the first ~125 characters written like a second title (that's all that shows above the fold), then summary, chapters block (`00:00 Label`, 3+ ascending, keyword-bearing labels), links.
5. **Tags:** brand + topic terms + common misspellings. Quick, not agonized.
6. For a series, keep packaging consistent: same title pattern family and thumbnail template (style system) across episodes.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

A ready-to-paste package: recommended title (+ alternates), thumbnail brief (or rendered URL), full description with chapters, tag list. Note the complementarity pairing explicitly ("title carries the number, thumbnail carries the face").

## Related skills

- Rendering the thumbnail properly → `elegiac-thumbnail-cover`
- The channel-wide template behind it → `elegiac-youtube-channel-kit`
- The video itself → `elegiac-narrated-video` / `elegiac-shorts-factory`
