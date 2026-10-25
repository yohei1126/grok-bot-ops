# Shared rules for multi-agent / Grok Bot operations

Living document for operators who run several specialized AI assistants
(sidebar bots). Goal: ops hygiene, lower token cost, and durable shared
state—not more rooms and more transcript reading.

Prefer generic language in every note and progress doc:

- operator, domain bot, progress bot, cost/ops bot
- document worker, cloud coding agent
- shared durable notes, shared workspace status files
- collaborative docs suite, task app, calendar
- monthly ops audit

Keep personal and family details out of work bots.

---

## 1. Where rules live

Cross-bot ops rules—roles, inter-bot communication, and progress—live in
**shared durable notes** and/or this docs repo.

Do not store those ops rules as Agent Skills.

Reserve **Agent Skills** for reusable procedures many bots share, for example:

- writing style
- platform posting workflows

This repository is documentation. It is not an Agent Skills pack.

---

## 2. When to create a long-lived sidebar bot

**Create a long-lived domain bot** when the topic will last roughly a month
or more (a product area, a recurring ops lane, a writing stream).

- Name pattern: `Domain｜Role` (fullwidth vertical bar is fine; keep Domain
  and Role short and stable).
- Fill in a real description: what the bot owns, what it does *not* own, and
  where durable notes live.
- Point it at the dated folder where its weekly progress note lives (see
  Progress). A shared workspace status file is optional.

**Prefer one-off chats or cloud agents** when the work is a single PR, a
one-time research question, or a short burst of tool calls. Do not promote
every chat into a sidebar bot.

The operator talks to that domain bot directly. Do not send every topic
through a central bot or a permanent multi-bot room (see Talk to the
responsible bot).

---

## 3. Talk to the responsible bot

The operator messages the domain bot that owns the topic directly.

- Do not route every topic through a central bot.
- Do not route every topic through a permanent multi-bot room.
- Isolated code work still starts a fresh cloud coding agent (see Code vs
  documents), not a standing room.

---

## 4. Group rooms

Use **group rooms only** when you need several bots consulting at once
(design review, cross-domain triage).

- Never create one room per PR or issue.
- Prefer a fresh cloud coding agent (or a single chat) for isolated code
  work.
- When the consultation ends, capture decisions in shared durable notes; do
  not leave the room as the system of record.
- Do not keep a standing multi-bot room only to relay facts between domains.
  Send a low-priority message to the responsible domain bot instead (see
  Bot-to-bot messages).

---

## 5. Code vs documents

- **Code changes** (features, fixes, refactors, follow-up fixes): start a
  **fresh** cloud coding agent (or subagent) for each pull request or separate
  coding task. Give it a **self-contained brief** (goal, constraints, full
  URLs or paths, and how to tell the work is done). Do not keep reusing one
  long agent that carries a huge history.
- **Documents, articles, decks**: a **document worker** drafts the whole
  piece; a coding agent only commits approved text into the repo.

Do not ask a long-lived domain bot to own every commit for a PR. Do not ask a
coding agent to invent the full article in the repo without an approved draft
elsewhere.

Hands-on hardware or local work that must stay on one machine session may keep
the same agent while that session continues (see Fresh agents and token cost).

Publishing rules for long-form articles are under Publishing and long-form
articles.

---

## 6. Fresh agents and token cost

Default: **switch agents often**. Long threads accumulate context and cost.

For each new pull request, follow-up fix, or separate coding task, start a
**fresh** cloud coding agent (or subagent) with a self-contained brief. Do not
keep reusing one long agent with a huge history.

**Exceptions:**

- Tiny tasks that need only a few tool calls may stay inline in the current
  chat.
- Hands-on hardware or local work that must stay on one machine session may
  keep the same agent while that session continues.

If a thread has already wandered across topics, start a new agent with a short
handoff note instead of continuing forever.

---

## 7. Bot-to-bot messages

- **Default priority: low (deferred).** The recipient may act on the next
  scheduled pass or when the operator opens that bot.
- **High priority** only when the recipient must act *now* (blocker,
  production incident, operator-declared deadline).

Do not spam high-priority pings for FYI updates. Put FYIs in shared durable
notes or the weekly progress doc. An optional status file may carry the same
short FYI for a progress-bot rollup.

