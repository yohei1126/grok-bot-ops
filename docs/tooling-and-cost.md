# Tooling surfaces, cost lanes, and spend controls

Split work across four surfaces (Grok Bot, Cursor, Antigravity CLI (`agy`), and
the local workstation) so usage stays within included plan pools and unexpected
on-demand charges stay rare.

Use the same generic labels as [`shared-rules.md`](shared-rules.md): operator,
domain bot (`Domain｜Role`), progress bot, cost/ops bot, document worker, cloud
coding agent, and shared durable notes.

For the full cast, assignment channels, and the task-app queue of record, see
[`cast-and-routing.md`](cast-and-routing.md). For workstation CLI setup,
`agy` and `agent` handoff paths, parallel-writer controls, and card-style
launch confirmation, see [`workstation-handoffs.md`](workstation-handoffs.md).

## 1. Split work across four surfaces and cost lanes

Route every task to the surface that fits its compute profile and authentication
pool:

1. **Grok Bot**: owns the operator UI, mobile-friendly orchestration, external
   connectors (mail, calendar, collaborative docs suite, task app), scheduled
   routines, and multi-bot coordination. Grok reads and updates the operator's
   task app as the queue of record, defines the goal, guardrails, and success
   criteria, and launches handoffs (see
   [`cast-and-routing.md`](cast-and-routing.md)). Keep chats short, and keep
   long machine learning runs, large PDF comparison loops, and bulk
   regeneration loops out of Grok.
2. **Cursor (IDE, cloud coding agents, and local `agent` CLI)**: owns
   repository coding across interactive IDE sessions, fresh cloud branches, and
   local headless CLI runs (`agent -p` or `cursor-agent -p`) for features, bug
   fixes, multi-file refactors, and iterative test cycles (see
   [Code and documents](shared-rules.md#5-code-and-documents-use-different-workers)).
3. **Antigravity (`agy` CLI and Remote Control)**: owns document drafting,
   repository documentation updates, and lighter repository work under a
   separate Google or Gemini authentication lane. It runs either in the
   interactive TUI (`agy`), through Remote Control (`agy remote-control`), or
   in headless print mode (`agy -p`).
4. **Local workstation hardware**: runs machine learning training, local model
   inference, heavy generation or comparison batches, local test suites, and
   local CLI workers (`agy` and `agent`). Run heavy compute on the workstation
   and return only short summaries, metrics, or output paths to Grok.

## 2. Match devices and execution environments to tool roles

Align each execution surface with the work it can run and supervise safely:

- **Grok cloud computer ("box")**: runs connector calls, scheduled routines,
  inter-bot coordination, and short research queries. Keep GPU-heavy workloads
  and long iterative compute loops off the Grok box.
- **Registered local workstation**: the operator's computer (for example, an
  Apple Silicon laptop) registered with Grok's local execution bridge to run
  heavy compute, local model inference, test suites, and local CLI workers
  (`agy` and `agent`; see [`workstation-handoffs.md`](workstation-handoffs.md)).
- **Phone**: handles short instructions, triage, status checks, and human
  approvals (including reviewing changes or approving actions in Antigravity
  Remote Control). Do not launch long training runs, bulk regeneration jobs, or
  unreviewed multi-file refactors from the phone.

## 3. Understand shared plan pools versus separate auth lanes

Account for how each tool authenticates and draws from subscription usage pools
before dispatching a batch of tasks:

- **Shared pool considerations**: Cursor usage (across Cursor IDE, cloud coding
  agents, and the local `agent` CLI) may share plan usage pools with Grok Bot
  depending on billing settings.
- **Separate Google or Gemini lane**: Antigravity CLI (`agy`) authenticates
  through a separate Google or Gemini lane. When the shared Grok or Cursor pool
  is tight, shift eligible documentation updates, prose reviews, and lighter
  repository tasks to `agy`.
- **Keep billing rules generic**: never state or invent subscription prices,
  dollar figures, or tier names in repository documentation, weekly progress
  docs, or status files (see
  [Billing and usage trend](monthly-audit.md#1-billing-and-usage-trend)).

## 4. Treat spend caps, lane shifts, and routine schedules as proposals

Propose routing and spend adjustments through a cost/ops bot or the
[monthly audit](monthly-audit.md) instead of applying ad hoc changes mid-month
(see
[Cost and ops changes start as proposals](shared-rules.md#14-cost-and-ops-changes-start-as-proposals)).
The operator decides which proposals to adopt:

1. **Move heavy loops off Grok Bot**: shift training, large document comparison,
   and bulk drafting loops onto the local workstation, `agy`, or Cursor as
   appropriate.
2. **Set an on-demand monthly spend cap**: when product billing settings support
   an on-demand or additional-usage cap, set a monthly limit so usage halts
   predictably after the included pool runs out instead of triggering silent
   top-ups.
3. **Prefer event-driven or daytime routines**: schedule recurring routines for
   hours when the operator can act (such as weekday daytime) or trigger them on
   concrete events. Avoid overnight routines that accumulate unread output.
