# Monthly ops audit checklist

Run this about once a month. The audit **proposes** changes; the operator
chooses what to apply, then instructs bots. Prefer opening a PR with
**generalized** diffs only—no personal facts, billing amounts, customer names,
or bot display names that identify an individual.

Use generic labels in notes and PRs: operator, domain bot, progress bot,
cost/ops bot, document worker, cloud coding agent, shared durable notes,
shared workspace status files, collaborative docs suite, task app, calendar,
monthly ops audit.

---

## 1. Billing / usage (generic)

- [ ] Review overall usage trend vs last month (direction only: up / flat /
  down). Do **not** paste raw invoices, dollar amounts, or subscription tier
  names into this repo, weekly progress docs, or work-bot status files.
- [ ] Flag unusually expensive threads or bots (by role or domain label, not
  by personal identifiers).
- [ ] Note candidates to split, retire, or move to shorter-lived agents for
  cost control.
- [ ] Confirm high-priority bot-to-bot traffic was rare and justified.

**Propose (examples):** retire idle bots, shorten default routines, move heavy
research to one-off agents.

---

## 2. Routine inventory

- [ ] List scheduled routines (progress aggregation, reminders, sync jobs) and
  their owners.
- [ ] Confirm each routine still has a purpose lasting ~a month+ or mark it
  for deletion.
- [ ] Ensure routines **do not** read other bots’ transcripts. They should
  read shared durable notes and weekly progress documents (collaborative docs
  under a dated folder). Optional shared workspace status files may feed a
  progress-bot rollup only; they are not the canonical weekly-review source.
- [ ] Check that bot-to-bot messages default to low (deferred) priority unless
  the operator requires otherwise.
- [ ] Check that cross-domain facts go to the responsible domain bot at low
  priority, not through a standing multi-bot room.

**Propose:** drop redundant routines; merge overlapping schedules; document
remaining ones in shared notes.

---

## 3. Idle bots and rooms

- [ ] List long-lived sidebar bots; verify each still matches `Domain｜Role`
  with a filled description.
- [ ] Identify bots with no meaningful weekly progress note or operator use
  since the last audit.
- [ ] List group rooms; close any that were created for a single PR/issue, a
  finished consultation, or only to relay facts between domains.
- [ ] For finished single-purpose bots/rooms: confirm history was saved to
  shared durable notes, then the operator deletes the bot or room in the UI
  (bots cannot). Archive or remove the progress doc and any status file.
- [ ] If a cost/ops bot prepared an inventory, treat it as a proposal. The
  operator selects what to apply, then instructs the affected bots.

**Propose:** delete / archive list with one-line reasons for the operator to
approve.

---

## 4. Shared-rules drift

- [ ] Re-read [`shared-rules.md`](shared-rules.md) against how you actually
  operate.
- [ ] Note practices that drifted (for example: a coding agent writing whole
  articles; rooms per PR; transcript mining; reusing one long coding agent;
  routing every topic through a central bot; treating status files as the
  weekly-review source of truth; a bot publishing or merging without the
  operator).
- [ ] Draft generalized wording fixes only—no personal schedules, cities,
  employers, or family references.

**Propose:** a short PR against this docs repo (or your fork) updating
`shared-rules.md` and this checklist if needed.

---

## 5. Cross-bot practice (spot check)

- [ ] The operator messages the domain bot that owns the topic, not a central
  bot and not a standing multi-bot room.
- [ ] New pull requests, follow-up fixes, and separate coding tasks started
  from a fresh cloud coding agent (or subagent) with a self-contained brief.
  Same-agent continuation only for an ongoing hardware or local machine
  session.
- [ ] The bot that heard an operator decision wrote it into shared durable
  notes. Decisions were not relayed through a chain of bots.
- [ ] The weekly review used collaborative progress docs under a dated folder.
  Workspace status files, if any, were optional rollup hygiene.
- [ ] Todos live in the task app. The calendar is still the only schedule of
  record.
- [ ] Long-form: a document worker drafted the body; a coding agent committed
  approved text only; nothing was published or merged without the operator.
  Paste-into-LinkedIn-style sources stayed plain Markdown.

---

## 6. Open a PR (generalized diffs only)

- [ ] Open a pull request into `main` with English title and body.
- [ ] Include only generalized best-practice changes (rules, checklist items,
  CONTRIBUTING clarifications).
- [ ] Scrub the diff for personal identifiers: real names, employers, family,
  billing amounts, subscription tiers, customer/project names, identifying bot
  display names, internal home paths, email addresses, city/move plans, Drive
  folder IDs, and GitHub usernames or repositories that identify one person.
- [ ] After merge (operator decision), instruct affected bots with the new
  rules—do not assume bots read the PR automatically.

---

## Operator decision log (optional template)

Keep this in **shared durable notes**, not in public commits, if it contains
environment-specific detail:

```text
Audit date: YYYY-MM
Proposals accepted:
- …
Proposals deferred:
- …
Bots/rooms deleted:
- …
Follow-ups for next month:
- …
```
