# Monthly ops audit checklist

Run this audit about once a month. After the review, open the monthly-audit
PR for accepted rule changes. When that PR merges, update the operator's
private shared assistant notes, then tag one `YYMMDD` GitHub Release for the
cycle.

Mid-cycle PRs may still update docs or rules. They do not get a release tag.
Only the monthly audit cycle cuts `YYMMDD`, once per month, after that
audit's PR merges.

The audit proposes changes. The operator chooses what to apply and then
instructs the bots.

When the audit leads to a PR, the diff must stay generalized. Leave out
personal facts, billing amounts, customer names, and bot display names that
identify an individual.

Use generic labels in notes and PRs: operator, domain bot, progress bot,
cost/ops bot, document worker, cloud coding agent, shared durable notes,
shared workspace status files, collaborative docs suite, task app, calendar,
monthly ops audit, operator's shared assistant notes.

## Monthly cycle at a glance

1. Review agent, routine, and subscription ops. Draft improvements to the
   shared rules.
2. Open the monthly-audit pull request on this repo for human review. Follow
   [`CONTRIBUTING.md`](../CONTRIBUTING.md).
3. After that monthly-audit PR merges, copy the accepted rules into the
   operator's private shared assistant notes.
4. Then tag one GitHub Release as `YYMMDD` (six digits for that merge date in
   the operator's local calendar).

The numbered sections below are the checklist for step 1. Steps 2 through 4
are sections 6 through 8. Other PRs during the month follow
[`CONTRIBUTING.md`](../CONTRIBUTING.md) only. They skip sections 7 and 8.

## 1. Billing and usage trend

- [ ] Compare overall usage with last month by direction only: up, flat, or
  down. Do not paste raw invoices, dollar amounts, or subscription tier names
  into this repo, weekly progress docs, or work-bot status files.
- [ ] Flag unusually expensive threads or bots by role or domain label, not by
  personal identifiers.
- [ ] Note candidates to split, retire, or move to shorter-lived agents for
  cost control.
- [ ] Review tool routing across Grok Bot, Cursor, Antigravity CLI (`agy`),
  and the local workstation, verify on-demand monthly spend caps, and check
  Antigravity Remote Control status, watched inbox jobs, and headless
  `permissions.allow` rules for drift (see
  [`tooling-and-cost.md`](tooling-and-cost.md)).
- [ ] Confirm that high-priority bot-to-bot traffic was rare and justified.

Example proposals: retire idle bots, shorten default routines, and move heavy
research to one-off agents.

## 2. Routine inventory

- [ ] List scheduled routines (progress aggregation, reminders, sync jobs) and
  their owners.
- [ ] Confirm that each routine still has a purpose lasting about a month or
  more, or mark it for deletion.
- [ ] Make sure routines do not read other bots' transcripts. They read shared
  durable notes and weekly progress documents (collaborative docs under a
  dated folder). Optional shared workspace status files may feed only a
  progress-bot rollup. They are not the canonical weekly-review source.
- [ ] Check that bot-to-bot messages default to low (deferred) priority unless
  the operator requires otherwise.
- [ ] Check that cross-domain facts go to the responsible domain bot at low
  priority, not through a standing multi-bot room.

Proposals: drop redundant routines, merge overlapping schedules, and document
the remaining ones in shared notes.

## 3. Idle bots and rooms

- [ ] List long-lived sidebar bots. Verify that each still follows
  `Domain｜Role` and has a filled-in description.
- [ ] Identify bots with no meaningful weekly progress note or operator use
  since the last audit.
- [ ] List group rooms. Close any created for a single PR or issue, for a
  finished consultation, or only to relay facts between domains.
- [ ] For finished single-purpose bots and rooms, confirm that their history
  was saved to shared durable notes. The operator then deletes the bot or room
  in the UI, because bots cannot. Archive or remove the progress doc and any
  status file.
- [ ] If a cost/ops bot prepared an inventory, treat it as a proposal. The
  operator selects what to apply and then instructs the affected bots.

Proposal: a list of bots and rooms to delete or archive, each with a one-line
reason, for the operator to approve.

## 4. Drift from the shared rules

- [ ] Re-read [`shared-rules.md`](shared-rules.md) and compare it with how you
  actually operate.
- [ ] Note practices that drifted. Examples: a coding agent writing whole
  articles, rooms per PR, transcript mining, reusing one long coding agent,
  routing every topic through a central bot, treating status files as the
  weekly-review source of truth, or a bot publishing or merging without the
  operator.
- [ ] Draft generalized wording fixes only. Leave out personal schedules,
  cities, employers, and family references.

Proposal: a short PR against this docs repo or your fork that updates
`shared-rules.md`, and this checklist if needed.

## 5. Cross-bot practice spot check

- [ ] The operator messages the domain bot that owns the topic, not a central
  bot or a standing multi-bot room.
- [ ] New pull requests, follow-up fixes, and separate coding tasks started
  from a fresh cloud coding agent or subagent with a self-contained brief. The
  same agent continued only for an ongoing hardware or local machine session.
- [ ] The bot that heard an operator decision wrote it into shared durable
  notes. Decisions were not relayed through a chain of bots.
- [ ] The weekly review used collaborative progress docs under a dated folder.
  Workspace status files, if any, served only as optional rollup input.
- [ ] Todos live in the task app. The calendar is still the only schedule of
  record.
- [ ] For long-form work, a document worker drafted the body and a coding
  agent committed only approved text. Nothing was published or merged without
  the operator. Sources meant for pasting into LinkedIn-style surfaces stayed
  plain Markdown.

## 6. Open the monthly-audit PR with generalized diffs only

Follow [`CONTRIBUTING.md`](../CONTRIBUTING.md) for every PR to this repo.
[`AGENTS.md`](../AGENTS.md) only points agents at that file.

This section is the monthly-audit PR that closes the cycle. Mid-cycle docs or
rules PRs use the same contribution rules, without sections 7 and 8.

- [ ] Include only generalized best-practice changes: rules, checklist items,
  and CONTRIBUTING clarifications.
- [ ] Scrub the diff for personal identifiers: real names, employers, family,
  billing amounts, subscription tiers, customer or project names, identifying
  bot display names, internal home paths, email addresses, city or move plans,
  Drive folder IDs, and GitHub usernames or repositories that identify one
  person.
- [ ] Every Markdown file is 500 lines or fewer. Split any file over the limit
  and update cross-links in the same PR (see
  [`CONTRIBUTING.md`](../CONTRIBUTING.md)).
- [ ] English prose reviewed (structure + humanizer) before open.
- [ ] Open a pull request into `main` with an English title and body.
- [ ] Do not merge your own PR unless maintainers ask you to.

## 7. Reflect accepted rules into private shared assistant notes

Do this only after the monthly-audit PR from section 6 merges. Skip this
section for mid-cycle PRs.

- [ ] Copy the accepted rule changes into the operator's private shared
  assistant notes so bots and the operator use the same updated rules.
- [ ] Instruct the affected bots with the new rules. Bots do not read the PR
  automatically.
- [ ] Keep environment-specific detail in those private notes. Do not commit
  it back into this public repo.

## 8. Tag a GitHub Release as YYMMDD

Cut this tag once per monthly audit cycle, after the monthly-audit PR merges
and after the private notes update. Do not tag mid-cycle docs or rules PRs.

- [ ] Create an annotated git tag named with six digits `YYMMDD` for that
  monthly-audit merge date in the operator's local calendar (example:
  `251025` for 25 October 2025).
- [ ] Publish a GitHub Release on that annotated tag.
- [ ] Write short English release notes that state what changed in the audit
  cycle. Keep them generalized, with no personal identifiers.

Example:

```bash
git tag -a 251025 -m "Monthly ops audit: clarify bot-to-bot priority defaults"
git push origin 251025
gh release create 251025 --title "251025" --notes "Clarify bot-to-bot priority defaults and retire idle progress routines."
```

## Operator decision log (optional template)

Keep this log in shared durable notes, not in public commits, if it contains
environment-specific detail:

```text
Audit date: YYYY-MM
Proposals accepted:
- …
Proposals deferred:
- …
Bots/rooms deleted:
- …
Shared assistant notes updated: yes/no
Release tag: YYMMDD
Follow-ups for next month:
- …
```
