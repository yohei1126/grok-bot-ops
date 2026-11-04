export interface LaunchConfig {
  GITHUB_APP_SLUG?: string;
  ALLOWED_ACTORS?: string;
  HUB_REPO: string;
  IGNORED_LAUNCH_REPOS?: string;
}

export interface SenderInfo {
  login?: string;
  type?: string;
}

export type Lane = "lane-agy-docs" | "lane-agent-local";

export function parseCsv(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item.length > 0);
}

export function isAllowedActor(
  config: LaunchConfig,
  sender: SenderInfo
): boolean {
  if (sender.type === "Bot") {
    return false;
  }
  const login = sender.login?.trim().toLowerCase();
  if (!login) {
    return false;
  }
  return parseCsv(config.ALLOWED_ACTORS).includes(login);
}

export function isAppSender(
  config: LaunchConfig,
  sender: SenderInfo
): boolean {
  if (sender.type !== "Bot") {
    return false;
  }
  const slug = config.GITHUB_APP_SLUG?.trim().toLowerCase();
  const login = sender.login?.trim().toLowerCase();
  if (!slug || !login) {
    return false;
  }
  return login === `${slug}[bot]`;
}

export type RepoDecision =
  | { allowed: true }
  | { allowed: false; reason: "public-repo" | "repo-not-allowed" };

export function checkLaunchRepo(
  config: LaunchConfig,
  repo: string
): RepoDecision {
  const target = repo.trim().toLowerCase();
  if (target === config.HUB_REPO.trim().toLowerCase()) {
    return { allowed: true };
  }
  if (parseCsv(config.IGNORED_LAUNCH_REPOS).includes(target)) {
    return { allowed: false, reason: "public-repo" };
  }
  return { allowed: false, reason: "repo-not-allowed" };
}

export type LaneDecision =
  | { ok: true; lane: Lane }
  | {
      ok: false;
      reason: "lane-missing" | "lane-ambiguous" | "lane-not-supported";
    };

const SUPPORTED_LANES: Lane[] = ["lane-agy-docs", "lane-agent-local"];
const UNSUPPORTED_LANES = ["lane-cursor-cloud"];

export function selectLane(labels: string[]): LaneDecision {
  const normalized = labels.map((label) => label.trim().toLowerCase());
  const supported = SUPPORTED_LANES.filter((lane) =>
    normalized.includes(lane)
  );
  if (supported.length > 1) {
    return { ok: false, reason: "lane-ambiguous" };
  }
  if (supported.length === 1) {
    return { ok: true, lane: supported[0] };
  }
  if (UNSUPPORTED_LANES.some((lane) => normalized.includes(lane))) {
    return { ok: false, reason: "lane-not-supported" };
  }
  return { ok: false, reason: "lane-missing" };
}
