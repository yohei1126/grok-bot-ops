# Tool routing, cast roles, handoff channels, and cost controls

Route every task to the actor, device, and authentication lane that fits its
workload so usage stays within included plan pools and handoffs do not collide.

Use the same generic labels as [`shared-rules.md`](shared-rules.md): operator,
domain bot (`Domain｜Role`), progress bot, cost/ops bot, document worker, cloud
coding agent, and shared durable notes.

## 1. Know the full cast across actors, tools, and environments

Identify every human, bot, coding tool, automated trigger, and execution
surface before assigning work:

- **Operator (human)**: sets goals, approves cost and ops proposals, supervises
  sensitive tool calls, reviews pull requests, and merges or publishes finished
  work.
- **Grok Bot (sidebar bots and orchestrator surface)**: includes long-lived
  domain bots (`Domain｜Role`), the progress bot, the cost/ops bot, and
  short-lived one-off chats. Grok Bot is the primary conversational UI and
  multi-bot orchestrator.
- **Execution environments and devices**:
  - **Grok cloud computer ("box")**: the hosted cloud environment where Grok
    Bot runs connectors, scheduled routines, and short research tasks.
  - **Registered local workstation**: the operator's computer (for example, an
    Apple Silicon laptop) registered with Grok's local execution bridge to run
    local CLI workers and heavy compute.
  - **Phone**: the mobile client used for quick instructions, status checks,
    and human approvals.
- **Cursor toolchain**:
  - **Cursor IDE**: interactive local editor for hands-on development.
  - **Cursor cloud coding agents**: fresh remote workers that clone a
    repository, implement changes on a branch, and open or update a pull
    request.
  - **Local Cursor Agent CLI (`agent` or `cursor-agent`)**: local terminal or
    headless worker (`agent -p`) that executes repository coding briefs on the
    registered workstation.
- **Antigravity toolchain**:
  - **Antigravity CLI (`agy`)**: local terminal TUI (`agy`) and headless print
    worker (`agy -p`) authenticated through a separate Google or Gemini lane.
  - **Antigravity Remote Control**: local background daemon
    (`agy remote-control`) and web UI that let the operator paste prompts and
    approve tool calls from a phone or remote browser.
