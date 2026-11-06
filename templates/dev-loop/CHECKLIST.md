# Operator checklist for one development job

Use this page once per implementation job. Each line is a local check. When a
check fails, follow the action in [`GATES.md`](GATES.md) instead of improvising.

## Before start

- [ ] Branch matches the expected branch for this job.
- [ ] Required paths exist under `~/agy-work/<alias>`.
- [ ] Worktree lock holds: 1 PR / 1 Issue at a time for this job.
- [ ] Only one implementation job is open.
- [ ] Soft-deny count is under 2, or the run is already on OpenCode.

## Route the first review

- [ ] Diff is a lockfile plus the matching constraint file only? Record Argon
      SKIP as light review.
- [ ] Any other diff: label Argon need with tier A of [`RUBRIC.md`](RUBRIC.md).
- [ ] If the label is `ambiguous`, explain in tier B, then return `need` or
      `skip_light`.
- [ ] Do not treat "not lock only" as an Argon skip.
- [ ] Check re-review separately: `none`, `unresolved_blocker`, `core_ci`, or
      `option_b`.

## During the run

- [ ] No Allow widening mid-run.
- [ ] No model switch without an operator choice.
- [ ] Soft-deny: stop, then report the exact command and reason.
- [ ] Empty soft-deny twice in a row: switch to OpenCode Flash and stop.
- [ ] No live end-to-end test, synthetic event, or operator-live-once run.

## Open the pull request

- [ ] Draft is the default.
- [ ] Ready only after the operator explicitly said ready.
- [ ] Summary names files changed, known gaps, and confirm conditions.
- [ ] One implementation job equals one pull request.

## Security

- [ ] OSV, Dependabot, or other vulnerability findings are reported.
- [ ] No finding is silently ignored.

## After merge

- [ ] RETRO comment starts with `## RETRO` on the tracking Issue.
- [ ] Marker absent: stay quiet, with no invented retro.
- [ ] No automatic memory write or shared-profile update.

## Optional local gate table

The script reads environment variables and prints one status per gate. It uses
no network and no secrets.

```bash
DEV_LOOP_BRANCH=docs/example \
DEV_LOOP_ALIAS=example-repo \
DEV_LOOP_DIFF_KIND=lock_and_constraint \
bash ../../scripts/dev-loop-gate.sh
```

It exits 0 for every soft status, including FAIL on a later gate, so the table
is readable in one pass. It exits 1 only on a G1 hard preflight miss.

## Related

- [`GATES.md`](GATES.md): gate inputs, PASS conditions, and actions.
- [`RUBRIC.md`](RUBRIC.md): tier A labels and tier B prose limits.
- [`../retro/README.md`](../retro/README.md): RETRO contract.
