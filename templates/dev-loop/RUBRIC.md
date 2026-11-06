# Two-tier rubric for ambiguous judgments

The gates in [`GATES.md`](GATES.md) need a label when the evidence is not clear.
This rubric splits those judgments into two tiers. Tier A returns a finite label
and is the only tier that can decide a gate. Tier B returns prose and never
decides a gate.

## Tier (A): finite labels only

Tier A uses Jev-style shapes: Noul, Choice, or Score. The shapes are a
documentation convention, not an API. A caller can record the label in a PR
comment, a summary, or an operator note.

| Shape | Return value |
| --- | --- |
| Choice | Exactly one label from a fixed set, plus one evidence line that cites the local fact used. |
| Noul | `pass` or `fail`, plus a list of missing items when the verdict is `fail`. |
| Score | A number or band, plus the threshold that turns it into a pass. |

### Item 1: Argon need (first review)

Shape: Choice.

| Label | Meaning |
| --- | --- |
| `need` | Core code, CI, or a security contract changes, so a first Argon review is needed. |
| `skip_light` | Only templates, docs, or a lockfile with its matching constraint file change, so light review is enough. |
| `ambiguous` | Evidence sits between the two labels, so explain before relabeling. |

`ambiguous` cascades to tier B for an explanation only. The next step is a final
tier A label: `need` or `skip_light`. Tier B never selects the label.

### Item 2: Re-review need

Shape: Choice. This is separate from the first Argon need in item 1. A job can
need no first review and still need a re-review, or the reverse.

| Label | Meaning |
| --- | --- |
| `none` | No re-review is needed after the current change set. |
| `unresolved_blocker` | A prior review blocker is still open. |
| `core_ci` | A core code or CI change landed after the first review. |
| `option_b` | A deferred option B path was taken after the first review. |

Return exactly one of `none`, `unresolved_blocker`, `core_ci`, or `option_b`.
Do not merge this choice into item 1.

### Item 3: SUMMARY sufficiency

Shape: Score or Noul pass/fail, plus a missing blocker list.

The summary must name the files changed, the known gaps, and each confirm
condition for the job. A Noul verdict is `pass` when all three are present, and
`fail` with the missing items listed. A Score variant is 0 to 3 points, one per
section, with a pass threshold of 3.

When the verdict is `fail`, return the gaps as a blocker list:

```text
- missing: <section or condition>
- missing: <section or condition>
```

### Item 4: RETRO template sufficiency

Shape: Noul pass/fail against the contract in
[`../retro/RETRO.md`](../retro/RETRO.md).

The checks are: the first line is `## RETRO`, a `Source PR: URL` line follows the
marker, the required sections are present, the scrub list passes, and the whole
comment is 1,500 characters or fewer. Return `pass`, or `fail` with the missing
items listed. Absent marker means no retro, not a failed template.

### Item 5: Lock-boundary ambiguity

Shape: Choice.

| Label | Meaning |
| --- | --- |
| `lock_only` | The diff stays inside the lockfile plus its matching constraint file. |
| `beyond_lock` | Any other file changes, or the constraint change does not match the lock upgrade. |
| `unclear` | The diff cannot be classified from the available facts. |

Treat `unclear` as `beyond_lock` for routing, and relabel after the diff is
inspected. Do not let `unclear` become a light-review skip.

## Mid confidence: cascade then return to tier A

Use this sequence when tier A confidence is mid:

1. Pick the provisional tier A shape and label.
2. Cascade to tier B for an explanation of the ambiguity.
3. Return a final tier A label.

Never let tier B prose decide a gate. A gate decision needs a tier A label from
one of the five items above.

## Tier (B): prose only

Tier B may produce only these outputs:

- Adoption-copy polish for RETRO lines or `shared_profile` candidate lines.
- Near-term priority proposals, 1 to 3 items, each with a reason.

Deliver them as proposals to the ops-optimization role (`運用｜最適化`) only. No
auto-apply, no merge, no Allow widening, and no memory write.

Tier B must not produce gate labels, PASS or FAIL verdicts for a gate, merge
approval, model switches, or Allow changes. Those belong to tier A or to the
operator.

## Routing examples

- Lockfile plus its matching constraint file: item 1 `skip_light`, item 5
  `lock_only`, item 2 `none`.
- A CI workflow change: item 1 `need`, item 2 `core_ci`.
- A prior blocker still open after a new push: item 1 `need`, item 2
  `unresolved_blocker`.

## Related

- [`GATES.md`](GATES.md): the gates that consume these labels.
- [`CHECKLIST.md`](CHECKLIST.md): the one-page operator pass.
