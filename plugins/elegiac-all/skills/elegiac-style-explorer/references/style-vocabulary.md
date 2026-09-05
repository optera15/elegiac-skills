# Style Vocabulary & Style-System Mapping

A working lexicon for naming looks, and how to store a chosen look as a durable Elegiac style system.

## Mediums

| Family | Useful terms |
|---|---|
| Photographic | 35mm film still, large-format, Polaroid, cross-processed, halation, grain, tintype, infrared |
| Painting | gouache, oil impasto, watercolor wash, tempera, fresco, acrylic flat |
| Print | risograph (limited inks, misregistration), screenprint, linocut, woodcut, etching, lithograph |
| Drawing | ligne claire, charcoal, graphite study, ink wash, ballpoint, marker comp |
| Digital | cel-shaded, pixel art, low-poly, vector flat, painterly concept art, photobash |
| Collage | cut-paper, mixed-media, photomontage, zine |

## Movements & eras (shorthand that models understand)

Art-historical: Bauhaus, Art Deco, Art Nouveau, Constructivist, Ukiyo-e, Impressionist, Expressionist (hard shadows, distorted space), Surrealist, Brutalist, Memphis, Swiss/International typographic.

Cinematic: film noir, German Expressionist, French New Wave, '70s New Hollywood (zooms, grain, amber), '80s neon, '90s music-video, Dogme handheld, A24-naturalism (soft window light, muted palette), neo-noir (wet streets, sodium + neon).

Illustration traditions: mid-century children's book, golden-age sci-fi paperback, EC comics, Franco-Belgian bande dessinée, manga screen-tone, Ghibli-adjacent pastoral (describe traits — "soft watercolor skies, painterly clouds, gentle light" — rather than naming living studios/artists).

**Rule:** evoke traditions and visual traits; do not prompt with living artists' names or current franchises.

## Describing a look precisely (the 6 axes)

1. **Medium** (one term from above)
2. **Palette** (3-5 named colors or a temperature statement)
3. **Light** (key + quality: "single hard tungsten key", "overcast soft")
4. **Texture/finish** (grain, paper tooth, halation, clean digital)
5. **Composition habit** (centered symmetry, negative space, dense frames, dutch angles)
6. **Era/movement anchor** (optional, one)

A look that can't be stated in these 6 axes isn't locked yet — keep exploring.

## Mapping a look into an Elegiac style system

When a look is approved, store it (`create_style_system` or `promote_visual_style_to_style_system`):

- **title** — human name ("Dust & Sodium")
- **visualRules** — the 6 axes written as imperatives ("Always single-source hard light…")
- **palette** — the named colors
- **negativePrompt** — what the look must never contain ("no lens flare, no saturated blues, no clean digital finish")
- **reference images** — 2-4 approved frames that exemplify it

Then *apply by `styleSystemId`* on every future generation. Never paste the rules back into prompts manually — the system is the single source of truth, and its negativePrompt is binding governance.

## Series consistency (illustration/social sets)

For an N-image set: lock style system → generate 1 keeper → pass the keeper as an additional reference to the remaining N-1 → batch with one `maxCredits` cap. Same order every time.
