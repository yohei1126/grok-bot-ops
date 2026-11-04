# Secrets and placeholders

A secret manager is the source of truth for secret values. Read them at run
time or inject them at deploy time. Do not put real secrets in a local `.env`.
Cloudflare secrets are a deploy-time inject, not a second source of truth.

The committed template is [`.env.example`](../.env.example): placeholder names
only. An `op://` reference in that file is not key material.

The shared operator convention for local injection is in
[secrets and local injection](../../../docs/secrets-local-injection.md). This
file does not restate it.

## Placeholder names

| Name | Where the value lives | Committed form |
| --- | --- | --- |
| `WEBHOOK_SECRET` | Secret manager. Cloudflare secret is a deploy-time inject only. | `replace-with-webhook-secret` |
| `GITHUB_APP_PRIVATE_KEY` | Secret manager. Cloudflare secret is a deploy-time inject only. | `op://vault/item/private-key` (not key material) |
| `STATUS_PROXY_SHARED_SECRET` | Secret manager. Cloudflare secret is a deploy-time inject only. | `replace-with-status-proxy-secret` |
| `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID` | Worker config after the operator creates the App | `000000` |
| `GITHUB_APP_SLUG` | Worker config. Bot login without `[bot]`. | `your-app-bot` |
| `ALLOWED_ACTORS` | Worker config | `login1,login2` |
| `HUB_REPO` | Worker config | `YOUR_HUB_OWNER/YOUR_HUB_REPO` |
| `IGNORED_LAUNCH_REPOS` | Worker config | `YOUR_PUBLIC_OWNER/YOUR_PUBLIC_REPO` |
| `WORKER_BASE_URL` | Mac config | `https://worker.example.invalid` |
| Access service token and tunnel hostname | Unused while Mac pull is the default | Commented placeholders only |

Ignoring a file is not permission to store secrets in it. Do not put real
secrets in a local `.env`.

The App private key's source of truth is the secret manager. Deploy injects it
into a Cloudflare secret. It is not written to the Mac disk or to a local
`.env`. Token and webhook rules are in
[Security Must summary](SECURITY_IMPLEMENTATION.md).

## Comment redaction

Issue comments on the private hub are limited to PID, log path, soft-deny
command plus reason, and PR URL. See [Label taxonomy](LABELS.md).

The Worker rejects values with control characters, private key markers, GitHub
tokens, cloud keys, JWTs, or `op://` references.

## Before a public export

Confirm that every file has none of the following:

- Webhook secrets, App private keys, PATs, installation tokens, or status-proxy
  secrets
- Tunnel hostnames and Access client secrets or audience values
- Personal email addresses
- Real `ALLOWED_ACTORS` logins
- Real App id or installation id
- Secret manager vault or item names that identify a person
- A private hub owner or repo used as the public template destination
- Log excerpts, `.env` dumps, and Wrangler secret listings
- Personal job briefs, Issue bodies, and other personal task text

The full scan list is in
[Personal values checklist](../PERSONAL_VALUES_CHECKLIST.md).

## Secrets stay off CI

Live secrets stay out of GitHub Actions. Workflows use `permissions: contents
read` and no repository secrets. They run with no webhook secret, no App key,
no status-proxy secret, and no real claim. Live runs happen on the Mac.

Optional `workflow_dispatch` jobs that take secrets are not part of the
baseline. Add them only after a separate review.
