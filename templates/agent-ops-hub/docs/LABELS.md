# Label taxonomy

Labels on the private hub are the operator-visible source of truth for launch
requests, execution lane, and job status. Comments carry short facts only. The
Worker and the Mac launcher implement this taxonomy.

Related: [Security Must summary](SECURITY_IMPLEMENTATION.md),
[Secrets and placeholders](SECRETS.md),
[Worker relay pattern](../worker/README.md).

## Kinds

Keep lane labels and status labels separate. An Issue has one lane, at most
one status label, and `trigger-run` only while a launch is requested.

| Kind | Name | Meaning |
| --- | --- | --- |
| Trigger | `trigger-run` | Add to request a launch. Remove on accept, before the job starts. |
| Lane | `lane-agy-docs` | Docs job. Mac `agy` under `$HOME/agy-work/<repo>`. |
| Lane | `lane-agent-local` | Local coding job. Mac `agent` under `$HOME/agent-work/<repo>`. |
| Lane | `lane-cursor-cloud` | Cloud lane. The Mac launcher starts no process for it. |
| Status | `status-running` | A job for this Issue is in progress. |
| Status | `status-waiting` | Accepted or queued. No job is running. |
| Status | `status-soft-deny` | Stopped by soft-deny. The comment has the command and the reason. |
| Status | `status-error` | Launch or the job failed. |
| Status | `status-done` | The job finished and met the brief's done criteria. |

`<repo>` is one path segment. `..` and nested paths are rejected. See
[Security Must summary](SECURITY_IMPLEMENTATION.md).

## Trigger rule

`trigger-run` means "please start". It is not a status.

On accept, the Worker removes `trigger-run` before enqueue or launch. If the
remove fails, do not launch. A retry of the same delivery must not start a
second job.

Only logins in `ALLOWED_ACTORS` may add `trigger-run`. Logins absent from that
list, including bots, do not launch a job.

`trigger-run` on a public template repository is ignored. Personal jobs run
from Issues in the private hub only. Set `IGNORED_LAUNCH_REPOS` to the public
repository.

## Status rule

Status labels are mutually exclusive. Setting one removes the other
`status-*` labels in the same update.

While `status-running` is present, refuse a second job for that Issue. This
applies to the pull claim and to any push fallback.

`status-waiting` is the queued state after accept and before a Mac claim, or
before a cloud lane reports start. It is not a second running job.

## Comment content rules

A status comment may contain only these facts:

| Fact | When |
| --- | --- |
| PID | The process started on the Mac |
| Log path | Path only. Do not paste the log. |
| Soft-deny command and reason | `status-soft-deny`. The exact command and the reason text. |
| PR URL | A pull request exists for the job |

Comments must not contain environment dumps, API keys, webhook secrets, App
private keys, Access client secrets, tunnel hostnames, personal emails, or full
logs. The redaction rules are in [Secrets and placeholders](SECRETS.md).

## Loop prevention

Ignore webhook events whose actor is this GitHub App, except an intentional
status update that does not add `trigger-run`. A status update that re-adds
`trigger-run` is not that exception: do not launch.

## One-shot create

With `gh` authenticated to manage labels, create the full set from a checkout
of the private hub:

```bash
gh label create trigger-run --repo YOUR_HUB_OWNER/YOUR_HUB_REPO \
  --description "Add to request a launch. Removed on accept, before the job starts." \
  --force
```

Repeat for each label name. Colors are local display hints. The names and rules
above are normative.
