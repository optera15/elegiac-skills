# YouTube Creator Knowledge

YouTube-specific knowledge beyond the pixel specs in `platform-specs.md` (thumbnail 1280×720, banner 2560×1440 with the 1546×423 all-device safe area — see that file; don't restate them).

## Channel surfaces

| Surface | Spec | Rules |
|---|---|---|
| Avatar / profile | 800×800, displays as a circle | Must read at 98px (and 32px in comments) — one bold shape or letterform, no fine detail; corners get cropped by the circle |
| Video watermark | 150×150 | Subtle corner mark, works at 50% opacity over any footage; usually the avatar mark simplified |
| End screen | The last 5–20s of the video | YouTube overlays a subscribe element + up to 2 video/playlist cards on a grid. Design the background with the right and center-right kept visually quiet for the cards, lower-left for subscribe; keep the speaker/branding to the left third. No critical content in the last 20s |
| Intro/outro bumper | 5–8s max | Cold-open BEFORE the bumper (see pacing below); bumper is brand mark + motion + audio sting, nothing else |

## Thumbnail–title complementarity

The thumbnail and title are one unit and must NOT repeat each other. The thumbnail sells the emotion/situation; the title supplies the missing fact (or vice versa). If the title says "I tested 5 budget lenses", the thumbnail shows the shocked face + one lens — not the words "5 budget lenses" again. When drafting either, always ask for (or draft) the other.

## Packaging

- **Titles:** ≤60 characters (truncates beyond), front-load the searchable keyword, one curiosity gap OR one concrete promise — not both. Patterns: outcome ("I built X in Y"), negative ("Stop doing X"), versus ("X vs X"), number+noun ("7 lighting setups"), question. Draft 3–5 options across different patterns.
- **Description:** first ~125 characters show above the fold — that's the real description; write it like a second title. Then: 2–3 sentence summary, chapters block, links, boilerplate.
- **Chapters:** `00:00 Label` format, first one must be 00:00, 3+ chapters, ascending, each ≥10s. Labels are searchable — use keywords, not jokes.
- **Tags:** minor ranking signal. Brand name, topic terms, common misspellings. Don't agonize.

## Shorts mechanics

- **Hook inside the first second** — mid-action start or an on-screen text question; there is no second chance.
- **Loop seam:** Shorts replay automatically — ending on (or near) the opening frame makes the loop invisible and boosts watch percentage.
- Text on screen: large, middle 65% (UI covers top/bottom — see `platform-specs.md`), max ~2 lines at once.
- One idea per Short. If it needs context, it's not a Short.

## Long-form retention pacing

- **Cold open first:** the most interesting 5–15s of the video, before any branding/bumper.
- Intro ≤8s after the cold open; get to the promised content immediately.
- **Pattern interrupt every 30–60s:** cut to B-roll, graphic, angle change, or location change — anything that resets attention.
- B-roll cadence against narration: never more than ~15s of static talking head; generated stills/clips slot in as B-roll beats.

## Originality & disclosure (binding for narrated/faceless channels)

- YouTube's reused-content and mass-produced-content policies demonetize channels whose videos are templated/repetitive or add nothing to borrowed material. **Original scripts are required** — never generate near-duplicate videos from a swapped-keyword template.
- Significant synthetic/altered content (realistic AI visuals, synthetic narration presented as a real person) should use YouTube's altered-content disclosure. Flag this; don't let a user ship undisclosed synthetic realism.
- A narrated channel survives on writing quality and visual specificity — generic stock-like visuals with monotone narration is precisely what gets demonetized. Push for specific, scripted, designed beats.
