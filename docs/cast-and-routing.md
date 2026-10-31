# Cast roles, assignment channels, and work-request routing

Route human work requests from the task app and bot jobs from the private job hub
through a named channel to the actor and surface built for that job.

Use the same generic labels as [`shared-rules.md`](shared-rules.md): operator,
domain bot (`Domain｜Role`), progress bot, cost/ops bot, document worker, cloud
coding agent, and shared durable notes.

For plan pools, spend caps, and surface cost lanes, see
[`tooling-and-cost.md`](tooling-and-cost.md). For workstation CLI setup,
`agy` and `agent` handoff paths, parallel-writer control, and card-style launch
confirmation, see [`workstation-handoffs.md`](workstation-handoffs.md).

## 1. Know the full cast across actors, tools, and environments

Identify every human, bot, coding tool, automated trigger, and execution
surface before assigning work:

- **Operator (human)**: sets goals, approves cost and ops proposals, supervises
  sensitive tool calls, reviews pull requests, and merges or publishes finished
  work.
- **Grok Bot (sidebar bots and orchestrator surface)**: includes long-lived
  domain bots (`Domain｜Role`), the progress bot, the cost/ops bot, and
  short-lived one-off chats. Grok Bot provides conversational UI and multi-bot
  coordination.
- **Cost/ops bot (daily commander)**: routes tasks to execution lanes, prepares
  briefs, requests launch confirmation, accepts completion signals, and manages
  peer handoffs. It links daily orchestration directly with spend oversight.
- **Progress bot (weekly aggregator)**: aggregates weekly progress from the
  Drive weekly Google Doc into an operator digest. Status files under
  `/home/box/status/<slug>.md` are optional auxiliary notes. The progress bot
  does not manage daily task assignments or poll workers.
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

### Daily commander versus progress bot

Assign daily dispatch responsibilities to the cost/ops bot rather than creating
a separate commander role:

- **Cost/ops bot as daily commander**: selects the execution lane (document
  worker, cloud coding agent, or registered workstation), prepares briefs,
  requests launch confirmation, accepts completion signals, and routes peer
  handoffs. Combining commander duties with cost tracking keeps lane routing
  aligned with plan limits. Do not create a separate commander bot when a
  cost/ops bot already manages lanes and spend.
- **Progress bot for weekly rollups**: aggregates weekly progress into an
  operator digest (such as a Monday routine digest). The Drive weekly Google Doc
  is the single source of truth for these digests. The progress bot prefers the
  Drive Doc and does not chase stale or missing status files. Files under
  `/home/box/status/<slug>.md` are optional auxiliary notes, and missing or
  stale files are not defects. The progress bot does not handle daily task
  assignments, receive completion pings, or poll workers. Personal and family
  details stay out of work-bot digests.

## 2. Match each role and surface to the right workload

Assign each job to the actor and device built to execute and supervise it
safely (see [`tooling-and-cost.md`](tooling-and-cost.md) for cost-lane details):

