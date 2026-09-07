# MicroDrama branding: brand punctuation, not an intro

Microdrama branding behaves like mobile-content packaging, not TV packaging. The episode gets into story immediately and keeps momentum into the next episode; the **series** is the unit being branded, never the individual episode. Key art, the series page, character imagery, typography, colour, and the platform UI carry most of the identity that a title sequence used to carry. What remains for the episode is one repeatable 1–2 second **brand punctuation** package: mark animation, sonic sting, typography, and end-card behaviour.

The package is designed once per show, stored in durable memory, and reused byte-for-byte in every episode. Resolve it **before** the edit manifest is written; the validator refuses a manifest without a `branding` block, and HyperFrames must never invent logos, stings, or credits on its own.

## Rules of the form

| Element | Rule |
| --- | --- |
| Series title / mark | Brief or over the picture. Episode 1 may open with a 0.5–2 s splash after the cold hook lands, or a translucent mark over the opening shot. Episodes 2+ default to a translucent overlay mark or nothing at all. |
| Episode titles | Numbered (`S1 · EP7`). The platform UI carries episode information. A creative title may live in metadata; it is never a title card that stops the story. |
| "Previously on" | Avoided. Comprehension comes from callbacks and repetition inside the drama. |
| Opening theme / title sequence | Never. A 20–60 s open is wrong for the form and even 10 s is expensive against a 75 s episode. A short sting plus the mark is the whole "theme". |
| Theme music | A recurring 1–3 s sonic signature and a melodic motif the score can reuse, not a song played at the top of every episode. |
| End credits | Out of the dramatic flow. Platform metadata carries credits; if on-screen credits are contractually required they are very short end matter after the end card, never a rolling sequence. |
| Cliffhanger | Sacred. The last image, line, or reveal lands clean, then hard cut or a very short blackout, then the branded end card with the sting, then the next episode. |

The conditioning the package creates is `reveal → sting → mark → NEXT`. Anything that dissipates that (a slow fade, a theme song, cast credits, production-company logos, a "next episode" preview) is prohibited.

## Making the mark when there is no logo yet

Two findings from Another League S01E01, where the first four attempts were rejected outright ("these are junk"):

- **Generated wordmarks are a poor buy.** A model asked for "a logo for X" returns clip art: correct letters, no idea. Three `muse-image` wordmarks were rejected in a row.
- **Illustrated key art with the actual cast is the thing that lands.** Ask for a full-frame 9:16 poster of a real moment from the show — the premise in one image — with the title lettering inside the illustration, and pass the cast identity sheets as `referenceImageUrls` so the figures are the characters rather than strangers. That poster then serves twice: as the Episode 1 splash, and cropped to its title band as the series mark. The keeper came from `gpt-image-2` at medium 2K with four cast sheets attached; `reve` was tried first and returned a downstream 500 on two jobs with 100 credits deducted and unrefunded.
- **Verify a supplied "transparent" PNG actually has an alpha channel.** A user-supplied file named `..._transparent.png` had the checkerboard flattened into the pixels, and `ffprobe` reports `rgb24` for it. Check with PIL (`Image.open(f).mode`), and if there is no alpha, key it back out by saturation and luminance — brand colours are saturated, the checker greys are not — rather than compositing the grid into the render.

## Bookend design

**Episode 1 opening** (`opening.mode`): `splash` (0.5–2 s title treatment, after or instead of a beat that can afford it) or `overlay-mark` (translucent mark over the opening shot, no added time). Never delay the cold hook past the first three seconds.

**Episodes 2+ opening**: `overlay-mark` or `none`. A splash on an episode after the first is flagged by the validator and needs a stated reason.

**Every episode ending** (`endCard`): cliffhanger frame → hard cut or `blackoutSeconds` 0–0.5 → end card `durationSeconds` 0.5–1.5 with the mark and, when `mode` is `mark-and-sting`, the sting starting on the cut to black. Optional `nextText` such as `Next: Episode 8`. No dip, dissolve, or music swell may begin before the last line lands.

**Score motif**: when music is generated (`voice-and-music.md`), brief the composer with the sting's melodic identity ("reuse the three-note rising motif from the brand sting as the score's recurring signature") so the theme becomes vocabulary rather than an interruption.

## Package inventory

| Element | Spec | Sources, in order of preference | Stored |
| --- | --- | --- | --- |
| Series mark | PNG with real transparency (or SVG), reads at phone width when scaled to **60–70 %** of the frame; or a typographic lockup (title + font) that HyperFrames renders | user file → StyleSystem/key-art title treatment → **illustrated key art the mark is cropped from** (see below) → generated wordmark on `muse-image` (3 credits) → typographic | `brand/series-mark.<ext>` in the Production Kit; `series-manifest.branding.seriesMark` |
| Sonic sting | 0.3–3 s (target ~1 s), one clear hit, clean tail that ends inside the end card, intelligible on a phone speaker | user file → `generate_audio` with `audioCategory: "sfx"`, `model: "elevenlabs-sfx-v2"`, `sfxDuration: 1`, `loop: false` ("brand sting: short rising synth hit with a hard cinematic impact, dry tail") or a 2–3 s music job → waived | `brand/sting.<ext>`; `series-manifest.branding.sting` |
| Typography and colour | One display family for the mark/end card/episode bug and one caption family, **chosen from the families HyperFrames can fetch from Google Fonts** (Inter, Bebas Neue, Space Grotesk, JetBrains Mono, Oswald, Playfair Display, …; Inter Tight is not one of them); one or two brand colours | StyleSystem → user brand kit → chosen once with the user | `series-manifest.branding.typography` / `palette` |
| Bookend ground | The surface behind the mark on the splash and end card: a full-bleed gradient or texture in the brand palette, or dedicated key art. **Never bare black** (the Tessa complaint) and **never a blurred grab of the splash** (the Another League complaint: "ugly grab from the splash screen"). A blurred frame of your own poster reads as a placeholder, because it is one. | chosen once with the user; `mode: gradient` is the safe default, a dedicated `texture` plate is better | `series-manifest.branding.ground` |
| Opening treatment | `splash` / `overlay-mark` / `none` per the bookend design | decided once per show, Episode 1 vs later | `series-manifest.branding.opening` (`episode1` and `later`) |
| End card | mode, blackout, duration, `nextText` pattern | decided once per show | `series-manifest.branding.endCard` |
| Episode bug | `S1 · EP7`, translucent, inside the phone-safe zone, first 2–3 s only, optional | convention | `edit-manifest.graphics.episodeBug` |
| Credits | `none` by default; `end-matter` ≤ 3 s only on a rights/platform requirement | user/legal | `series-manifest.branding.credits` |

