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

- [`docs/shared-rules.md`](docs/shared-rules.md) — Living shared-rules: when
  to create bots, rooms, coding vs document workers, priorities, progress
  files, deliverables, monthly optimization
- [`docs/monthly-audit.md`](docs/monthly-audit.md) — Checklist for a monthly
  ops review (usage, inventory, drift, PR back to this repo)
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — How to propose improvements via pull
  request

## How to use it

1. Read [`docs/shared-rules.md`](docs/shared-rules.md) and adapt the patterns
   to your workspace.
2. Point your bots (or a short operator note) at the rules that matter for
   your setup—prefer durable shared notes over copying personal details into
   bot prompts.
3. Once a month, run [`docs/monthly-audit.md`](docs/monthly-audit.md). Propose
   cleanups; the operator chooses what to apply, then instructs bots.
4. Suggest generalized improvements via PR (see
   [`CONTRIBUTING.md`](CONTRIBUTING.md)). Keep examples generic: “operator”,
   “domain bot”, “progress bot”, “status files on a shared workspace”.

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
