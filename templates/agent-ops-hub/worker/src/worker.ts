/**
 * Webhook, claim, and status handlers for a hub relay Worker.
 *
 * This file is a pattern, not a deployable entry point. A JobStore and a
 * GitHubGateway arrive through WorkerDeps so that storage and the GitHub API
 * client stay outside the template. Wire them in your own entry point.
 */

import {
  checkLaunchRepo,
  isAllowedActor,
  isAppSender,
  selectLane,
  type Lane,
  type LaunchConfig,
  type SenderInfo
} from "./config";
import { verifyBearer, verifyWebhookSignature } from "./security";

export interface Env extends LaunchConfig {
  WEBHOOK_SECRET: string;
  STATUS_PROXY_SHARED_SECRET: string;
}

export type JobState = "queued" | "running" | "done" | "error" | "soft-deny";

export interface Job {
  id: string;
  deliveryId: string;
  repo: string;
  issueNumber: number;
  lane: Lane;
  requestedBy: string;
  createdAt: number;
  state: JobState;
  agentId?: string;
}

/**
 * Storage contract. A single-writer Durable Object is a good fit because the
 * per-Issue lock and the claim path need one consistent view.
 */
export interface JobStore {
  beginDelivery(deliveryId: string): Promise<{ duplicate: boolean }>;
  beginLaunch(
    job: Job
  ): Promise<{ ok: true } | { ok: false; reason: string }>;
  commitLaunch(jobId: string): Promise<void>;
  abortLaunch(jobId: string): Promise<void>;
  claimNext(agentId: string): Promise<Job | null>;
  releaseClaim(jobId: string): Promise<void>;
  getJob(jobId: string): Promise<Job | null>;
  finish(jobId: string, state: JobState): Promise<void>;
}

/**
 * GitHub contract. Every method mints or reuses a short-lived installation
 * token in your implementation. The template never stores a token.
 */
export interface GitHubGateway {
  removeTriggerLabel(repo: string, issueNumber: number): Promise<boolean>;
  getIssueLabels(repo: string, issueNumber: number): Promise<string[] | null>;
  setStatusLabel(
    repo: string,
    issueNumber: number,
    label: string
  ): Promise<boolean>;
  createComment(
    repo: string,
    issueNumber: number,
    body: string
  ): Promise<boolean>;
}

export interface WorkerDeps {
  store: JobStore;
  github: GitHubGateway;
}

const MAX_BODY_BYTES = 1_000_000;
const PROXY_STATUSES = ["running", "done", "error", "soft-deny"] as const;
const STATUS_REQUEST_KEYS = new Set([
  "jobId",
  "status",
  "pid",
  "logPath",
  "prUrl",
  "softDenyCommand",
  "softDenyReason"
]);

type ProxyStatus = (typeof PROXY_STATUSES)[number];

interface WebhookPayload {
  action?: unknown;
  repository?: { full_name?: unknown };
  sender?: { login?: unknown; type?: unknown };
  label?: { name?: unknown };
  issue?: {
    number?: unknown;
    labels?: Array<string | { name?: unknown }> | unknown;
  };
}

function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

function empty(status: number): Response {
  return new Response(null, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/** Audit fields are identifiers only. Never add a body, token, or log. */
function audit(event: string, fields: Record<string, unknown>): void {
  console.log(JSON.stringify({ event, ...fields }));
}

function ignored(
  reason: string,
  details: Record<string, unknown> = {}
): Response {
  audit("webhook.ignored", { reason, ...details });
  return json({ ok: true, ignored: reason }, 202);
}

function issueLabels(labels: unknown): string[] {
  if (!Array.isArray(labels)) {
    return [];
  }
  const out: string[] = [];
  for (const item of labels) {
    if (typeof item === "string") {
      out.push(item);
    } else if (isRecord(item) && typeof item.name === "string") {
      out.push(item.name);
    }
  }
  return out;
}

async function readJsonBody(
  request: Request
): Promise<{ ok: true; value: unknown } | { ok: false; response: Response }> {
  const text = await request.text();
  if (text.length > MAX_BODY_BYTES) {
    return { ok: false, response: json({ error: "payload too large" }, 413) };
  }
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, response: json({ error: "invalid json" }, 400) };
  }
}

const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

const SECRET_PATTERNS: RegExp[] = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/,
  /op:\/\//i,
  /\bbearer\s+[A-Za-z0-9._~+/=-]{8,}/i
];

function looksLikeSecret(value: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(value));
}

function cleanFact(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) {
    return null;
  }
  if (CONTROL_CHARACTERS.test(trimmed) || looksLikeSecret(trimmed)) {
    return null;
  }
  return trimmed;
}

