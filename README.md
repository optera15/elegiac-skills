# Elegiac Agent Skills

Agent skills and plugins for driving [Elegiac](https://elegiac.ai) — cinematic AI production
(images, video, audio, storyboards, consistent characters, campaign packs) — from Claude Code,
Claude Desktop, Cursor, VS Code / GitHub Copilot, Codex, and other skill-aware agents.

Every plugin bundles the Elegiac MCP server plus a tier of skills. The skills are MCP-first and
fail closed: they require the authenticated Elegiac MCP server and do not fall back to other
providers or tools.

```text
https://elegiac.vercel.app/api/mcp
```

Generation spends Elegiac credits after a quoted, user-approved permission step — skills quote
before spending, and mutating calls may pause on an approval link in your Elegiac account.

## Install

**Claude Code** (plugin marketplace):

```text
claude plugin marketplace add optera15/elegiac-skills
claude plugin install elegiac-filmmaker
```

**Agent Plugins hosts** (Cursor, VS Code / Copilot, Copilot CLI, Kiro, ChatGPT/Codex apps):
each directory under `plugins/` is a standard [Agent Plugins](https://agent-plugins.org)
package (`plugin.json` + `skills/` + `mcp.json`). Install from this repo using your
client's plugin install flow — e.g. in VS Code, **Chat: Install Plugin From Source** with this
repo's URL, or add the repo to `chat.plugins.marketplaces`.

**Claude Desktop**: add a custom connector named `Elegiac` pointing at the MCP URL above,
then upload individual skills from any `plugins/*/skills/` directory via the Skills UI.

On first use, authenticate the Elegiac MCP server when your client prompts (OAuth). A good
zero-spend smoke test: *"Use the Elegiac MCP server to list available generation models. Do
not generate anything."*

## Plugin bundles

### `elegiac-filmmaker`

Filmmaker core: shot lists, storyboards, animatics, trailers, key art, pitch decks, story bibles, locations, continuity, dialogue, cast, and launch kits — Elegiac as a cinematic production backend.

| Skill | What it does |
|---|---|
| `elegiac-shotlist` | Break a script, scene, or brief into a professional shot list with coverage and lens plan, plus rendered styleframes via Elegiac. Use when the user asks for a shot list, coverage or lens plan, scene blocking, or "how should I shoot this scene". |
| `elegiac-storyboard` | Create storyboards with Elegiac — turn scripts and scene briefs into sequenced frames. Use when the user asks for storyboard frames, visual beats, script breakdowns, shot sequencing, or animating selected frames. |
| `elegiac-animatic` | Turn storyboards into timed animatics with Elegiac — animate selected frames, set per-shot durations, add temp music and SFX. Use when the user asks for an animatic, timed boards, or previz. |
| `elegiac-trailer-kit` | Build trailer beats and trailer kits with Elegiac — beat structures, hero moment videos, title cards inside a trailer, trailer music and VO. Use when the user asks for a trailer, trailer beats, or a marketing video for a film, series, or game. |
| `elegiac-key-art` | Create film/series posters and key art with Elegiac — teaser and payoff one-sheets, title treatments, and social crops. Use when the user asks for a poster / one-sheet or "the image that sells my film". |
| `elegiac-pitch-deck` | Generate pitch deck and lookbook visuals with Elegiac — tone, world, character, and key-scene pages for financiers and greenlight meetings. Use when the user asks for pitch deck visuals, a lookbook, or visual development for a pitch. |
| `elegiac-story-bible` | Build a story, world, or series bible as durable Elegiac production memory — character and world canon, locations, rules, visual canon. Use when the user asks for a bible or lore document, or wants their world and characters kept consistent across future generations. |
| `elegiac-location-scout` | Develop location concepts and matched environment plates with Elegiac — establishing shots, coverage angles, time-of-day series, the same location across scenes. Use when the user asks for location concepts, location scouting, environment plates, set looks, backdrops, or "the same place at night/in winter/years later". |
| `elegiac-scene-continuity` | Diagnose and fix continuity across Elegiac frames — mismatched wardrobe, drifting lighting, inconsistent props, a character or location that looks different between shots. Use when frames don't match or the user wants a scene kept consistent. |
| `elegiac-dialogue-scene` | Create talking-character scenes with Elegiac — voice casting, line reads, lipsync, dialogue coverage. Use when the user wants a character to speak ("make her say this line"), a talking head, a voiced scene, lipsync, voice casting, or dialogue between characters. |
| `elegiac-character-cast` | Reuse, inspect, and plan generation around Elegiac production cast memory. Use when the user asks to use a named character, keep cast continuity, or make a character appear in new scenes or media. |
| `elegiac-launch-kit` | Build the full release package with Elegiac — poster, stills, trailer pieces, vertical teaser, thumbnails, and social set for a film/series launch or festival run. Use when the user asks for a launch kit, release kit, "everything I need for release week", or festival press kit visuals. |

### `elegiac-marketing`

Marketing and ads: campaign packs, product photography, A/B ad variants, UGC-style spots, and platform cutdowns with brand continuity.

| Skill | What it does |
|---|---|
| `elegiac-campaign-pack` | Generate multi-asset campaign packs with Elegiac: hero stills, social variants, short videos, and platform-specific creative sets. Use when the user asks for a multi-format campaign, launch pack, or teaser pack. |
| `elegiac-product-shots` | Generate product photography with Elegiac — hero shots, lifestyle scenes, flat-lays, macro details, marketplace images, seasonal restyles, PDP and social packs. Use when the user asks for product photography, hero or lifestyle shots, or "make my product look professional". |
| `elegiac-ad-variants` | Plan and generate ad variant sets with Elegiac — an A/B variant matrix that tests one message axis at a time, sized per platform. Use when the user asks for ad variants, an A/B test matrix, or "10 versions of this ad". |
| `elegiac-ugc-ads` | Create UGC- and creator-style video ads with Elegiac — talking-head spots, testimonial-format reads, phone-native ads with a recurring spokesperson. Use when the user asks for a UGC ad, creator-style video, or spokesperson content. |
| `elegiac-platform-cutdowns` | Re-version an existing master with Elegiac — vertical versions, 30/15/6-second ladders, platform-native re-compositions of a hero spot or trailer. Use when the user asks to "cut this down", make a vertical/TikTok/Shorts version, a 6s bumper, or platform sizes of an existing video. |

### `elegiac-social`

Social and creators: virtual influencers, content calendars, and click-worthy thumbnails/covers with series consistency.

| Skill | What it does |
|---|---|
| `elegiac-virtual-influencer` | Build and run a persistent synthetic persona that posts — virtual influencers with Elegiac: persona design, locked identity, content in the persona's voice, talking posts. Use when the user asks for a virtual influencer, AI persona, brand character for socials, or a synthetic spokesperson with a persistent identity. |
| `elegiac-content-calendar` | Plan and produce recurring social content with Elegiac — visual continuity across weeks of posts. Use when the user asks for a content calendar, "a month of posts", or a recurring series. |
| `elegiac-thumbnail-cover` | Create a single click-worthy thumbnail or cover image with Elegiac — YouTube thumbnail, podcast cover, playlist or episode art. Use when the user asks for a thumbnail, cover art, or "something people will click". |

### `elegiac-youtube`

YouTube creators: channel identity kits, narrated/faceless video pipelines, native Shorts, and title/description/chapter packaging.

| Skill | What it does |
|---|---|
| `elegiac-youtube-channel-kit` | Build the complete YouTube channel identity set with Elegiac — banner, avatar, watermark, thumbnail template, end-screen background, and intro/outro bumper as one coherent kit. Use when the user asks for channel identity, "set up my YouTube channel", "rebrand my channel", or banner and avatar. |
| `elegiac-narrated-video` | Produce faceless narrated YouTube videos with Elegiac — script beats, narration, matched visuals, music bed, delivered as timed segments. Use when the user asks for a faceless video, video essay or explainer visuals, or "turn this script into a YouTube video". |
| `elegiac-shorts-factory` | Create YouTube Shorts natively with Elegiac — hook-first vertical clips, loop-seam endings, talking Shorts, batched series with consistent style. Use when the user asks for YouTube Shorts, Shorts from an idea or board, vertical clips for a channel, or a Shorts series. |
| `elegiac-video-packaging` | Package YouTube videos for clicks and search — titles, descriptions, chapters, tags, video SEO. Use when the user asks what to call a video, for a title and description, tags and chapters, or to "package my video". |

### `elegiac-studio-tools`

Studio tools: one-off generation, boards, brand memory, style exploration, illustration, prompt triage, model comparison, account audits, delivery packs, and Production Kit exports.

| Skill | What it does |
|---|---|
| `elegiac-generate` | Generate one-off images, videos, image-to-video animations, and audio (speech, music, SFX) with Elegiac; list models/assets/productions; quote credits; poll jobs. Use for any one-off Elegiac generation, model or asset lookup, credit quote, or job status check. |
| `elegiac-board-workspace` | Organize Elegiac outputs into Production Boards: scene boards, trailer-kit boards, character boards, pitch boards, and launch-kit boards. Use after generating or finding assets/workflows when the user wants results placed into a usable filmmaker work surface. |
| `elegiac-brand-memory` | Use Elegiac brand kits, visual systems, production memory, approved references, and continuity constraints. Use when the user asks for on-brand visuals, recurring campaign style, visual consistency, or governance-aware generation. |
| `elegiac-style-explorer` | Explore visual styles systematically with Elegiac — direction grids converging on a reusable style system. Use when the user asks to explore styles, see multiple directions or versions in different styles, find a look, or develop the visual identity for a project or brand. |
| `elegiac-illustration` | Create illustration work with Elegiac — editorial illustration, comic and graphic-novel pages, children's book art, album/zine art. Use when the user asks to illustrate something, wants a specific artistic medium (gouache, riso, woodcut, ligne claire), or a consistent illustrated series. |
| `elegiac-prompt-doctor` | Diagnose and fix failed or disappointing Elegiac generations — ignored prompts, mangled text, broken anatomy, style drift, 422 errors, content-policy rejections. Use when the user says a generation looks wrong, "why did it ignore my prompt", "the hands are broken", "it doesn't match my style", or a model call keeps failing. |
| `elegiac-production-audit` | Audit an Elegiac account read-only — credits, productions, boards, cast, style systems, campaigns, and what to clean up or archive. Use when the user asks to audit their account, review what they have, find what's eating credits, clean up productions, or asks "what's in my Elegiac / what should I archive". |
| `elegiac-model-compare` | Run a model bake-off with Elegiac — the same prompt across multiple image or video models, scored against a rubric, with a recommendation. Use when the user asks to compare models on a brief or which model to standardize on for a project. |
| `elegiac-deliver-pack` | Package and hand off finished Elegiac work — delivery manifests, organized download packs, editor/client handoffs with stable filenames. Use when the user asks to package the finals, "give me everything as files", export a board or campaign, a deliverables manifest, or a handoff to an editor/client. |
| `elegiac-production-kit` | Export an Elegiac Production as a portable OpenAI/ChatGPT or Anthropic/Claude Production Kit folder. Use when the user asks to export a production or take it into ChatGPT or Claude, refresh a kit with `elegiac kit sync`, or push local shot lists up with `elegiac kit push`. |

## Cookbook

Worked prompts per workflow live in [COOKBOOK.md](COOKBOOK.md).

## Production Kits

`downloads/` carries blank Production Kit archives for ChatGPT Projects and Claude Projects;
the `elegiac-production-kit` skill fills them from your Productions.

---

This repository is generated from the Elegiac source tree — issues and PRs against skill
content are welcome as feedback but changes land upstream.
