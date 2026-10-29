# Workstation wrapper scripts for headless `agy` handoffs

Use [`agy-docs-launch.sh`](agy-docs-launch.sh) and
[`agy-docs-collect.sh`](agy-docs-collect.sh) to collapse a workstation
documentation handoff into one `Shell` call for launch and one `Shell` call for
collection. Batching by phase reduces Grok local-execution approval cards
without widening Auto-review Allow lists or Antigravity permissions.

See [`../docs/workstation-handoffs.md`](../docs/workstation-handoffs.md) for the
full workstation handoff rules.

## Run launch and collection in two workstation shell calls

Call one workstation `Shell` per phase after the brief exists under
`$HOME/agy-inbox/`:

1. **Launch (`agy-docs-launch.sh`)**: validates that `<repo>` is a plain
   basename, verifies that `$HOME/agy-work/<repo>` exists and resolves inside
   `$HOME/agy-work`, verifies that `<brief-path>` resolves inside
   `$HOME/agy-inbox/`, starts `agy --project "$HOME/agy-work/<repo>" -p` in the
   background via `nohup`, and writes `$HOME/agy-inbox/<stem>.pid`,
   `<stem>-stdout.log`, and `<stem>-stderr.log`.

   ```bash
   ~/agy-work/grok-bot-ops/scripts/agy-docs-launch.sh <repo> ~/agy-inbox/<brief>.txt [log-stem]
   ```

2. **Collect (`agy-docs-collect.sh`)**: inspects the recorded PID file (or falls
   back to process lookup), prints `git status -sb`, current branch, the last
   three commits, up to five open pull requests via `gh pr list`, and the last
   80 lines of the stdout and stderr logs.

   ```bash
   ~/agy-work/grok-bot-ops/scripts/agy-docs-collect.sh <repo> [log-stem]
   ```

## Safety boundaries remain unchanged

Keep every existing launch confirmation and permission boundary in place when
using the wrapper scripts:

- **Choice cards still gate heavy launches**: the operator confirms on the chat
  choice card or widget before Grok Bot invokes `agy-docs-launch.sh`.
- **No permission escalation**: neither script passes
  `--dangerously-skip-permissions`, edits Antigravity `settings.json`, or widens
  Grok Auto-review Allow rules.
- **Headless soft-deny still stops the worker**: if the `agy -p` worker hits a
  `soft-deny`, `unknown_command`, or `unsupported_tool` error, it stops and
  reports the exact command and reason so the operator can review permissions
  offline.
- **One `argv`-style command per worker tool call**: inside the `agy` session,
  the worker must still issue one simple command per `RunCommand` tool call and
  keep `git` and `gh` invocations separate.
