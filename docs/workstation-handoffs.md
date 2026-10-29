# Workstation CLI handoffs and parallel-writer control

Wire Grok Bot to Antigravity CLI (`agy`) and the local Cursor Agent CLI (`agent`
or `cursor-agent`) on a registered workstation using scoped permissions,
self-contained briefs, and strict one-writer isolation per checkout.

Use the same generic labels as [`shared-rules.md`](shared-rules.md): operator,
domain bot (`Domain｜Role`), progress bot, cost/ops bot, document worker, cloud
coding agent, and shared durable notes.

For surface cost lanes and spend caps, see
[`tooling-and-cost.md`](tooling-and-cost.md). For cast roles, assignment
channels, and the task-app queue of record, see
[`cast-and-routing.md`](cast-and-routing.md). Prefer card-style launch
confirmation over growing Allow lists (see
[Prefer card-style launch confirmation](#6-prefer-card-style-launch-confirmation-over-growing-allow-lists)).

## 1. Prepare the workstation for Antigravity and Cursor CLI handoffs

Complete five one-time setup steps on the registered local workstation before
wiring Grok Bot to `agy` or `agent` (`cursor-agent`):

1. **Install the CLI binaries on `PATH`**: install `agy` (running `agy install`
   if needed) and `agent` (or `cursor-agent`) so both interactive shells and
   non-interactive automation runners can resolve them.
2. **Complete one interactive login per tool**: run `agy` and `agent` once in a
   local terminal and finish their authentication prompts. Headless runs
   (`agy -p` and `agent -p`) rely on stored credentials and fail if the
   workstation has never logged in.
3. **Start the Remote Control daemon when mobile review is needed**: run
   `agy remote-control start` (and check with `agy remote-control status`) when
   the operator wants to paste briefs or approve tool calls from a phone or
   remote browser. Stop it with `agy remote-control stop` when remote access is
   no longer needed.
4. **Configure scoped tool and command permissions**: edit the CLI settings
   (such as `permissions.allow` in Antigravity CLI `settings.json` or session
   `--settings`) to allow only the specific tools and commands that unattended
   runs require. Scope write permissions to the fixed checkout root for each
   CLI (`~/agy-work` for `agy` and `~/agent-work` for `agent`). In headless
   print mode, tools that would normally ask for interactive confirmation are
   soft-denied unless allowed in advance.
5. **Register the workstation for Grok local execution**: connect the
   workstation to Grok's local execution bridge and restrict command approvals
   to the fixed checkout roots (`~/agy-work` and `~/agent-work`).

### Fixed checkout roots

Isolate every local CLI worker inside its dedicated checkout root so
directory-scoped `write_file` and command permissions match the workspace on
disk:

1. **Antigravity CLI (`agy` / `agy -p`) reads and writes only under
   `~/agy-work/`**: clone or update every GitHub repository at
   `~/agy-work/<repo>` before editing. Running `agy` against `~/work/...` or
   any path outside `~/agy-work` is forbidden, because Antigravity write
   permissions are scoped strictly to `~/agy-work`.
2. **Local Cursor Agent CLI (`agent` / `cursor-agent` / `agent -p`) reads and
   writes only under `~/agent-work/`**: create the root directory first if it
   is missing (`mkdir -p ~/agent-work`), and clone or update the repository at
   `~/agent-work/<repo>` before editing. Running `agent` against `~/work/...`
   or any path outside `~/agent-work` is forbidden.
3. **Require the absolute checkout path in every headless brief**: every brief
   for `agy -p` or `agent -p` must state the exact absolute checkout path under
   `~/agy-work/<repo>` or `~/agent-work/<repo>`. Never write "prefer `~/work`
   if present" or point a headless CLI worker at `~/work`.

### When to use Cursor cloud coding agents versus local `agent`

Route repository coding and documentation across cloud and workstation lanes
according to whether the work requires local machine access (see
[Code and documents](shared-rules.md#5-code-and-documents-use-different-workers)
and
[Match each role and surface to the right workload](cast-and-routing.md#2-match-each-role-and-surface-to-the-right-workload)):

- **Repository coding (features, bug fixes, refactors)**: prefer **Cursor cloud
  coding agents** on a fresh remote branch over local `agent -p`.
- **Local `agent -p` (`~/agent-work/<repo>`)**: use only when the task **must**
  run on the registered workstation, such as local hardware validation,
  local-only files, or headless local tooling that cloud agents cannot reach.
- **Antigravity CLI (`agy` under `~/agy-work/<repo>`)**: use for document
  drafting, repository documentation updates, and prose reviews on the Google
  or Gemini authentication lane.

## 2. Wire Grok Bot to Antigravity CLI and local Cursor Agent CLI

Select the workstation handoff path that matches how much live supervision the
task requires (see
[Map who assigns work to whom](cast-and-routing.md#4-map-who-assigns-work-to-whom-and-over-which-channel)).

### Path A: run headless print mode via an approved local shell

Use headless print mode when a Grok Bot (`Domain｜Role`) has approval to run
local shell commands on the registered workstation.

For documentation or Google and Gemini lane tasks with Antigravity CLI (`agy`) under `~/agy-work/<repo>`:

```bash
cd ~/agy-work/<repo> && agy -p "<brief>"
```

For workstation-only repository coding tasks with the local Cursor Agent CLI (`agent` or `cursor-agent`) under `~/agent-work/<repo>`:

```bash
mkdir -p ~/agent-work
cd ~/agent-work/<repo> && agent -p "<brief>"
```

When a brief is long or contains shell metacharacters, pipe it over standard
input instead of embedding it in command arguments:

```bash
agy -p --project ~/agy-work/<repo> < /path/to/agy-inbox/current-brief.txt
cd ~/agent-work/<repo> && agent -p < /path/to/cursor-inbox/current-brief.txt
```

Useful flags from `agy --help` for scripted runs:

- `-p` or `--print`: run a single prompt non-interactively and print the
  response.
- `--project <project>` and `--add-dir <dir>`: scope the session to a project
  or attach extra workspace directories.
- `--mode <mode>`: set the execution mode (`accept-edits`, `auto`, or `plan`)
  for the session.
- `--model <model>` and `--effort <level>`: select the model and reasoning
  effort (`low`, `medium`, `high`, `xhigh`, `max`).
- `--print-timeout <duration>`: set a maximum runtime so a stalled command does
  not block the caller indefinitely.
- `--output-format <format>`: emit `text`, `json`, or `stream-json` when a
  local wrapper parses the result.
- `--sandbox`: enable terminal restrictions for tightly scoped tasks.

Prefer scoped `permissions.allow` rules in settings over
`--dangerously-skip-permissions`. Test a new workflow once and add narrow allow
rules for the exact tools it requires.

### Path B: draft the brief in Grok and paste it into Remote Control

Use the Remote Control web UI when the operator is on a phone or away from the
desk and wants to supervise tool calls in real time:

1. Start the background daemon on the workstation with
   `agy remote-control start`, or open a single session with
   `agy --remote-control` (or `/remote-control` inside the TUI).
2. Ask the responsible Grok Bot to draft a self-contained brief in chat.
3. Open the Antigravity Remote Control web UI, paste the brief, and approve or
   reject edits and shell commands as they appear.

### Path C: drop a task file into a watched inbox folder

Use a watched inbox folder as a local transport spool when Grok Bot dispatches
an already-queued work request from the task app without holding a synchronous
shell session open:

1. Grok Bot reads the work request from the task app and writes a plain-text or
   Markdown brief into a watched directory on the workstation, such as
   `/path/to/agy-inbox/task-YYYYMMDD-HHMM.md` (or
   `/path/to/cursor-inbox/task-YYYYMMDD-HHMM.md`).
2. A macOS `LaunchAgent` (`WatchPaths`) or `cron` entry invokes a local wrapper
   script whenever a new file lands in the inbox folder.
3. The wrapper moves the file into `processing/` first so a second trigger
   cannot pick up the same file, pipes the file contents into `agy -p` or
   `agent -p`, writes the log to `out/task-YYYYMMDD-HHMM.log`, and archives the
   brief under `done/`.
4. Grok Bot reads the short output summary or exit status on a later pass and
   updates the item in the task app. Do not store unscheduled backlog items in
   the watched inbox folder.

## 3. Structure self-contained handoff briefs and keep secrets out of `argv`

Write every Grok-to-worker brief (`agy`, `agent`, or cloud coding agent) so a
fresh worker session can finish the job without reading the Grok chat
transcript. Do not store concrete task prompts or personal briefs in shared
public documentation.

Include four required sections in every handoff brief:

- **Goal**: one sentence naming the deliverable (for example, updating a
  specific guide section or fixing a failing test).
- **Target paths, branch, and merge policy**: the absolute repository checkout
  path under the fixed root (`~/agy-work/<repo>` for `agy` or
  `~/agent-work/<repo>` for `agent`; never `~/work/...`), which branch or pull
  request to update or create, the exact files in scope, and an explicit merge
  rule (such as opening a draft PR or updating the branch without merging). Do
  not tell a worker to "prefer `~/work` if present".
- **Constraints**: line limits, style rules, required reading (such as
  `CONTRIBUTING.md` and `AGENTS.md` on public docs repositories), and forbidden
  content (such as personal identifiers, billing amounts, subscription tiers, or
  real bot display names).
- **Success criteria and return format**: the exact verification commands to run
  (such as `npx --yes markdownlint-cli2@0.23.2` or a test suite) and what to
  report back (such as the PR URL and the list of changed files).

Keep secrets out of command arguments (`argv`): never pass API keys, tokens, or
private URLs inline inside `agy -p "..."` or `agent -p "..."`, because arguments
appear in local process tables (`ps`) and shell history. Load secrets from
workstation environment variables or local secret stores, and pass sensitive or
long briefs over standard input or through a local file with `0600` permissions.

### Issue one command per tool call in headless CLI handoffs

Instruct headless CLI workers (`agy -p` and `agent -p`) to run one `argv`-style
command per `RunCommand` tool call. Scoped allow lists match a single command
prefix and soft-deny compound shell lines that contain `&&`, `||`, `;`, `|`,
`$()`, backticks, or unquoted shell globs.

Split verification, git, and pull request steps into separate tool calls:

1. `wc -l docs/workstation-handoffs.md`
2. `npx --yes markdownlint-cli2@0.23.2 docs/workstation-handoffs.md`
3. `git status`
4. `git diff`
5. `git add docs/workstation-handoffs.md`
6. `git commit -m "Docs: explain single-command headless calls"`
7. `git push -u origin docs/topic-branch`
8. `gh pr create --draft --title "..." --body "..."`

If any `RunCommand` call is soft-denied, stop the run and report the exact
command line and deny reason to the orchestrator. Do not widen permissions
mid-run.

## 4. Control parallel `agy` and `agent` runs to prevent branch conflicts

Enforce strict write isolation whenever multiple local CLI sessions (`agy`,
`agent`, or `cursor-agent`) run on the workstation.

### Allowed parallelism

Operators can run multiple sessions at the same time when write scopes do not
overlap:

- **Different repositories or separate git worktrees**: parallel writers are
  safe when each job runs in a different repository or in its own
  `git worktree` directory on a distinct branch.
- **Read-only or plan-and-ask modes alongside a writer**: running an
  inspection, research, or planning session (such as `agy --mode plan`) is safe
  alongside a single active writer as long as the second session does not edit
  tracked files or mutate git state.
- **Separate Remote Control sessions on different projects**: multiple
  Antigravity Remote Control sessions can run in parallel when each session
  points at a different project directory or worktree.

### One-writer rule

Allow at most one writer process per git checkout, branch, or shared working
tree at any time:

- Keep `agy` checkouts under `~/agy-work/<repo>` and local `agent` checkouts
  under `~/agent-work/<repo>`, and state the absolute checkout path under the
  matching root in every brief.
- Do not run two `agy -p` jobs, two `agent -p` jobs, or an `agy` job and an
  `agent -p` job that edit the same branch or working directory concurrently.
- Prefer git worktrees (`git worktree add`) or separate clone directories under
  the tool's fixed checkout root when true parallel writes are needed on the
  same repository:

```bash
git worktree add ~/agy-work/<repo>-topic-b -b docs/topic-b main
```

### Control knobs

Use four operational controls to keep parallel runs from colliding:

1. **Queue of record (task app)**: serialize jobs that share a checkout or
   branch in the operator's task app, and mark the active job in progress before
   launching the worker (see
   [Keep the work-request queue of record in the task app](cast-and-routing.md#3-keep-the-work-request-queue-of-record-in-the-task-app)).
   Hold follow-up jobs for that checkout in the queue until the current writer
   exits.
2. **Grok orchestrator pre-launch PID and lock check**: before launching a
   writer, Grok Bot (or the local wrapper script) checks the target checkout
   (`~/agy-work/<repo>` or `~/agent-work/<repo>`) for a running writer process
   ID (PID) or lock file. Use a simple lock convention such as
   `~/agy-work/<repo>/.agy-write.lock` recording the writer `pid`, `tool`,
   `branch`, `started_at`, and `purpose`:

   ```text
   pid=48210
   tool=agy
   branch=docs/topic-a
   started_at=2026-10-29T16:50:00Z
   purpose=Update routing section in docs/cast-and-routing.md
   ```

   Ignore `.agy-write.lock` in `.git/info/exclude` (or the workstation's global
   git ignore file) so the lock file never dirties `git status`, and remove the
   lock file when the writer finishes.
3. **Scoped Antigravity and Cursor permissions**: keep headless
   `permissions.allow` rules in Antigravity CLI and command allow-lists in
   Cursor scoped to the target workspace and required commands so a runaway
   shell command cannot touch sibling checkouts or global workstation state.
4. **Stop or kill stale writers before starting a new run**: if a lock file or
   process check shows a hung or orphaned writer on the target tree, stop or
   kill that stale writer first, verify `git status` and the current branch are
   clean, remove the stale lock, and only then launch the next writer.

### Failure modes to watch for

Running concurrent writers on the same branch or working tree causes four
predictable failure modes:

- **Two pull requests or jobs fighting on one branch**: parallel writers
  overwrite each other's file edits, stage mixed hunks, or push conflicting
  commits to the same branch.
- **Dirty working tree**: uncommitted files or an interrupted merge left behind
  by one writer cause the next writer to fail branch checks, abort rebases, or
  commit unintended changes.
- **Lost commits**: overlapping branch switches, resets, or force updates strand
  commits on detached HEAD states or overwrite local branch refs.
- **Duplicate pull request noise**: two workers dispatched for the same or
  overlapping tasks open competing pull requests or post contradictory updates
  to the same pull request thread.

## 5. Avoid common orchestration anti-patterns

Reject fragile shortcuts that bypass tool isolation or human review:

- **Do not browser-automate the Remote Control UI**: driving the Remote Control
  web interface with a browser automation agent breaks whenever the web UI
  changes. Use Path A (`agy -p`) or Path C (`/path/to/agy-inbox/`) for automated
  runs, and keep Remote Control (Path B) for a human operator.
- **Do not launch heavy jobs from the phone**: mobile chats are for short
  prompts, triage, and approvals. Start long builds, batch evaluations, and
  multi-file refactors on the workstation where power, network, and logs are
  stable.
- **Do not keep machine learning or bulk regeneration loops inside Grok Bot**:
  iterative training, large document comparisons, and repeated generation loops
  consume shared cloud tokens rapidly. Run those loops on the local workstation
  and send only final metrics or output paths back to Grok.
- **Do not treat `--dangerously-skip-permissions` as a default**: bypassing all
  permission checks in `agy` or `agent` removes safety boundaries for shell
  commands and file deletions. Use scoped allow rules and review them during the
  [monthly ops audit](monthly-audit.md#1-billing-and-usage-trend).
- **Do not grow fine-grained Allow lists as the primary launch gate**: adding a
  new Auto-review Allow rule or Antigravity `permissions.allow` entry for every
  command that might run next week is brittle and over-broad. Prefer an
  operator-facing choice card (see
  [Prefer card-style launch confirmation](#6-prefer-card-style-launch-confirmation-over-growing-allow-lists)).

## 6. Prefer card-style launch confirmation over growing Allow lists

Gate whether a workstation handoff starts with an operator-facing choice card
(or an equivalent one-tap confirmation). Expanding fine-grained Allow rules for
every new command is a weak primary control.

### Prefer a named choice card

When Grok Bot (or another orchestrator) is ready to start local work, present a
short card that names the lane and the action. Typical choices:

- run with `agy`
- run with `agent` (or `cursor-agent`)
- queue in the task app
- cancel

Keep the card copy short: the deliverable in one line, the proposed lane, and a
one-sentence reason (for example, documentation on the Google or Gemini lane, or
repository coding on a fresh local branch).

### Keep Allow lists narrow

Treat Auto-review Allow lists and Antigravity `permissions.allow` as a narrow
safety net for unattended tools the operator already trusts in that workspace.
Leave launch-class decisions on the choice card.

Keep Ask-first (or equivalent interactive confirmation) for:

- destructive git operations
- external sends (mail, chat, or public posts)
- deletes outside the project directory
- purchases or other spend actions

If a headless `agy -p` or `agent -p` run soft-denies a required tool, stop and
report which permission was denied. Do not widen allow lists ad hoc just to
finish that one job.

### Orchestrator flow: propose, pick, then launch

1. Propose the matching lane and a short reason.
2. Wait for the operator to pick on the card (or cancel).
3. Launch only after that pick, unless standing permission already covers that
   class of job.
4. For durable or deferred work that surfaces mid-conversation, queue it in the
   task app instead of starting silently or dropping it (see
   [Keep the work-request queue of record in the task app](cast-and-routing.md#3-keep-the-work-request-queue-of-record-in-the-task-app)).

Heavy jobs wait for the card pick. Standing permission may cover a narrow,
repeatable class (for example, a routine that always queues a status pass). It
does not mean every shell command is pre-approved forever.

### Cards gate start; checkout locks still apply

Choice cards decide *whether* to start. CLI-side controls still bound the run:

- scoped `permissions.allow` and directory-scoped execution approvals still
  limit what a running worker may do
- the one-writer-per-checkout rule and `.agy-write.lock` checks still serialize
  writers on a shared tree (see
  [Control parallel `agy` and `agent` runs](#4-control-parallel-agy-and-agent-runs-to-prevent-branch-conflicts))

After the operator picks a lane on the card, run the usual pre-launch PID or
lock check, then start Path A, B, or C from
[Wire Grok Bot to Antigravity CLI and local Cursor Agent CLI](#2-wire-grok-bot-to-antigravity-cli-and-local-cursor-agent-cli).
