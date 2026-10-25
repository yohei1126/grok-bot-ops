# Multi-Agent / Grok Bot Operations Best Practices

Practical ops hygiene for people who run several specialized AI assistants
(sidebar bots) and want lower token cost, clearer handoffs, and less chaos.

This repository is **documentation only**. It is not an Agent Skills
`SKILL.md` pack and does not ship runnable agents.

## Who this is for

Operators who:

- Keep long-lived **domain bots** for ongoing areas of work
- Spin up short-lived chats or cloud coding agents for one-off tasks
- Care about billing/usage discipline and durable shared notes

## What’s in the repo

- [`docs/shared-rules.md`](docs/shared-rules.md) — Living shared rules: where
  ops rules live (shared durable notes and this repo, not Agent Skills), when
  to create bots, talk to the responsible bot, rooms, fresh cloud coding
  agents vs document workers, priorities and cross-domain signals, decisions,
  weekly progress docs, tasks vs calendar, deliverables and publishing,
  cost/ops proposals, retiring finished bots
- [`docs/monthly-audit.md`](docs/monthly-audit.md) — Checklist for a monthly
  ops review (usage, inventory, drift, cross-bot spot check, PR back to this
  repo)
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — How to propose improvements via pull
  request

## How to use it

1. Read [`docs/shared-rules.md`](docs/shared-rules.md) and adapt the patterns
   to your workspace.
2. Point your bots (or a short operator note) at the rules that matter for
   your setup. Cross-bot ops rules live in shared durable notes and/or this
   repo—not as Agent Skills. Reserve Agent Skills for reusable procedures many
   bots share (for example writing style or platform posting workflows). Do
   not copy personal details into bot prompts.
3. Once a month, run [`docs/monthly-audit.md`](docs/monthly-audit.md). A
   cost/ops bot or the audit proposes cleanups; the operator chooses what to
   apply, then instructs bots. Bots cannot delete sidebar bots or rooms.
4. Suggest generalized improvements via PR (see
   [`CONTRIBUTING.md`](CONTRIBUTING.md)). Keep examples generic: “operator”,
   “domain bot”, “progress bot”, “cost/ops bot”, “document worker”,
   “shared durable notes”, “collaborative docs suite”.

## Markdown linting

This repository uses [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
to check Markdown formatting. Configuration lives in `.markdownlint-cli2.yaml`.
CI runs the same checks on pull requests and pushes to `main`
(see `.github/workflows/markdown.yml`).

To lint locally (version pinned to match CI):

```bash
npx --yes markdownlint-cli2@0.23.2
```

## License

Licensed under the [Apache License 2.0](LICENSE).
