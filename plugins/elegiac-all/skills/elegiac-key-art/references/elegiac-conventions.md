# Elegiac House Rules (shared conventions)

Every Elegiac skill follows these rules. Skills reference this file instead of duplicating it.

## Spending

- **Quote before spending.** Call `quote_generation` (or pass `--max-credits` on the CLI) before any batch or any single job the user has not already priced. Show the user the total before proceeding.
- **Always set a batch cap.** Multi-asset work takes a total `maxCredits` / `--max-credits`, never per-item caps the user has to add up. When the user gave no budget, derive the cap from the quote.
- **Small first pass.** Generate 3-6 frames / 3-5 pack deliverables / 1-2 hero assets before expanding. Get approval on the look, then scale.
- **Draft economy.** Use 1K stills and `qualityMode: "draft"` video for exploration; this routes omitted video models to Seedance 2.0 Mini at 480p. Reserve 2K stills and 720p+ video for keepers. Never run a large batch at final quality before the user has approved a draft.

## Permissions

- A mutating tool may return a `permission_required` error containing an `approvalUrl`. Show the quoted cost and the URL, ask the user to approve in Elegiac, then **retry the exact same call** (same params, same `idempotencyKey`).
- **Standing policies beat repeated approvals.** When a loop will call the same spend action many times with different params (a scene of `enhance_prompt` + `generate_shots`), tell the user on the first `permission_required` that the approval page has an "Also permit … in future" checkbox (scoped to the production or the client, optionally capped at the quoted credits). One approval then covers the loop; the policy is revocable under Agent Integrations → Permissions. Host-side tool approvals are separate.
- `idempotencyKey` policy: a fresh key per distinct attempt; reuse the same key only when retrying an identical call after a transport error or an approval, so the job is not double-billed.

## Defaults

- Stills: `resolution: "2k"` for professional output; `1k` only for drafts/smoke tests.
- Video: `720p` professional default; for cheap drafts pass `qualityMode: "draft"` and omit `model` unless the user asks for a specific model. Higher than 720p only on explicit request.
- Aspect: `16:9` unless the deliverable or platform dictates otherwise (see `platform-specs.md`).
- Do not pass model parameters the model's schema doesn't declare — check `get_model_schema` when unsure.

## Memory discipline

- **Reuse before create.** Check `list_characters`, `find_style_system`, `find_campaign_memory`, `list_boards` before creating anything new.
- **Promote keepers.** Approved board artifacts go to durable memory (`promote_character_concept`, `promote_visual_style_to_style_system`, `promote_character_variant`).
- Apply style systems by `styleSystemId`, never by copying their text into prompts. Honor a style system's `negativePrompt` strictly — it is brand governance, not a suggestion.
- Archive (soft-delete) rather than abandon; archived records restore cleanly.

## Rights and likeness

- Real-person likeness (face refs, voice cloning, virtual influencers based on a person) requires explicit, recorded consent. Track it via `update_character_bible` rights fields. If rights are restricted or consent is not on file, do not generate the likeness — offer a fully fictional persona instead. Cast-backed generation fails closed on characters marked `restricted`/`needs_consent`.
- Disclose synthetic spokespeople per platform norms. Never present a synthetic person as a real customer or as giving a real first-person testimonial.

## Fail closed

- These skills require the Elegiac MCP server (or authenticated `elegiac` CLI). If neither is available, say so and stop — never fall back to driving the web app, screenshots, or another provider.

## Reporting results

- Poll `wait_for_job` / `wait_for_workflow` before reporting when the user expects finished assets. Use 20-second windows (server maximum 25), follow `nextPollAfterMs`, and reuse the existing IDs. A pending response or wait-window expiry is not failure and never authorizes replacement generation. If `stage=submission_unknown`, stop resubmission and reconcile the existing operation. Report delivery and billing state separately from the quote.
- Return **labeled URLs**, not raw JSON: one line per asset with what it is, then the URL. Include credit spend when the user asked about cost.

## Durable media and episode handoff

Generation starts return an accepted operation, with no dependency on keeping the chat open. Use the returned job/workflow ID, or recover a lost start response with the identical idempotency key. A wait defaults to 20 seconds and is capped at 25; expiry is normal pending progress. If `requiresAction` is true (`submission_unknown` or `recovery_required`), preserve the ID and surface the reconciliation need; do not keep polling or generate a replacement automatically.

MCP `upload_asset`, `export_pack`, and `export_production_kit` also return `job.id`. Poll `get_job` / `wait_for_job`. An import is registered only when the job completes: record `job.result.id` in the call sheet. A completed export's `job.result.url` downloads the JSON manifest containing the existing kit/files/media structure. Follow `kit.nextBoardOffset` for additional Boards. Large local masters must first use the app/storage upload path; register the resulting HTTPS `mediaUrl`, and mark registration incomplete until an asset ID is returned. Use one stable idempotency key for each import/export version.
