# Elegiac Skills Cookbook

Worked prompts per workflow. Every recipe assumes the Elegiac MCP server is connected and authenticated.

## First Asset

> Create a cinematic 16:9 style frame for a rain-soaked rooftop confrontation.

The agent should use `elegiac-generate`, quote before spending, wait for completion, and return the final URL.

## Script to Storyboard

> Turn this scene into six storyboard frames, then animate the strongest frame.

The agent should use `elegiac-storyboard`, inspect available Productions when useful, generate a small first pass, and animate the selected frame once an image URL exists.

## The Flagship: Script → Shot List → Boards → Animatic

1. > Break this scene into a shot list with lens choices. (`elegiac-shotlist` — the list itself costs nothing)
2. > Render styleframes for the master, the turn, and the closing CU. (3 frames, quoted)
3. > Put those on a scene board and make an animatic: hold most shots, animate the master and the turn, add temp music. (`elegiac-board-workspace` → `elegiac-animatic`)

Result: a timed, ordered previz package from one scene of script, with most shots as cheap holds.

## Story Bible First (recommended for any ongoing project)

> Set up a story bible for my series "Saltlight": two leads, a recurring lighthouse location, and a faded-Polaroid visual canon. Don't generate art yet.

`elegiac-story-bible` writes the production, cast bibles, location registry, and style system — near-zero credits. Every later skill inherits this memory automatically.

## Trailer Kit

> Cut a 60-second festival teaser for "Saltlight". Use frames from my scene boards where possible.

`elegiac-trailer-kit` writes the beat sheet first, reuses board frames as beats, generates only missing pieces (hero clips, title cards, music), and delivers assets grouped by beat.

## Pitch Deck Visuals

> I'm pitching "Saltlight" to financiers next week. Build the lookbook pages.

`elegiac-pitch-deck` locks a style system, renders tone/world/character pages at 2K 16:9, and hands the labeled images to your deck (pptx/pdf) skill for assembly.

## Location Lock

> Design the lighthouse interior, then give me the same room at dawn and in the storm scene.

`elegiac-location-scout` scouts 3-4 candidates at draft cost, locks the winner as a location concept, then generates matched plates varying only time/weather.

## Style Exploration

> Show me five different visual directions for a noir podcast brand, then make the winner reusable.

`elegiac-style-explorer` builds a named direction grid at 1K, converges on the user's pick, proves it on more subjects, and promotes it to a style system.

## Campaign Pack

> Build a launch pack for this short film: poster frame, vertical teaser, and three social thumbnails.

The agent should use `elegiac-campaign-pack`, quote the aggregate cost once, and return labeled result URLs sized per `references/platform-specs.md`.

## Key Art with Edit Iteration

> Make a payoff poster for "Saltlight" with both leads, then darken the sky and clear the title zone.

`elegiac-key-art` picks an archetype, generates the art with cast references at 2:3, then iterates with `edit_image` — the approved composition never gets re-rolled.

## Product Pack

> Here are four photos of my candle. I need a PDP set and three lifestyle shots that match my brand kit.

`elegiac-product-shots` uploads the references, applies the brand style system, generates the hero for approval, batches the remaining modes, and restyles backgrounds with edits so the product pixels stay honest.

## Continuity Repair

> Frames 2 and 5 have her in the wrong jacket and the lighting went warm.

`elegiac-scene-continuity` diagnoses from the board (free), inspects the actual sent prompts, and fixes the outliers with surgical `edit_image` calls — not a scene re-roll.

## Talking Character

> Have Mira deliver the closing line to camera: "We were never coming back."

`elegiac-dialogue-scene` casts/uses her voice, generates the directed read for approval, animates a clean talking framing from her cast references, then lipsyncs — voice first, video last.

## UGC Ad Batch

> Three UGC-style ads for my app, same spokesperson, testing different hooks.

`elegiac-ugc-ads` writes three scripts varying only the hook, voices them, and lipsyncs the same recurring spokesperson — labeled by test axis, with disclosure notes.

## A Month of Posts

> Plan March for my coffee brand: 4 posts a week on Instagram.

`elegiac-content-calendar` lays out the pillar grid, generates week 1 for approval, then `continue_campaign` keeps weeks 2-4 visually identical to week 1.

## Generation Triage

> Why does this keep coming out wrong?

`elegiac-prompt-doctor` reads the real payload via `get_job`, matches the symptom to a known failure mode, and applies the cheapest fix first — at draft resolution until proven.

## Channel Launch

> Set up the branding for my new cooking channel "Salt & Smoke" — everything I need before the first upload.

`elegiac-youtube-channel-kit` locks the brand style system, generates banner/avatar/watermark/end-screen at exact specs (avatar verified at 32px), locks a thumbnail TEMPLATE as a reusable style system, animates a 5s bumper, and exports the kit. Episode thumbnails then come from `elegiac-thumbnail-cover` using the locked template; titles/descriptions from `elegiac-video-packaging`.

## Script to Narrated Video

> Here's my 6-minute script about the Bronze Age collapse. Make the video.

`elegiac-narrated-video` beats the script with retention pacing, generates the narration for approval BEFORE any video spend, renders one designed visual per beat (animating only the beats that need motion), adds a music bed, and delivers timed segments + a timeline manifest for the editor — with originality/disclosure guardrails applied.

## Release Week

> "Saltlight" premieres in three weeks. Build the launch kit.

`elegiac-launch-kit` locks the key art first, builds trailer pieces that inherit its title treatment, batches the derivative set (stills, vertical teaser, thumbnail, social) through one quoted campaign plan, and exports the delivery manifest at the end.

## Model Bake-off

> Same prompt on Imagen, Nano Banana, and Seedream — which should I use for this series?

`elegiac-model-compare` runs the identical brief at 1K draft cost, scores each result against the rubric (adherence, anatomy, text, style fit, cost), and recommends a standard — or tells you the routing table already answers it without spending.

## Editor Handoff (zero spend)

> Package the trailer board for my editor.

`elegiac-deliver-pack` calls `export_pack` (read-only), annotates the manifest, and — via the CLI — downloads everything under stable numbered filenames with a `manifest.json`.

## Account Hygiene (zero spend)

> What's in my Elegiac account, and what should I archive?

`elegiac-production-audit` sweeps read-only, reports orphans/unused memory/spend patterns, and archives only what you explicitly confirm.
