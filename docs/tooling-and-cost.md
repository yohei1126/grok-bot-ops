# Tooling surfaces, cost lanes, and spend controls

Split work across four surfaces (Grok Bot, Cursor, Antigravity CLI (`agy`), and
the local workstation) so usage stays within included plan pools and unexpected
on-demand charges stay rare.

Use the same generic labels as [`shared-rules.md`](shared-rules.md): operator,
domain bot (`Domain｜Role`), progress bot, cost/ops bot, document worker, cloud
coding agent, and shared durable notes.

For the full cast, assignment channels, and the task-app queue of record, see
[`cast-and-routing.md`](cast-and-routing.md). For workstation CLI setup,
`agy` and `agent` handoff paths, parallel-writer controls, and card-style
launch confirmation, see [`workstation-handoffs.md`](workstation-handoffs.md).

## 1. Split work across four surfaces and cost lanes

Route every task to the surface that fits its compute profile and authentication
pool:

1. **Grok Bot**: owns the operator UI, mobile-friendly orchestration, external
   connectors (mail, calendar, collaborative docs suite, task app), scheduled
   routines, and multi-bot coordination. Grok reads and updates the operator's
   task app as the queue of record, defines the goal, guardrails, and success
   criteria, and launches handoffs (see
   [`cast-and-routing.md`](cast-and-routing.md)). Keep chats short. Keep
   long machine learning loops, bulk regeneration loops, and large media
   understanding out of Grok token burn.
