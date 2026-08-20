---
name: elegiac-production-kit
description: Export an Elegiac Production as a portable OpenAI/ChatGPT or Anthropic/Claude Production Kit folder. Use when the user asks to export a production or take it into ChatGPT or Claude, refresh a kit with `elegiac kit sync`, or push local shot lists up with `elegiac kit push`.
allowed-tools: Bash
argument-hint: "[which production to export, and whether to download media]"
references:
  - elegiac-conventions.md
---

# Elegiac Production Kit Export

A **Production Kit** is a portable folder that mirrors a live Elegiac Production: a `SKILL.md` production office that any skill-aware agent can run, `elegiac/manifest.json` binding the folder to the Production, plus rendered cast sheets, style guide, per-board shot digests, and tracking files. Zero credit spend — `export_production_kit` is read-only.

Apply the Fail-closed and Reporting rules in `references/elegiac-conventions.md`.

## Two entry states

- **Exported kit** — bound to a live Production (`productionId` in the manifest). The kit's own SKILL.md opens with a Call Sheet built from live data. This skill produces these.
- **Blank kit** — the same template with a null `productionId`, downloadable from Elegiac's Agent Integrations page (Production Kit tab). Point users there when they want to start a film from scratch rather than export existing work.

## Workflow

1. **Identify the production** — `list_productions` if the user gives a title hint; confirm before exporting when several match.
2. **Choose the target and scope** — ask whether the kit is for OpenAI/ChatGPT Projects or Anthropic/Claude. Pass `targetSystem: "openai"` or `"anthropic"`; omission remains Anthropic-compatible. All boards are included by default; pass `boardIds` to narrow. Media is **links-only by default**: the kit's manifests reference every asset by URL. Offer `includeMedia` packs when the user wants files on disk: `refs` (cast reference stills), `curated` (board images), `video` (board clips — can be large).
3. **Export:**
   - **Chat/MCP handoff:** `export_production_kit` returns the rendered kit — `files[]` (path + content) and `media[]` (path, url, pack) for opted-in packs. Without a filesystem, present the summary and point the user to the app's Export Production Kit button on the Production page for a one-click zip.
   - **File handoff (CLI):** `elegiac export kit` materializes the full folder locally — writes every file, creates the working directories, downloads opted-in media to their manifest paths, and records downloaded packs in `elegiac/manifest.json` under `assets.packs`.
4. **Hand off:** for OpenAI, tell the user to paste `chatgpt/PROJECT_INSTRUCTIONS.md` into Project settings and upload the four sources listed in `chatgpt/README.md`; for Anthropic, open the local folder in Claude Code. Connected mode needs an authorized Elegiac tool in that session.
5. **Refresh:** `elegiac kit sync` (from the kit folder, or pass its path) pulls live state back into an existing kit — re-renders Elegiac-owned files, downloads media missing for packs already on disk, refreshes the kit template on `skillVersion` bumps, and stamps `sync.lastReconciledAt`. Locally edited files are never clobbered: the fresh render lands beside them as `*.sync-new.*` for a reviewed merge (`--force` accepts live for everything). Sync never writes to Elegiac.
6. **Push:** `elegiac kit push` sends locally authored scene shot lists (`shots/scene-*.md`) up to the production's board as shot-list cards — first push creates the card (`add_shot_list`), later pushes patch the same card (`update_board_artifact`), and each push is recorded in `sync.pushedArtifacts` so unchanged lists (including Hero/Clip/Status-only edits, which stay local) are skipped. Rendered board digests are pull-owned and never pushed. `--dry-run` previews; a `permission_required` reply means the user approves board writes in Elegiac once, then re-run the same command.

## MCP Workflow

```text
export_production_kit { productionId }                                → links-only kit (files[] + empty media[])
export_production_kit { productionId, targetSystem: "openai" }        → ChatGPT Projects adapter + shared live-production files
export_production_kit { productionId, includeMedia: ["refs","curated"] } → kit + media entries to download
export_production_kit { productionId, boardIds: ["<board-id>"] }     → only the named boards' digests
```

`itemLimit` caps per-board items for very large boards.

## CLI Commands

```bash
elegiac export kit --production "$PRODUCTION_ID" --output-dir ./my-film --json
elegiac export kit --production "$PRODUCTION_ID" --target openai --output-dir ./my-film --json
elegiac export kit --production "$PRODUCTION_ID" --output-dir ./my-film --media refs,curated --json
elegiac kit sync ./my-film --json          # pull-refresh an existing kit (add --all-boards to widen scope)
elegiac kit push ./my-film --dry-run       # preview, then push local shot lists up as board artifacts
```

## Output

Where the kit landed (or how to get it), what it contains (target, file count, boards covered, media packs downloaded vs links-only), and the target-specific handoff for ChatGPT Projects or Claude.

## Related skills

- Working inside a kit → the kit's own SKILL.md (production office); this skill only creates kits
- Flat media handoffs without the production-office wrapper → `elegiac-deliver-pack`
- Pre-export cleanup (archive strays, check credits) → `elegiac-production-audit`
