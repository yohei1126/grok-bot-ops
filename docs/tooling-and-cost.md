# Tool routing, cost caps, and workstation CLI handoffs

Split work across four surfaces (Grok Bot, Cursor, Antigravity CLI (`agy`), and
the local workstation) so usage stays within included plan limits and extra
on-demand charges stay rare.

Use the same generic labels as [`shared-rules.md`](shared-rules.md): operator,
domain bot (`Domain｜Role`), progress bot, cost/ops bot, document worker, cloud
coding agent, and shared durable notes.

## 1. Split work across four surfaces

Route every task to the surface that fits its compute, authentication pool, and
token profile:

1. **Grok Bot**: operator UI, mobile-friendly orchestration, connectors (mail,
   calendar, collaborative docs, task app), scheduled routines, and multi-bot
   coordination. Grok owns the goal, guardrails, success criteria, and handoff
   launch. Keep chats short, and keep long machine learning runs, large PDF
   comparison loops, and bulk regeneration loops out of Grok.
2. **Cursor (IDE, cloud agents, and local CLI)**: repository coding across
   interactive IDE sessions, fresh cloud coding agents, and local headless CLI
   runs (`agent` or `cursor-agent`) for multi-file refactors and iterative
   code-and-test cycles (see
   [Code and documents](shared-rules.md#5-code-and-documents-use-different-workers)).
3. **Antigravity CLI (`agy`)**: document drafting and lighter repository work
   under Google or Gemini authentication. It executes workstation briefs after
   Grok hands off work, either in the interactive TUI (`agy`) or in headless
   print mode (`agy -p`).
4. **Local workstation (for example, an Apple Silicon laptop)**: machine
   learning training, local model inference, and heavy generation or comparison
   jobs. Run the compute on the workstation and return only short results or
   output paths to Grok.

Keep the orchestrator-versus-worker boundary strict when handing work from Grok
Bot to a workstation CLI (`agy` or `agent`):

- **Grok Bot (orchestrator)** decides *what* needs to happen: the deliverable
  goal, target repository and branch policy, guardrails, forbidden content, and
  done criteria, and then launches the handoff.
- **Workstation CLIs (workers)** decide *how* to finish the job inside the
  brief: which files to inspect, how to structure edits, and how to run local
  checks before reporting back.

Cursor usage (across the IDE, cloud agents, and local CLI) may share plan pools
with Grok Bot depending on billing, whereas Antigravity CLI runs in a separate
Google or Gemini authentication lane. When product billing settings support an
on-demand or additional-usage spend cap, the operator should set a monthly cap
so usage stops at a known limit after the included pool runs out.

## 2. Keep device posture aligned with tool roles

Match each device or execution surface to the work it can supervise safely.

- **Local workstation**: runs heavy compute, local model inference, and local
  CLI agents (`agy`, `agent` or `cursor-agent`, local test suites, and build
  scripts).
- **Phone**: handles short instructions, human approvals, and progress checks.
  Do not launch long training runs or bulk regeneration jobs from the phone.
- **Grok cloud environment**: runs connectors, routines, multi-bot
  coordination, and short research queries. Keep GPU-heavy work and long
  iterative compute loops off the cloud environment.

## 3. Treat cost and routing changes as proposals

Propose routing and spend changes through a cost/ops bot or the
[monthly audit](monthly-audit.md) instead of applying them ad hoc (see
[Cost and ops changes start as proposals](shared-rules.md#14-cost-and-ops-changes-start-as-proposals)).
The operator decides what to adopt:

1. Move heavy compute, comparison, or drafting loops off Grok onto the local
   workstation, Antigravity CLI, or Cursor as appropriate.
2. Set an on-demand or additional-usage monthly spend cap in product billing
   settings so work halts at a known limit instead of triggering silent
   top-ups.
3. Prefer routines that run when a person can act (such as weekday daytime) or
   fire on event triggers, rather than overnight schedules that pile up unread
   output.

## 4. Prepare the workstation for Antigravity CLI handoffs

Complete five one-time setup steps on the local workstation before wiring Grok
Bot to Antigravity CLI (`agy`):

1. **Install `agy` and configure the shell path**: install the Antigravity CLI
   binary and run `agy install` if needed so `agy` is on `PATH` for both
   interactive shells and non-interactive automation runners.
2. **Complete one interactive login**: run `agy` once in a local terminal and
   finish the Google or Gemini authentication prompt. Headless runs (`agy -p`)
   rely on the stored session and fail if the workstation has never logged in.
3. **Start the Remote Control daemon when mobile access is needed**: run
   `agy remote-control start` (and verify with `agy remote-control status`) if
   the operator plans to review or paste prompts from a phone or remote
   browser. Stop it with `agy remote-control stop` when remote access is no
   longer wanted.
4. **Configure scoped `permissions.allow` rules**: edit the Antigravity CLI
   `settings.json` file (or pass session settings via `--settings`) to allow
   only the specific tools and commands that unattended runs need. In headless
   print mode, tools that would normally ask for interactive confirmation are
   soft-denied unless explicitly allowed in advance.
5. **Register the workstation for Grok local execution**: when Grok Bot will
   invoke `agy -p` or drop files onto the workstation directly, register the
   workstation with Grok's local execution bridge and restrict command
   approvals to the intended working directories.

## 5. Hand work from Grok Bot to Antigravity CLI through three paths

Pick the handoff path that matches how much human supervision the task needs.

### Path A: run headless print mode via an approved local shell

Use headless print mode when a Grok Bot (`Domain｜Role`) can run approved local
shell commands on the registered workstation:

```bash
cd /path/to/project && agy -p "<brief>"
```

When the brief is long or contains shell metacharacters, pipe it over standard
input instead of embedding it in command arguments:

```bash
agy -p --project /path/to/project < /path/to/agy-inbox/current-brief.txt
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
- `--sandbox`: enable terminal restrictions for untrusted or tightly scoped
  tasks.

Prefer scoped `permissions.allow` rules in settings over
`--dangerously-skip-permissions`. Because headless mode soft-denies any action
that still needs interactive approval, test a new workflow once and add narrow
allow rules for the exact tools it requires.

### Path B: draft the brief in Grok and paste it into Remote Control

Use Remote Control when the operator is on a phone or away from the desk and
wants to supervise tool calls in real time:

1. Keep the background daemon running on the workstation with
   `agy remote-control start`, or open a single session with
   `agy --remote-control` (or `/remote-control` inside the TUI).
2. Ask the responsible Grok Bot to draft a self-contained brief in chat.
3. Open the Antigravity Remote Control web view, paste the brief, and approve
   or reject edits and shell commands as they appear.

### Path C: drop a task file into a watched inbox folder

Use a watched inbox folder when Grok Bot should queue unattended work without
holding a synchronous shell session open:

1. Grok Bot writes a plain-text or Markdown brief into a watched directory on
   the workstation, such as `/path/to/agy-inbox/task-YYYYMMDD-HHMM.md`.
2. A macOS LaunchAgent (`WatchPaths`) or cron entry invokes a local wrapper
   script whenever a new file lands in `/path/to/agy-inbox/`.
3. The wrapper moves the file into `/path/to/agy-inbox/processing/` first so a
   second trigger cannot pick up the same file, feeds the file contents to
   `agy -p`, writes the output to
   `/path/to/agy-inbox/out/task-YYYYMMDD-HHMM.log`, and archives the input
   under `/path/to/agy-inbox/done/`.
4. Grok Bot reads only the short output summary or exit status on a later pass.

## 6. Hand coding work from Grok Bot to the local Cursor Agent CLI

Use the local Cursor Agent CLI as an optional parallel workstation handoff when
a task is repository coding and should run locally in the Cursor toolchain. On
the workstation, the CLI entrypoint is typically `agent` (also installed as
`cursor-agent`), and it supports the same non-interactive print mode pattern as
`agy -p`:

```bash
cd /path/to/project && agent -p "<brief>"
```

For long briefs or prompts with shell metacharacters, pipe the brief from a
file or watched inbox directory instead of passing it inline on the command
line:

```bash
cd /path/to/project && agent -p < /path/to/cursor-inbox/current-brief.txt
```

Prepare the workstation with the same safeguards used for `agy`: put `agent`
(or `cursor-agent`) on `PATH`, complete an interactive login once in a local
terminal, prefer scoped command and tool permissions over skip-all flags, and
restrict Grok's local execution approvals to the target project directories.

Pick between `agent -p` and `agy -p` by task type and billing lane:

- **Prefer `agent -p` (or `cursor-agent -p`)** when the job is repository
  coding (features, refactors, bug fixes, and test loops) that should stay in
  the Cursor toolchain.
- **Prefer `agy -p`** when the job is document drafting, Google or Gemini side
  work, or when the operator wants that separate authentication and cost lane.
- **Account for plan pools**: Cursor usage (IDE, cloud agents, and local CLI)
  may share plan pools with Grok Bot depending on billing, whereas Antigravity
  CLI uses a separate Google or Gemini authentication lane.

## 7. Keep handoff briefs self-contained and free of secrets

Write every Grok-to-CLI brief (`agy` or `agent`) so a fresh worker session can
finish the job without reading the Grok chat transcript. Keep the
orchestrator-and-worker division clear: Grok specifies the target outcome,
constraints, and done criteria, while the workstation CLI determines the
implementation steps inside the brief. Do not store concrete task prompts or
project-specific briefs in shared public documentation.

Structure each handoff brief around four fields:

- **Goal**: one sentence naming the deliverable (for example, updating a
  specific guide section or fixing a lint failure).
- **Target paths and branch policy**: the repository directory, which branch to
  update or create, and the exact files in scope.
- **Constraints**: line limits, formatting rules, forbidden content (such as
  personal identifiers, billing figures, or real display names), and whether the
  worker must stop before merging.
- **Verification and return format**: the exact check commands to run (such as
  a Markdown linter or test suite) and what to report back (for example, the PR
  URL and the list of changed files).

Apply two extra hygiene rules on every handoff:

- **Follow `CONTRIBUTING.md` on public docs repositories**: instruct the worker
  to read `CONTRIBUTING.md` before changing files or updating a pull request,
  and to run required structure and humanizer prose checks plus Markdown
  linting.
- **Keep secrets out of `argv`**: never pass API keys, tokens, or private URLs
  inline inside `agy -p "..."` or `agent -p "..."`. Command-line arguments
  appear in local process tables (`ps`) and shell history. Load secrets from
  workstation environment variables or local secret stores, and pass long or
  sensitive prompts through standard input or a local file with restricted
  permissions (`0600`).

## 8. Avoid common orchestration anti-patterns

Do not use fragile shortcuts that defeat tool isolation or human review:

- **Do not browser-automate the Remote Control UI**: driving the Remote Control
  web interface with a browser automation agent is brittle and breaks whenever
  the web UI changes. Use Path A (`agy -p`) or Path C (`/path/to/agy-inbox/`)
  for automated runs, and reserve Remote Control (Path B) for a human operator.
- **Do not launch heavy jobs from the phone**: mobile chats are for short
  prompts, triage, and approvals. Start long builds, batch evaluations, and
  multi-file refactors on the workstation where power, network, and logs are
  stable.
- **Do not keep machine learning or bulk regeneration loops inside Grok Bot**:
  iterative training, large document comparisons, and repeated generation loops
  consume shared cloud tokens rapidly. Run those loops on the local workstation
  and send only final metrics or output paths back to Grok.
- **Do not treat `--dangerously-skip-permissions` or skip-all flags as a
  default**: bypassing all permission checks in `agy` or `agent` removes safety
  boundaries for shell commands and file deletions. Use scoped allow rules and
  review them during the
  [monthly ops audit](monthly-audit.md#1-billing-and-usage-trend).
