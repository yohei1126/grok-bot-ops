# OpenCode thrift

Keep OpenCode jobs short and event-driven so they do not burn chat turns or
included capacity on waiting.

Related: [`docs/agy-quota-and-coding-lanes.md`](agy-quota-and-coding-lanes.md#coding-lane-order),
[`docs/tooling-and-cost.md`](tooling-and-cost.md),
[`docs/workstation-handoffs.md`](workstation-handoffs.md).

## Job shape

1. **Preflight**: confirm the checkout, branch, credentials injection, and
   remaining capacity before launch.
2. **Short `PROMPT`**: one file with the goal, the allowed paths, and the done
   condition.
3. **Model**: use Nexus Auto, or the Flash model your fleet pins.
4. **`SUMMARY`**: the job writes a `SUMMARY` file with files changed, line
   counts, and the lane used.
5. **Draft PR**: the orchestrator opens a draft pull request from the result.

## Rules

- Do not poll in chat every N minutes. Wait for completion.
- For long live jobs, use a watchdog or a preflight check that reports stalls,
  instead of manual status checks.
- When the Fireworks capacity is spent, stop this lane and fall through to the
  next one. Do not buy more.
