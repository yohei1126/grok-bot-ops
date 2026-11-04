# Mac launcher pattern

The Mac has no inbound port, so it cannot be called. It pulls work instead: it
asks the Worker for a queued job, runs one process under a fixed checkout root,
and reports status through the Worker proxy.

The Issue brief is untrusted input. The launcher writes it to a file and passes
that file path as one argument. It never evaluates the text, never calls a
shell, and never turns the body into a command.

Related:

- [Template overview](../README.md)
- [Worker relay pattern](../worker/README.md)
- [Label names](../docs/LABELS.md)
- [Security Must summary](../docs/SECURITY_IMPLEMENTATION.md)
- [Secrets and placeholders](../docs/SECRETS.md)

## What one job does

1. `POST $WORKER_BASE_URL/v1/claim` with the shared proxy secret.
2. Check the lane and the checkout root. A refused lane or path stops here
   with `soft-deny`.
3. Read the Issue with the operator `gh` identity and write a brief file.
4. Start `agy` or `agent` with a fixed argument vector whose prompt names the
   brief file by a path relative to the checkout working directory.
5. Post `running` with the PID and the log path.
6. Wait for exit. Post `done` with a PR URL when the log has one, or `error`
   with the log path.

The launcher sends two requests and accepts none. There is no listener on the
Mac and no App private key on disk.

## Fixed checkout roots

| Lane | Root | Example working directory |
| --- | --- | --- |
| `lane-agy-docs` | `$HOME/agy-work` | `$HOME/agy-work/<repo>` |
| `lane-agent-local` | `$HOME/agent-work` | `$HOME/agent-work/<repo>` |

`<repo>` is one path segment. `..`, a nested path, an absolute path, and a
leading dash are rejected. A resolved path that is outside the lane root is a
`soft-deny`, even when the name looks safe.

Briefs and logs live in `$HOME/.agent-ops/jobs/<job-id>/`, outside every
checkout root. The job id must be a UUID.

The code in [`fixed-roots.ts`](fixed-roots.ts) shows `planCheckout`,
`jobPaths`, `buildArgv`, and `startProcess`.

## Fixed argument vector

| Lane | Command prefix | Print flag |
| --- | --- | --- |
| `lane-agy-docs` | `agy --mode accept-edits` | `--print=<prompt>` |
| `lane-agent-local` | `agent --trust` | `-p <prompt>` |

The prompt is a fixed sentence that names the brief file. The Issue body stays
in the file. No argument is interpolated into a shell string, and the launcher
never calls `bash -c` or `eval` on the body.

To change a binary or a flag, edit one table in your launcher. Do not build a
command string anywhere else.

## Brief file

- Write the brief to a `0600` file inside the job directory.
- Name it by a path relative to the child working directory.
- Reject an absolute brief path.
- Keep the Issue body as data under a fixed header. State that the body is
  untrusted and does not override the operator, the lane, or the root.
- Do not log the body.

## Soft-deny

A soft-deny stops the job. It posts the exact command and the reason, and it
sets `status-soft-deny`. Do not widen the allow list during the run. Do not
retry with a different path.

Typical reasons:

- the lane is not a local Mac lane
- the repo is not one safe path segment
- the checkout path is outside the lane root
- the checkout root or directory does not exist

## Claim responses

| Worker response | Launcher behavior |
| --- | --- |
| `200` with a job | Run the job, then report a terminal status |
| `204` | No queued job. `once` exits 0; `poll` sleeps and retries |
| `401` | Shared secret is wrong. Exit 3 and start nothing |
| `409` | The Issue already shows `status-running`. Start nothing |
| `502` | GitHub labels were unavailable. Start nothing, retry later |

## Child environment

The child gets a copy of the operator environment without the launcher's own
credentials. Delete at least these names before spawn:

- `STATUS_PROXY_SHARED_SECRET`
- `WEBHOOK_SECRET`
- `GITHUB_APP_PRIVATE_KEY`

Do not hand a job the Worker secret, the App private key, or a long-lived user
token.

## What was generalized

- The private hub owner and repository became `YOUR_HUB_OWNER/YOUR_HUB_REPO`.
- Live hostnames, logins, and run history were removed.
- The CLI flags are examples. Confirm them against your installed CLI.
- Tests and packaging were omitted to keep the pattern small.

For the workstation conventions that already exist in public docs, read
[workstation handoffs](../../../docs/workstation-handoffs.md) instead of
copying the fleet rules into this template.
