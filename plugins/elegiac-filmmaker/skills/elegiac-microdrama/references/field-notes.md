# Evidence and integration notes

Observations dated 14 September 2026; not guarantees or hardcoded prices. Check current schema/quotes before generation.

## Native scenelet pilot

Another League tested a 15-second, three-shot WAN 3.0 Standard scene using two character sheets, a landscape location master and two short solo ElevenLabs voice samples. WAN generated new dialogue using voice identity, not demonstrated waveform passthrough. The user approved voice resemblance, lip-sync, performances, pacing and internal edits, and preferred this to the old isolated-shot assembly.

An identical MiniMax comparison was judged too contrasty, less sharp, weaker in voice clarity/fidelity and wrong in one speaker assignment. It delivered about 15 seconds (H3 is not limited to five). An identical Seedance 2.0 attempt produced no video, returned generic invalid-input error and was refunded; the error did not prove a specific moderation cause. These tests motivate this workflow, not universal rankings.

The WAN first attempt was content-check rejected; an explicitly requested identical retry succeeded. Do not infer blanket reference bans or auto-retry moderation failures. Keep references and safety settings intact unless an authorized creative change is appropriate.

## Tool traps

- Model schema default resolution/aspect/duration may differ from this skill: explicitly send wan-3, standard, 720p, 9:16 and duration string.
- Live WAN references are numbered Image 1 / Audio 1 by array order. Static catalogs have used other syntax; verify live/provider guidance. Adding a start image alongside references can shift numbering.
- quote_generation has rejected duration even as the required string. A quote-only multiPromptShots sum produced the correct 15-second quote in observed tests; actual WAN generation still used one prompt and duration, no shots array. Use this only if current quote semantics confirm the intended sum, compare the generation's approved quote/cap, and never reuse a default-duration quote as if it priced a longer take. If exact pricing cannot be established, report the problem rather than spend an unknown amount.
- URLs must come from actual assets; never fabricate storage tokens.
- Pending/result-fetch errors do not authorize duplicate jobs. Keep IDs and reconcile unknown submissions. A refund requires billing evidence.
- Probe actual media. Resolution labels, prompt timestamps and requested duration are not proof of output specs.
- Image-model catalog presence is not proof the worker supports generation. On an unsupported model, disclose and resolve an authorized alternative; do not silently reroute.
- Board placement and final registration are separate from successful generation. Verify each.

## Creative lessons retained

Reuse location canon; document causal prop/seat state; write the emotional logic before camera directions; keep voice assignments unambiguous; check tails and both sides of every cut. Let a good scene play intact. Preserve native sound and do not solve every issue with more shots.

Source basis: current Elegiac WAN schema; [Alibaba WAN 3.0 guide](https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-guide); [fal WAN reference API](https://fal.ai/models/alibaba/wan-3.0/reference-to-video/api); user-reviewed production pilots. Exact audio-performance preservation remains unproven for the two-speaker multi-shot workflow.
