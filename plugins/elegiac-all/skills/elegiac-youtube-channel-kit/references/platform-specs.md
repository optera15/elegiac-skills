# Platform Specs (aspect, duration, safe areas, text norms)

Authoritative cheat sheet for sizing deliverables. When a platform is named, use these specs without asking. Specs drift — if a spec matters commercially (paid media buy), tell the user to confirm against the platform's current docs.

## Video

| Platform / placement | Aspect | Durations that perform | Notes |
|---|---|---|---|
| TikTok | 9:16 | 9–15s organic; ≤30s ads | Top ~10% and bottom ~25% covered by UI/captions — keep faces and text in the middle 65% |
| Instagram Reels | 9:16 | 7–15s | Bottom ~20% covered by caption/CTA; right edge ~10% by action rail |
| Instagram Feed | 1:1 or 4:5 | ≤30s | 4:5 takes more screen; sound-off assumption — needs burned-in text |
| YouTube Shorts | 9:16 | 15–60s | Title overlays bottom; hook in first 2s |
| YouTube pre-roll | 16:9 | 6s bumper (non-skip), 15s, 30s | 6s = one idea + logo, no plot |
| Meta Feed ads | 1:1 (also 4:5) | 15s | First 3s decide; design sound-off |
| Meta Stories ads | 9:16 | ≤15s | Top 14% / bottom 20% are UI-unsafe |
| X / Twitter | 16:9 or 1:1 | ≤30s | Autoplays muted |
| LinkedIn | 16:9 or 1:1 | 15–30s | Professional tone; captions expected |
| Theatrical / festival trailer | 16:9 (scope letterboxed inside) | Teaser 30–60s; trailer 90–150s | See `trailer-structures.md` |

## Stills

| Surface | Pixel spec | Safe-area / text notes |
|---|---|---|
| Theatrical one-sheet poster | 27×40 in — work at 2:3, e.g. 2400×3600 | Reserve bottom ~15% for billing block; top third for title; see `poster-key-art.md` |
| YouTube thumbnail | 1280×720 (16:9) | Must read at 168px wide; ≤4 words; bottom-right corner shows duration badge |
| YouTube channel banner | 2560×1440 | Only the central 1546×423 is visible on all devices |
| Podcast cover | 3000×3000 (1:1) | Must read at 55px; title legible, no fine detail |
| Instagram post | 1080×1080 (1:1) or 1080×1350 (4:5) | Grid crops preview to 1:1 |
| Instagram Story / Reels cover | 1080×1920 (9:16) | Middle 65% safe |
| X header | 1500×500 | Avatar overlaps bottom-left |
| Meta link-ad image | 1200×628 (1.91:1) | Minimal text on image performs better |
| Amazon/marketplace main image | 2000×2000+, pure white bg | Product fills ~85% of frame; no props/text on main |
| Key art social crops | derive 1:1 and 9:16 from the one-sheet | Re-compose, don't crop — title must survive |

## Text-on-image norms

- Thumbnails/posters/banners with rendered text need a **text-capable model** (see `model-catalog.md`). Verify spelling in the output before delivering; regenerate or edit if mangled.
- Sound-off platforms (Meta, X, LinkedIn feeds) need the message readable without audio: burned-in captions or text overlays.
- Paid placements: Meta no longer hard-blocks >20% text but dense text still reduces delivery; keep overlay text under ~6 words.

## Duration ladders (cutdown planning)

Master 60–90s → 30s (one act, one promise) → 15s (one moment + CTA) → 6s (one image, one line, logo). Each rung is a **re-edit of the idea**, not a trim: keep the single strongest beat, cut everything that needs context.

## Aspect translation rule

Going 16:9 → 9:16 is a re-composition, not a crop: re-generate with the same style system/references at the target aspect, re-centering the subject vertically. Faces that sat at thirds-left in 16:9 belong center-frame upper-third in 9:16.
