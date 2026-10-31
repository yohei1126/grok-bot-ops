# Grok Bot and multi-agent operations practices

Practical ops hygiene for operators who run several specialized AI assistants
(sidebar bots) and want lower token cost, clearer handoffs, and less chaos.

This repository is documentation only. It is not an Agent Skills `SKILL.md`
pack and does not ship runnable agents.

## Who this is for

Operators who:

- keep long-lived domain bots for ongoing areas of work
- start short-lived chats or cloud coding agents for one-off tasks
- care about billing and usage discipline and durable shared notes

## What the repo contains

- [`docs/shared-rules.md`](docs/shared-rules.md) holds the living shared
  rules. They cover where ops rules live (shared durable notes and this repo,
  not Agent Skills), when to create bots, talking to the responsible bot,
  group rooms, fresh cloud coding agents versus document workers, priorities
  and cross-domain signals, decisions, Drive weekly Doc as the weekly progress
  source of truth with optional status files, human tasks in the task app,
  agent jobs in the private job hub, schedules in the calendar, deliverables
  and publishing, issue-first coding, cost and ops proposals, retiring finished
  bots, preferring public repositories, archiving unused repositories, and
  storing secrets in 1Password.
- [`docs/secrets-local-injection.md`](docs/secrets-local-injection.md) covers Mac LLM API-key injection with `op run`.
- [`docs/tooling-and-cost.md`](docs/tooling-and-cost.md) covers how to split
  work across Grok Bot, Cursor (IDE, cloud coding agents, and local CLI),
  Antigravity (`agy` CLI and Remote Control), the local workstation, and
  GitHub Actions CI to stay within plan pools, how to enforce on-demand hard
  stops, how to keep CI lean, how to minimize cloud token spend, how to route
  and saturate local workstation compute, how to audit monthly spend with dual
  attribution and overnight routine checks, and how to propose spend caps, lane
  shifts, and routine timing changes.
- [`docs/cast-and-routing.md`](docs/cast-and-routing.md) maps the full cast
  across actors, tools, and execution environments, clarifies daily commander
  versus progress bot roles (with Drive weekly Docs as the progress source of
  truth and status files as optional auxiliary notes), defines who assigns work
  to whom over which named channel, separates human tasks in the task app from
  bot jobs in a private job hub with handoff visibility conventions, defines
  assign-and-accept boundaries with event-driven completion, and provides a
  pre-launch routing checklist that includes card-style confirmation for heavy
  launches.
- [`docs/workstation-handoffs.md`](docs/workstation-handoffs.md) covers how to
  prepare a registered workstation, enforce fixed checkout roots (`~/agy-work`
  for `agy` and `~/agent-work` for local `agent`) and cloud-versus-local coding
  routing, wire Grok Bot to Antigravity CLI (`agy`, defaulting to Gemini 3.8
  Flash with Grok docs drafting exception-only) and the local Cursor Agent CLI
  (`agent` or `cursor-agent`), structure self-contained briefs, enforce
  one-writer parallel-execution controls, and prefer operator-facing choice
  cards over growing fine-grained Allow lists (including
  [docs and deck prose lane discipline](docs/workstation-handoffs.md#docs-and-deck-prose-lane-non-negotiable),
  [local approval prompt reduction](docs/workstation-handoffs.md#reduce-local-approval-prompts),
  [headless `agy` soft-deny handling](docs/workstation-handoffs.md#headless-agy-soft-deny-handling),
  and the phase-batched wrapper scripts in
  [`scripts/README.md`](scripts/README.md)).
- [`docs/monthly-audit.md`](docs/monthly-audit.md) is the checklist for the
  monthly ops cycle: review usage across LLM subscriptions and GitHub Actions,
  routines, idle bots, rule drift, and cross-bot practice; open the
  monthly-audit PR; after that PR merges, update the operator's private shared
  assistant notes; tag one `YYMMDD` GitHub Release for the cycle (not for
  mid-cycle PRs).
- [`CONTRIBUTING.md`](CONTRIBUTING.md) holds all contribution rules: how to
  propose changes by pull request, the English prose review every PR needs,
  and the generic-examples policy.
- [`AGENTS.md`](AGENTS.md) points coding agents and bots at `CONTRIBUTING.md`
  and states the topic-file and 500-line split rule for `docs/`.

## How to use it

1. Read [`docs/shared-rules.md`](docs/shared-rules.md) and adapt the patterns
   to your workspace.
2. Point your bots (or a short operator note) at the rules that matter for
   your setup. Cross-bot ops rules live in shared durable notes, this repo, or
   both. Do not store them as Agent Skills. Reserve Agent Skills for reusable
   procedures many bots share, such as writing style or platform posting
   workflows. Do not copy personal details into bot prompts.
3. Run [`docs/monthly-audit.md`](docs/monthly-audit.md) once a month. A
   cost/ops bot or the audit proposes cleanups. The operator chooses what to
   apply, merges the monthly-audit PR, updates private shared assistant notes,
   and tags one `YYMMDD` GitHub Release for that cycle. Mid-cycle docs PRs do
   not get a release tag. Bots cannot delete sidebar bots or rooms.
4. Suggest generalized improvements by pull request. Read and follow
   [`CONTRIBUTING.md`](CONTRIBUTING.md) first. It holds every contribution
   rule, including the English prose review each PR needs.

## Markdown linting

This repository uses
[markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2) to check
Markdown formatting. The configuration is in `.markdownlint-cli2.yaml`. CI runs
the same checks on pull requests and on pushes to `main` (see
`.github/workflows/markdown.yml`).

To lint locally with the version CI uses:

```bash
npx --yes markdownlint-cli2@0.23.2
```

## License

Licensed under the [Apache License 2.0](LICENSE).