Store the series-level block in `series-manifest.json` (see `schemas.md`). Each episode's `edit-manifest.branding` copies the resolved files and policy so the manifest validates on its own; a changed mark or sting hash between episodes is a deliberate rebrand and must be called out in the call sheet.

## Bookend template (what HyperFrames builds from the package)

Both bookends share one layout so the show is recognisable in a single frame:

- **Ground**: `branding.ground` full-bleed (gradient of `palette[0]` → `palette[1]` at 20° with 3 % grain by default). Bare black is prohibited.
- **Mark**: centred, width 60–70 % of the frame for the splash, 55–65 % for the end card; PNG with transparency placed as-is, never `mix-blend-mode` to hide a baked background. A typographic lockup renders the title in the display family at about 11 % of frame height, letter-spaced, in `palette[2]` or near-black.
- **Splash (Episode 1)**: inserted after the cold-hook shot has landed (never before it), 0.5–2 s, hard cut in, hard cut out, sting on the cut in.
- **Overlay mark (later episodes)**: 36 % width, 70 % opacity, top-centre inside the safe zone for the first 2–3 s of the opening shot; no ground.
- **End card**: cliffhanger frame → hard cut or ≤ 0.5 s black → ground + mark + `nextText` in the caption family at 4 % frame height under the mark → sting starting on the cut to black, ending inside the card.
- **Sponsor or credits end matter**: only when `credits.mode` is `end-matter`; the sponsor's own ground and palette (a sponsor card is *their* brand, not the show's), logo at ≤ 30 % width with its tagline, 0.5–1.5 s, after the end card and never before it. Stagger the fades so the card assembles rather than pops, keep it silent, and ask for the sponsor's fonts — at 1 s a tagline is a glance, so if the URL has to register, argue for 1.5 s.

The stills animatic uses the same template so the bookends are reviewed with the stills, not discovered at the render.

## Pre-render branding checklist (the gate)

Run this once per show, then reuse. It sits **before the first cut is built** in `edit.md` (so bookends, fonts, and ground are built once, not rebuilt when the package arrives), and inside step 8 of `new-show.md`.

1. **Read before asking.** Load `series-manifest.branding` and the Production Kit `brand/` folder. If every element is `provided`, `typographic`, or `waived` with a reason, reuse it silently and skip to step 4.
2. **Ask once, in one message.** Request, in this order, with a recommended default for each so Fast Track can accept the whole package in one reply:
   - the series mark file, or permission to render a typographic lockup, or a quoted logo generation;
   - the sonic sting file, or a quoted generation (`elevenlabs-sfx-v2`), or a waiver;
   - typography and colours (or "use the StyleSystem");
   - the opening policy for Episode 1 and for later episodes;
   - the end-card policy and `nextText` pattern;
   - whether any credits are contractually required.
   A waiver is explicit and recorded with a reason (for example `platform UI carries series identity`); silence is not a waiver.
3. **Generate only what was approved.** Quote each generation (`quote_generation`), get authorization, generate, let the user pick, then freeze the keeper into `brand/` and hash it. Generated marks and stings are registered assets with `sourceOrigin: elegiac`; user files carry `sourceOrigin: user` and a source label.
4. **Write it down.** Update `series-manifest.branding`, mirror a compact "Brand punctuation" card on `00 — Series Bible` with `update_board_artifact`, and copy the resolved block into `edit-manifest.branding`.
5. **Validate.** `validate-episode-manifest.mjs` fails without the block, with a splash longer than 2 s, an end card outside 0.5–1.5 s, a sting longer than 3 s, or a mode that references a waived element. The summary reports `bookendSeconds` and `masterDurationSeconds` (story cut plus bookends).
6. **Hand off.** `build-edit-handoff.mjs` writes the package into `BRIEF.md` (assets with hashes, timings, and the prohibitions). HyperFrames places the sting under the end card, keeps the cliffhanger frame untouched, and adds nothing the brief does not name.

## Anti-patterns to reject on sight

- Any logo, splash, or title before the cold hook has landed.
- A title card, "previously on", or episode-name card anywhere in the story.
- A fade-to-black that starts under the cliffhanger line.
- An end card over 1.5 s, a sting that outlasts the end card, or music swelling over the black.
- Rolling credits, cast lists, production-company logos, or a "next episode" preview clip.
- A different mark, sting, or typography from the previous episode without a recorded rebrand.
- HyperFrames-invented placeholder branding because the package was never resolved.
