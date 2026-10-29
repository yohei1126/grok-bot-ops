# Shared rules for multi-agent and Grok Bot operations

A living document for operators who run several specialized AI assistants
(sidebar bots). The rules aim for ops hygiene, lower token cost, and durable
shared state, with fewer rooms and less transcript reading.

Use generic language in every note and progress doc:

- operator, domain bot, progress bot, cost/ops bot
- document worker, cloud coding agent
- shared durable notes, shared workspace status files
- collaborative docs suite, task app, calendar
- monthly ops audit

Keep personal and family details out of work bots.

## 1. Ops rules live in shared notes, not Agent Skills

Cross-bot ops rules (roles, inter-bot communication, and progress) live in
shared durable notes, this docs repo, or both. Do not store those ops rules as
Agent Skills.

Reserve Agent Skills for reusable procedures many bots share, for example:

- writing style
- platform posting workflows

This repository is documentation. It is not an Agent Skills pack.

## 2. When to create a long-lived sidebar bot

Create a long-lived domain bot when the topic will last roughly a month or
more, such as a product area, a recurring ops lane, or a writing stream.

- Use the name pattern `Domain｜Role`. The fullwidth vertical bar is fine.
  Keep Domain and Role short and stable.
- Fill in a real description: what the bot owns, what it does *not* own, and
  where its durable notes live.
