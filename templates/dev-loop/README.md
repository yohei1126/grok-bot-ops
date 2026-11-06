# Development loop templates

Use this folder to make the hybrid development loop explicit before an agent
starts, during review routing, and after a pull request merges. The loop has
three parts: a coding agent, an operator, and a review path. These files record
the decisions that the three parts must share, so the same job does not depend
on a fresh chat explanation.

The templates are prose and local checks only. They do not call the network,
read secrets, or run a live end-to-end job.

## File map

| File | Use |
| --- | --- |
| [`GATES.md`](GATES.md) | Machine decision table for gates G1 to G7. |
| [`RUBRIC.md`](RUBRIC.md) | Two-tier rubric for ambiguous judgments: finite labels in tier A, prose only in tier B. |
| [`CHECKLIST.md`](CHECKLIST.md) | One-page human operator checklist for a single job. |
| [`../../scripts/dev-loop-gate.sh`](../../scripts/dev-loop-gate.sh) | Optional thin local gate table. Prints status per gate. No network. |

## Order of use

1. Run the checklist or the optional gate script before the first command.
2. Route the first review with `GATES.md` gate G3 and tier A of `RUBRIC.md`.
3. Keep re-review separate from the first review.
4. Open the pull request as a draft unless the operator explicitly said ready.
5. After merge, look for a `## RETRO` comment. If the marker is absent, stay
   quiet.

## Non-goals

- No job hub pointer, webhook, or relay configuration.
- No live end-to-end run, synthetic event, or operator-live-once test.
- No automatic RETRO ingest, memory write, or shared-profile update.
- No Allow widening, model switch, or auto-review upgrade.
- No secrets, Worker URLs, or local paths beyond the documented
  `~/agy-work/<alias>` examples.
- Not a runnable agent, skill pack, or CI workflow.

## Related

- [`../retro/README.md`](../retro/README.md): RETRO template and ingest
  contract.
- [`../../docs/workstation-handoffs.md`](../../docs/workstation-handoffs.md):
  checkout roots, one-writer control, and soft-deny handling.
- [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md): contribution rules and the
  English prose review.