- **Document worker versus coding agent**: as defined in
  [Code and documents](shared-rules.md#5-code-and-documents-use-different-workers),
  a document worker drafts prose, long-form articles, and decks, while a coding
  agent (`agent`, `agy`, or a cloud coding agent) implements code changes or
  commits approved text into a repository.
- **Routines and schedules (automated assigners)**: scheduled Grok routines and
  local workstation file watchers (`LaunchAgent` or `cron`) that trigger
  recurring passes or dispatch queued inbox briefs. They are automated triggers
  owned by the operator, never independent decision-makers.

## 2. Match each role and device to the right workload

Assign each job to the surface built to execute and supervise it safely:

1. **Grok Bot**: owns the operator UI, mobile-friendly orchestration, external
   connectors (mail, calendar, collaborative docs suite, task app), multi-bot
   coordination, and scheduled routines. Grok reads and updates the operator's
   task app (Todoist or an equivalent) as the queue of record for work requests,
   owns the goal, guardrails, and success criteria, and launches handoffs
   (`agy -p`, `agent -p`, cloud coding agents, and bot-to-bot messages; see
   [Todos go in the task app, schedules in the calendar](shared-rules.md#10-todos-go-in-the-task-app-schedules-in-the-calendar)).
   Keep long machine learning runs, large PDF comparison loops, and bulk
   regeneration loops out of Grok.
2. **Cursor cloud coding agents and local `agent` (plus Cursor IDE)**: own
   repository coding across interactive sessions, fresh cloud branches, and
   local headless runs (`agent -p`) for features, bug fixes, multi-file
   refactors, and iterative test cycles.
3. **Antigravity (`agy` and Remote Control)**: owns document drafting,
   repository documentation updates, and lighter repository tasks that belong on
   the Google or Gemini authentication lane.
4. **Local workstation hardware**: runs machine learning training, local model
   inference, heavy generation or comparison batches, local test suites, and
   local CLI workers (`agy` and `agent`). Run heavy compute on the workstation,
   enforce the one-writer rule across local checkouts (see
   [Control parallel `agy` and `agent` runs](#9-control-parallel-agy-and-agent-runs-to-prevent-branch-conflicts)),
   and return only short summaries, metrics, or output paths to Grok.
5. **Phone**: handles short instructions, triage, and human approvals. Do not
   use the phone as a launch surface for long training runs, bulk regeneration
   jobs, or unreviewed multi-file refactors.
6. **Grok cloud computer ("box")**: runs connector calls, scheduled routines,
   inter-bot coordination, and short research queries. Keep GPU-heavy workloads
   and long iterative compute loops off the Grok box.

## 3. Map who assigns work to whom and over which channel

Route every handoff through a named channel so tasks have a clear owner and
return path:

| Assigner | Assignee | Channel type | Typical use |
| :--- | :--- | :--- | :--- |
| Operator | Grok Bot (`Domain｜Role` or one-off chat) | **In-app chat / `@bot`** | Goal setting, domain questions, connector tasks, and orchestration briefs |
| Grok Bot | Another Grok Bot (`Domain｜Role`) | **Bot-to-bot message** | Cross-domain facts and handoffs (low priority by default; high priority only for blockers) |
| Grok Bot | Antigravity CLI (`agy`) | **Approved local shell on registered workstation** (`agy -p`) | Synchronous or scripted documentation and Google or Gemini lane tasks on the workstation |
| Grok Bot (with operator) | Antigravity CLI (`agy`) | **Remote Control web UI (paste)** | Grok drafts the brief; the operator pastes it into Remote Control and approves actions live |
| Grok Bot | Antigravity CLI (`agy`) or local Cursor Agent (`agent`) | **Inbox file + LaunchAgent/cron** | Unattended local queue where a file drop triggers `agy -p` or `agent -p` |
| Grok Bot | Local Cursor Agent (`agent` / `cursor-agent`) | **Approved local shell on registered workstation** (`agent -p`) | Local repository coding, refactors, and test loops on the workstation |
| Grok Bot or operator | Cursor cloud coding agents | **Cloud agent launch / PR thread** | Fresh remote branch and pull request work for isolated repository coding tasks |
| Routines / schedules | Grok Bot or local CLI workers | **Scheduled routine / LaunchAgent or cron** | Daytime or event-driven status passes and watched-folder CLI dispatch |
| Operator | Cursor IDE, cloud coding agents, `agent`, or `agy` | **Direct CLI, IDE, Remote Control, or cloud launch (bypass)** | Self-contained coding or docs work that needs no Grok connectors or multi-bot context |

Follow these channel rules on every handoff:

- **Task app as the work-request queue of record**: keep the backlog of work
  requests and todos in the operator's task app (Todoist or an equivalent),
  while the calendar remains the schedule source of truth (see
  [Todos go in the task app, schedules in the calendar](shared-rules.md#10-todos-go-in-the-task-app-schedules-in-the-calendar)).
  Grok Bot reads and updates that queue and launches handoffs (`agy -p`,
  `agent -p`, cloud coding agents, and bot-to-bot messages). Do not create a
  second queue in chat transcripts, watched inbox folders, or weekly progress
  docs. Use those surfaces only as execution channels or status notes.
- **In-app chat / `@bot`**: message the responsible `Domain｜Role` bot directly
  (see [Talk to the responsible bot](shared-rules.md#3-talk-to-the-responsible-bot)).
  Use `@bot` mentions inside a group room only during live multi-bot
  consultation.
- **Bot-to-bot message**: default to low (deferred) priority so the recipient
  acts on its next scheduled pass or when the operator opens that bot. Use high
  priority only for immediate blockers, production incidents, or
  operator-declared deadlines (see
  [Bot-to-bot messages](shared-rules.md#7-bot-to-bot-messages-default-to-low-priority)).
- **Approved local shell on registered workstation (`agy -p` / `agent -p`)**:
  invoke headless print mode only inside directories the operator has registered
  and approved on the local workstation, and verify no other writer is active on
  that checkout (see
  [Control parallel `agy` and `agent` runs](#9-control-parallel-agy-and-agent-runs-to-prevent-branch-conflicts)).
- **Remote Control web UI (paste)**: keep Remote Control for human paste and
  supervision. Do not use browser automation to drive the Remote Control web UI
  as a primary handoff path.
- **Inbox file + LaunchAgent/cron**: drop a self-contained brief file into a
  watched workstation directory (`/path/to/agy-inbox/` or
  `/path/to/cursor-inbox/`) when Grok should queue local work without holding an
  interactive shell open.
- **Cloud agent launch / PR thread**: start a fresh Cursor cloud coding agent
  per pull request or isolated coding task, and keep code review and follow-up
  fixes anchored to the pull request thread.
- **Direct operator bypass**: the operator may talk directly to Cursor IDE,
  Cursor cloud coding agents, local `agent`, or `agy` without going through Grok
  Bot when the task is self-contained and does not need Grok connectors,
  multi-bot coordination, or shared-note lookups. If a direct session changes a
  project priority, architecture choice, or cross-domain rule, record the
  decision in shared durable notes afterward so domain bots stay aligned.

## 4. Keep the orchestrator-versus-worker boundary strict

Separate orchestration decisions in Grok Bot from implementation steps inside
workstation CLIs and coding agents:

- **Grok Bot (orchestrator)** decides *what* must happen: the deliverable goal,
  target repository and branch policy, constraints, forbidden content, merge
  policy, and success criteria, and then launches the handoff.
- **Workstation CLIs (`agy`, `agent`) and cloud coding agents (workers)** decide
  *how* to finish the job inside the brief: which files to inspect, how to
  structure edits, and how to run local verification commands before reporting
  back.

Give the worker a complete brief up front so it never needs to read a Grok chat
transcript or guess repository policy.

## 5. Treat plan pools, spend caps, and routine schedules as proposals

Account for shared usage pools and propose routing or spend adjustments through
a cost/ops bot or the [monthly audit](monthly-audit.md) (see
[Cost and ops changes start as proposals](shared-rules.md#14-cost-and-ops-changes-start-as-proposals)):

1. **Confirm shared weekly and plan pool implications**: Cursor usage (across
   Cursor IDE, cloud coding agents, and local `agent`) may share plan usage
   pools with Grok Bot depending on billing settings, whereas Antigravity CLI
   (`agy`) runs on a separate Google or Gemini authentication lane. Shift
   eligible documentation or side tasks to `agy` when the shared pool is tight,
   and never state or invent subscription prices or tier figures in repository
   docs.
2. **Set an on-demand monthly spend cap**: when product billing settings support
   an on-demand or additional-usage cap, set a monthly limit so usage stops
   predictably after the included pool runs out.
3. **Prefer event-driven or daytime routines**: schedule recurring routines for
   hours when the operator can act (such as weekday daytime) or trigger them on
   concrete events. Avoid overnight routines that accumulate unread output.

## 6. Prepare the workstation for Antigravity and Cursor CLI handoffs

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
   runs require. In headless print mode, tools that would normally ask for
   interactive confirmation are soft-denied unless allowed in advance.
5. **Register the workstation for Grok local execution**: connect the
   workstation to Grok's local execution bridge and restrict command approvals
   to the target project directories.

## 7. Wire Grok Bot to Antigravity CLI and local Cursor Agent CLI

Select the workstation handoff path that matches how much live supervision the
task requires.

### Path A: run headless print mode via an approved local shell

Use headless print mode when a Grok Bot (`Domain｜Role`) has approval to run
local shell commands on the registered workstation.

For documentation or Google and Gemini lane tasks with Antigravity CLI (`agy`):

```bash
cd /path/to/project && agy -p "<brief>"
```

For repository coding tasks with the local Cursor Agent CLI (`agent` or
`cursor-agent`):

```bash
cd /path/to/project && agent -p "<brief>"
```

When a brief is long or contains shell metacharacters, pipe it over standard
input instead of embedding it in command arguments:

```bash
agy -p --project /path/to/project < /path/to/agy-inbox/current-brief.txt
cd /path/to/project && agent -p < /path/to/cursor-inbox/current-brief.txt
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

## 8. Structure handoff briefs and prevent mis-assignment

Write every Grok-to-worker brief (`agy`, `agent`, or cloud coding agent) so a
fresh worker session can finish the job without reading the Grok chat
transcript. Do not store concrete task prompts or personal briefs in shared
public documentation.

Include four required sections in every handoff brief:

- **Goal**: one sentence naming the deliverable (for example, updating a
  specific guide section or fixing a failing test).
- **Target paths, branch, and merge policy**: the repository directory, which
  branch or pull request to update or create, the exact files in scope, and an
  explicit merge rule (such as opening a draft PR or updating the branch without
  merging).
- **Constraints**: line limits, style rules, required reading (such as
  `CONTRIBUTING.md` on public docs repositories), and forbidden content (such as
  personal identifiers, billing amounts, subscription tiers, or real bot display
  names).
- **Success criteria and return format**: the exact verification commands to run
  (such as `npx --yes markdownlint-cli2@0.23.2` or a test suite) and what to
  report back (such as the PR URL and the list of changed files).

Keep secrets out of command arguments (`argv`): never pass API keys, tokens, or
private URLs inline inside `agy -p "..."` or `agent -p "..."`, because arguments
appear in local process tables (`ps`) and shell history. Load secrets from
workstation environment variables or local secret stores, and pass sensitive or
long briefs over standard input or through a local file with `0600` permissions.

Run this checklist before launching a handoff to prevent mis-assignment and
bad handoffs:

- [ ] **Match the job type to the right lane**: route repository coding to
  Cursor cloud coding agents or local `agent`; route documentation and Google or
  Gemini lane work to `agy` (or a document worker); route machine learning and
  heavy compute to native workstation tools; keep connectors, routines, and
  multi-bot orchestration in Grok Bot.
- [ ] **Enforce one writer per checkout at a time**: never run parallel `agy` or
  `agent` processes on the same local repository checkout or branch at the same
  time (see
  [Control parallel `agy` and `agent` runs](#9-control-parallel-agy-and-agent-runs-to-prevent-branch-conflicts)).
  Use separate clones, git worktrees, or sequential runs when two tasks touch
  the same repository.
- [ ] **Verify goal, constraints, success criteria, and merge policy**: confirm
  the brief specifies all four fields, including whether to open a draft PR or
  stop before merging.
- [ ] **Use scoped permissions over skip-all flags**: rely on narrow
  `permissions.allow` rules and directory-scoped execution approvals instead of
  `--dangerously-skip-permissions`.
- [ ] **Schedule routines for daytime or events**: prefer event triggers or
  daytime schedules when a person can review the output over overnight jobs that
  create unread noise.
- [ ] **Check shared weekly pool implications**: account for whether Cursor
  shares plan usage pools with Grok Bot while Antigravity CLI uses its separate
  Google or Gemini authentication lane, and never invent or hardcode billing
  numbers.
- [ ] **Keep the work-request backlog in the task app**: read and update
  pending work requests in the operator's task app (Todoist or an equivalent)
  instead of building a second queue in chat transcripts, watched inbox folders,
  or weekly progress docs.
- [ ] **Keep Remote Control human-driven and heavy launches off the phone**: do
  not browser-automate the Remote Control web UI as a primary path, and start
  heavy builds or compute runs from the workstation instead of the phone.

## 9. Control parallel `agy` and `agent` runs to prevent branch conflicts

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

- Do not run two `agy -p` jobs, two `agent -p` jobs, or an `agy` job and an
  `agent -p` job that edit the same branch or working directory concurrently.
- Prefer git worktrees (`git worktree add`) or separate clone directories when
  true parallel writes are needed on the same repository:

```bash
git worktree add /path/to/worktrees/project-topic-b -b docs/topic-b main
```

### Control knobs

Use four operational controls to keep parallel runs from colliding:

1. **Queue of record (task app)**: serialize jobs that share a checkout or
   branch in the operator's task app, and mark the active job in progress before
   launching the worker (see
   [Todos go in the task app, schedules in the calendar](shared-rules.md#10-todos-go-in-the-task-app-schedules-in-the-calendar)).
   Hold follow-up jobs for that checkout in the queue until the current writer
   exits.
2. **Grok orchestrator pre-launch PID and lock check**: before launching a
   writer, Grok Bot (or the local wrapper script) checks the target project
   directory for a running writer process ID (PID) or lock file. Use a simple
   lock convention such as `/path/to/project/.agy-write.lock` recording the
   writer `pid`, `tool`, `branch`, `started_at`, and `purpose`:

   ```text
   pid=48210
   tool=agy
   branch=docs/topic-a
   started_at=2026-10-29T16:50:00Z
   purpose=Update routing section in docs/tooling-and-cost.md
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
