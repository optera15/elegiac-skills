# The continuity gate: no still animates unreviewed

This gate sits between stage 2 (stills) and stage 3 (motion) of `production-pipeline.md`. It costs nothing and it is where an episode is won or lost: an H3 Turbo clip and a VEED pass cost roughly 200 credits per cut, a still costs 3–25, and a broken still animated is a broken clip paid for twice. Tessa S01E01 skipped this gate and delivered "unwatchable slop" on staging alone: a character leaning on a truck, then twenty feet in front of it, then on a slightly different truck; extra trucks around the lot; the protagonist in a cab identical to the other character's truck; a cab shot through the windshield that made no spatial sense. Every one of those was visible in the still.

The gate has two halves: a **per-still checklist** written into the ledger and a **stills animatic** the user watches before saying "animate".

## 0. A still is the FIRST FRAME of its clip, not a snapshot of the scene

Every check below depends on this and it is the rule most easily lost. A still is not "a picture of this beat"; it is the frame the clip starts on. Two things follow, and both were learned the expensive way on Another League S01E01:

- **Never write a still as though a state change has already happened.** If a car door is open at the end of one shot, it is open at the start of the next, and the *closing* is performed inside a clip. That episode's opening was built with the door open while a boy talks and closed in the reverse, so the door shut in the gap between two cuts and the scene was unplayable. Both stills and both clips had to be re-shot. Ask of every still: does its opening state match the **end** state of the previous cut, and is every change between them performed on screen by someone?
- **The stills animatic cannot catch this**, because it holds stills and shows no motion. This gate is the only place it gets caught, so check it here rather than trusting the animatic to reveal it.

The same reasoning applies to a matched pair. An over-the-shoulder and its reverse are one geometry: fix who is screen-left and who is screen-right in the OTS, and the reverse must honour it. Generating the reverse from a fresh description rather than from the pair is how a scene ends up with two characters looking the same way.

## 1. Per-still checklist (shot order, always)

Review stills in edit order, never as a pile. For each still, open the plate it was pinned to, the previous PASS still, the next still, and the speaking character's identity sheet. Answer every line; write the result to `shot.continuity`.

| Check | Question | Typical failure |
| --- | --- | --- |
| `plate` | Is this the pinned plate? Same building, fence, ground, horizon, sun direction, vehicle count, vehicle colour and era? | A different truck; a second truck that was never there; a lot that gained a lamppost |
| `position` | Where is each character relative to the fixed objects, and does that agree with the previous still and with what the script says happened in between? | Leaning on the hood, then in front of the grille, then leaning again with no move scripted |
| `axis` | Do eyelines and body directions keep the line? Left-looking character still looks left in the reverse? | Reverse crosses the line; both characters look screen-left in a two-hander |
| `vehicle` | Is every vehicle the vehicle in its plate (colour, era, dents, interior)? Is the character inside the vehicle they own? | Tessa in a cab identical to Natalie's; the cab plate's boxy Ford becomes a modern truck |
| `viewpoint` | Could a camera physically be here, and does the framing string match? | Shot "from the driver's side" returned through the windshield from the hood |
| `wardrobe` | Sleeves, colours, layers, jewellery, hair state, exactly as the identity sheet and the ledger say for this scene? | Short-sleeve polo gains a long cuff in the insert |
| `anatomy` | Hands, arms, skin age, nails, fingers, teeth against the identity sheet? | A nineteen-year-old with a sixty-year-old hand |
| `props` | Every plot object present, same object, same state, in the hand or place the previous still left it? | The bag appears, disappears, changes colour |
| `light` | Same lighting key and time of day as the plate and neighbours? | Sunset in one still, overcast in the next |
| `face` | For a speaking cut: exactly one visible face, mouth closed, within ~30° of camera, unobstructed? | Two faces (lipsync will pick one); mouth open (reads as mid-word in a held frame) |
| `state` | Does this frame's opening state match the END of the previous cut — doors, props, who is standing, what is in whose hand? Is every change between the two performed on screen? | A door open in one shot and already shut in the next |
| `frame` | Native 9:16 staging, subject in the upper-middle, caption zone clear, nothing important in the platform UI zones? | Face at the very top; hands cropped |
| `text` | Any generated text (phone screens, signs) legible at phone size and correct? | Phone message unreadable |
| `sense` | Would a script supervisor accept this frame in the cut? | Anything that makes you say "wait, where are we?" |