function cleanPid(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }
  if (value < 1 || value > 4_194_304) {
    return null;
  }
  return value;
}

function cleanLogPath(value: unknown): string | null {
  const cleaned = cleanFact(value, 512);
  if (!cleaned) {
    return null;
  }
  if (!cleaned.startsWith("/") && !cleaned.startsWith("~/")) {
    return null;
  }
  return cleaned;
}

function cleanPrUrl(value: unknown): string | null {
  const cleaned = cleanFact(value, 300);
  if (!cleaned) {
    return null;
  }
  const shape =
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/[0-9]+$/;
  return shape.test(cleaned) ? cleaned : null;
}

function buildStatusComment(facts: {
  pid?: number;
  logPath?: string;
  prUrl?: string;
  softDenyCommand?: string;
  softDenyReason?: string;
}): string | null {
  const lines: string[] = [];
  if (facts.pid !== undefined) {
    lines.push(`PID: ${facts.pid}`);
  }
  if (facts.logPath !== undefined) {
    lines.push(`Log: ${facts.logPath}`);
  }
  if (facts.prUrl !== undefined) {
    lines.push(`PR: ${facts.prUrl}`);
  }
  if (facts.softDenyCommand !== undefined) {
    lines.push(`Soft-deny: ${facts.softDenyCommand}`);
  }
  if (facts.softDenyReason !== undefined) {
    lines.push(`Reason: ${facts.softDenyReason}`);
  }
  return lines.length > 0 ? lines.join("\n") : null;
}

async function handleWebhook(
  request: Request,
  env: Env,
  deps: WorkerDeps
): Promise<Response> {
  const lengthHeader = request.headers.get("content-length");
  if (lengthHeader) {
    const length = Number(lengthHeader);
    if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
      return json({ error: "payload too large" }, 413);
    }
  }
  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return json({ error: "payload too large" }, 413);
  }

  const signature = request.headers.get("x-hub-signature-256");
  const signatureResult = await verifyWebhookSignature(
    rawBody,
    env.WEBHOOK_SECRET,
    signature
  );
  if (signatureResult !== "ok") {
    audit("webhook.signature_rejected", { reason: signatureResult });
    return json(
      {
        error:
          signatureResult === "missing"
            ? "missing signature"
            : "invalid signature"
      },
      signatureResult === "missing" ? 401 : 403
    );
  }

  const deliveryId = request.headers.get("x-github-delivery");
  if (!deliveryId || !/^[A-Za-z0-9-]{1,100}$/.test(deliveryId)) {
    return json({ error: "invalid delivery id" }, 400);
  }

  const dedupe = await deps.store.beginDelivery(deliveryId);
  if (dedupe.duplicate) {
    audit("webhook.duplicate", { delivery: deliveryId });
    return json({ ok: true, duplicate: true }, 200);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody) as unknown;
  } catch {
    return json({ error: "invalid json" }, 400);
  }
  if (!isRecord(parsed)) {
    return json({ error: "invalid payload" }, 400);
  }
  const payload = parsed as WebhookPayload;

  const event = request.headers.get("x-github-event") ?? "unknown";
  const action = stringValue(payload.action);
  if (event === "ping") {
    return ignored("ping", { delivery: deliveryId });
  }
  if (event !== "issues" && event !== "issue_comment") {
    return ignored("event-not-subscribed", { delivery: deliveryId, event });
  }

  const repo = stringValue(payload.repository?.full_name);
  if (!repo) {
    return ignored("missing-repository", { delivery: deliveryId, event });
  }
  const repoDecision = checkLaunchRepo(env, repo);
  if (!repoDecision.allowed) {
    return ignored(repoDecision.reason, {
      delivery: deliveryId,
      event,
      repo
    });
  }

  const sender: SenderInfo = {
    login: stringValue(payload.sender?.login),
    type: stringValue(payload.sender?.type)
  };
  if (isAppSender(env, sender)) {
    return ignored("app-loop", {
      delivery: deliveryId,
      event,
      action,
      actor: sender.login
    });
  }
  if (event === "issue_comment") {
    return ignored("issue-comment-noop", {
      delivery: deliveryId,
      actor: sender.login
    });
  }
  if (action !== "labeled") {
    return ignored("action-not-labeled", {
      delivery: deliveryId,
      action
    });
  }
  const labelName = stringValue(payload.label?.name)?.trim().toLowerCase();
  if (labelName !== "trigger-run") {
    return ignored("label-not-trigger", {
      delivery: deliveryId,
      actor: sender.login
    });
  }
  if (!isAllowedActor(env, sender)) {
    return ignored("actor-not-allowed", {
      delivery: deliveryId,
      actor: sender.login
    });
  }

  const issueNumber = payload.issue?.number;
  if (
    typeof issueNumber !== "number" ||
    !Number.isInteger(issueNumber) ||
    issueNumber < 1
  ) {
    return ignored("missing-issue", { delivery: deliveryId });
  }

  const labels = issueLabels(payload.issue?.labels);
  if (labels.includes("status-running")) {
    return ignored("status-running", {
      delivery: deliveryId,
      repo,
      issue: issueNumber
    });
  }

  const laneDecision = selectLane(labels);
  if (!laneDecision.ok) {
    return ignored(laneDecision.reason, {
      delivery: deliveryId,
      repo,
      issue: issueNumber
    });
  }

  const job: Job = {
    id: crypto.randomUUID(),
    deliveryId,
    repo,
    issueNumber,
    lane: laneDecision.lane,
    requestedBy: sender.login ?? "unknown",
    createdAt: Date.now(),
    state: "queued"
  };

  const begin = await deps.store.beginLaunch(job);
  if (!begin.ok) {
    return ignored(begin.reason, {
      delivery: deliveryId,
      repo,
      issue: issueNumber
    });
  }

  const removed = await deps.github.removeTriggerLabel(repo, issueNumber);
  if (!removed) {
    await deps.store.abortLaunch(job.id);
    audit("launch.trigger_remove_failed", {
      delivery: deliveryId,
      repo,
      issue: issueNumber,
      job: job.id
    });
    return json({ error: "could not remove trigger-run" }, 502);
  }

  await deps.store.commitLaunch(job.id);
  try {
    await deps.github.setStatusLabel(repo, issueNumber, "status-waiting");
  } catch {
    audit("launch.status_waiting_failed", { job: job.id });
  }

  audit("launch.queued", {
    delivery: deliveryId,
    repo,
    issue: issueNumber,
    actor: job.requestedBy,
    lane: job.lane,
    job: job.id
  });
  return json({ ok: true, jobId: job.id }, 202);
}

