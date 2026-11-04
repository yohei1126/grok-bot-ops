# Accuracy evaluation stub

An e2e run and an accuracy evaluation answer different questions. Do not treat
one as the other.

| Kind | Question | Where it runs |
| --- | --- | --- |
| e2e (mocked or partial) | Does the relay move a job from trigger to status? | GitHub Actions, mocked, every PR |
| Live e2e | Does the real relay work on a real Issue? | The operator's Mac, before a release |
| Accuracy evaluation | Does the lane produce a correct result for a fixed task? | The operator's Mac, on demand |

A partial e2e smoke on Actions is not an accuracy evaluation. A passing live
e2e does not show the output is correct. The evaluation scores one run of a
fixed fixture against an expected checklist.

Related: [Operator live e2e stub](OPERATOR_LIVE_E2E.md),
[Security Must summary](SECURITY_IMPLEMENTATION.md).

## Scope

The evaluation covers hub and path quality only. It does not replace a domain
evaluation in another repository, and it holds no content from such a
repository. Fixtures stay in the private hub.

## When to run

Run the evaluation in these cases:

- After the Mac live pre-release run passes.
- When the model, the prompt, or the brief template changes.

Do not run it on every pull request. GitHub Actions has no requirement to run
the full evaluation, and a green Actions run does not depend on it. No live
model call belongs in a workflow.

## Executor and ops roles

The executor is a coding agent. Ops starts the run with the brief and gives a
final judgment when the executor reports. Ops does not poll on a timer.

## Pinned model

Pin one model for the run and write its name in `SUMMARY.md`. Use another model
only when the operator overrides it, and record the override.

## Commands

Use a copy of a fixture brief as the job brief. Run on the Mac, outside CI.

```bash
cd $HOME/agent-work/<repo>
ls eval/fixtures/
cat eval/fixtures/<fixture>/brief.md
cp eval/fixtures/<fixture>/checklist.template.md "$RUN_DIR/checklist.md"
```

Set `RUN_DIR` to the run directory below. Start the executor with the fixture
brief and the pinned model. Wait for its final report. Fill the copied
checklist item by item.

## Where SUMMARY lands

Write the result to a run directory outside git:

```text
$HOME/agent-work/runs/<run-id>/SUMMARY.md
```

Use a run id that names the task, the executor, and the date. `SUMMARY.md`
holds:

- The fixture name and the pinned model.
- The executor.
- The filled checklist with pass or fail per item and the optional score.
- The final judgment from ops.

Do not record a secret, a hostname, a full log, or an environment dump.