**Cross-domain signals.** When another domain needs a fact (for example
external reactions), send a low-priority message to the **responsible** domain
bot. Do not keep a standing multi-bot room just to relay those facts.

---

## 8. Decisions and transcripts

The bot that heard the operator’s decision records it in **shared durable
notes** (shared journal or memo). Do not relay the decision through a chain of
bots.

Do **not** have routines read other bots’ transcripts.

- Point bots at those notes (paths or short summaries), not at each other’s
  chat history.
- Relaying “what Bot A said last Tuesday” through bots is fragile and
  expensive; write it down once.

---

## 9. Progress

For the operator’s weekly review, each long-lived work bot writes a short
progress note as a **collaborative document** under a dated folder in a shared
Drive (or an equivalent collaborative docs suite).

That note is the **canonical source** for the weekly review. Keep it short:
current focus, blockers, next step. A dated folder name such as `YYYY-MM-DD`
is enough—do not record Drive folder IDs in work notes or in this repo.

**Shared workspace status files** are optional hygiene for the progress bot’s
rollup. They are not the canonical source for that review.

- Keep personal and family information out of work progress docs and out of
  other work bots.
- Progress docs and status files are operator-facing hygiene, not a substitute
  for issues and pull requests.
- When a bot is retired, archive or remove its progress doc and any status
  file so the progress bot does not keep aggregating it (see Finished
  single-purpose rooms and bots).

---

## 10. Tasks and calendar

- Use a dedicated **task app** for todos.
- The **calendar** remains the schedule source of truth.
- Do not invent a second calendar of record in bot notes, progress docs, or
  status files.

---

## 11. Deliverable conventions (example shapes)

Pick shapes that fit your tools; keep them consistent:

- **Chat handoffs** — TXT or PDF export into shared notes
- **Working docs** — collaborative document in a collaborative docs suite
- **Articles / long-form** — Markdown in a writing repo (see Publishing and
  long-form articles)

Always leave a full URL or stable path when pointing another bot or the
operator at a deliverable.

---

## 12. Publishing and long-form articles

Platform-agnostic. The split of labor matches Code vs documents:

- A **document worker** drafts the body.
- A **cloud coding agent** only commits text the operator has approved.
- Prefer a **draft** pull request, and an unpublished or draft flag when the
  repo or platform has one.
- Bots never publish or merge without the operator.

Use writing skills for platform conventions (voice, length, front matter).
Those skills are reusable procedures, not a place for cross-bot ops rules
(see Where rules live).

Store articles as Markdown. A generic path shape is
`articles/YYYY-MM-DD-slug.md`.

For paste-into-LinkedIn-style surfaces, the source meant for paste is plain
Markdown only:

- no tables
- no HTML
- no Mermaid diagrams

Keep repo and path examples generic. Do not point examples at one person’s
repositories.

---

## 13. Issues and pull requests

- Write issues and PRs in **English**.
- Include **full URLs** (repos, docs, related issues)—not “the doc we talked
  about”.
- Titles and bodies should be understandable without the sidebar chat context.

---

## 14. Cost and ops proposals

Do not constantly ad-hoc cleanup rules, bots, and rooms mid-month unless
something is broken.

A **cost/ops bot** (or the [monthly audit checklist](monthly-audit.md))
**proposes** inventory and cleanup. It does not apply the cleanup itself.

1. The cost/ops bot or the monthly audit proposes changes only.
2. The **operator selects** what to apply.
3. The operator then **instructs the affected bots**.
4. Bots cannot delete sidebar bots or rooms. The operator does that in the UI
   (see Finished single-purpose rooms and bots).

Generalized rule changes land as a pull request to this docs repo (or your
fork).

---

## 15. Finished single-purpose rooms and bots

When a room or bot has finished its purpose:

1. Save useful history into shared durable notes (decisions, links, open
   follow-ups).
2. The **operator deletes** the room or bot from the UI. Bots cannot delete
   sidebar bots or rooms.
3. Archive or remove its weekly progress doc and any shared workspace status
   file so the progress bot does not keep aggregating dead weight.

Do not leave idle bots “just in case” without a named owner and a next review
date in the monthly audit.
