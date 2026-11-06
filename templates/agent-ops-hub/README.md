# Agent ops hub templates

This tree holds public, scrubbed templates for an operator-run job hub. The
private hub holds job traffic, Issue briefs, and secret placeholders. This tree
holds shareable patterns only. It carries zero personal values.

Use a template as a starting point, then replace every placeholder with a value
from your own deployment. Keep secret values in a secret manager. Do not commit
them.

## What each side holds

| Side | Holds | Does not hold |
| --- | --- | --- |
| Private hub (your own repository) | Job Issues, briefs, live run history, secret placeholders | Public template copies |
| This public repository | Scrubbed templates, pattern docs, checklists | Live values, personal job text |
| Orchestrator | Git commit, push, and pull request for a job | Secret values |

The private hub is the only launch repository. A public template repository is
listed in `IGNORED_LAUNCH_REPOS` and never starts a job.

## What is here

- [`worker/`](worker/README.md): Cloudflare Worker pattern for a signed GitHub
  webhook, a job queue, a pull claim, and a status proxy.
- [`mac/`](mac/README.md): Mac launcher pattern for fixed checkout roots and a
  fixed argument vector.
- [`docs/LABELS.md`](docs/LABELS.md): label names and state rules.
- [`docs/SECURITY_IMPLEMENTATION.md`](docs/SECURITY_IMPLEMENTATION.md): Must
  summary for the relay.
- [`docs/SECRETS.md`](docs/SECRETS.md): placeholder names and redaction rules.
- [`docs/GITHUB_APP_SETUP.md`](docs/GITHUB_APP_SETUP.md): procedure template
  with IDs omitted.
- [`docs/OPERATOR_LIVE_E2E.md`](docs/OPERATOR_LIVE_E2E.md): thin acceptance
  stub.
- [`docs/ACCURACY_EVAL.md`](docs/ACCURACY_EVAL.md): short note on the
  difference between a relay e2e run and an accuracy evaluation.
- [`.env.example`](.env.example): placeholder names only.
- [`PERSONAL_VALUES_CHECKLIST.md`](PERSONAL_VALUES_CHECKLIST.md): patterns a
  reviewer must scan for before publishing a template change.

## What is not here

The private hub's eval fixtures, live end-to-end history, real Allow lists,
Auto-review rule changes, and personal briefs stay private. This tree does not
mirror the private tree.

Fleet conventions already live in the public docs. Follow those instead of
copying them here:

- [Shared rules](../../docs/shared-rules.md)
- [Workstation handoffs and fixed roots](../../docs/workstation-handoffs.md)
- [Secrets and local injection](../../docs/secrets-local-injection.md)
- [Cast and routing](../../docs/cast-and-routing.md)
- [Tooling and cost lanes](../../docs/tooling-and-cost.md)

## How to use a template

1. Copy the directory you need into your own project.
2. Replace `YOUR_HUB_OWNER/YOUR_HUB_REPO`,
   `YOUR_PUBLIC_OWNER/YOUR_PUBLIC_REPO`, `worker.example.invalid`, and every
   `replace-with-...` value.
3. Keep the real webhook secret, App private key, and status proxy secret in a
   secret manager. Inject them at deploy time.
4. Run the personal values checklist on your adaptation before you publish it.
5. Keep job briefs and run history in the private hub, outside the public copy.

These files are patterns, not a deployable release. They have no tests and no
wiring for a specific account.
