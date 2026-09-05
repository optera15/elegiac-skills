---
name: elegiac-generate
description: Generate one-off images, videos, image-to-video animations, and audio (speech, music, SFX) with Elegiac; list models/assets/productions; quote credits; poll jobs. Use for any one-off Elegiac generation, model or asset lookup, credit quote, or job status check.
argument-hint: "[prompt or command]"
references:
  - model-catalog.md
  - prompt-patterns.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Generate

When choosing a model, consult `references/model-catalog.md`; when a result misses, `references/prompt-patterns.md` has the fix ladder. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Core Rules

- Generate only when the user explicitly asks for a new image, video, animation, audio clip, or variation.
- Use the Elegiac MCP tools. If no Elegiac MCP tool is exposed in the current chat, fail closed: stop and tell the user to reconnect/authenticate the Elegiac MCP server and start a new chat.
- Mode routing: stills, style frames, and posters → image; text-to-video with no source image → video; a starting image → animate; speech, music, and sound effects → audio (audio bills as video credits).
- Quality controls are provider-specific (fast/pro endpoints, `qualityTier`, `veoQualityMode`, resolution-backed tiers) — call `get_model_schema` before passing a model-specific quality or tier param you are not certain about, and `list_models` when the user names a model, mode, or setting you don't recognize.
- Preserve requested aspect ratio, resolution, quality, duration, audio setting, production id, and source image URL exactly unless the server rejects them.
- Never expose or ask the user to paste permission grant tokens — approval retry is tokenless when the request is unchanged.

## MCP Read Behavior

- For "list models", call the Elegiac MCP `list_models` tool directly.
- For "quote", call `quote_generation`; do not start a generation job.
- For "list productions" or "list assets", use the matching MCP read tool.
- If the MCP call fails for auth, report that Elegiac needs MCP authentication. Do not open a browser or attempt OAuth manually unless the user asks.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md` (auth setup, reads, quotes, generation).

## Final Response

Report per the conventions Reporting rules, plus the model used when available. For images, render the result inline with Markdown when the host supports it:

```markdown
![Generated image](RESULT_URL)
```

For videos and audio, return a labeled watch/listen link. Use Markdown image syntax for `.mp4` or `.mp3` URLs only when the host explicitly supports inline media rendering.

## Related skills

- Multi-frame story work → `elegiac-storyboard` / `elegiac-shotlist`
- Finding or locking a look first → `elegiac-style-explorer` / `elegiac-brand-memory`
- Multi-asset packs → `elegiac-campaign-pack`
