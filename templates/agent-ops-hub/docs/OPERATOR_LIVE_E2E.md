# Operator live e2e stub

The operator live e2e run proves the relay on a real Issue in the private hub.
A real webhook reaches the Worker, the Mac claims one job, a real lane CLI runs
in a checkout, and the Worker writes the status labels and comments. The run is
manual on the Mac and stays out of CI.

This is a thin stub. It holds no host-specific run history and no personal
Issue text.

Related: [Security Must summary](SECURITY_IMPLEMENTATION.md),
[Label taxonomy](LABELS.md),
[Secrets and placeholders](SECRETS.md),
[Worker relay pattern](../worker/README.md),
[Mac launcher pattern](../mac/README.md).

## Preconditions

1. The Worker is deployed. Its secrets came from a secret manager at deploy
   time.
2. The GitHub App is installed on the private hub only. The webhook is
   subscribed to Issues and Issue comments.
3. The labels exist, including `trigger-run` and the status labels.
4. `agy` and `agent` are on `PATH`. `gh` is authenticated as the operator. Both
   checkout roots exist.
5. The status-proxy secret is available to the launcher from the secret
   manager. It is not in a committed file.
6. Poll mode is stopped. A poll loop would claim the job before `once` sees it.
   Run one job at a time.
7. Use a harmless Issue. A docs wording change is enough.

## Acceptance checks

The required checks prove the normal path, the concurrent-launch guard, and the
evidence hygiene. The optional checks add negative cases.

| ID | Check | Required |
| --- | --- | --- |
| A1 | The Worker answers `/health` with `{"ok":true}` | yes |
| A2 | The label taxonomy exists on the private hub | yes |
| A3 | The target Issue is open, has one lane, and is not running or queued | yes |
| A4 | The Worker accepts `trigger-run`, removes the trigger, and sets a status | yes |
| A5 | `once` claims exactly one job and runs the lane CLI | yes |
| A6 | A second claim while `status-running` is refused | yes |
| A7 | The running status comment carries only PID and log path | yes |
| A8 | The job ends `done` with a PR URL and `status-done` | yes |
| A9 | A login outside `ALLOWED_ACTORS` does not launch | optional |
| A10 | `trigger-run` on the public template repository does not launch | optional |
| A11 | Comments and launcher argv carry no secret and no absolute brief path | yes |
| A12 | Unsigned or badly signed webhooks are refused | optional |

## Evidence rules

Record pass or fail per check. Do not record a secret, a tunnel hostname, a
full log, an environment dump, or personal task text. A log path is enough. A
short outcome note is enough.

## After the run

- Clear `status-running` if the run stopped without a terminal status.
- Stop the launcher.
- Keep the run record in the private hub or another private location. Do not
  publish it as a template.
