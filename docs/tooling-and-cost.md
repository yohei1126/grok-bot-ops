# Tool routing, cost caps, and Antigravity CLI handoffs

Split work across Grok Bot, Cursor, Antigravity CLI (`agy`), and the local
workstation so usage stays within included plan limits and extra on-demand
charges stay rare.

Use the same generic labels as [`shared-rules.md`](shared-rules.md): operator,
domain bot (`Domain｜Role`), progress bot, cost/ops bot, document worker, cloud
coding agent, and shared durable notes.

## 1. Assign each tool a clear role

Route every task to the surface that fits its compute and token profile.

- **Grok Bot**: mobile-friendly orchestration, connectors (mail, calendar,
  collaborative docs, task app), multi-bot coordination, and scheduled
  routines. Keep chats short. Avoid long machine learning runs, large PDF
  comparison loops, and bulk regeneration loops inside Grok.
- **Cursor** (IDE and cloud coding agents): repository coding, multi-file
  refactors, and long iterative code and test cycles (see
  [Code and documents](shared-rules.md#5-code-and-documents-use-different-workers)).
- **Antigravity CLI (`agy`)**: document drafting and lighter coding that should
  stay outside the shared Grok and Cursor usage pool when the operator wants
  that separation. Run it in the interactive TUI (`agy`) or in headless print
  mode (`agy -p`).
- **Local workstation**: machine learning training, local inference, and heavy
  generation or comparison jobs. Finish the heavy job on the workstation and
  return only output paths or a short summary to Grok.

Some subscriptions share a weekly usage pool across Grok Bot and Cursor. When
product settings support an on-demand or additional-usage spend cap, the
operator should set a monthly cap so usage stops at a known limit after the
included pool runs out. Antigravity CLI usage stays separate from that shared
pool when the operator runs `agy` under Antigravity's own authentication.

## 2. Keep device posture aligned with tool roles

Match each device or execution surface to the work it can supervise safely.

- **Local workstation**: runs heavy compute, local model inference, and local
  CLI agents (`agy`, local test suites, and build scripts).
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

## 4. Hand work from Grok Bot to Antigravity CLI in three ways

Use one of three handoff paths when a Grok Bot (such as a domain bot or
cost/ops bot) delegates drafting or light repository tasks to Antigravity CLI
on the operator's workstation. Do not use browser automation against the Remote
Control web UI as a primary path, because UI automation against that surface is
fragile.

### Path 1: headless print mode on the workstation (default for automation)

Run `agy` non-interactively in the target project directory when a Grok Bot can
execute approved local shell commands on the registered workstation:

```bash
cd /path/to/project && agy -p "<task>"
```

You can also scope the workspace or project with flags from `agy --help`, such
as `--project <project>` or `--add-dir <dir>`, and set `--print-timeout` when a
bounded runtime is needed.

Operational requirements for headless mode:

- Complete interactive login (`agy`) on that workstation ahead of time.
- Configure scoped `permissions.allow` rules in Antigravity CLI settings rather
  than passing `--dangerously-skip-permissions`.
- Add explicit allow rules before running unattended jobs, because tools that
  require confirmation are soft-denied in headless print mode unless allowed in
  advance.

### Path 2: draft prompt plus Remote Control (phone or away from desk)

Keep the Remote Control daemon running on the workstation with
`agy remote-control start` (or start an interactive session with
`agy --remote-control` or `/remote-control`).

1. Grok drafts a self-contained prompt with the goal, file paths, and
   verification steps.
2. The operator opens the Antigravity Remote Control UI in a mobile or laptop
   browser, pastes the prompt, and approves tool actions in the loop.

Use this path when the operator is away from the workstation and wants human
review before edits or commands run.

### Path 3: watched inbox file plus LaunchAgent or cron (asynchronous)

Use a watched inbox folder and a local scheduler for unattended handoffs that
do not use a direct shell bridge:

1. Grok writes a plain-text or Markdown task file into a watched inbox folder
   on the workstation (for example, `/path/to/agy-inbox/task-YYYYMMDD-HHMM.md`).
2. A macOS LaunchAgent (`WatchPaths`) or cron job runs a small local bridge
   script whenever a task file appears.
3. The bridge script passes the file contents to `agy -p`, writes the response
   to an output file, and moves the task file to a processed folder so it does
   not run twice.

Set up the bridge script once on the workstation and return only the output
file path or a brief status note to Grok.
