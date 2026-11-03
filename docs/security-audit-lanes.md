# Security audit lane routing

Route security domain audits through a partial Antigravity CLI (`agy`) routing
pattern: security audit bodies stay off `agy`, while secondary prose drafting
and translations run on `agy`.

This policy separates security posture evaluation from the monthly operations
cost and subscription checklist in [`monthly-audit.md`](monthly-audit.md).

## Route security audits through partial agy only

Security work divides into technical posture analysis, live edge hardening, and
prose reporting:

- Antigravity CLI (`agy`, under `~/agy-work`, defaulting to Gemini 3.8 Flash,
  `gemini-3.8-flash-medium`) handles secondary prose tasks only. It drafts
  weekly security news from public sources and refines summary prose after an
  audit analysis already exists.
- Core technical security auditing stays off `agy`. Settings analysis, secrets
  surfaces, threat models, and vulnerability severity judgments require coding
  agents or stronger reasoning models.

## Allowed tasks on the agy lane

Run these two prose tasks on workstation `agy` under `~/agy-work/<repo>`:

1. **Weekly security news and trend reports**: draft informational prose from
   public vulnerability feeds, vendor security bulletins, and disclosed
   advisories.
2. **Post-audit Japanese polish and executive summaries**: translate or polish
   an existing audit report into stakeholder summaries, Japanese briefs, or
   slide text after the technical analysis is complete.

## Prohibited security tasks on agy

Keep technical security evaluations, credential handling, and live infrastructure
tasks off `agy`:

- **Monthly repository security audit body**: do not use `agy` to inspect
  repository settings, authentication posture, secrets exposure surfaces,
  dependency vulnerability gaps, or severity rankings. Route this analysis to
  Cursor cloud coding agents using the repository security-audit skill or
  workflow. For complex or borderline severity judgment, invoke a one-shot
  stronger model (such as an Argon-class model).
- **Live edge and cloud infrastructure defense**: do not use `agy` to explore or
  harden Cloudflare dashboards, API rules, or firewall settings. The security
  domain bot and the operator handle live infrastructure jointly.
- **Quarterly threat-model attack scenario validation**: do not evaluate attack
  paths or scenario feasibility on `agy`. Route scenario validity to human
  review or a one-shot stronger model. `agy` may polish the resulting prose
  only after that evaluation finishes.
- **Secrets, password managers, and API keys**: do not process credentials,
  token injection, or password-manager items through `agy` (see
  [`secrets-local-injection.md`](secrets-local-injection.md)).
- **Dependabot merge evaluations**: do not route dependency update merge
  decisions to `agy`. Assessing CI test coverage, regression risks, and blast
  radius requires coding lanes and operator review.
- **Permission, billing, and soft-deny debugging**: do not use `agy` to diagnose
  tool permissions, quota limits, or subscription billing failures.

## Audit workers stay read-oriented and remediation stays in coding lanes

Keep audit workers read-oriented. Security audit agents inspect configurations,
evaluate risks, and draft findings. They do not write code changes or merge pull
requests.

Remediation pull requests belong on the coding lane. When the operator accepts
an audit recommendation:

1. The operator commissions a fresh Cursor cloud coding agent with a focused
   remediation brief.
2. The coding agent implements the fix, verifies CI tests, and opens a
   remediation pull request for operator review.
3. If remediation requires workstation validation or Mac runtime checks, route
   the verification to local `agent -p` under `~/agent-work/<repo>` (see
   [`workstation-handoffs.md`](workstation-handoffs.md)). Do not use `agy` for
   code verification or security regression testing.

## Domain security audits differ from monthly operations audits

Do not combine domain security audits with monthly operations cost reviews.

Monthly operations audits ([`monthly-audit.md`](monthly-audit.md)) focus on
subscription quotas, GitHub Actions runner minutes, idle routines, and ops rule
drift. Domain security audits evaluate attack surfaces, credential safety, and
dependency risk.

Track security remediations through dedicated issues and coding pull requests
instead of folding them into the monthly operations audit cycle.

## Keep security gates thrifty

- **Dependabot**: act only on alerts that have a fixed version, and only on
  repositories that are not archived.
- **OpenCode keys**: reference API keys in config as `{env:NAME}` placeholders.
  Never write a literal key into a file (see
  [`docs/secrets-local-injection.md`](secrets-local-injection.md)).
- **Must-to-diff gate**: the security domain bot owns the check that every Must
  item in an issue maps to a change in the diff before merge.

Lane routing for the coding work itself:
[`docs/agy-quota-and-coding-lanes.md`](agy-quota-and-coding-lanes.md).
