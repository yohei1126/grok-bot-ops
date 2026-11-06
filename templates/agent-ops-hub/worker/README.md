# Worker relay pattern

This directory shows the Worker side of a hub relay. The Worker receives a
signed GitHub webhook, queues one job per accepted launch, and serves a pull
claim plus a status proxy. The Mac never listens on a public port and never
holds the GitHub App private key.

The files are a pattern, not a deployable project. Storage and the GitHub API
client are injected through `WorkerDeps` in [`src/worker.ts`](src/worker.ts).

Related:

- [Template overview](../README.md)
- [Label names](../docs/LABELS.md)
- [Security Must summary](../docs/SECURITY_IMPLEMENTATION.md)
- [Secrets and placeholders](../docs/SECRETS.md)
- [GitHub App procedure](../docs/GITHUB_APP_SETUP.md)
- [Mac launcher pattern](../mac/README.md)

## Routes

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | none | Liveness check. Returns `{"ok":true}` |
| `POST` | `/github/webhook` | `X-Hub-Signature-256` HMAC | GitHub Issues and Issue comment events |
| `POST` | `/v1/claim` | `Authorization: Bearer $STATUS_PROXY_SHARED_SECRET` | Mac claims one queued job |
| `POST` | `/v1/status` | Same Bearer secret | Mac posts PID, log path, soft-deny facts, or PR URL |

Every other path returns `404`. Every other method on a defined path returns
`405`. Responses set `Cache-Control: no-store`.

## Webhook order

The order is the security contract. The launch path stops at the first refusal.

1. Read the raw body and cap it at 1 MB.
2. Verify `X-Hub-Signature-256` with a constant-time compare of the
   HMAC-SHA256 over the raw body. A missing header returns `401`. A malformed
   or wrong signature returns `403`. Do not parse JSON before this step.
3. Validate `X-GitHub-Delivery` and claim it in the store. A duplicate returns
   `200` and starts no work.
4. Parse JSON. A parse failure returns `400`.
5. Require the repository to equal `HUB_REPO`. A repository in
   `IGNORED_LAUNCH_REPOS` returns `202` with reason `public-repo`. Any other
   repository is refused.
6. Drop a sender that matches this App (`GITHUB_APP_SLUG` plus `[bot]`). This
   is loop prevention. A status update must never re-add `trigger-run`.
7. Accept `issue_comment` events for audit and return `202`. Comment text is
   never a command source.
8. Accept a launch only for `issues` action `labeled` with label
   `trigger-run`.
9. Require the sender login in `ALLOWED_ACTORS`. A Bot sender is always
   rejected. Refuse when the Issue already has `status-running`.
10. Pick exactly one lane. Reserve the Issue, remove `trigger-run`, then commit
    the job and set `status-waiting`. If the removal fails, release the
    reservation and queue nothing.

The Worker reads no URL, shell command, or checkout root from the Issue body.

## Storage contract

[`src/worker.ts`](src/worker.ts) defines `JobStore`. A single-writer SQLite
Durable Object fits this pattern:

- The per-Issue lock and the claim path need one consistent view.
- The queue, the delivery dedupe set, and the job records can live in one
  object.
- The queue is small, so one object for all jobs is enough.

A production store should also keep a reservation timeout, prune delivery
records, and release a stale `status-running` lock. The template leaves those
choices to the implementation.

## Claim API

The Mac posts the shared proxy secret and an optional `X-Agent-Id` for audit.

```bash
curl -sS -X POST "$WORKER_BASE_URL/v1/claim" \
  -H "Authorization: Bearer $STATUS_PROXY_SHARED_SECRET" \
  -H "X-Agent-Id: mac-1"
```

| Result | Meaning |
| --- | --- |
| `200` with `{"job":{...}}` | One job is now `status-running` for this Mac |
| `204` | No queued job |
| `401` | Missing or wrong shared secret |
| `409` | The Issue already shows `status-running`, or another claim won |
| `502` | A GitHub label read or write failed. The claim is released |

The response carries `jobId`, `repo`, `issueNumber`, `lane`, `requestedBy`, and
`createdAt`. It carries no brief body, token, Mac URL, or command. The Mac reads
the Issue with its own `gh` identity.

## Status proxy

The Mac posts one status at a time. The Worker uses an installation token for
the label and comment writes.

```bash
curl -sS -X POST "$WORKER_BASE_URL/v1/status" \
  -H "Authorization: Bearer $STATUS_PROXY_SHARED_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"jobId":"<uuid>","status":"done","prUrl":"https://github.com/YOUR_HUB_OWNER/YOUR_HUB_REPO/pull/123"}'
```

