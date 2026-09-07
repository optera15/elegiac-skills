# MicroDrama craft system

Use these as Elegiac planning defaults, not universal laws. Distribution, audience, genre, and an existing creator format may justify a change; record the exception instead of silently forcing the template.

## Format profiles

| Profile | Season | Episode target | Master |
| --- | ---: | ---: | --- |
| App Standard | 60 episodes | 75 seconds | 1080 × 1920 |
| Creator 24 | 24 episodes | 60–120 seconds | 1080 × 1920 |
| Creator 30 | 30 episodes | 60–120 seconds | 1080 × 1920 |
| Custom | Explicit | Explicit | Usually 1080 × 1920 |

All are vertical, mobile-first scripted series. `720 × 1280` is a disclosed budget/model fallback. `480 × 854` is for drafts only. Separate source quality from delivery quality: a 720p keeper may be conformed into a 1080p master, but disclose the upscale/source limitation.

## App Standard episode grammar

| Time | Function | Test |
| ---: | --- | --- |
| 0–3s | Cold hook | A visual, verbal, or situational question exists in the first frames. |
| 3–12s | Re-anchor | Viewer understands who wants what and the immediate situation. |
| 12–40s | Conflict ladder | At least two escalations; exposition arrives under pressure. |
| 40–58s | Turn | New evidence, reversal, choice, or emotional reframe changes the scene. |
| 58–70s | Spike/decision | A character commits, loses leverage, or reveals a consequential truth. |
| 70–75s | Cliffhanger | A caused story event creates a precise next question. |

One episode should have one dominant want/conflict and one material change. Track `opens`, `advances`, and `resolves`; keep no more than three major viewer-facing loops open at once. Honor the prior cliffhanger early. A random knock, withheld sentence, or unexplained interruption is not a durable cliffhanger unless character action made it consequential.

Estimate performed time: dialogue read, reactions, reveals, transitions, and caption comprehension. Page count alone is unreliable. Favor one scene, a small cast, and one or two reusable locations, but never flatten a premise whose appeal depends on a larger world.

## App Standard season spine

| Episodes | Movement |
| ---: | --- |
| 1–3 | Deliver the premise, relationship, and first irreversible hook. |
| 4–10 | Lock the protagonists into the engine and establish repeatable pressure. |
| 11–20 | Complicate alliances, costs, and the apparent truth. |
| 21–30 | Invert the working theory or relationship power. |
| 31–45 | Squeeze options, expose secrets, and pay smaller loops. |
| 46–60 | Converge, reveal, pay the central promise, and leave only an intentional continuation door. |

For 24/30-episode profiles, preserve the same six movements proportionally. Plan every episode's one-line promise, hook, turn, cliffhanger, and loop effects before producing Episode 1. In Fast Track, present the movement map plus the first ten episode rows and keep the complete spine in the production files.

## Renewable series engine

Before workspace creation, express the premise as:

- protagonist and active desire;
- obstacle and personal contradiction;
- relationship/emotional engine;
- repeatable episode engine;
- season truth and audience promise;
- “why Episode 2?” question.

Popular commercial lanes include romance and relationship melodrama, family/status conflict, revenge and rebirth, thriller/mystery/true crime, workplace/class comedy, fantasy/xianxia-inspired worlds, historical/period, science fiction, horror, action, and animation. Treat animation as a visual form, not a genre. Do not claim a universal genre-percentage split: published figures often mix China-only survey preferences, app revenue, ad revenue, and non-exclusive tags. Use current market research when a commercial decision depends on percentages.

## Vertical picture and sound grammar

