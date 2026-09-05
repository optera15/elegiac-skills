# Elegiac Agent Skills

Agent skills and plugins for driving [Elegiac](https://elegiac.ai) — cinematic AI production
(images, video, audio, storyboards, consistent characters, campaign packs) — from Claude Code,
Claude Desktop, Cursor, VS Code / GitHub Copilot, Codex, and other skill-aware agents.

The recommended **Elegiac — All Skills** plugin includes all 35 skills and the
Elegiac MCP server configuration. Smaller bundles are available below. The skills are MCP-first and
fail closed: they require the authenticated Elegiac MCP server and do not fall back to other
providers or tools.

```text
https://elegiac.ai/api/mcp
```

Generation spends Elegiac credits after a quoted, user-approved permission step — skills quote
before spending, and mutating calls may pause on an approval link in your Elegiac account.

## Install

### Claude Desktop / Cowork

1. **[Download Elegiac — All Skills](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-all-plugin.zip)** (35 skills, version 0.2.0).
2. Open **Customize → Plugins**, choose the option to upload a plugin, and select the ZIP as downloaded.
3. Connect the included Elegiac connector and sign in to your Elegiac account. If your build does not add the connector, use the [manual connector setup](#manual-connector-setup) below.
4. Start a fresh conversation in the Claude mode where the plugin is available and run the read-only check below.

Plugin availability depends on your Claude plan, app build, mode, and organization settings.
If Plugins or upload is unavailable in Chat, check Cowork. If you only have the Skills uploader,
use the **[individual skill ZIP downloads](downloads/README.md#individual-skills)**:
Customize → Skills → + → Create skill → Upload a skill. Upload one skill ZIP at a time and
connect Elegiac separately. The complete plugin ZIP and the local-folder archive do **not** belong
in the single-skill uploader. Uploading a ZIP as a chat attachment does not install it.

No terminal, npm command, folder downloading, or manual zipping is needed.
See [Anthropic's plugin guide](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)
and [skill upload guide](https://support.claude.com/en/articles/12512180-use-skills-in-claude).

### Claude Code

**Claude Code** (plugin marketplace):

```text
claude plugin marketplace add optera15/elegiac-skills
claude plugin install elegiac-all@elegiac
```

Installing a bundle also registers the Elegiac MCP server — run `/mcp` to authenticate it.
Choose **either elegiac-all or the smaller bundles**, to avoid duplicate skills.
When switching to All Skills, disable/uninstall your smaller Elegiac plugins and individually
installed Elegiac skills after confirming the complete plugin works. Keep your account connection.

### Other clients

**Agent Plugins hosts** (Cursor, VS Code / Copilot, Copilot CLI, Kiro, ChatGPT/Codex apps):
each directory under `plugins/` is a standard [Agent Plugins](https://agent-plugins.org)
package (`plugin.json` + `skills/` + `mcp.json`). Install from this repo using your
client's plugin install flow — e.g. in VS Code, **Chat: Install Plugin From Source** with this
repo's URL, or add the repo to `chat.plugins.marketplaces`.

**Clients with a local skills folder**, including Codex: download
[all skill folders](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-skills-all.zip) and extract the contents into your
client's skills directory (for Codex: `~/.codex/skills/`). The archive contains one folder
per skill with its references. Configure and authenticate the Elegiac MCP server separately.
This archive is for extraction, not for Claude's single-skill uploader.

### Manual connector setup

Add a custom connector named **Elegiac** with `https://elegiac.ai/api/mcp`.
In Claude's connector dialog, choose **Always required** for Authentication and
**No client ID — register one automatically** for OAuth. Leave headers empty and Advanced
at its defaults. Connect and sign in. If you already have an authenticated Elegiac connector,
reuse it rather than creating another. Signing in does not authorize credit spending.

### Verify the installation

On first use, authenticate the Elegiac MCP server when your client prompts (OAuth). A good
zero-spend smoke test: *"Use the Elegiac MCP server to list available generation models. Do
not generate anything."*

Also check the installed plugin's skill list against the 35 skills in the catalog;
a successful MCP call alone does not prove skills were installed.

### Downloads and updates

- [All download links and individual skill ZIPs](downloads/README.md)
- [Versioned releases](https://github.com/optera15/elegiac-skills/releases) — keep a known version or download the latest.
- [Download manifest](downloads/manifest.json) — version, skill counts, filenames, sizes, and SHA-256 checksums.

Marketplace installs: update the Elegiac marketplace/plugin through your client's plugin manager.
File uploads: download the new plugin ZIP, use your client's update/replace flow, and start a fresh
conversation. If replacement is unavailable, uninstall the old Elegiac plugin before installing the
new one. Individual skill uploads must each be updated separately. Check the displayed version
and skill list after an update; avoid keeping both the complete plugin and its smaller bundles enabled.

## Plugin bundles

**Recommended: [elegiac-all](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-all-plugin.zip)** — all 35 skills.
The following bundles are optional smaller installs; skill names link to individual upload ZIPs.

### `elegiac-filmmaker`

Filmmaker core: microdramas, shot lists, storyboards, animatics, trailers, key art, pitch decks, story bibles, locations, continuity, dialogue, cast, and launch kits — Elegiac as a cinematic production backend.

| Skill | What it does |
|---|---|
| [`elegiac-microdrama`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-microdrama-claude.zip) | Create, continue, or edit episodic vertical microdramas with Elegiac production memory and HyperFrames post. Use for short drama, micro drama, vertical drama, duanju, one-minute drama, or a mobile-first scripted series; routes new-show, new-episode, and edit workflows without using Showrunner. |
| [`elegiac-shotlist`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-shotlist-claude.zip) | Break a script, scene, or brief into a professional shot list with coverage and lens plan, plus rendered styleframes via Elegiac. Use when the user asks for a shot list, coverage or lens plan, scene blocking, or "how should I shoot this scene". |
| [`elegiac-storyboard`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-storyboard-claude.zip) | Create storyboards with Elegiac — turn scripts and scene briefs into sequenced frames. Use when the user asks for storyboard frames, visual beats, script breakdowns, shot sequencing, or animating selected frames. |
| [`elegiac-animatic`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-animatic-claude.zip) | Turn storyboards into timed animatics with Elegiac — animate selected frames, set per-shot durations, add temp music and SFX. Use when the user asks for an animatic, timed boards, or previz. |
| [`elegiac-trailer-kit`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-trailer-kit-claude.zip) | Build trailer beats and trailer kits with Elegiac — beat structures, hero moment videos, title cards inside a trailer, trailer music and VO. Use when the user asks for a trailer, trailer beats, or a marketing video for a film, series, or game. |
| [`elegiac-key-art`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-key-art-claude.zip) | Create film/series posters and key art with Elegiac — teaser and payoff one-sheets, title treatments, and social crops. Use when the user asks for a poster / one-sheet or "the image that sells my film". |
| [`elegiac-pitch-deck`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-pitch-deck-claude.zip) | Generate pitch deck and lookbook visuals with Elegiac — tone, world, character, and key-scene pages for financiers and greenlight meetings. Use when the user asks for pitch deck visuals, a lookbook, or visual development for a pitch. |
| [`elegiac-story-bible`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-story-bible-claude.zip) | Build a story, world, or series bible as durable Elegiac production memory — character and world canon, locations, rules, visual canon. Use when the user asks for a bible or lore document, or wants their world and characters kept consistent across future generations. |
| [`elegiac-location-scout`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-location-scout-claude.zip) | Develop location concepts and matched environment plates with Elegiac — establishing shots, coverage angles, time-of-day series, the same location across scenes. Use when the user asks for location concepts, location scouting, environment plates, set looks, backdrops, or "the same place at night/in winter/years later". |
| [`elegiac-scene-continuity`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-scene-continuity-claude.zip) | Diagnose and fix continuity across Elegiac frames — mismatched wardrobe, drifting lighting, inconsistent props, a character or location that looks different between shots. Use when frames don't match or the user wants a scene kept consistent. |
| [`elegiac-dialogue-scene`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-dialogue-scene-claude.zip) | Create talking-character scenes with Elegiac — voice casting, line reads, lipsync, dialogue coverage. Use when the user wants a character to speak ("make her say this line"), a talking head, a voiced scene, lipsync, voice casting, or dialogue between characters. |
| [`elegiac-character-cast`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-character-cast-claude.zip) | Reuse, inspect, and plan generation around Elegiac production cast memory. Use when the user asks to use a named character, keep cast continuity, or make a character appear in new scenes or media. |
| [`elegiac-launch-kit`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-launch-kit-claude.zip) | Build the full release package with Elegiac — poster, stills, trailer pieces, vertical teaser, thumbnails, and social set for a film/series launch or festival run. Use when the user asks for a launch kit, release kit, "everything I need for release week", or festival press kit visuals. |

### `elegiac-marketing`

Marketing and ads: campaign packs, product photography, A/B ad variants, UGC-style spots, and platform cutdowns with brand continuity.

| Skill | What it does |
|---|---|
| [`elegiac-campaign-pack`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-campaign-pack-claude.zip) | Generate multi-asset campaign packs with Elegiac: hero stills, social variants, short videos, and platform-specific creative sets. Use when the user asks for a multi-format campaign, launch pack, or teaser pack. |
| [`elegiac-product-shots`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-product-shots-claude.zip) | Generate product photography with Elegiac — hero shots, lifestyle scenes, flat-lays, macro details, marketplace images, seasonal restyles, PDP and social packs. Use when the user asks for product photography, hero or lifestyle shots, or "make my product look professional". |
| [`elegiac-ad-variants`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-ad-variants-claude.zip) | Plan and generate ad variant sets with Elegiac — an A/B variant matrix that tests one message axis at a time, sized per platform. Use when the user asks for ad variants, an A/B test matrix, or "10 versions of this ad". |
| [`elegiac-ugc-ads`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-ugc-ads-claude.zip) | Create UGC- and creator-style video ads with Elegiac — talking-head spots, testimonial-format reads, phone-native ads with a recurring spokesperson. Use when the user asks for a UGC ad, creator-style video, or spokesperson content. |
| [`elegiac-platform-cutdowns`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-platform-cutdowns-claude.zip) | Re-version an existing master with Elegiac — vertical versions, 30/15/6-second ladders, platform-native re-compositions of a hero spot or trailer. Use when the user asks to "cut this down", make a vertical/TikTok/Shorts version, a 6s bumper, or platform sizes of an existing video. |

### `elegiac-social`

Social and creators: virtual influencers, content calendars, and click-worthy thumbnails/covers with series consistency.

| Skill | What it does |
|---|---|
| [`elegiac-virtual-influencer`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-virtual-influencer-claude.zip) | Build and run a persistent synthetic persona that posts — virtual influencers with Elegiac: persona design, locked identity, content in the persona's voice, talking posts. Use when the user asks for a virtual influencer, AI persona, brand character for socials, or a synthetic spokesperson with a persistent identity. |
| [`elegiac-content-calendar`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-content-calendar-claude.zip) | Plan and produce recurring social content with Elegiac — visual continuity across weeks of posts. Use when the user asks for a content calendar, "a month of posts", or a recurring series. |
| [`elegiac-thumbnail-cover`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-thumbnail-cover-claude.zip) | Create a single click-worthy thumbnail or cover image with Elegiac — YouTube thumbnail, podcast cover, playlist or episode art. Use when the user asks for a thumbnail, cover art, or "something people will click". |

### `elegiac-youtube`

YouTube creators: channel identity kits, narrated/faceless video pipelines, native Shorts, and title/description/chapter packaging.

| Skill | What it does |
|---|---|
| [`elegiac-youtube-channel-kit`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-youtube-channel-kit-claude.zip) | Build the complete YouTube channel identity set with Elegiac — banner, avatar, watermark, thumbnail template, end-screen background, and intro/outro bumper as one coherent kit. Use when the user asks for channel identity, "set up my YouTube channel", "rebrand my channel", or banner and avatar. |
| [`elegiac-narrated-video`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-narrated-video-claude.zip) | Produce faceless narrated YouTube videos with Elegiac — script beats, narration, matched visuals, music bed, delivered as timed segments. Use when the user asks for a faceless video, video essay or explainer visuals, or "turn this script into a YouTube video". |
| [`elegiac-shorts-factory`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-shorts-factory-claude.zip) | Create YouTube Shorts natively with Elegiac — hook-first vertical clips, loop-seam endings, talking Shorts, batched series with consistent style. Use when the user asks for YouTube Shorts, Shorts from an idea or board, vertical clips for a channel, or a Shorts series. |
| [`elegiac-video-packaging`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-video-packaging-claude.zip) | Package YouTube videos for clicks and search — titles, descriptions, chapters, tags, video SEO. Use when the user asks what to call a video, for a title and description, tags and chapters, or to "package my video". |

### `elegiac-studio-tools`

Studio tools: one-off generation, boards, brand memory, style exploration, illustration, prompt triage, model comparison, account audits, delivery packs, and Production Kit exports.

| Skill | What it does |
|---|---|
| [`elegiac-generate`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-generate-claude.zip) | Generate one-off images, videos, image-to-video animations, and audio (speech, music, SFX) with Elegiac; list models/assets/productions; quote credits; poll jobs. Use for any one-off Elegiac generation, model or asset lookup, credit quote, or job status check. |
| [`elegiac-board-workspace`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-board-workspace-claude.zip) | Organize Elegiac outputs into Production Boards: scene boards, trailer-kit boards, character boards, pitch boards, and launch-kit boards. Use after generating or finding assets/workflows when the user wants results placed into a usable filmmaker work surface. |
| [`elegiac-brand-memory`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-brand-memory-claude.zip) | Use Elegiac brand kits, visual systems, production memory, approved references, and continuity constraints. Use when the user asks for on-brand visuals, recurring campaign style, visual consistency, or governance-aware generation. |
| [`elegiac-style-explorer`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-style-explorer-claude.zip) | Explore visual styles systematically with Elegiac — direction grids converging on a reusable style system. Use when the user asks to explore styles, see multiple directions or versions in different styles, find a look, or develop the visual identity for a project or brand. |
| [`elegiac-illustration`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-illustration-claude.zip) | Create illustration work with Elegiac — editorial illustration, comic and graphic-novel pages, children's book art, album/zine art. Use when the user asks to illustrate something, wants a specific artistic medium (gouache, riso, woodcut, ligne claire), or a consistent illustrated series. |
| [`elegiac-prompt-doctor`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-prompt-doctor-claude.zip) | Diagnose and fix failed or disappointing Elegiac generations — ignored prompts, mangled text, broken anatomy, style drift, 422 errors, content-policy rejections. Use when the user says a generation looks wrong, "why did it ignore my prompt", "the hands are broken", "it doesn't match my style", or a model call keeps failing. |
| [`elegiac-production-audit`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-production-audit-claude.zip) | Audit an Elegiac account read-only — credits, productions, boards, cast, style systems, campaigns, and what to clean up or archive. Use when the user asks to audit their account, review what they have, find what's eating credits, clean up productions, or asks "what's in my Elegiac / what should I archive". |
| [`elegiac-model-compare`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-model-compare-claude.zip) | Run a model bake-off with Elegiac — the same prompt across multiple image or video models, scored against a rubric, with a recommendation. Use when the user asks to compare models on a brief or which model to standardize on for a project. |
| [`elegiac-deliver-pack`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-deliver-pack-claude.zip) | Package and hand off finished Elegiac work — delivery manifests, organized download packs, editor/client handoffs with stable filenames. Use when the user asks to package the finals, "give me everything as files", export a board or campaign, a deliverables manifest, or a handoff to an editor/client. |
| [`elegiac-production-kit`](https://github.com/optera15/elegiac-skills/raw/refs/heads/main/downloads/elegiac-production-kit-claude.zip) | Export an Elegiac Production as a portable OpenAI/ChatGPT or Anthropic/Claude Production Kit folder. Use when the user asks to export a production or take it into ChatGPT or Claude, refresh a kit with `elegiac kit sync`, or push local shot lists up with `elegiac kit push`. |

## Cookbook

Worked prompts per workflow live in [COOKBOOK.md](COOKBOOK.md).

## Production Kits

`downloads/` carries blank Production Kit archives for ChatGPT Projects and Claude Projects;
the `elegiac-production-kit` skill fills them from your Productions.

---

This repository is generated from the Elegiac source tree — issues and PRs against skill
content are welcome as feedback but changes land upstream.