async function handleClaim(
  request: Request,
  env: Env,
  deps: WorkerDeps
): Promise<Response> {
  const authorized = await verifyBearer(
    request.headers.get("authorization"),
    env.STATUS_PROXY_SHARED_SECRET
  );
  if (!authorized) {
    audit("claim.unauthorized", {});
    return json({ error: "unauthorized" }, 401);
  }

  const agentId =
    cleanFact(request.headers.get("x-agent-id"), 100) ?? "unknown";
  const job = await deps.store.claimNext(agentId);
  if (!job) {
    return empty(204);
  }

  const labels = await deps.github.getIssueLabels(job.repo, job.issueNumber);
  if (labels === null) {
    await deps.store.releaseClaim(job.id);
    audit("claim.labels_failed", { job: job.id });
    return json({ error: "github labels unavailable" }, 502);
  }
  if (labels.includes("status-running")) {
    await deps.store.releaseClaim(job.id);
    audit("claim.rejected_status_running", { job: job.id });
    return json({ error: "status-running" }, 409);
  }

  const running = await deps.github.setStatusLabel(
    job.repo,
    job.issueNumber,
    "status-running"
  );
  if (!running) {
    await deps.store.releaseClaim(job.id);
    audit("claim.status_label_failed", { job: job.id });
    return json({ error: "could not set status-running" }, 502);
  }

  audit("claim.accepted", {
    job: job.id,
    repo: job.repo,
    issue: job.issueNumber,
    lane: job.lane,
    agent: agentId
  });
  return json({
    job: {
      jobId: job.id,
      repo: job.repo,
      issueNumber: job.issueNumber,
      lane: job.lane,
      requestedBy: job.requestedBy,
      createdAt: job.createdAt
    }
  });
}