- Compose natively for 9:16; do not crop widescreen coverage. Use upper-middle faces, readable hands/props, depth staging, motivated foregrounds, and vertical reveals.
- Test phone-size readability and platform UI safe zones. Caption and key evidence placement must survive the destination overlay.
- Close-ups and inserts carry plot economically. Establish geography briefly, then favor clean eyelines, reactions, and evidence details.
- Keep one camera move per generated shot, on a **handheld camera by default**: subtle organic drift, never shaky-cam, never a tripod unless the shot's narrative demands a locked frame and the reason is written on the shot. Repeat the exact lighting/time-of-day key and approved identity/wardrobe anchors across coverage.
- Characters are never still in a moving frame: every motion prompt gives the figure two or three small natural behaviours (weight shifts, glances, nods and head shakes, shrugs, hand gestures) matched to the beat, so performances read as people rather than mannequins.
- Every still is framed through the plugin's "Enhance Prompt with Framing" against a named entry from `list_framings`; framings vary across consecutive cuts in size and side so the sequence cuts like a film before any motion exists.
- Dialogue stems carry a breath before the first word and room after the last (0.3 s and 0.4 s after normalisation) so cuts can J/L and nothing pops or clicks at a clip boundary.
- Dialogue should be performable, interrupted by behavior, and understandable on phone speakers. Generate separate character lines/stems when lipsync or editorial timing matters.
- Brand the series, not the episode (`branding.md`): one repeatable 1–2 s brand punctuation package (mark, sting, typography, end-card behaviour) as bookends, plus a caption style, episode bug, music palette, ambience palette, and a score motif shared with the sting. No title sequence, theme song, "previously on", or rolling credits; the cliffhanger lands clean before the end card.
- The episode must work muted and improve with sound. Captions are story timing, delivered as a sidecar the platform overlays; burned-in caption pills are opt-in because they distract and double the caption-zone risk.
- Continuity is staged, not hoped for: every shot pins to a plate from the location's coverage set, every recurring vehicle is one vehicle with one plate, and no still becomes a clip until it has passed the shot-order checklist in `continuity-gate.md` and the user has watched the stills animatic.
- Perform-time the ledger before stems (`scripts/check-shot-budget.mjs`): speaking cuts at about 2.6 words per second plus 0.75 s of handles, silent cuts at their target, bookends added. Over budget means a trim list now, while cutting a line is free.

## Framing and prompt enhancement

- Frame every still against its references, not from memory. For each shot: pick one framing from `list_framings` (group `distance-zoom` for coverage size, `conversation-dialogue` for two-handers, `dramatic` for turns; free text is allowed when nothing fits), then call `enhance_prompt` once per scene with `shots[]` (raw shot description + framing each) and the shared `referenceImageUrls` you will generate with (the shot's pinned plate first, approved cast references, vehicle and prop plates). One quote, one approval, 5 credits per shot; `wait_for_job` returns each `enhancedPrompt`.
- Generate with `generate_shots` (batch, one approval) or per-shot `generate_image`, passing each `enhancedPrompt` VERBATIM with the same references, then the show's `styleLine` (and `lookLine` on composites). Lint the prompt first: no "lipsync" or "for <purpose>" phrases, no numeric ages, no skin-ageing adjectives on young characters, the `wardrobeAnatomy` line on inserts. Never send enhanced prompts to `generate_storyboard`: it rewrites them into numbered storyboard panels and cannot carry a location plate.
- A two-hander with both faces visible is a reaction cut, never a speaking cut: lipsync cannot choose the speaker. Stage every line on a single-face framing and let the reverse carry the listener.
- Never enhance twice for one shot and never feed an enhanced prompt back in as the raw prompt. Keep the framing string on the shot record; it is the continuity key when you re-run a beat.
- On the first `permission_required`, tell the user the approval page can save a standing Permit for `enhance_prompt` / `generate_shots` in this production (optionally capped at the quoted credits), so the rest of the episode runs without prompts. Host-side tool approvals (Claude, ChatGPT) are separate and need their own always-allow.

## Development package that earns its keep

Maintain only artifacts with downstream value: series bible and spine; character/relationship canon; recurring location/prop registry; approved 9:16 identity, dialogue, action, and lighting tests; StyleSystem; brand punctuation package (`series-manifest.branding` and `brand/`); caption style; sound palette; episode index and loop ledger; and one complete Episode Board.
