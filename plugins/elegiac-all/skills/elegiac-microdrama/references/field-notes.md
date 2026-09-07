# Field notes from Another League S01E01 (2026-09)

Notes to the next model that builds an episode. Everything here was paid for once. The rules live in the other references; this file is the reasoning behind them and the small operational facts that have no natural home.

The episode: 21 cuts, three locations, six speaking lines plus two off-screen exchanges, delivered at 1080 × 1920 / 24 fps / 92.25 s. About 4,600 video and 230 image credits, of which roughly a third was re-work.

## The pipeline that worked

Muse Image drafts → **GPT Image 2** stills (medium, 2K, 15 credits) → **H3 Max Turbo** motion → **VEED Lipsync V2**. Keep it. The user's summary was "worked pretty well", and the failures below were all in the seams, not the stages.

The single highest-value habit was **one build script that owns the cut**. A literal table of `(shot, source, in, out, role, dialogue, sfx)` at the top, and a body that regenerates the edit manifest, the captions, and every composition file. Eleven revisions of the cut, not one hand-edited HTML file, and the manifest could never drift from what actually rendered. Build it on the first episode; it pays for itself by the third note.

## What the user actually asks for, and what it means

The notes arrived one at a time, each one small and each one correct. A representative set, with what it really meant:

| Note | What it actually was |
| --- | --- |
| "The opening clip only has 2 coherent seconds" | Generated digits scramble under motion. Use the first second, cut before the drift. |
| "This drags" on a 2.5 s insert | Inserts want 0.9 s, not 2.5. Find the beat (the button press), keep a breath, cut. |
| "The door sound is too soon" | The cue was on the prompt's timing, not the picture's. Find the frame, place the transient there. |
| "Sienna should cut him off" | Comedy is frames. Cut the first speaker mid-syllable and truncate his stem with the picture. |
| "The audio has drifted terribly" | A superseded stem take. Not a sync problem, an identity problem. |
| "Weird because he is talking nonsense" | The motion model ignored a negation. Stop writing negations. |
| "These are junk" (four brand marks) | Generated wordmarks are clip art. Illustrate a real moment instead. |

The pattern: **measure before you guess**. Almost every note above was answered by pulling frames at 4–8 fps and reading them, or by running an RMS envelope over a stem to find where speech actually starts and ends. Both are free. Guessing at a timing and re-rendering is not.

## Ffmpeg recipes worth keeping

```bash
# Where does the picture actually change? Tile at 8 fps and read it.
ffmpeg -ss 3.0 -i clip.mp4 -vf "fps=8,scale=150:-1,tile=7x2" -frames:v 1 tiles.png

# Where does speech start and end inside a stem? (RMS envelope, 10 ms hops)
#   peak-25 dB is a reliable voiced threshold for ElevenLabs output.

# Tile an ambience bed to length with crossfades, then level it
ffmpeg -y -i bed.mp3 -i bed.mp3 -filter_complex \
  "[0:a][1:a]acrossfade=d=1.5:c1=tri:c2=tri,atrim=0:45,loudnorm=I=-30:TP=-6[o]" -map "[o]" out.wav

# Splice a VEED head onto the original clip so the action after the line survives
ffmpeg -y -i lipsync.mp4 -i clip.mp4 -filter_complex \
  "[0:v]fps=25,scale=768:1344,setsar=1[a];[1:v]trim=start=2.36,setpts=PTS-STARTPTS,fps=25,scale=768:1344,setsar=1[b];\
   [a][b]concat=n=2:v=1:a=0[v];[0:a]aresample=48000,apad=whole_dur=6.59[aud]" -map "[v]" -map "[aud]" out.mp4
```

## Model and connector facts

- **No voice changer, no video-to-audio.** All 41 models are text-to-something plus lipsync. Speech-to-speech does not exist here; neither does Foley from picture.
- **`quote_generation` and `duration`.** Grok and VEED reject it numeric ("must be a string") and then reject the string. Omit it, quote the default, read the real charge off the job.
- **`elevenlabs-sfx-v2` bills by `sfxDuration`**, roughly 1 credit per second. A 15 s bed is 15 credits, so `maxCredits: 4` on a 15 s request fails with `budget_exceeded` before it starts. Set the cap from the duration.
- **Lyria 3 Clip always renders 30 s** and rejects any time phrase in the prompt, including "each phrase is about 1.5 seconds long". Two jobs failed that way and were refunded. Ask for a *collection of short jingles with rests between them*, then cut the phrase you want locally.
- **MiniMax Music 3's `musicDuration` is a ceiling and the shortfall may not be refunded.** 180 s requested, 23.6 s delivered, 90 credits taken. Design music as placed cues, not a bed.
- **Reve 2.1 stalled twice** with a downstream 500 on result fetch, 50 image credits each, deducted and not auto-refunded. Have a fallback ready and record the job ids.
- **Firebase URLs carry per-asset tokens.** Never hand-assemble one from a pattern. A guessed token made VEED fail with "Error downloading file" (refunded, but a wasted cycle). Copy the URL from the tool result or the blueprint.
- **`generate_shots` silently drops per-shot `referenceImageUrls` beyond the first** (`source_frame_limit`). Pass cast through `castMemberIds`, keep `referenceImageUrls` for the plate, and batch by character. The symptom is a stranger in the wrong wardrobe, which reads as identity drift and sends you chasing the character sheet instead of the call. `enhance_prompt` is fine with reference lists; its trap is a hand-typed Firebase token, which cannot be guessed.

## Spending well

Re-work, not generation, is what costs money. The 1,600-odd credits of re-work on this episode break down as four motion re-rolls after a continuity note, six re-lipsyncs, one Grok repair shot at 492, and 100 stuck in failed Reve jobs. Every one of the first ten was preventable at the still stage or by measuring before generating.

When a shot genuinely needs a better model, say what the money buys and let the user choose. Grok at 720p was worth naming as *not* an upgrade — it is a smaller frame than H3 — and the user picked 1080p understanding why.

## Working with the user

- **Batch a render, not a note.** A draft render is about two minutes for 90 seconds. Apply everything you have, render once, send a proxy under 30 MB plus a short excerpt of the specific fix.
- **Send the excerpt.** A 10–20 s cut of just the shot under discussion gets a faster, better answer than the full episode.
- **Say when a preview is lying.** Studio's player stutters on a dialogue timeline; the user reported unlistenable audio from a preview that rendered clean. Volunteer this before they hit it.
- **Name the trade-off, then pick.** "The tagline is a glance at 1 s; 1.5 s makes the URL land" got a decision in one word.
