# Monthly ops audit checklist

Run this about once a month. The audit **proposes** changes; the operator
chooses what to apply, then instructs bots. Prefer opening a PR with
**generalized** diffs only—no personal facts, billing amounts, customer names,
or bot display names that identify an individual.

Use generic labels in notes and PRs: operator, domain bot, progress bot,
status files on a shared workspace, monthly ops audit.

---

## 1. Billing / usage (generic)

- [ ] Review overall usage trend vs last month (direction only: up / flat /
  down). Do **not** paste raw invoices, dollar amounts, or subscription tier
  names into this repo or into work-bot status files.
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
- [ ] Ensure routines **do not** read other bots’ transcripts; they should
  read status files and shared durable notes only.
- [ ] Check that bot-to-bot messages default to low (deferred) priority unless
  the operator requires otherwise.

**Propose:** drop redundant routines; merge overlapping schedules; document
remaining ones in shared notes.

---

## 3. Idle bots and rooms

- [ ] List long-lived sidebar bots; verify each still matches `Domain｜Role`
  with a filled description.
- [ ] Identify bots with no meaningful status updates or operator use since
  the last audit.
- [ ] List group rooms; close any that were created for a single PR/issue or a
  finished consultation.
- [ ] For finished single-purpose bots/rooms: confirm history was saved to
  shared notes, then operator deletes from the UI; archive or remove their
  status files.

**Propose:** delete / archive list with one-line reasons for the operator to
approve.

---

## 4. Shared-rules drift

- [ ] Re-read [`shared-rules.md`](shared-rules.md) against how you actually
  operate.
- [ ] Note practices that drifted (e.g., coding agent writing whole articles;
  rooms per PR; transcript mining).
- [ ] Draft generalized wording fixes only—no personal schedules, cities,
  employers, or family references.

**Propose:** a short PR against this docs repo (or your fork) updating
`shared-rules.md` and this checklist if needed.

---

## 5. Open a PR (generalized diffs only)

- [ ] Open a pull request into `main` with English title and body.
- [ ] Include only generalized best-practice changes (rules, checklist items,
  CONTRIBUTING clarifications).
- [ ] Scrub the diff for personal identifiers: real names, employers, family,
  billing amounts, subscription tiers, customer/project names, identifying bot
  display names, internal home paths, email addresses, city/move plans.
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