Result per still:

- `pass`: every check holds.
- `fix`: one or two checks fail and `edit_image` can repair them (wardrobe, a prop, a single stray vehicle) with the plate and the neighbour as references.
- `reject`: the plate, position, vehicle, viewpoint, anatomy, or sense check fails. Regenerate from the plate; do not animate; do not adopt as canon.

Rules that override taste:

- **A deviation is a reject candidate, not a happy accident.** "It's boxier than I pictured, I like it more, it's now canon" is how two different trucks entered Tessa. A departure from the plate or the framing string may only become canon after every neighbour is re-checked against it and the plate is updated.
- **The majority is usually right.** When one still disagrees with its plate and neighbours, re-roll that one, not the others (`elegiac-scene-continuity`).
- **Absurd is a hard reject.** No note, no "we can cut around it". If the frame cannot exist in the world, it does not get a clip.
- **No animation with an open review.** `continuity.status` must be `pass` on every cut before stage 3, and stage 3 checks the blueprint, not the chat.

Write the review compactly to the ledger:

```json
"continuity": {
  "status": "reject",
  "checks": { "plate": false, "vehicle": false, "position": true, "axis": true, "wardrobe": true, "anatomy": true, "face": true, "sense": false },
  "reviewedAgainst": { "plateId": "loc-lot-hood", "previousShotId": "S01E01-060", "nextShotId": "S01E01-080" },
  "note": "second truck behind Natalie; Natalie's truck is the wrong colour",
  "reviewedAt": "2026-09-07T12:00:00Z"
}
```

## 2. Cheapest fix first

1. **Editorial**: can the shot be dropped or replaced by an existing PASS still (a reaction, an insert)? Free.
2. **Surgical edit**: `edit_image` on the outlier with the plate and the adjacent PASS still in `referenceImageUrls`: "remove the second truck; keep pose, lighting, background unchanged." 3–25 credits.
3. **Anchored regeneration**: regenerate only the outlier from the plate with cast references, the verbatim lighting key, and the style line. A fresh idempotency key.
4. **Identity repair**: if the same character drifts across many stills, fix the identity sheet (`make_board_character_consistent`), then regenerate the affected stills.
5. **Plate repair**: if many stills at one staging position fail the same way, the plate is the problem. Regenerate the plate, then the stills.

Fix one, confirm it cuts with its neighbours, then batch the rest.

## 3. The stills animatic

When every still is `pass`, build the episode as stills before any clip exists:

```bash
node <skill>/scripts/build-stills-animatic.mjs episodes/s01e01/episode-blueprint.json --root . --output post/animatic
HYPERFRAMES_BROWSER_PATH="<chrome>" npx hyperframes preview post/animatic --background --port 3022
```

The script holds each still for its `clipDurationSeconds` (with a slow 2–3 % push so `check` does not report a frozen timeline), lays each stem under its cut at the cut's start plus 0.25 s, applies the edit order override if one exists, and adds the branding bookends if `series-manifest.branding` is resolved. No captions are burned in. Run `npx hyperframes check` on it like any composition.

The user watches it end to end, muted and with sound. This is the only place where the flow of the scene can be judged for the price of nothing. Two outcomes:

- Fixes named: return to the checklist for those shots, rebuild, re-preview.
- **"animate"**: record in the blueprint

```json
"animatic": { "approvedAt": "2026-09-07T12:30:00Z", "stillHashes": { "S01E01-010": "sha256…" }, "previewPath": "post/animatic" }
```

Stage 3 reads `animatic.approvedAt` and compares the still hashes to the files on disk; a changed still after approval reopens the gate for that cut.

## 4. What the gate does not cover

It does not review motion. After the pilot batch of clips (stage 3), look at first and last frames and one midpoint per clip for the same checks; a motion model can introduce a vehicle or move a character too, and the last frames are where a VEED reversal shows. Motion review is cheaper than lipsync, which is why the pilot batch exists.