async function handleStatus(
  request: Request,
  env: Env,
  deps: WorkerDeps
): Promise<Response> {
  const authorized = await verifyBearer(
    request.headers.get("authorization"),
    env.STATUS_PROXY_SHARED_SECRET
  );
  if (!authorized) {
    audit("status.unauthorized", {});
    return json({ error: "unauthorized" }, 401);
  }

  const parsed = await readJsonBody(request);
  if (!parsed.ok) {
    return parsed.response;
  }
  if (!isRecord(parsed.value)) {
    return json({ error: "invalid body" }, 400);
  }
  for (const key of Object.keys(parsed.value)) {
    if (!STATUS_REQUEST_KEYS.has(key)) {
      return json({ error: `unknown field: ${key}` }, 400);
    }
  }

  const jobId = parsed.value.jobId;
  if (typeof jobId !== "string" || !/^[0-9a-f-]{36}$/i.test(jobId)) {
    return json({ error: "invalid jobId" }, 400);
  }
  const statusValue = parsed.value.status;
  if (
    typeof statusValue !== "string" ||
    !PROXY_STATUSES.includes(statusValue as ProxyStatus)
  ) {
    return json({ error: "invalid status" }, 400);
  }
  const status = statusValue as ProxyStatus;

  let pid: number | undefined;
  if (parsed.value.pid !== undefined) {
    const cleaned = cleanPid(parsed.value.pid);
    if (cleaned === null) {
      return json({ error: "invalid pid" }, 422);
    }
    pid = cleaned;
  }

  let logPath: string | undefined;
  if (parsed.value.logPath !== undefined) {
    const cleaned = cleanLogPath(parsed.value.logPath);
    if (cleaned === null) {
      return json({ error: "invalid logPath" }, 422);
    }
    logPath = cleaned;
  }

  let prUrl: string | undefined;
  if (parsed.value.prUrl !== undefined) {
    const cleaned = cleanPrUrl(parsed.value.prUrl);
    if (cleaned === null) {
      return json({ error: "invalid prUrl" }, 422);
    }
    prUrl = cleaned;
  }

  let softDenyCommand: string | undefined;
  if (parsed.value.softDenyCommand !== undefined) {
    const cleaned = cleanFact(parsed.value.softDenyCommand, 300);
    if (cleaned === null) {
      return json({ error: "invalid softDenyCommand" }, 422);
    }
    softDenyCommand = cleaned;
  }

  let softDenyReason: string | undefined;
  if (parsed.value.softDenyReason !== undefined) {
    const cleaned = cleanFact(parsed.value.softDenyReason, 300);
    if (cleaned === null) {
      return json({ error: "invalid softDenyReason" }, 422);
    }
    softDenyReason = cleaned;
  }

  if (status === "soft-deny") {
    if (!softDenyCommand || !softDenyReason) {
      return json({ error: "soft-deny needs command and reason" }, 422);
    }
  } else if (softDenyCommand || softDenyReason) {
    return json(
      { error: "soft-deny fields require soft-deny status" },
      422
    );
  }

  const job = await deps.store.getJob(jobId);
  if (!job) {
    return json({ error: "job not found" }, 404);
  }
  if (job.state !== "running") {
    return json({ error: "job is not running" }, 409);
  }

  const label =
    status === "soft-deny" ? "status-soft-deny" : `status-${status}`;
  const labelSet = await deps.github.setStatusLabel(
    job.repo,
    job.issueNumber,
    label
  );
  if (!labelSet) {
    audit("status.label_failed", { job: jobId, status });
    return json({ error: "could not set status label" }, 502);
  }

  const comment = buildStatusComment({
    pid,
    logPath,
    prUrl,
    softDenyCommand,
    softDenyReason
  });
  let commentPosted = false;
  if (comment) {
    const posted = await deps.github.createComment(
      job.repo,
      job.issueNumber,
      comment
    );
    if (!posted) {
      audit("status.comment_failed", { job: jobId, status });
      return json({ error: "could not post comment" }, 502);
    }
    commentPosted = true;
  }

  if (status !== "running") {
    await deps.store.finish(jobId, status);
  }

  audit("status.update", {
    job: jobId,
    repo: job.repo,
    issue: job.issueNumber,
    status,
    comment: commentPosted
  });
  return json({ ok: true, status, commentPosted });
}

export async function handleRequest(
  request: Request,
  env: Env,
  deps: WorkerDeps
): Promise<Response> {
  const url = new URL(request.url);
  try {
    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true });
    }
    if (request.method === "POST" && url.pathname === "/github/webhook") {
      return await handleWebhook(request, env, deps);
    }
    if (request.method === "POST" && url.pathname === "/v1/claim") {
      return await handleClaim(request, env, deps);
    }
    if (request.method === "POST" && url.pathname === "/v1/status") {
      return await handleStatus(request, env, deps);
    }
    if (
      url.pathname === "/github/webhook" ||
      url.pathname === "/v1/claim" ||
      url.pathname === "/v1/status"
    ) {
      return json({ error: "method not allowed" }, 405, { Allow: "POST" });
    }
    return json({ error: "not found" }, 404);
  } catch (error) {
    audit("request.error", {
      reason: error instanceof Error ? error.name : "unknown"
    });
    return json({ error: "internal error" }, 500);
  }
}

/**
 * Build the Worker handler. Your entry point calls this with a concrete
 * JobStore and GitHubGateway, then exports the result as `default`.
 */
export function createWorker(deps: WorkerDeps) {
  return {
    fetch(request: Request, env: Env): Promise<Response> {
      return handleRequest(request, env, deps);
    }
  };
}