2. **Cursor (IDE, cloud coding agents, and local `agent` CLI)**: owns
   repository coding across interactive IDE sessions, fresh cloud branches, and
   local headless CLI runs (`agent -p` or `cursor-agent -p`) for features, bug
   fixes, multi-file refactors, and iterative test cycles (see
   [Code and documents](shared-rules.md#5-code-and-documents-use-different-workers)).
   Prefer Cursor cloud coding agents for ordinary repository coding inside
   included Cursor pools.
3. **Antigravity (`agy` CLI and Remote Control)**: owns document drafting,
   repository documentation updates, and lighter repository work under a
   separate Google or Gemini authentication lane. Prefer `agy` (defaulting to
   Gemini 3.8 Flash) whenever that lane has quota. It runs either in the
   interactive TUI (`agy`), through Remote Control (`agy remote-control`), or
   in headless print mode (`agy -p`).
4. **Local workstation hardware**: runs Apple Silicon Metal and MPS workloads,
   local model inference, heavy batch processing, large local disk I/O, local
   test suites, and local CLI workers (`agy` and `agent`). Prefer running heavy
   local compute on the workstation so shared cloud LLM tokens are not burned
   on non-LLM compute, returning only short summaries, metrics, or output paths
   to Grok.

## 2. Match devices and execution environments to tool roles

Align each execution surface with the work it can run and supervise safely:

- **Grok cloud computer ("box")**: runs connector calls, scheduled routines,
  inter-bot coordination, and short research queries. Keep GPU-heavy workloads
  and long iterative compute loops off the Grok box.
- **Registered local workstation**: the operator's computer (for example, an
  Apple Silicon laptop) registered with Grok's local execution bridge to run
  heavy compute, local model inference, test suites, and local CLI workers
  (`agy` and `agent`; see [`workstation-handoffs.md`](workstation-handoffs.md)).
- **Phone**: handles short instructions, triage, status checks, and human
  approvals (including reviewing changes or approving actions in Antigravity
  Remote Control). Do not launch long training runs, bulk regeneration jobs, or
  unreviewed multi-file refactors from the phone.

## 3. Understand shared plan pools versus separate auth lanes

Account for how each tool authenticates and draws from subscription usage pools
before dispatching a batch of tasks:

- **Shared pool considerations**: Cursor usage (across Cursor IDE, cloud coding
  agents, and the local `agent` CLI) may share plan usage pools with Grok Bot
  depending on billing settings.
- **Separate Google or Gemini lane**: Antigravity CLI (`agy`) authenticates
  through a separate Google or Gemini lane. When the shared Grok or Cursor pool
  is tight, shift eligible documentation updates, prose reviews, and lighter
  repository tasks to `agy`. Prefer `agy` (defaulting to Gemini 3.8 Flash,
  `gemini-3.8-flash-medium`) for docs drafting and review; Grok drafting docs is
  an exception-only fallback (see
  [Default agy model](workstation-handoffs.md#default-agy-model-gemini-38-flash)
  and
  [Prefer agy for docs; Grok draft exception-only](workstation-handoffs.md#prefer-agy-for-docs-grok-draft-exception-only)).
  Prefer `agy` for **unstructured and multimodal** understanding (images,
  short video, PDF, long messy logs) so Grok Bot only routes paths and returns
  a short summary (see
  [Unstructured and multimodal offload](workstation-handoffs.md#unstructured-and-multimodal-offload)).
- **Distinguish subscription lanes from pay-as-you-go cloud runs**: distinguish
  subscription-authenticated workstation sessions (`agy` and Cursor) from
  API-key pay-as-you-go runs on a remote cloud computer ("box"). Prefer
  subscription-authenticated local workstation or Cursor cloud execution for
  quota-aligned work. Do not use API-key pay-as-you-go billing for routine
  documentation work unless the operator explicitly approves metered billing.
- **Keep billing rules generic**: never state or invent subscription prices,
  dollar figures, or tier names in repository documentation, weekly progress
  docs, or status files (see
  [Billing and usage trend](monthly-audit.md#1-billing-and-usage-trend)).

## 4. Set spend posture to exhaust subscription pools and avoid overage

Exhaust included plan and subscription usage pools for Grok Bot, Cursor, and
related connected products before leaving capacity idle. Do not incur overage
charges, on-demand top-ups, or pay-as-you-go API-key fees for routine work
unless the operator explicitly approves that spend in advance.

Configure an on-demand monthly spend cap whenever a tool or platform supports
one. A fixed spend cap ensures that automated jobs halt predictably when an
included pool runs dry, avoiding silent top-up charges. In line with the generic
billing rule, never commit specific dollar amounts, credit numbers, or tier
names to repository files.

Align each task with its best cost lane to protect quotas:

- Route ordinary repository coding (features, bug fixes, refactors) to Cursor
  cloud coding agents within included Cursor pools.
- Route document drafting, prose reviews, and documentation maintenance to
  Antigravity CLI (`agy`) on its separate Gemini authentication lane whenever
  that lane has quota.
- Route tasks requiring local GPU (Apple Silicon Metal or MPS), intensive disk
  I/O, or offline inference to the registered local workstation, preventing
  cloud LLM token burn on non-LLM compute.
- Reserve Grok Bot for orchestration: short chats, connectors, status updates,
  and task handoffs. Keep heavy loops and unstructured media processing out of
  Grok conversation threads.

## 5. Minimize cloud token spend while maximizing useful outcomes

Select cost-effective models and write focused briefs to get the most value out
of every prompt:

- **Default agy to Gemini 3.8 Flash**: default documentation launches in `agy`
  to Gemini 3.8 Flash (`gemini-3.8-flash-medium`) unless the operator
  explicitly requests another model. Smaller, fast models handle iterative
  document edits and reviews with minimal quota use. Reserve larger or
  high-reasoning models for explicit operator instructions or complex design
  tasks.
- **Keep briefs narrow and self-contained**: define narrow deliverables,
  explicit constraints, and concrete success criteria in every brief. If a
  worker fails or hits a soft-deny, do not re-run the same brief blindly.
  Diagnose the cause, update the prompt or allow-list rules offline, and re-run
  only with corrected instructions.
- **Reuse prior facts and batch status collection**: embed paths, inventories,
  and log excerpts already known from parent chats into the brief rather than
  spending tokens asking the worker to rediscover them. Combine status and
  result collection into single batched checks rather than polling workers
  repeatedly.
- **Offload unstructured and multimodal media**: route image inspection, video
  analysis, large PDF review, and long logs to `agy` instead of passing large
  blobs through conversational chat tokens (see
  [Unstructured and multimodal offload](workstation-handoffs.md#unstructured-and-multimodal-offload)).

## 6. Run eligible heavy workloads locally and saturate workstation capacity

Route resource-heavy tasks to the registered local workstation (Apple Silicon
Metal and MPS, local disk, and local runtimes) rather than consuming cloud LLM
tokens on non-LLM compute. Light documentation and small pull requests stay on
Cursor cloud or Flash `agy`, while compute that benefits from Metal acceleration
or large local disk transfers belongs on the Mac.

### Workloads beyond training and simulation

Apple Silicon Metal acceleration and high-throughput local disk storage handle a
wide range of operational jobs beyond machine learning training and physics
simulations. Eligible non-training workloads include:

- **Video and image pipelines**: video frame extraction, video encoding, bulk
  thumbnail generation, and local vision or embedding passes.
- **Audio processing**: long-form audio transcription, noise filtering, and
  speaker separation using local models.
- **Local offline inference**: classification, extraction, or summarization
  using local MLX or GGUF models when cloud tokens should be conserved.
- **Large data transforms**: CSV and parquet conversions, bulk PDF text
  extraction, and repository corpus preprocessing.
- **Heavy local builds and test suites**: compiling native binaries, building
  multi-stage container images, or running integration test suites inside a
  lightweight local Linux virtual machine or container runtime (such as Colima).

### Saturate workstation CPU and GPU

When a workload is routed to the local workstation, saturate available CPU cores
and GPU (Metal / MPS) capacity aggressively rather than leaving compute idle
while cloud LLM tokens continue to burn elsewhere.

Follow these operational guidelines for local saturation:

- Configure batch sizes, thread concurrency, and worker pools to keep CPU and
  Metal engines busy throughout eligible pipeline runs.
- Balance throughput against thermal and power limits accepted by the operator.
- Avoid low-concurrency runs when a task was moved to the workstation specifically
  to conserve subscription tokens.
- Keep Grok Bot strictly in an orchestration role. Hardware saturation applies
  to the local compute job on the workstation, not to generating extra LLM
  calls.
- Enforce standard safety boundaries: confirm heavy launches on an
  operator-facing choice card, scope file writes to dedicated checkout roots
  (`~/agy-work` or `~/agent-work`), and stop immediately on permission denials
  without widening permissions mid-run.

## 7. Treat spend caps, lane shifts, and routine schedules as proposals

Propose routing and spend adjustments through a cost/ops bot or the
[monthly audit](monthly-audit.md) instead of applying ad hoc changes mid-month
(see
[Cost and ops changes start as proposals](shared-rules.md#14-cost-and-ops-changes-start-as-proposals)).
The operator decides which proposals to adopt:

1. **Move heavy loops off Grok Bot**: shift training, large document comparison,
   and bulk drafting loops onto the local workstation, `agy`, or Cursor as
   appropriate.
2. **Set an on-demand monthly spend cap**: when product billing settings support
   an on-demand or additional-usage cap, set a monthly limit so usage halts
   predictably after the included pool runs out instead of triggering silent
   top-ups.
3. **Prefer event-driven or daytime routines**: schedule recurring routines for
   hours when the operator can act (such as weekday daytime) or trigger them on
   concrete events. Avoid overnight routines that accumulate unread output.