1. **Grok Bot**: owns the operator UI, mobile-friendly orchestration, external
   connectors (mail, calendar, collaborative docs suite, task app), multi-bot
   coordination, and scheduled routines. As the front door and orchestrator,
   Grok proactively queues human tasks in the operator's task app, records bot
   jobs in the private job hub, proposes the matching execution lane for
   immediate work, owns the goal, guardrails, and success criteria, and launches
   approved handoffs (`agy -p`, `agent -p`, cloud coding agents, and bot-to-bot
   messages; see
   [Track human tasks in the task app and agent jobs in a private job hub](#3-track-human-tasks-in-the-task-app-and-agent-jobs-in-a-private-job-hub)).
   Keep long machine learning runs, large PDF comparison loops, and bulk
   regeneration loops out of Grok.
2. **Cursor cloud coding agents and local `agent` (plus Cursor IDE)**: own
   repository coding across interactive sessions, fresh cloud branches, and
   local headless runs (`agent -p`) for features, bug fixes, multi-file
   refactors, and iterative test cycles. Prefer **Cursor cloud coding agents**
   for standard repository coding; use local `agent -p` only when the job must
   run on the workstation (local hardware, local-only files, or local-only
   headless tooling), and keep its checkouts strictly under
   `~/agent-work/<repo>` (`mkdir -p ~/agent-work`; never `~/work/...`).
3. **Antigravity (`agy` and Remote Control)**: owns document drafting,
   repository documentation updates, and lighter repository tasks that belong on
   the Google or Gemini authentication lane. Prefer `agy` (defaulting to
   Gemini 3.8 Flash) whenever that lane has quota. Keep all local `agy`
   checkouts strictly under `~/agy-work/<repo>` (never `~/work/...`; see
   [Fixed checkout roots](workstation-handoffs.md#fixed-checkout-roots)).
4. **Local workstation hardware**: runs Apple Silicon Metal and MPS workloads,
   local model inference, non-training heavy batches (video, audio, data
   transforms, container builds), local test suites, and local CLI workers
   (`agy` and `agent`). Enforce the one-writer rule across local checkouts (see
   [Control parallel `agy` and `agent` runs](workstation-handoffs.md#4-control-parallel-agy-and-agent-runs-to-prevent-branch-conflicts))
   and return only short summaries, metrics, or output paths to Grok.
5. **Phone**: handles short instructions, triage, and human approvals. Do not
   use the phone as a launch surface for long training runs, bulk regeneration
   jobs, or unreviewed multi-file refactors.
6. **Grok cloud computer ("box")**: runs connector calls, scheduled routines,
   inter-bot coordination, and short research queries. Keep GPU-heavy workloads
   and long iterative compute loops off the Grok box.

Enforce strict boundaries between prose authorship and repository coding:

- **Document and deck-body authorship**: route repository Markdown docs,
  md-deck slide body prose, customer-facing proposals, and Q&A decks to `agy`
  under `~/agy-work/<repo>`.
- **Code and mechanical PR hygiene**: route features, bug fixes, refactors, CI
  pins, and script plumbing to Cursor cloud coding agents (or local `agent`
  when workstation-bound).
- **Never switch lanes on approval wait**: never change lanes mid-task solely
  because a Mac local Shell command is waiting for an approval card. Wait for
  operator review, relaunch `agy` after allow, or stop and report.

## 3. Track human tasks in the task app and agent jobs in a private job hub

Keep human work in the operator's task app and agent jobs in a private job hub,
while the calendar remains the schedule source of truth (see
[Human tasks in the task app, agent jobs in the private job hub, schedules in the calendar](shared-rules.md#10-human-tasks-in-the-task-app-agent-jobs-in-the-private-job-hub-schedules-in-the-calendar)):

- **Human task manager for human work only**: the operator's dedicated task app
  (Todoist or an equivalent) tracks human work only. Use it for operator
  chores, personal reminders, and non-agent tasks. Do not put bot or agent job
  queues in the human task app.
- **Private job hub for bot and agent jobs**: bot and agent jobs use a private
  job hub (such as a private operations repository with Issues and labels) for
  bot assignments, launch triggers, status labels, and completion signals.
- **Do not duplicate agent state into the human task app**: keep agent job queues
  and status inside the private job hub. Do not duplicate agent job state into
  the human task app unless the operator explicitly asks for a personal reminder
  about a human step (for example, "approve this card").
- **Proactively queue durable or deferred work**: when a human follow-up
  surfaces mid-conversation, Grok Bot proposes adding it to the human task app.
  When an agent job surfaces, Grok Bot logs it in the private job hub instead of
  letting the active conversation bury and silently drop it.
- **Propose the matching lane for immediate work**: when work should run now,
  Grok Bot proposes launching on the matching lane (cloud coding agent versus
  local workstation; `agy` versus `agent`) with a short reason, such as
  isolating repository code on a fresh branch, keeping documentation on the
  Google or Gemini lane, or running local tests on the workstation.
- **Confirm on a choice card before starting heavy or consequential jobs**:
  prefer an operator-facing choice card (or equivalent one-tap confirmation)
  that names the lane and action: run with `agy`, run with `agent`, queue in
  the private job hub, or cancel. Grok Bot does not start heavy compute,
  multi-file refactors, external sends, or other consequential jobs until the
  operator picks, unless standing permission or an explicit instruction to run
  immediately covers that launch or send. Keep Auto-review Allow lists and
  Antigravity `permissions.allow` narrow. The choice card is the launch gate
  (see
  [Prefer card-style launch confirmation](workstation-handoffs.md#6-prefer-card-style-launch-confirmation-over-growing-allow-lists)).
- **Grok Bot dispatches from the private job hub**: Grok Bot reads pending
  agent jobs from the private job hub, marks the active item `running` with the
  active lane, serializes jobs that touch the same local checkout, and launches
  the matching handoff (`agy -p`, `agent -p`, cloud coding agents, or bot-to-bot
  messages).
- **Do not create a second backlog**: never maintain a parallel work-request
  queue in chat transcripts, watched inbox folders (`/path/to/agy-inbox/` or
  `/path/to/cursor-inbox/`), weekly progress docs, or shared workspace status
  files. Watched inbox folders are transport spools for already-dispatched
  tasks, and progress docs or status files are summaries only.

### Format job items so handoff ownership is visible at a glance

Apply a consistent visibility convention to every dispatched item in the private
job hub so the operator can see who was asked to do what without keeping a second
backlog:

- **Labels for lane and status**: attach a lane label (such as `agy`, `agent`,
  `orchestrator-bot`, or `cloud-coding`) and a status label (`running` or
  `waiting`).
- **Title prefix for the active lane and handoff chain**: prefix the job title
  with the active execution lane, and show the handoff chain when work moves
  across workers (for example, `[agy] Document job hub visibility rules` or
  `[agent→agy] Refresh routing docs after CLI verification`).
- **Structured description fields**: keep four fields in the job description:
  1. **Assignee and lane**: which bot or worker owns the current step.
  2. **Target pull request or checkout path**: generic placeholders until bound,
     such as `https://github.com/org/repo/pull/N` or `~/agy-work/<repo>` (or
     `~/agent-work/<repo>`) on branch `docs/topic-name`.
  3. **Progress notes**: short timestamped or step-level handoff updates.
  4. **Done criteria**: the verification check and expected deliverable (such as
     lint passing and the pull request updated without merging).

Example private job hub entry during a handoff:

```text
Title: [agent→agy] Document job hub visibility rules
Labels: agy, running
Description:
- Assignee / lane: agy (document lane on registered workstation)
- Target: ~/agy-work/<repo> (branch docs/topic-name, PR https://github.com/org/repo/pull/N)
- Progress: CLI check finished in agent; handed off to agy for Markdown edits
- Done criteria: docs updated, <= 500 lines per file, markdownlint clean, PR body refreshed
```

### Update job state on launch, block, and finish

Update the private job hub item at each transition so the queue shows live
status and completion without chat archaeology:

1. **On launch**: apply the lane label and `running`, add or update the lane
   title prefix (including any `worker-a→worker-b` handoff chain), and record
   who is running what in the description before or as the worker starts.
2. **On block or wait**: switch the status label from `running` to `waiting` and
   record the specific blocker in the description or an Issue comment (such as
   waiting on an operator choice-card pick, a soft-denied CLI permission, or
   another writer holding `.agy-write.lock`).
3. **On finish**: close the Issue or mark the job complete in the private job hub
   (or post a short outcome comment with the pull request URL or commit hash and
   then close the item) so the operator sees completion in the queue without
   reading chat logs.

## 4. Map who assigns work to whom and over which channel

Route every handoff through a named channel so tasks have a clear owner and
return path:

| Assigner | Assignee | Channel type | Typical use |
| :--- | :--- | :--- | :--- |
| Operator | Grok Bot (`Domain｜Role` or one-off chat) | **In-app chat / `@bot`** | Goal setting, domain questions, connector tasks, and orchestration briefs |
| Grok Bot | Another Grok Bot (`Domain｜Role`) | **Bot-to-bot message** | Cross-domain facts and handoffs (low priority by default; high priority only for blockers) |
| Grok Bot | Antigravity CLI (`agy`) | **Approved local shell on registered workstation** (`agy -p`) | Synchronous or scripted documentation and Google or Gemini lane tasks on the workstation |
| Grok Bot (with operator) | Antigravity CLI (`agy`) | **Remote Control web UI (paste)** | Grok drafts the brief; the operator pastes it into Remote Control and approves actions live |
| Grok Bot | Antigravity CLI (`agy`) or local Cursor Agent (`agent`) | **Inbox file + LaunchAgent/cron** | Local transport spool where a file drop triggers `agy -p` or `agent -p` |
| Grok Bot | Local Cursor Agent (`agent` / `cursor-agent`) | **Approved local shell on registered workstation** (`agent -p`) | Local repository coding, refactors, and test loops on the workstation |
| Grok Bot or operator | Cursor cloud coding agents | **Cloud agent launch / PR thread** | Fresh remote branch and pull request work for isolated repository coding tasks |
| Routines / schedules | Grok Bot or local CLI workers | **Scheduled routine / LaunchAgent or cron** | Daytime or event-driven status passes and watched-folder CLI dispatch |
| Operator | Cursor IDE, cloud coding agents, `agent`, or `agy` | **Direct CLI, IDE, Remote Control, or cloud launch (bypass)** | Self-contained coding or docs work that needs no Grok connectors or multi-bot context |

Follow these channel rules on every handoff:

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
  invoke headless print mode only inside its fixed checkout root (`~/agy-work/<repo>`
  for `agy` and `~/agent-work/<repo>` for `agent`; never `~/work/...`), state
  the absolute checkout path in the brief, and verify no other writer is active
  on that checkout (see
  [`workstation-handoffs.md`](workstation-handoffs.md#fixed-checkout-roots)).
- **Remote Control web UI (paste)**: keep Remote Control for human paste and
  supervision. Do not use browser automation to drive the Remote Control web UI
  as a primary handoff path.
- **Inbox file + LaunchAgent/cron**: drop a self-contained brief file into a
  watched workstation directory (`/path/to/agy-inbox/` or
  `/path/to/cursor-inbox/`) when Grok dispatches a private job hub item without
  holding an interactive shell open.
- **Cloud agent launch / PR thread**: start a fresh Cursor cloud coding agent
  per pull request or isolated coding task, and keep code review and follow-up
  fixes anchored to the pull request thread.
- **Direct operator bypass**: the operator may talk directly to Cursor IDE,
  Cursor cloud coding agents, local `agent`, or `agy` without going through Grok
  Bot when the task is self-contained and does not need Grok connectors,
  multi-bot coordination, or shared-note lookups. If a direct session changes a
  project priority, architecture choice, or cross-domain rule, record the
  decision in shared durable notes afterward so domain bots stay aligned.

## 5. Keep the orchestrator-versus-worker boundary strict

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
transcript or guess repository policy (see
[Structure handoff briefs](workstation-handoffs.md#3-structure-self-contained-handoff-briefs-and-keep-secrets-out-of-argv)).

### Commander assigns and accepts completion only

The orchestrator defines the goal, guardrails, execution lane, and success
criteria. It launches the task or queues it: a human follow-up goes in the task
app, and an agent job goes in the private job hub. It then waits for a
completion signal and routes the next step.

Domain bots, cloud coding agents, and workstation workers own the internal
implement, review, and fix cycle. The commander does not execute code edits or
supervise intermediate steps inside the worker loop.

### Harden goal and done criteria before launch

Define clear goals, constraints, and verifiable success criteria before
launching any worker. Do not dispatch heavy cloud coding agents or workstation
CLI runs on vague requests.

Every brief must state target paths, forbidden changes, expected deliverables,
and exact verification checks. Workers rely on complete briefs to finish tasks
without conversational back-and-forth (see
[Structure handoff briefs](workstation-handoffs.md#3-structure-self-contained-handoff-briefs-and-keep-secrets-out-of-argv)).

### Prefer event-driven completion over polling

Wait for asynchronous completion signals instead of polling workstation shells
or log files in tight loops.

Use standard completion signals:

- private job hub status transitions (`running` to completed) for agent jobs
- human task app status only when the operator asked to track a human step
- pull request or issue comments and status labels
- webhook relays or worker completion callbacks
- explicit peer messages sent to the commander

When a completion signal arrives, collect results in a single pass (such as
running `scripts/agy-docs-collect.sh`). Avoid periodic status queries that burn
shell calls and tokens.

### Enforce one-writer isolation across parallel workers

Parallel writers must never edit the same checkout directory or git branch
concurrently.

When concurrent work is required, assign each worker its own checkout directory
or a dedicated git worktree under its fixed root (`~/agy-work/<repo>` for
`agy` and `~/agent-work/<repo>` for `agent`). See
[Control parallel `agy` and `agent` runs](workstation-handoffs.md#4-control-parallel-agy-and-agent-runs-to-prevent-branch-conflicts).

### Split roles only at explicit quality gates

Keep single-worker runs on default economical models, such as Gemini 3.8 Flash
for documentation and standard cloud coding pools. Do not use continuous
multi-model handoffs or separate plan, implement, and review roles for routine
tasks. Always-on model switching increases token consumption and latency.

Split plan, implement, or review roles into separate sessions or models only
after reaching an explicit quality gate:

- an automated check or test failure
- a tool permission soft-deny
- an explicit operator review checkpoint

## 6. Run the pre-launch checklist to prevent mis-assignment

Verify every item before launching a handoff:

- [ ] **Assign dispatch to the daily commander**: confirm the cost/ops bot
  manages lane selection and dispatch. Keep the progress bot focused on weekly
  aggregation using the Drive weekly Google Doc as the source of truth, treating
  status files as optional notes. Do not create an extra commander bot.
- [ ] **Match the job type to the right lane**: route standard repository
  coding to Cursor cloud coding agents; use local `agent -p` (under
  `~/agent-work/<repo>`) only when the task must run on the workstation (local
  hardware, local-only files, or local-only tooling); route documentation and
  Google or Gemini lane work to `agy` (under `~/agy-work/<repo>`) or a document
  worker; route machine learning and heavy compute to native workstation tools;
  keep connectors, routines, and multi-bot orchestration in Grok Bot.
- [ ] **Enforce fixed checkout roots and one writer per checkout**: run `agy`
  only under `~/agy-work/<repo>` and local `agent` only under
  `~/agent-work/<repo>` (never under `~/work/...`), state the absolute checkout
  path in the brief, and never run parallel `agy` or `agent` processes on the
  same checkout or branch at the same time (see
  [Fixed checkout roots](workstation-handoffs.md#fixed-checkout-roots) and
  [Control parallel `agy` and `agent` runs](workstation-handoffs.md#4-control-parallel-agy-and-agent-runs-to-prevent-branch-conflicts)).
  Use separate clones, git worktrees, or sequential runs when two tasks touch
  the same repository.
- [ ] **Harden goal, constraints, success criteria, and merge policy**: confirm
  the brief specifies all four fields, including whether to open a draft PR or
  stop before merging. Reject vague asks before dispatching heavy workers.
- [ ] **Restrict commander scope to assign and accept**: verify the commander
  sets up the brief, records the task, and waits for a completion signal. Leave
  the internal implement and review loop to the worker.
- [ ] **Rely on event signals rather than polling**: configure completion
  tracking via private job hub status, pull request or issue labels, webhooks,
  or callbacks. Do not poll workstation shells or logs in tight loops.
- [ ] **Keep execution on default models until a quality gate**: run standard
  tasks on default models. Separate plan, implement, or review roles only after
  a soft-deny, check failure, or operator checkpoint.
- [ ] **Use scoped permissions over skip-all flags**: rely on narrow
  `permissions.allow` rules and directory-scoped execution approvals instead of
  `--dangerously-skip-permissions`. Do not expand fine-grained Allow entries for
  every new command as the primary launch control. Follow
  [Reduce local approval prompts](workstation-handoffs.md#reduce-local-approval-prompts)
  and
  [Headless agy soft-deny handling](workstation-handoffs.md#headless-agy-soft-deny-handling).
- [ ] **Schedule routines for daytime or events**: prefer event triggers or
  daytime schedules when a person can review the output over overnight jobs that
  create unread noise.
- [ ] **Check shared weekly pool implications**: account for whether Cursor
  shares plan usage pools with Grok Bot while Antigravity CLI uses its separate
  Google or Gemini authentication lane, and never invent or hardcode billing
  numbers.
- [ ] **Keep human tasks in the task app and agent jobs in the private job hub**:
  read and update agent jobs in the private job hub, and keep human chores in
  the task app (Todoist or an equivalent). Apply lane (`agy`, `agent`,
  `orchestrator-bot`, `cloud-coding`) and status (`running`, `waiting`) labels
  on job hub items, prefix titles with the active lane or handoff chain
  (`[agy]`, `[agent→agy]`), record the assignee, target pull request or checkout
  path, progress notes, and done criteria in the description, and close (or
  comment the outcome on) finished items. Copy agent job state into the human
  task app only when the operator asks for a personal reminder about a human
  step. Never build a second queue in chat transcripts, watched inbox folders,
  or status docs.
- [ ] **Confirm heavy or consequential launches on a choice card**: propose the
  target lane (cloud versus local; `agy` versus `agent`) with a short reason,
  present a card that names the action (run with `agy`, run with `agent`, queue
  an agent job in the private job hub or a human task in the task app, or
  cancel), and wait for the operator pick before starting
  unless standing permission or an explicit run-now instruction covers that
  launch (see
  [Prefer card-style launch confirmation](workstation-handoffs.md#6-prefer-card-style-launch-confirmation-over-growing-allow-lists)).
- [ ] **Keep Remote Control human-driven and heavy launches off the phone**: do
  not browser-automate the Remote Control web UI as a primary path, and start
  heavy builds or compute runs from the workstation instead of the phone.
