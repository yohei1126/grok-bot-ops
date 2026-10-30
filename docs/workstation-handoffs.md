# Workstation CLI handoffs and parallel-writer control

Wire Grok Bot to Antigravity CLI (`agy`) and the local Cursor Agent CLI (`agent`
or `cursor-agent`) on a registered workstation using scoped permissions,
self-contained briefs, and strict one-writer isolation per checkout.

Use the same generic labels as [`shared-rules.md`](shared-rules.md): operator,
domain bot (`Domain｜Role`), progress bot, cost/ops bot, document worker, cloud
coding agent, and shared durable notes.

For surface cost lanes and spend caps, see
[`tooling-and-cost.md`](tooling-and-cost.md). For cast roles, assignment
channels, and job routing, see
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
- **Heavy local compute and hardware saturation**: for non-training workloads
  (media pipelines, audio, offline inference, large data transforms, and heavy
  builds) and guidance on saturating Mac CPU and Metal capacity, see
  [Run eligible heavy workloads locally and saturate workstation capacity](tooling-and-cost.md#6-run-eligible-heavy-workloads-locally-and-saturate-workstation-capacity).

### Prefer agy for docs; Grok draft exception-only

Prefer Antigravity CLI (`agy`) for repository document writing and review
whenever credits or quota are available.

Drafting documentation in Grok Bot is an exception-only fallback. Use Grok
drafts only after an `agy` soft-deny or a `RESOURCE_EXHAUSTED` (429) quota
failure, and only with explicit operator approval. Never fall back to Grok docs
drafting silently. When Grok prepares briefs for `agy`, keep the standard
safety rules: card confirmation before launch, one `argv`-style command per
tool call, and soft-deny stop-and-report without widening permissions mid-run.

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

- `-p` or `--print`: run a single prompt non-interactively and print the response.
- `--project <project>` and `--add-dir <dir>`: scope the session or attach extra directories.
- `--mode <mode>`: set execution mode (`accept-edits`, `auto`, or `plan`).
- `--model <model>` and `--effort <level>`: select the model and reasoning effort.
- `--print-timeout <duration>`: set a maximum runtime.
- `--output-format <format>`: emit `text`, `json`, or `stream-json`.
- `--sandbox`: enable terminal restrictions for tightly scoped tasks.

Prefer scoped `permissions.allow` rules in settings over
`--dangerously-skip-permissions`. Test a new workflow once and add narrow allow
rules for the exact tools it requires.

### Default agy model (Gemini 3.8 Flash)

Default interactive and headless `agy` documentation launches to **Gemini 3.8
Flash** (`gemini-3.8-flash-medium`) unless the operator explicitly specifies
another model.

Larger models exhaust Antigravity Individual quota and trigger HTTP 429
(`RESOURCE_EXHAUSTED`) much faster on iterative documentation passes. When
Grok Bot or an operator needs an alternate model, pass it through
[`scripts/agy-docs-launch.sh`](../scripts/agy-docs-launch.sh) as the 4th
argument or via `AGY_DOCS_MODEL` (or `AGY_MODEL`). Do not bypass the wrapper to
craft raw, multi-flag Mac `agy ... --model` commands.

### Path B: draft the brief in Grok and paste it into Remote Control

Use the Remote Control web UI when the operator is on a phone or away from the
desk and wants to supervise tool calls in real time:

1. Start the background daemon on the workstation with `agy remote-control start`,
   or open a single session with `agy --remote-control` (or `/remote-control`).
2. Ask the responsible Grok Bot to draft a self-contained brief in chat.
3. Open the Antigravity Remote Control web UI, paste the brief, and approve or
   reject edits and shell commands as they appear.

### Path C: drop a task file into a watched inbox folder

Use a watched inbox folder as a local transport spool when Grok Bot dispatches
an already-queued work request from the task app without holding a synchronous
shell session open:

1. Grok Bot writes a brief into a watched directory on the workstation, such as
   `/path/to/agy-inbox/task-YYYYMMDD-HHMM.md` (or `cursor-inbox`).
2. A macOS `LaunchAgent` (`WatchPaths`) or `cron` entry invokes a local wrapper
   script whenever a new file lands in the inbox folder.
3. The wrapper moves the file into `processing/` first to prevent double runs,
   pipes the file into `agy -p` or `agent -p`, writes the log to
   `out/task-YYYYMMDD-HHMM.log`, and archives the brief under `done/`.
4. Grok Bot reads the short output summary or exit status on a later pass and
   updates the item in the task app.

## 3. Structure self-contained handoff briefs and keep secrets out of `argv`

Write every Grok-to-worker brief (`agy`, `agent`, or cloud coding agent) so a
fresh worker session can finish the job without reading the Grok chat
transcript. Do not store concrete task prompts or personal briefs in shared
public documentation.

Include four required sections in every handoff brief:

- **Goal**: one sentence naming the deliverable.
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
  (such as `wc -l` or an explicitly allow-listed linter or test command) and
  what to report back (such as the PR URL and the list of changed files).

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

Split verification, git, and pull request steps into separate tool calls using
commands already in the workstation allow list (see
[Headless agy soft-deny handling](#headless-agy-soft-deny-handling)): `wc -l`,
`git status`, `git diff`, `git add`, `git commit`, `git push`, and
`gh pr create --draft`.

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

1. **Queue of record (private job hub)**: serialize jobs that share a checkout or
   branch in the private job hub, and mark the active job in progress before
   launching the worker (see
   [Track human tasks in the task app and agent jobs in a private job hub](cast-and-routing.md#3-track-human-tasks-in-the-task-app-and-agent-jobs-in-a-private-job-hub)).
   Hold follow-up jobs for that checkout in the queue until the current writer
   exits.
2. **Grok orchestrator pre-launch PID and lock check**: before launching a
   writer, Grok Bot (or the local wrapper script) checks the target checkout
   (`~/agy-work/<repo>` or `~/agent-work/<repo>`) for a running writer process
   ID (PID) or lock file. Use a simple lock convention such as
   `~/agy-work/<repo>/.agy-write.lock` recording `pid`, `tool`, `branch`,
   `started_at`, and `purpose`. Ignore `.agy-write.lock` in `.git/info/exclude`
   (or global gitignore) so it never dirties git status, and remove it when the
   writer finishes.
3. **Scoped Antigravity and Cursor permissions**: keep headless
   `permissions.allow` rules in Antigravity CLI and command allow-lists in
   Cursor scoped to the target workspace and required commands so a runaway
   shell command cannot touch sibling checkouts or global workstation state.
4. **Stop or kill stale writers before starting a new run**: if a lock file or
   process check shows a hung or orphaned writer on the target tree, stop or
   kill that stale writer first, verify `git status` and the current branch are
   clean, remove the stale lock, and only then launch the next writer.

### Failure modes to watch for

Concurrent writers on the same branch or working tree cause four predictable
failure modes: branches fighting over conflicting commits, dirty working trees
blocking rebases, commits lost to detached HEAD resets, and duplicate pull
request noise.

## 5. Avoid common orchestration anti-patterns

Reject fragile shortcuts that bypass tool isolation or human review:

- **Do not browser-automate the Remote Control UI**: driving the Remote Control
  web interface with a browser automation agent breaks when the UI changes.
  Use Path A (`agy -p`) or Path C (`/path/to/agy-inbox/`) for automated runs,
  and keep Remote Control (Path B) for a human operator.
- **Do not launch heavy jobs from the phone**: mobile chats are for short
  prompts, triage, and approvals. Start long builds, batch evaluations, and
  multi-file refactors on the workstation where power, network, and logs are
  stable.
- **Do not keep machine learning or bulk regeneration loops inside Grok Bot**:
  iterative training, large document comparisons, and repeated generation loops
  consume shared cloud tokens rapidly. Run those loops on the workstation and
  send only final metrics or output paths back to Grok.
- **Do not treat `--dangerously-skip-permissions` as a default**: bypassing all
  permission checks in `agy` or `agent` removes safety boundaries for shell
  commands and file deletions. Use scoped allow rules and review them during the
  [monthly ops audit](monthly-audit.md#1-billing-and-usage-trend).
- **Do not grow fine-grained Allow lists as the primary launch gate**: adding a
  new Allow rule for every upcoming command is brittle. Prefer an
  operator-facing choice card (see
  [Prefer card-style launch confirmation](#6-prefer-card-style-launch-confirmation-over-growing-allow-lists)).

## 6. Prefer card-style launch confirmation over growing Allow lists

Gate whether a workstation handoff starts with an operator-facing choice card
(or an equivalent one-tap confirmation). Expanding fine-grained Allow rules for
every new command is a weak primary control.

### Prefer a named choice card

When Grok Bot (or another orchestrator) is ready to start local work, present a
short card naming the deliverable, proposed lane, and one-sentence reason:

- run with `agy`
- run with `agent` (or `cursor-agent`)
- queue in the task app
- cancel

### Keep Allow lists narrow

Treat Auto-review Allow lists and Antigravity `permissions.allow` as a narrow
safety net for unattended tools the operator already trusts in that workspace.
Leave launch-class decisions on the choice card. Keep Ask-first confirmation
for destructive git operations, external sends, deletes outside the project
directory, and purchases.

### Orchestrator flow: propose, pick, then launch

1. Propose the matching lane and a short reason.
2. Wait for the operator to pick on the card (or cancel).
3. Launch only after that pick, unless standing permission covers that class.
4. For durable or deferred work that surfaces mid-conversation, queue human
   tasks in the task app and agent jobs in the private job hub instead of
   starting silently (see
   [Track human tasks in the task app and agent jobs in a private job hub](cast-and-routing.md#3-track-human-tasks-in-the-task-app-and-agent-jobs-in-a-private-job-hub)).

Choice cards decide whether to start. Scoped permissions and checkout locks
still apply during execution.

### Reduce local approval prompts

Keep **Grok local-execution approval** distinct from **Antigravity
`permissions.allow`**. Every workstation `Shell` call that Grok Bot sends with a
registered `machineId` can trigger a Grok local-execution approval card, even
when Antigravity CLI (`agy`) already has `permissions.allow` and
`trustedWorkspaces` configured on the workstation.

Configure Grok local execution and batch workstation calls to reduce prompt churn:

- **Narrow Allow for fixed checkout roots**: prefer a narrow Allow rule for Grok
  local execution scoped strictly to `~/agy-work` (and `~/agent-work` when local
  agent runs are used). Scoping to these roots lets routine status checks, brief
  file copies, script launches, and log reads proceed without raising an
  approval card on every call.
- **Keep Ask-first for sensitive operations**: never expand Allow to arbitrary
  local `Shell` commands or "always allow everything". Retain Ask-first
  confirmation for destructive git operations, external sends, deletes outside
  the project directory, and purchases. This Grok approval policy remains
  separate from Antigravity `permissions.allow` and headless soft-deny handling.
- **Batch workstation calls by phase**: combine pre-launch checks, brief writes,
  launch, and log inspection into as few `Shell` calls as practical (ideally
  `prepare`, `launch`, and `collect-result`). For `agy` documentation, call
  [`scripts/agy-docs-launch.sh`](../scripts/agy-docs-launch.sh) to start the
  worker and [`scripts/agy-docs-collect.sh`](../scripts/agy-docs-collect.sh) to
  inspect PID, git status, open PRs, and logs (see
  [`scripts/README.md`](../scripts/README.md)):

  ```bash
  ~/agy-work/grok-bot-ops/scripts/agy-docs-launch.sh <repo> ~/agy-inbox/<brief>.txt [stem] [model]
  ~/agy-work/grok-bot-ops/scripts/agy-docs-collect.sh <repo> [stem]
  ```

- **Confirm heavy launches once, then poll minimally**: gate heavy runs once on
  an operator-facing choice card. After launch, wait for completion notification
  or run `agy-docs-collect.sh` once instead of polling in a tight loop.
- **Never auto-approve all local `Shell` calls to fix prompt fatigue**: do not
  expand Grok Auto-review Allow rules to cover arbitrary local commands, and
  never pass `--dangerously-skip-permissions` inside wrapper scripts.

### Prepare agy docs briefs without long Mac heredocs

Long delays before an `agy` docs launch are often **brief preparation**, not the
worker itself. Keep brief prep fast and low-approval with three rules that align
with the `prepare` → `launch` → `collect-result` phases above:

1. **Write long briefs on the Grok box, then copy them to the workstation**:
   create the Markdown brief under a box path such as
   `/workspace/agy-briefs/<brief>.md`, then use Grok's `CopyFromBox` into
   `~/agy-inbox/` on the registered workstation. Do **not** put a large
   heredoc (`cat <<'EOF' …`) into a workstation `Shell(machineId=…)` call.
   Local-execution approval can refuse or stall payloads that are too long to
   show for review.
2. **Reuse parent-provided facts instead of re-scanning the Mac**: if the
   parent chat or handoff already includes inventory, absolute path lists,
   trial tables, or log excerpts, embed those facts in the brief. Re-scan the
   workstation only for **missing** facts. Ideal prep before
   [`scripts/agy-docs-launch.sh`](../scripts/agy-docs-launch.sh) is one or two
   short Mac `Shell` calls plus `CopyFromBox`, not a chain of inventory
   commands that each raise an approval card.
3. **Split status language for brief prep versus worker launch**: say
   **「brief 準備中」** while the brief is still being written or copied, and
   **「agy 起動済み (PID=…, log=…)」** only after
   `agy-docs-launch.sh` (or an equivalent launch) has recorded a PID and log
   path. When the operator asks whether the worker started, answer from
   PID/log presence, not a vague "working".

After the brief file exists under `~/agy-inbox/`, prefer the launch and collect
wrappers in [`scripts/README.md`](../scripts/README.md) so launch and result
collection each stay one workstation `Shell` call.

### Unstructured and multimodal offload

Route **images, short videos, PDF understanding, and long messy logs** to
Antigravity CLI (`agy`, Gemini multimodal) when the work is understanding or
summarizing unstructured media. Grok Bot **routes** (absolute paths, brief,
done criteria) and returns a short summary; do not spend Grok tokens on large
binaries or OCR when `agy` can read the media directly.

Verified headless pattern:

```bash
agy --add-dir <media-dir> --add-dir <other-dir> -p "… @/absolute/path/to/file …"
```

- Prefer `@` absolute paths plus `--add-dir` for the directories that hold the
  media. Interactive Ctrl+V paste remains valid for official media types when
  the operator is supervising a live session.
- Read-only multimodal review may `--add-dir` media outside `~/agy-work`.
  **Writes** still stay under path-scoped `~/agy-work/<repo>` only (see
  [Fixed checkout roots](#fixed-checkout-roots)).
- Keep the same safety boundaries as other docs-lane handoffs: card-style
  launch confirmation, one `argv`-style command per `RunCommand`, soft-deny
  stop-and-report, no mid-run allow widen, and no
  `--dangerously-skip-permissions` (see
  [Prefer card-style launch confirmation](#6-prefer-card-style-launch-confirmation-over-growing-allow-lists)
  and [Headless agy soft-deny handling](#headless-agy-soft-deny-handling)).

### Headless agy soft-deny handling

Stop immediately and report the exact command or tool when a headless `agy -p`
run hits a permission denial or unsupported tool error; never widen permissions
mid-run.

Configure briefs and permissions for unattended Print mode (`agy -p`) with four
constraints in mind:

- **Path-scoped `write_file` and `trustedWorkspaces` are necessary and still
  limited**: scoping `write_file(~/agy-work)` and `trustedWorkspaces` is
  required for `agy -p`, and those settings still do not authorize every tool
  alias or shell command. Because Print mode cannot show an interactive
  confirmation dialog, any action that requires confirmation is soft-denied, or
  fails with `unknown_command` or `unsupported_tool: write_file`.
- **Interactive review modes soft-deny in Print mode**: settings such as
  `toolPermission=request-review` (or equivalent interactive review policies)
  are incompatible with unattended `agy -p` runs for those tools, because
  headless Print mode soft-denies instead of prompting the operator.
- **Prefer allow-listed commands in docs-lane briefs**: write docs-lane briefs
  around commands already in the workstation allow list: `git`, `gh`, `cp`,
  `wc`, `mkdir`, `ls`, `cat`, and the allow-listed `git` and `gh` subcommands.
  Avoid `npm` or `npx` lint commands unless the exact allow-listed command
  string is named in the brief before launch. Issue one `argv`-style command per
  `RunCommand` call with no `&&`, `||`, `;`, `|`, `$()`, backticks, or unquoted
  globs (see
  [Issue one command per tool call in headless CLI handoffs](#issue-one-command-per-tool-call-in-headless-cli-handoffs)).
- **Review allow-list changes offline after a stop**: on `soft-deny`,
  `unknown_command`, or `unsupported_tool`, stop the run and return the exact
  command or tool and the failure reason. The operator or the cost/ops bot
  reviews any `permissions.allow` change offline and re-runs the brief afterward.
