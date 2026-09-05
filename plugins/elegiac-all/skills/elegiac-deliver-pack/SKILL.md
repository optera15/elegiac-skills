---
name: elegiac-deliver-pack
description: Package and hand off finished Elegiac work — delivery manifests, organized download packs, editor/client handoffs with stable filenames. Use when the user asks to package the finals, "give me everything as files", export a board or campaign, a deliverables manifest, or a handoff to an editor/client.
allowed-tools: Bash
argument-hint: "[which board or campaign to package]"
references:
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Deliver Pack

The last mile: turn a finished board or campaign into a handoff a stranger can use. `export_pack` is read-only — zero credit spend, no quote, no permission step.

Apply the Fail-closed and Reporting rules in `references/elegiac-conventions.md`.

## Workflow

1. **Identify the source** — a board (`list_boards`/`get_board`, needs `productionId`) or a campaign (`find_campaign_memory`/`get_campaign`). If the user says "the finals", confirm which board/campaign holds the approved versions so the pack ships keepers only.
2. **`export_pack`** with `boardId`+`productionId` or `campaignId`. It returns the manifest: title, item count, and per-item label / mediaType / URL / `suggestedFilename` (numbered, slugified, extension-correct).
3. **Deliver appropriately:**
   - Chat handoff: present the manifest as a labeled list — recipient downloads what they need.
   - File handoff: the CLI downloads everything — `elegiac export pack --output-dir` writes the assets under their suggested filenames plus `manifest.json` into a pack directory.
4. **Annotate the manifest** for the recipient: which asset is which deliverable, target platform/spec per item, and any conform notes ("trailer beats 1-7 in order; music bed is item 12"). The export gives structure; you add meaning.
5. Large packs: respect `itemLimit` and report exactly which items were truncated.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The annotated manifest (item, what it is, spec, URL or local path), the pack location if downloaded, and what was excluded and why.

## Related skills

- Assembling the assets being delivered → `elegiac-launch-kit` / `elegiac-campaign-pack`
- Cleaning up before export → `elegiac-production-audit`
