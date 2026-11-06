# Gate decision table G1 to G7

Use this table to decide, before and during one implementation job, whether the
development loop may continue. Each gate has a local input, a PASS condition,
and the action to take when PASS does not hold.

The table is for a coding agent and an operator. It needs no network and no
secrets. Ambiguous judgments use [`RUBRIC.md`](RUBRIC.md). The human pass is
[`CHECKLIST.md`](CHECKLIST.md).

## How to read a row

- **Input** is the local fact the gate needs.
- **PASS** is the only state that lets the loop continue unchanged.
- **Other** is the routing state when PASS does not hold. Some gates route to a
  judgment instead of a hard stop.
- **Action** is what the agent or operator does next.

## Machine table

| Gate | Name | Input | PASS | Other | Action |
| --- | --- | --- | --- | --- | --- |
| G1 | Checkout and worktree lock | Expected branch, required paths under `~/agy-work/<alias>`, count of open jobs and PRs | Branch and paths match, and the worktree/checkout lock holds: 1 PR / 1 Issue at a time for this job | Any mismatch, or a second active job | Do not start. Send a one-line FYI. Fix the checkout or close the other job first. |
| G2 | Soft-deny | Consecutive empty soft-deny count; current model lane | Count is under 2, or the run already switched to OpenCode | Empty soft-deny occurred twice in a row | Stop. Switch to OpenCode Flash. Never widen Allow. Report the exact command and reason. |
| G3 | Lock and matching constraint | Diff kind | Diff is only a lockfile plus the matching constraint file, so Argon SKIP applies as light review | Anything else: route to Argon-need judgment with tier A of the rubric. This is not an Argon skip. | Lock only: record the light-review skip. Else: label Argon need with tier A before review. |
| G4 | Draft | PR state and whether the operator explicitly said ready | PR is a draft, or it is ready and the operator explicitly said ready | Ready without an explicit operator instruction | Create or convert the pull request to draft. |
| G5 | Vulnerability silence | OSV, Dependabot, or other vulnerability findings | No finding is silently ignored | A finding is dropped without a recorded decision | Block and report the finding with its source. |
| G6 | RETRO ingest | `pr-merged` event plus an Issue comment whose first line is `## RETRO` | Marker present, so the ingest path may run | Marker absent | Stay quiet: v1 silence, no invented retro. Wait for a later marker. |
| G7 | One job | Count of implementation jobs and pull requests in this loop | 1 implementation job equals 1 PR | A second job or a second PR is requested | Refuse the new job, or send a completion report only. |

## Gate notes

### G1: checkout and worktree lock

G1 is the hard preflight. A failure means do not start. The worktree lock is a
job rule, not a git feature: one pull request and one Issue stay active for this
job, and a second job waits until the first closes.

### G2: soft-deny

A soft-deny is a permission refusal, `unknown_command`, or `unsupported_tool`
result. Stop and report the exact command and reason. An empty reply twice in a
row is the same signal. Use OpenCode Flash at that point. Do not widen Allow to
get past the refusal.

### G3: lock and matching constraint

G3 has a fixed orientation:

- Diff is only a lockfile plus the matching constraint file: Argon SKIP, light
  review.
- Any other diff: go to Argon-need judgment with tier A of the rubric, not
  Argon skip.

Do not describe the second branch as "Argon gate out" or "Argon skip". A
non-pass in G3 is a judgment about the first review, not permission to remove
the review. Keep re-review separate under item 2 of the rubric.

### G4: draft

Draft is the default. A ready pull request needs an explicit operator
instruction in the current job, not an inference from a merged earlier job.

### G5: vulnerability silence

Every OSV, Dependabot, or other vulnerability finding gets a recorded decision:
fix, accepted risk, or not applicable. Silence is not a decision.

### G6: RETRO ingest

G6 only opens the ingest path when the marker is present. Absent marker is not a
failure to repair. v1 stays quiet and does not invent a retro, a rule line, or a
memory write.

### G7: one job

One implementation job produces one pull request. A new request during an open
job gets a refusal or a completion report, not a second branch of work.

## Floors

These floors hold across every gate:

- Empty soft-deny twice: switch to OpenCode.
- No Allow widening mid-run.
- Draft pull request by default.
- No vulnerability silence.
- `## RETRO` absent: stay quiet.
- 1 job equals 1 PR.

## Related

- [`RUBRIC.md`](RUBRIC.md): two-tier labels behind the ambiguous rows.
- [`CHECKLIST.md`](CHECKLIST.md): the one-page operator pass.
- [`../retro/README.md`](../retro/README.md): RETRO marker and ingest contract.
