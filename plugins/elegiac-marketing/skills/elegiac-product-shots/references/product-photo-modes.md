# Product Photo Modes

Named modes for product imagery. Each mode = framing + lighting + set, ready to combine with a brand style system. Always anchor on real product reference images (`upload_asset` → pass as references); never let the model invent the product.

| Mode | Framing | Lighting | Set / notes |
|---|---|---|---|
| **hero** | Product centered, 3/4 angle, fills ~70% | Large soft key + rim for edge definition | Seamless sweep (white/brand color); the catalog/PDP money shot |
| **lifestyle** | Product in believable use context, environment visible | Motivated natural light (window, golden hour) | Real-world set; product still sharpest element in frame |
| **flat-lay** | Directly overhead, product + 3-5 styled props on a surface | Even soft toplight, minimal shadow | Grid-friendly; props echo brand palette |
| **hand-model** | Product held/used, hands + partial arm only | Soft key, skin tones natural | Watch anatomy (see `prompt-patterns.md`); crop to minimize finger count |
| **macro-detail** | ECU of texture, stitching, material, mechanism | Raking light to carry texture | Communicates quality; pair with hero in carousels |
| **scale-reference** | Product beside a universally-sized object or in-hand | Neutral | Kills "it's smaller than I thought" returns |
| **exploded / set-contents** | Components or what's-in-the-box arranged in order | Even, shadowless | Marketplace secondary-image staple |
| **seasonal** | Hero or lifestyle re-dressed for a season/holiday | Seasonal temperature (warm autumn, cool winter) | Re-skin of an approved mode — reuse its composition |
| **editorial** | Dramatic, magazine-style: bold shadow, unexpected angle, negative space | Hard directional or colored gels | Brand-building, not conversion; headline space in the negative |
| **ugc-style** | Slightly imperfect phone-camera look, real-life clutter | Available light, mild exposure flaws | Reads authentic in feeds; pair with `ad-frameworks.md` UGC scripts |
| **conceptual** | Product defying physics: levitating, splash, deconstructed | Studio dramatic | Hero-banner / campaign key visual energy |
| **restyle** | Existing approved product shot, new background/mood/season | Inherit product lighting, replace environment | An *edit* operation on a real photo — keeps the product pixels honest |

## Mode selection interview (ask at most 2 questions)

1. "Where will this run?" (PDP/marketplace → hero + macro + scale; social feed → lifestyle + ugc-style; campaign → editorial/conceptual)
2. "Studio-clean or in-the-world?" — then pick the mode yourself and say which you picked.

## Standard packs

- **PDP pack:** hero + macro-detail + scale-reference + lifestyle (4)
- **Social pack:** lifestyle + flat-lay + ugc-style in 1:1 and 9:16 (see `platform-specs.md`)
- **Campaign pack:** editorial + conceptual + hero re-skinned to the campaign style system

## Honesty rules

- The product itself must stay faithful to references — material, color, proportions, label. If generation alters the product, regenerate or edit; never deliver a misrepresented product image for commercial use.
- Marketplace main images: pure white background, no props/text, product ~85% of frame (see `platform-specs.md`).
