---
name: elegiac-model-compare
description: Run a model bake-off with Elegiac — the same prompt across multiple image or video models, scored against a rubric, with a recommendation. Use when the user asks to compare models on a brief or which model to standardize on for a project.
allowed-tools: Bash
argument-hint: "[the prompt/brief + candidate models if known]"
references:
  - model-catalog.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Model Compare

A bake-off with a rubric, not a vibe check. Same prompt, same aspect, draft resolution, 2-4 candidates — then a recommendation the user can standardize on.

Read `references/model-catalog.md` first — if the routing table already answers the question confidently (e.g. "rendered text → GPT Image 2"), SAY SO and offer to skip the spend. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Workflow

1. **Pick candidates from the routing table**, not the full roster: 2-4 models whose strengths plausibly fit the brief. `list_models` for current availability; `get_model_schema` to confirm each supports the needed params (aspect, references). Drop candidates that can't take the brief's inputs.
2. **Identical conditions:** the exact same prompt, same aspect ratio, same references, `resolution: "1k"` (drafts — this is a comparison, not finals).
3. **Score against the rubric** (state scores honestly, including "can't judge from one sample"): prompt adherence · anatomy/structure · text legibility (if any) · style fit to the brief · reference fidelity (if refs) · cost per result.
4. **Recommend:** one winner for this brief + when each runner-up would be the better choice. If the user adopts a winner for a project, suggest recording it in the production's style system notes so future sessions inherit the decision.
5. Video bake-offs: same flow with `generate_video`/`animate_image` at 5s with `qualityMode: "draft"`; add motion coherence to the rubric. Warn that video grids cost real credits even at draft settings.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md` (pin each candidate with `--model` on `elegiac generate image`).

## Output

A comparison table (model, scores per rubric axis, credits, URL), the recommendation with reasoning, and the per-model result URLs labeled clearly.

## Related skills

- Why a specific model keeps failing → `elegiac-prompt-doctor`
- Exploring looks rather than models → `elegiac-style-explorer`
- Day-to-day routing guidance lives in → `references/model-catalog.md` via `elegiac-generate`