- Point it at the dated folder that holds its weekly progress note (see
  [Weekly progress](#9-weekly-progress-lives-in-collaborative-docs)). A shared
  workspace status file is optional.

Use a one-off chat or cloud agent when the work is a single PR, a one-time
research question, or a short burst of tool calls. Do not promote every chat
into a sidebar bot.

The operator talks to the domain bot directly. Do not send every topic through
a central bot or a permanent multi-bot room (see
[Talk to the responsible bot](#3-talk-to-the-responsible-bot)).

## 3. Talk to the responsible bot

The operator messages the domain bot that owns the topic directly.

- Do not route every topic through a central bot.
- Do not route every topic through a permanent multi-bot room.
- Isolated code work starts a fresh cloud coding agent (see
  [Code and documents](#5-code-and-documents-use-different-workers)), not a
  standing room.

## 4. Use group rooms only for live multi-bot consultation

Open a group room only when several bots need to consult at once, such as a
design review or cross-domain triage.

- Never create one room per PR or issue.
- For isolated code work, prefer a fresh cloud coding agent or a single chat.
- When the consultation ends, capture the decisions in shared durable notes.
  The room is not the system of record.
- Do not keep a standing multi-bot room only to relay facts between domains.
  Send a low-priority message to the responsible domain bot instead (see
  [Bot-to-bot messages](#7-bot-to-bot-messages-default-to-low-priority)).

## 5. Code and documents use different workers

- Code changes (features, fixes, refactors, follow-up fixes): start a fresh
  cloud coding agent or subagent for each pull request or separate coding
  task. Give it a self-contained brief with the goal, constraints, full URLs
  or paths, and how to tell the work is done. Do not keep reusing one long
  agent that carries a huge history.
- Documents, articles, and decks: a document worker drafts the whole piece,
  and a coding agent only commits the approved text into the repo.

Do not ask a long-lived domain bot to own every commit for a PR. Do not ask a
coding agent to write a full article in the repo without a draft approved
elsewhere.

Hands-on hardware or local work that must stay in one machine session may keep
the same agent while that session continues (see
[Fresh agents](#6-start-fresh-agents-to-control-token-cost)).

Publishing rules for long-form articles are in
[Publishing and long-form articles](#12-publishing-and-long-form-articles).
Cast roles, assignment channels, one-writer parallel CLI controls, and tool
routing across Grok Bot, Cursor, Antigravity CLI (`agy`), and the local
workstation are in [`tooling-and-cost.md`](tooling-and-cost.md).

## 6. Start fresh agents to control token cost

Switch agents often. Long threads accumulate context and cost.

For each new pull request, follow-up fix, or separate coding task, start a
fresh cloud coding agent or subagent with a self-contained brief. Do not keep
reusing one long agent with a huge history.

Exceptions:

- Tiny tasks that need only a few tool calls may stay inline in the current
  chat.
- Hands-on hardware or local work that must stay in one machine session may
  keep the same agent while that session continues.

If a thread has already wandered across topics, start a new agent with a short
handoff note.

## 7. Bot-to-bot messages default to low priority

- Low (deferred) priority is the default. The recipient may act on its next
  scheduled pass or when the operator opens that bot.
- Use high priority only when the recipient must act *now*: a blocker, a
  production incident, or an operator-declared deadline.

Do not send high-priority pings for FYI updates. Put FYIs in shared durable
notes or the weekly progress doc. An optional status file may carry the same
short FYI for a progress-bot rollup.

When another domain needs a fact (for example, external reactions), send a
low-priority message to the responsible domain bot. Do not keep a standing
multi-bot room just to relay those facts.

## 8. Record decisions in shared notes

The bot that heard the operator's decision records it in shared durable notes,
such as a shared journal or memo. Do not relay the decision through a chain of
bots.

Routines must not read other bots' transcripts.

- Point bots at those notes (paths or short summaries), not at each other's
  chat history.
- Relaying "what Bot A said last Tuesday" through other bots is fragile and
  expensive. Write it down once.

## 9. Weekly progress lives in collaborative docs

For the operator's weekly review, each long-lived work bot writes a short
progress note as a collaborative document under a dated folder in a shared
drive or an equivalent collaborative docs suite.

That note is the canonical source for the weekly review. Keep it short:
current focus, blockers, and next step. A dated folder name such as
`YYYY-MM-DD` is enough. Do not record Drive folder IDs in work notes or in
this repo.

Shared workspace status files are optional input to the progress bot's
rollup. They are not the canonical source for the review.

- Keep personal and family information out of work progress docs and out of
  other work bots.
- Progress docs and status files are operator-facing hygiene. They do not
  replace issues and pull requests.
- When a bot is retired, archive or remove its progress doc and any status
  file so the progress bot stops aggregating it (see
  [Retire finished rooms and bots](#15-retire-finished-single-purpose-rooms-and-bots)).

## 10. Todos go in the task app, schedules in the calendar

Keep todos and work requests in the operator's task app, and keep schedules in
the calendar:

- **Task app as the todos and work-request source of truth**: the operator's
  dedicated task app (Todoist or an equivalent) holds all todos and serves as
  the queue of record for work requests.
- **Grok Bot dispatches from the task app**: Grok Bot reads and updates that
  queue, serializes jobs that share a local checkout (marking the active item
  in progress), and launches execution handoffs (`agy -p`, `agent -p`, fresh
  cloud coding agents, and low-priority bot-to-bot messages; see
  [`tooling-and-cost.md`](tooling-and-cost.md#3-map-who-assigns-work-to-whom-and-over-which-channel)
  and
  [Control parallel `agy` and `agent` runs](tooling-and-cost.md#9-control-parallel-agy-and-agent-runs-to-prevent-branch-conflicts)).
- **No second backlog**: do not maintain a parallel work-request queue in chat
  transcripts, watched inbox folders, weekly progress docs, or workspace status
  files. Those surfaces serve as execution channels or status summaries only.
- **Calendar as the schedule source of truth**: record dates and times in the
  calendar. Do not keep a second calendar of record in bot notes, progress
  docs, or status files.

## 11. Deliverable formats (examples)

Pick formats that fit your tools and use them consistently:

- Chat handoffs: a TXT or PDF export into shared notes.
- Working docs: a collaborative document in a collaborative docs suite.
- Articles and long-form writing: Markdown in a writing repo (see
  [Publishing and long-form articles](#12-publishing-and-long-form-articles)).

Always give a full URL or stable path when pointing another bot or the
operator at a deliverable.

## 12. Publishing and long-form articles

These rules apply on any platform. The division of labor matches
[Code and documents](#5-code-and-documents-use-different-workers):

- A document worker drafts the body.
- A cloud coding agent only commits text the operator has approved.
- Prefer a draft pull request, and set an unpublished or draft flag when the
  repo or platform has one.
- Bots never publish or merge without the operator.

Use writing skills for platform conventions such as voice, length, and front
matter. Those skills are reusable procedures. Cross-bot ops rules do not
belong in them (see
[Where rules live](#1-ops-rules-live-in-shared-notes-not-agent-skills)).

Store articles as Markdown. A generic path shape is
`articles/YYYY-MM-DD-slug.md`.

For surfaces where the text is pasted in, such as LinkedIn, keep the paste
source to plain Markdown:

- no tables
- no HTML
- no Mermaid diagrams

Keep repo and path examples generic. Do not point examples at one person's
repositories.

## 13. Issues and pull requests

- Write issues and PRs in English.
- Include full URLs for repos, docs, and related issues. Do not write "the doc
  we talked about".
- Make titles and bodies understandable without the sidebar chat context.
- For pull requests to this repo, follow
  [`CONTRIBUTING.md`](../CONTRIBUTING.md), including its required English
  prose review.

## 14. Cost and ops changes start as proposals

Do not keep making ad hoc cleanups to rules, bots, and rooms mid-month unless
something is broken.

A cost/ops bot (or the [monthly audit checklist](monthly-audit.md)) proposes
inventory and cleanup. It does not apply the cleanup itself.

1. The cost/ops bot or the monthly audit proposes changes only.
2. The operator selects what to apply and opens a generalized monthly-audit
   PR to this docs repo or a fork. Follow
   [`CONTRIBUTING.md`](../CONTRIBUTING.md).
3. After that monthly-audit PR merges, the operator copies accepted rules into
   private shared assistant notes, then instructs the affected bots.
4. The operator tags one `YYMMDD` GitHub Release for that cycle (see the
   monthly audit checklist). Mid-cycle docs or rules PRs do not get a release
   tag.
5. Bots cannot delete sidebar bots or rooms. The operator does that in the UI
   (see
   [Retire finished rooms and bots](#15-retire-finished-single-purpose-rooms-and-bots)).

See [`tooling-and-cost.md`](tooling-and-cost.md) for concrete cost and routing
proposals, including plan pool separation, on-demand spend caps, routine
timing, and Grok handoffs to Antigravity CLI (`agy`) and the local Cursor Agent
CLI (`agent` or `cursor-agent`).

## 15. Retire finished single-purpose rooms and bots

When a room or bot has finished its purpose:

1. Save useful history into shared durable notes: decisions, links, and open
   follow-ups.
2. The operator deletes the room or bot in the UI. Bots cannot delete sidebar
   bots or rooms.
3. Archive or remove its weekly progress doc and any shared workspace status
   file so the progress bot stops aggregating dead weight.

Do not leave idle bots around "just in case" unless they have a named owner
and a next review date in the monthly audit.