| Field | Required | Rule |
| --- | --- | --- |
| `jobId` | yes | UUID of a claimed job |
| `status` | yes | `running`, `done`, `error`, or `soft-deny` |
| `pid` | no | Integer from 1 to 4194304 |
| `logPath` | no | Absolute path or `~/` path, 512 characters or fewer |
| `prUrl` | no | `https://github.com/<owner>/<repo>/pull/<number>` |
| `softDenyCommand` | for soft-deny | One line, 300 characters or fewer |
| `softDenyReason` | for soft-deny | One line, 300 characters or fewer |

Unknown fields return `400`. A request cannot supply a free-text comment body.
The Worker builds the comment from the allowed facts only:

```text
PID: 4321
Log: ~/.agent-ops/jobs/<job-id>/job.log
PR: https://github.com/YOUR_HUB_OWNER/YOUR_HUB_REPO/pull/123
Soft-deny: agy --print="Read the job brief"
Reason: checkout path is outside the lane root
```

Values with control characters, private key markers, GitHub tokens, cloud
keys, JWTs, or `op://` references return `422`. The Worker writes no full log,
environment dump, or free text.

Status maps to one label:

| Status | Label |
| --- | --- |
| `running` | `status-running` |
| `done` | `status-done` |
| `error` | `status-error` |
| `soft-deny` | `status-soft-deny` |

A terminal status releases the per-Issue lock. Only a job in `running` state
accepts a status. A terminal job returns `409`.

## Configuration

[`.env.example`](../.env.example) holds placeholders. A secret manager is the
source of truth for secret values. Cloudflare secrets are a deploy-time
inject.

| Name | Kind | Use |
| --- | --- | --- |
| `WEBHOOK_SECRET` | Cloudflare secret | Webhook HMAC |
| `STATUS_PROXY_SHARED_SECRET` | Cloudflare secret | Claim and status Bearer token |
| `GITHUB_APP_PRIVATE_KEY` | Cloudflare secret | App JWT signing |
| `GITHUB_APP_ID` | Config or secret | JWT issuer |
| `GITHUB_INSTALLATION_ID` | Config or secret | Installation token target |
| `GITHUB_APP_SLUG` | Config or secret | App loop detection |
| `ALLOWED_ACTORS` | Config or secret | Comma-separated logins |
| `HUB_REPO` | Config | The only launch repository |
| `IGNORED_LAUNCH_REPOS` | Config | Public repositories to ignore |

A Wrangler configuration can commit the safe values and leave the secrets out:

```jsonc
{
  "name": "your-hub-worker",
  "main": "src/entry.ts",
  "vars": {
    "GITHUB_APP_SLUG": "your-app-bot",
    "ALLOWED_ACTORS": "login1,login2",
    "HUB_REPO": "YOUR_HUB_OWNER/YOUR_HUB_REPO",
    "IGNORED_LAUNCH_REPOS": "YOUR_PUBLIC_OWNER/YOUR_PUBLIC_REPO"
  }
}
```

A real value set with `wrangler secret put` overrides the same var name. The
placeholder logins fail closed.

## Wiring

Your entry point builds a `WorkerDeps` and exports `createWorker(deps)`:

```ts
import { createWorker } from "./worker";
import { buildDeps } from "./deps";

// buildDeps is yours. It returns a JobStore and a GitHubGateway.
export default createWorker(buildDeps());
```

The GitHub gateway mints one installation token per operation and never logs
its value. The template leaves that client, the Durable Object, and the test
suite to your project.

## Known gaps

- No tests, Durable Object, or GitHub client are included.
- The gateway contract returns `false` on failure. If your client can throw,
  catch the error and release the claim or the reservation.
- A claimed job has no heartbeat or lease. If the Mac dies mid-run, the Issue
  keeps `status-running` until the operator clears it.
- The claim and status routes share one secret and have no per-agent rate
  limit.

## What was generalized

- The private hub owner and repository became `YOUR_HUB_OWNER/YOUR_HUB_REPO`.
- The public template repository became `YOUR_PUBLIC_OWNER/YOUR_PUBLIC_REPO`.
- Live App ids, installation ids, logins, and hostnames were removed.
- Private issue links and run history were removed.
- Tests, the Durable Object implementation, and the GitHub client were
  omitted to keep the pattern small.

For fleet conventions, use the public docs instead of copying them here:
[workstation handoffs](../../../docs/workstation-handoffs.md) and
[secrets and local injection](../../../docs/secrets-local-injection.md).
