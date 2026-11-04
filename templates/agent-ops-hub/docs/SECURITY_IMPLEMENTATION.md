# Security Must summary

These checkboxes are acceptance gates for the Worker queue and claim stage, the
Mac launcher stage, and the operator live e2e stage. Use them as a pull request
checklist. Leave a box open until the code meets it.

Related: [GitHub App procedure](GITHUB_APP_SETUP.md),
[Label taxonomy](LABELS.md),
[Secrets and placeholders](SECRETS.md),
[Worker relay pattern](../worker/README.md),
[Mac launcher pattern](../mac/README.md).

## Foundation rules

1. HMAC: constant-time compare of `X-Hub-Signature-256` before JSON parse.
   Compute HMAC-SHA256 over the raw request body. Compare that digest to the
   header with a constant-time equality check. Missing or invalid signatures
   get `401` or `403` and stop. Do not parse JSON and do not run business
   logic on failure.
2. Concurrent launch: refuse a second job for the same Issue while
   `status-running` is set. This applies to the pull claim and to any push
   fallback.
3. Actor allowlist: `ALLOWED_ACTORS` holds GitHub logins, comma-separated. A
   label added by any other login does not launch. A Bot sender is always
   rejected.
4. Loop prevention: ignore webhook events where the App is the actor, except
   intentional status updates that do not re-add `trigger-run`. Re-adding
   `trigger-run` is outside that exception.

No environment flag disables rules 1, 2, or 4.

## GitHub App

- [ ] Permissions are Issues read and write, Metadata read, and Contents read.
- [ ] Pull requests, Actions, Workflows, Administration, Members, and Checks
      are not requested.
- [ ] Installation is selected repositories, and the selected repository is
      the private hub only.
- [ ] The App private key is stored in a secret manager and in Cloudflare
      secrets.
- [ ] The Mac disk does not hold the App private key or a long-lived user
      token.

## Webhook

- [ ] The signature is verified with a constant-time compare before JSON
      parse, using `WEBHOOK_SECRET` from Cloudflare secrets or a deploy-time
      inject.
- [ ] Dedupe on `X-GitHub-Delivery`, with the Issue id plus the label event as
      a backstop. A retry does not double-launch.
- [ ] Events from this App are ignored, except intentional status updates that
      do not re-add `trigger-run`.
- [ ] On accept, `trigger-run` is removed before enqueue or launch. A failed
      remove launches nothing.
- [ ] A second job is refused while the Issue shows `status-running`.

## Actors and public repositories

- [ ] Only logins in `ALLOWED_ACTORS` may add `trigger-run`. Bots and every
      other login are rejected.
- [ ] `trigger-run` and every other launch path are ignored on a public
      template repository listed in `IGNORED_LAUNCH_REPOS`. Personal job
      Issues exist only in the private hub.

## Reachability

The default is Mac pull. A push fallback needs a separate review.

- [ ] The Worker does not read a Mac URL, a shell command, or a checkout root
      from the Issue body.
- [ ] The pull claim enforces the `status-running` lock.
- [ ] The Mac claims a queued job. There is no inbound public listener on the
      Mac.
- [ ] If a push fallback is added: Cloudflare Access, one fixed route, a shared
      secret in Cloudflare secrets, a rate limit, and no unused public routes.

## Tokens

- [ ] The Worker holds the App private key and mints an installation access
      token per operation.
- [ ] The Mac does not store the App private key or a long-lived user token.
- [ ] Status updates use the Worker proxy. The Mac sends
      `STATUS_PROXY_SHARED_SECRET`, and the Worker uses a fresh installation
      token. A single-use short-TTL token for one job is the allowed
      alternative.
- [ ] Token mint and use are logged without token values.

## Launcher

The brief is untrusted input.

- [ ] The Issue brief reaches `agy` or `agent` only as a file the child reads.
      The prompt names the brief by a path relative to the child working
      directory. It contains no absolute path and no body.
- [ ] The launcher never evaluates the Issue body. Do not `eval` it. Do not
      `bash -c` it.
- [ ] The argument vector is fixed. The body is never interpolated into a
      shell command string.
- [ ] Checkout roots are `$HOME/agy-work/<repo>` for `agy` and
      `$HOME/agent-work/<repo>` for local `agent`. `<repo>` is one path
      segment. Paths outside those roots, including `..`, are rejected.
- [ ] `lane-cursor-cloud` does not start a Mac process from this launcher.
- [ ] Soft-deny stops the job, comments the exact command and reason, and sets
      `status-soft-deny`. The allow list is not widened mid-run.
- [ ] A second job for an Issue in `status-running` is refused.

## Comments and export

- [ ] Comments contain only PID, log path, soft-deny command and reason, or PR
      URL. No environment dumps, API keys, full logs, tunnel hostnames, Access
      client secrets, or personal emails.
- [ ] The private hub and any public export contain zero real tokens, webhook
      secrets, tunnel hostnames, Access client secrets, personal emails, or
      private keys. Placeholders live in `.env.example` only.
- [ ] A public export runs the personal values checklist and a secret-pattern
      search before publication.

## Out of scope

Replacing a cloud coding lane for general coding, and whole-home local
execution allow lists, stay out of scope.
