---
name: elegiac-prompt-doctor
description: Diagnose and fix failed or disappointing Elegiac generations — ignored prompts, mangled text, broken anatomy, style drift, 422 errors, content-policy rejections. Use when the user says a generation looks wrong, "why did it ignore my prompt", "the hands are broken", "it doesn't match my style", or a model call keeps failing.
allowed-tools: Bash
argument-hint: "[the failed result or error to diagnose]"
references:
  - prompt-patterns.md
  - model-catalog.md
  - elegiac-conventions.md
  - elegiac-cli.md
---

# Elegiac Prompt Doctor

Diagnose before you spend. Most "bad generations" are one of a dozen known failure modes with a known cheapest fix — work the ladder, never re-roll blindly.

Read the failure-mode table in `references/prompt-patterns.md` — it IS this skill's procedure. Before any spend or mutating call, apply the Spending, Permissions, and Defaults rules in `references/elegiac-conventions.md`.

## Diagnosis (zero spend)

1. **Look at what was actually sent**, not what the user thinks was sent: `get_job` / `get_workflow_run` return the real prompt, model, parameters, and reference images. Missing references and missing styleSystemId are the two most common root causes.
2. **Check the model contract:** `get_model_schema` — was a rejected/ignored parameter even supported? On bare 422s, diff the sent payload against the schema before touching the prompt.
3. Match the symptom to the failure-mode table in `prompt-patterns.md` and identify the rung-1 fix.

## Treatment rules

- **Cheapest fix first**, one variable at a time: restructure the prompt → drop/move a clause → change one parameter → switch model family (per `model-catalog.md` routing).
- Re-test at 1K draft resolution; only re-run at final quality once the fix is proven.
- Two failed fixes on the same model = switch families, don't keep rolling.
- Content-policy rejections: check whether the reference images are the trigger (photoreal-person refs on strict models — see `model-catalog.md` caveats) before rewording anything.
- For an approved image with one local flaw, `edit_image` the flaw ("fix the lettering on the sign to read 'DUSK'; keep everything else unchanged") instead of regenerating the whole frame.

## CLI

Only when the user explicitly asks to test or use the CLI: use the commands in `references/elegiac-cli.md`.

## Output

The diagnosis (symptom → root cause, citing the actual sent payload), the fix applied and why it was the cheapest rung, and the before/after URLs. If the fix is "this model can't do that", say so and name the right model.

## Related skills

- Drift across a multi-frame scene → `elegiac-scene-continuity`
- Choosing models up front → `elegiac-model-compare` workflows via `elegiac-generate`
