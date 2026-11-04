import { spawn } from "node:child_process";
import { closeSync, openSync } from "node:fs";
import path from "node:path";

export type MacLane = "lane-agy-docs" | "lane-agent-local";

/** The only checkout roots. `<repo>` is added as one path segment. */
export const LANE_ROOTS: Record<MacLane, string> = {
  "lane-agy-docs": "agy-work",
  "lane-agent-local": "agent-work"
};

/** Briefs and logs live outside every checkout root. */
export const STATE_DIR_NAME = ".agent-ops";

const OWNER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,38}$/;
const NAME_PATTERN = /^[A-Za-z0-9._-]{1,100}$/;
const JOB_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function macLane(value: string): MacLane | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === "lane-agy-docs" || normalized === "lane-agent-local") {
    return normalized;
  }
  return null;
}

/**
 * Return the name segment of `owner/repo`, or null.
 *
 * The name must be one safe path segment. `.`, `..`, a leading dash, and a
 * separator are rejected so the result cannot climb out of a checkout root.
 */
export function repoSegment(repo: string): string | null {
  if (typeof repo !== "string" || repo.length === 0 || repo.length > 140) {
    return null;
  }
  const parts = repo.split("/");
  if (parts.length !== 2) {
    return null;
  }
  const owner = parts[0];
  const name = parts[1];
  if (!owner || !name) {
    return null;
  }
  if (!OWNER_PATTERN.test(owner) || !NAME_PATTERN.test(name)) {
    return null;
  }
  if (
    name === "." ||
    name === ".." ||
    name.startsWith("-") ||
    name.includes("..")
  ) {
    return null;
  }
  return name;
}

export type CheckoutResult =
  | {
      ok: true;
      lane: MacLane;
      repoName: string;
      root: string;
      dir: string;
    }
  | {
      ok: false;
      reason:
        | "lane-not-supported"
        | "invalid-repo"
        | "invalid-home"
        | "path-outside-root";
    };

/**
 * Build the checkout directory for a claimed job.
 *
 * Two checks must pass: the repo name is one safe segment, and the resolved
 * directory is a direct child of the lane root.
 */
export function planCheckout(
  lane: string,
  repo: string,
  home: string
): CheckoutResult {
  const mac = macLane(lane);
  if (!mac) {
    return { ok: false, reason: "lane-not-supported" };
  }
  if (typeof home !== "string" || !path.isAbsolute(home)) {
    return { ok: false, reason: "invalid-home" };
  }
  const repoName = repoSegment(repo);
  if (!repoName) {
    return { ok: false, reason: "invalid-repo" };
  }
  const root = path.resolve(home, LANE_ROOTS[mac]);
  const dir = path.resolve(root, repoName);
  const relative = path.relative(root, dir);
  if (
    relative !== repoName ||
    relative.includes(path.sep) ||
    relative.startsWith("..")
  ) {
    return { ok: false, reason: "path-outside-root" };
  }
  return { ok: true, lane: mac, repoName, root, dir };
}

export interface JobPaths {
  dir: string;
  brief: string;
  log: string;
}

export function jobPaths(home: string, jobId: string): JobPaths | null {
  if (typeof home !== "string" || !path.isAbsolute(home)) {
    return null;
  }
  if (typeof jobId !== "string" || !JOB_ID_PATTERN.test(jobId)) {
    return null;
  }
  const base = path.resolve(home, STATE_DIR_NAME, "jobs");
  const dir = path.resolve(base, jobId);
  if (path.relative(base, dir) !== jobId) {
    return null;
  }
  return {
    dir,
    brief: path.join(dir, "brief.md"),
    log: path.join(dir, "job.log")
  };
}

const LANE_COMMANDS: Record<MacLane, readonly string[]> = {
  "lane-agy-docs": ["agy", "--mode", "accept-edits"],
  "lane-agent-local": ["agent", "--trust"]
};

const BRIEF_FLAG: Record<
  MacLane,
  { flag: string; promptIsValue: boolean }
> = {
  "lane-agy-docs": { flag: "--print", promptIsValue: true },
  "lane-agent-local": { flag: "-p", promptIsValue: false }
};

/**
 * Build a fixed argument vector. The prompt names the brief file by a path
 * relative to the child working directory. Absolute paths are rejected so
 * argv never carries the home layout. The Issue body is never part of this
 * string.
 */
export function buildArgv(lane: MacLane, briefFile: string): string[] {
  const base = LANE_COMMANDS[lane];
  const print = BRIEF_FLAG[lane];
  if (!Array.isArray(base) || base.length === 0 || !print) {
    throw new Error(`no command for lane ${lane}`);
  }
  if (
    typeof briefFile !== "string" ||
    briefFile.length === 0 ||
    path.isAbsolute(briefFile) ||
    briefFile.startsWith("/") ||
    briefFile.length > 512 ||
    /[\u0000-\u001f\u007f]/.test(briefFile)
  ) {
    throw new Error("brief path must be a relative single-line path");
  }
  const prompt = `Read the job brief at ${briefFile} and carry it out.`;
  if (print.promptIsValue) {
    return [...base, `${print.flag}=${prompt}`];
  }
  return [...base, print.flag, prompt];
}

/** Remove launcher credentials before a child process sees the environment. */
export function childEnv(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const copy = { ...env };
  delete copy.STATUS_PROXY_SHARED_SECRET;
  delete copy.WEBHOOK_SECRET;
  delete copy.GITHUB_APP_PRIVATE_KEY;
  return copy;
}

function closeQuietly(fd: number): void {
  try {
    closeSync(fd);
  } catch {
    // The descriptor is already closed.
  }
}

/**
 * Start one process with no shell. The child writes to the job log and
 * inherits nothing else on stdin.
 */
export function startProcess(params: {
  argv: readonly string[];
  cwd: string;
  logFile: string;
  env?: NodeJS.ProcessEnv;
}): { pid: number; wait: Promise<number | null> } {
  const [command, ...args] = params.argv;
  if (!command) {
    throw new Error("empty argv");
  }
  const fd = openSync(params.logFile, "a", 0o600);
  const child = spawn(command, args, {
    cwd: params.cwd,
    shell: false,
    detached: false,
    stdio: ["ignore", fd, fd],
    env: childEnv(params.env ?? process.env)
  });
  const wait = new Promise<number | null>((resolve) => {
    child.on("error", () => {
      closeQuietly(fd);
      resolve(null);
    });
    child.on("exit", (code) => {
      closeQuietly(fd);
      resolve(code);
    });
  });
  if (typeof child.pid !== "number" || child.pid < 1) {
    closeQuietly(fd);
    throw new Error(`could not start ${command}`);
  }
  return { pid: child.pid, wait };
}
