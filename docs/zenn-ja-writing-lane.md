# Japanese article writing lane

Write Japanese article bodies with one `write_file`-only Gemini Flash `agy`
launch. The orchestrator owns git.

Related: [`docs/agy-quota-and-coding-lanes.md`](agy-quota-and-coding-lanes.md),
[`docs/workstation-handoffs.md`](workstation-handoffs.md#headless-agy-soft-deny-handling),
[`docs/shared-rules.md`](shared-rules.md).

## Steps

1. Lock the source first. The lock is the article's tracking page or a
   `FACTS.md` file that lists the facts the article may state.
2. Launch exactly one `agy` job on Gemini Flash. Its Allow list is
   `write_file` under the article path. It does not run git, `gh`, package
   managers, or network commands.
3. The orchestrator reviews the written file, then commits, pushes, and opens
   the pull request.

## Rules

- **Model**: use Flash for the Japanese body. Do not use Sonnet for it. Sonnet
  belongs to the coding pool (see
  [quota groups](agy-quota-and-coding-lanes.md#route-by-quota-group)).
- **Soft-deny**: stop and report the exact need. Rewrite the brief. Do not widen
  the Allow list to get past it.
- **No mid-job patch relaunches**: if the output needs fixes, finish the job,
  then decide on one new launch with a corrected brief.
- **No polling**: wait for the completion notification instead of checking
  status on a timer.
- **Git ownership**: the launched agent never commits, pushes, or opens a PR.
