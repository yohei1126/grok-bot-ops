# Antigravity quota groups and coding lane order

Route each job to the `agy` quota group that matches its work type, and spend
spare headroom before it expires unused. When coding, follow the lane order
below.

Related: [`docs/tooling-and-cost.md`](tooling-and-cost.md),
[`docs/workstation-handoffs.md`](workstation-handoffs.md),
[`docs/shared-rules.md`](shared-rules.md).

## Route by quota group

`agy` exposes three separate model pools. Each pool has its own weekly and
5-hour limits, so exhausting one does not drain the others.

| Pool | Models | Route here |
| --- | --- | --- |
| Docs and multimodal | Gemini Flash and Gemini Pro | Prose drafts, summaries, document edits, image or video input |
| Coding | Claude Opus and Claude Sonnet, plus the GPT-OSS pool | Code changes, refactors, test fixes, review of diffs |
| Complex judgment | Gemini 4 Argon | Complex, ambiguous, or high-judgment tasks that other pools handle poorly |

Rules:

- Pick the pool from the job type, not from which model name is familiar.
- Prefer spare headroom over idle. If a pool has unused weekly capacity close to
  its reset, shift eligible work onto it instead of letting it expire.
- Do not move docs work onto the coding pool or coding work onto the docs pool
  only to save one launch. Cross-pool moves are for spare headroom.
- Reserve the complex judgment pool for tasks that need it. It is not a default.

## Coding lane order

Use the first lane that has capacity, then fall through.

1. **`agy` Claude pool.** Start here for coding while the pool has headroom.
2. **Workstation OpenCode with the Fireworks plan.** Burn the remaining
   included Fireworks capacity, then stop. Do not buy more capacity to keep
   this lane running.
3. **Always-on box with a low-cost coding model.** Use a GOAT-style harness
   running DeepSeek V4 Flash (roughly $10 per month) for ordinary coding and for
   GitHub work while the workstation is offline.

Fall through only when the earlier lane is exhausted or unavailable. Record the
lane used in the job `SUMMARY` so the weekly digest can report allocation (see
[weekly progress cost section](tooling-and-cost.md#weekly-progress-cost-section)).

## Related lanes

- Japanese article writing: [`docs/zenn-ja-writing-lane.md`](zenn-ja-writing-lane.md)
- OpenCode job shape: [`docs/opencode-thrift.md`](opencode-thrift.md)
