# Shared rules for multi-agent / Grok Bot operations

Living document for operators who run several specialized AI assistants
(sidebar bots). Goal: ops hygiene, lower token cost, and durable shared
state—not more rooms and more transcript reading.

Prefer generic language in every note and status file: **operator**,
**domain bot**, **progress bot**, **status files on a shared workspace**,
**monthly ops audit**. Keep personal and family details out of work bots.

---

## 1. When to create a long-lived sidebar bot

**Create a long-lived domain bot** when the topic will last roughly a month
or more (a product area, a recurring ops lane, a writing stream).

- Name pattern: `Domain｜Role` (fullwidth vertical bar is fine; keep Domain
  and Role short and stable).
- Fill in a real description: what the bot owns, what it does *not* own, and
  where durable notes live.
- Give it a short status file path on the shared workspace (see Progress
  below).

**Prefer one-off chats or cloud agents** when the work is a single PR, a
one-time research question, or a short burst of tool calls. Do not promote
every chat into a sidebar bot.

---

## 2. Group rooms

Use **group rooms only** when you need several bots consulting at once
(design review, cross-domain triage).

- Never create one room per PR or issue.
- Prefer a fresh cloud coding agent (or a single chat) for isolated code
  work.
- When the consultation ends, capture decisions in shared durable notes; do
  not leave the room as the system of record.

---

## 3. Code vs documents

- **Code changes** (features, fixes, refactors): fresh **cloud coding agent**
  per PR or fix
- **Documents, articles, decks**: a **document worker** drafts the whole
  piece; a coding agent only commits approved text into the repo

Do not ask a long-lived domain bot to own every commit for a PR. Do not ask a
coding agent to invent the full article in the repo without an approved draft
elsewhere.

---

## 4. Switch agents for token cost

Default: **switch agents often**. Long threads accumulate context and cost.

**Exception:** tiny tasks that need only a few tool calls may stay inline in
the current chat.

If a thread has already wandered across topics, start a new agent with a short
handoff note instead of continuing forever.

---

## 5. Bot-to-bot messages

- **Default priority: low (deferred).** The recipient may act on the next
  scheduled pass or when the operator opens that bot.
- **High priority** only when the recipient must act *now* (blocker,
  production incident, operator-declared deadline).

Do not spam high-priority pings for FYI updates. Put FYIs in status files or
shared notes.

---

## 6. No transcript mining between bots

Do **not** have routines read other bots’ transcripts.

- Record **operator decisions** in shared durable notes.
- Point bots at those notes (paths or short summaries), not at each other’s
  chat history.
- Relaying “what Bot A said last Tuesday” through bots is fragile and
  expensive; write it down once.

---

## 7. Progress and status files

- Each long-lived bot updates **its own short status file** on the shared
  workspace (current focus, blockers, next step—keep it brief).
- A **progress bot** aggregates those files on a schedule and produces a
  compact rollup for the operator.
- Keep personal and family information out of work bots’ status files.

Status files are operator-facing hygiene, not a substitute for issues/PRs.

---

## 8. Deliverable conventions (example shapes)

Pick shapes that fit your tools; keep them consistent:

- **Chat handoffs** — TXT or PDF export into shared notes
- **Working docs** — Docs suite (collaborative document)
- **Articles / long-form** — Markdown in a writing repo

Always leave a full URL or stable path when pointing another bot or the
operator at a deliverable.

---

## 9. Issues and pull requests

- Write issues and PRs in **English**.
- Include **full URLs** (repos, docs, related issues)—not “the doc we talked
  about”.
- Titles and bodies should be understandable without the sidebar chat context.

---

## 10. Optimize in a monthly ops audit

Do not constantly ad-hoc cleanup rules, bots, and rooms mid-month unless
something is broken.

- Once a month, run the [monthly audit checklist](monthly-audit.md).
- The audit **proposes** changes only.
- The **operator picks** what to apply, then instructs bots.
- Generalized rule changes land as a PR to this (or your fork of this) docs
  repo.

---

## 11. Finished single-purpose rooms and bots

When a room or bot has finished its purpose:

1. Save useful history into shared durable notes (decisions, links, open
   follow-ups).
2. The **operator deletes** the room or bot from the UI.
3. Remove or archive its status file so the progress bot does not keep
   aggregating dead weight.

Do not leave idle bots “just in case” without a named owner and a next review
date in the monthly audit.
