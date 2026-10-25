# Contributing

Thanks for helping improve these multi-agent / Grok Bot operations practices. This repo is documentation only.

## How to suggest improvements

1. Fork the repository (or use a branch if you have write access).
2. Edit the relevant docs—usually [`docs/shared-rules.md`](docs/shared-rules.md) or [`docs/monthly-audit.md`](docs/monthly-audit.md).
3. Keep the change **generalized**: useful to other operators, not tied to one person’s setup.
4. Open a pull request against `main` with an English title and body that explain *why* the change helps ops hygiene or token cost.
5. Do not merge your own PR unless maintainers ask you to; review may refine wording for a wider audience.

## Keep examples generic

Contributors **must** keep examples generic. Prefer:

- “operator”, “domain bot”, “progress bot”
- “status files on a shared workspace”
- “monthly ops audit”
- Name pattern `Domain｜Role` (placeholders, not real display names)

Do **not** include:

- Real names, employers, family details
- Billing amounts or subscription tiers
- Customer or project names
- Bot display names that identify an individual
- Internal paths (e.g. home directories), email addresses, or city/move plans

If your draft needs a concrete illustration, invent a clearly fictional placeholder (`Domain｜Role`, `docs/status/domain-bot.md`) rather than copying from a private workspace.

## Style

- English throughout (README, docs, PR title/body).
- Prefer short, actionable rules over essays.
- Link related sections instead of duplicating long passages.
- This is not an Agent Skills `SKILL.md` tree—do not add skill folders unless maintainers explicitly expand scope.

## License

By contributing, you agree that your contributions are licensed under the [Apache License 2.0](LICENSE).
