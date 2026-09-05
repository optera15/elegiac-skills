# Poster & Key Art Conventions

One-sheet anatomy, poster archetypes, and lookbook composition for pitch decks.

## One-sheet anatomy (2:3 portrait, e.g. 2400×3600)

Top to bottom:

1. **Tagline zone** (top ~8%) — optional one-liner, small
2. **Image field** (~60%) — the art; the single image that *is* the film
3. **Title treatment** (~15%) — usually lower third; must own its zone with clear contrast; leave clean negative space behind it when generating
4. **Billing block** (bottom ~12%) — condensed credits type; **always reserve this strip** even if delivering without credits: generate the art with the bottom 12-15% compositionally quiet
5. Laurels (festival) float top-left/top-right of the image field

When generating: explicitly prompt "lower third kept dark and uncluttered for title placement" — text gets added or re-rendered later and needs the room.

## Teaser poster vs payoff poster

- **Teaser:** one symbol, no faces or one obscured face, minimal title, date. Sells curiosity. (Ship first, months out.)
- **Payoff:** cast/world fully present, title + billing + date + laurels. Sells confidence.

## Poster archetypes (pick one, name it to the user)

| Archetype | What it is | Best for |
|---|---|---|
| **Big head** | Protagonist's face, huge, atmospheric | Star-driven drama/thriller |
| **Character stack** | Cast arranged in hierarchy (lead largest) | Ensembles, episodic |
| **Lone figure in landscape** | Small protagonist, vast world | Indie, sci-fi, westerns, elegy |
| **Concept/symbol** | One object/silhouette carrying the premise | Horror, arthouse, teasers |
| **Two-faces** | Leads back-to-back or mirrored | Romance, rivalry |
| **Montage collage** | Painterly composite of moments | Action/adventure, retro |
| **Typographic** | The title *is* the art | Comedy, documentary, A24-adjacent |

## Genre color language

Horror: black + single accent (red/white). Thriller: high-contrast teal/steel. Drama: muted naturals, skin tones. Comedy: white/yellow, flat bright. Romance: warm pastels, golden light. Sci-fi: cold blues, one alien accent. Action: orange/teal, metallic. Period/elegiac: amber, faded film grain.

## Title treatment

- Title style is a brand: lock it once (style system!) and reuse identically across poster, title cards, thumbnails, social.
- Generate with a text-capable model (GPT Image 2); always verify spelling letter-by-letter; regenerate or edit on any mangling.
- Contrast rule: title must read at thumbnail size (the poster will live as a 300px image on streaming shelves).

## Social derivatives

Re-compose (never crop) the one-sheet into 1:1 and 9:16: subject re-centered, title re-placed, billing dropped. See `platform-specs.md`.

## Lookbook / pitch-deck pages (16:9)

- **Tone page:** 3-6 image grid, one palette, no text — the film's feeling at a glance
- **World page:** locations/environments, consistent lighting key
- **Character page:** one cast member; portrait + 2-3 context frames + one line of arc
- **Comps framing:** "X meets Y" with one frame evoking each comp — *evoke*, never reproduce copyrighted frames
- Sequence: tone → world → characters → key scenes → comps. One idea per page; the deck's style system should drive every generated page so the lookbook reads as one film.
