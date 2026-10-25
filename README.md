# grok-bot-ops

Operations and documentation for the Grok bot.

## Markdown linting

This repository uses [markdownlint-cli2](https://github.com/DavidAnson/markdownlint-cli2)
to check Markdown formatting. Configuration lives in `.markdownlint-cli2.yaml`.
CI runs the same checks on pull requests and pushes to `main`
(see `.github/workflows/markdown.yml`).

To lint locally (version pinned to match CI):

```bash
npx --yes markdownlint-cli2@0.23.2
```
