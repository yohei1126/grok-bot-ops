#!/usr/bin/env bash
# Launch a headless Antigravity CLI (agy -p) documentation worker in the
# background under the fixed $HOME/agy-work/<repo> checkout root.
#
# Usage:
#   scripts/agy-docs-launch.sh <repo> <brief-path> [log-stem]
#
# Safety properties:
# - Requires <repo> to be a single directory basename (no slashes or '..').
# - Requires $HOME/agy-work/<repo> to exist already and resolve inside the
#   realpath of $HOME/agy-work.
# - Requires <brief-path> to exist and resolve inside the realpath of
#   $HOME/agy-inbox/.
# - Writes logs and a PID file under $HOME/agy-inbox/.
# - Never passes --dangerously-skip-permissions or alters Antigravity settings.

set -euo pipefail

usage() {
  cat >&2 <<'EOF'
Usage: scripts/agy-docs-launch.sh <repo> <brief-path> [log-stem]

Arguments:
  <repo>        Repository directory basename under $HOME/agy-work/<repo>
  <brief-path>  Readable brief file under $HOME/agy-inbox/
  [log-stem]    Optional log/PID filename stem (defaults to brief basename)
EOF
}

resolve_path() {
  local target="$1"
  if command -v realpath >/dev/null 2>&1; then
    realpath "$target"
  elif [[ -d "$target" ]]; then
    (cd -P -- "$target" && pwd -P)
  else
    local dir
    dir="$(cd -P -- "$(dirname -- "$target")" && pwd -P)"
    printf '%s/%s\n' "$dir" "$(basename -- "$target")"
  fi
}

validate_token() {
  local label="$1"
  local value="$2"
  if [[ -z "$value" || "$value" == "." || "$value" == ".." || "$value" == *"/"* || "$value" == *".."* || "$value" == -* || "$value" != "$(basename -- "$value")" ]]; then
    printf 'Error: invalid %s %q (must be a plain basename without slashes or "..").\n' "$label" "$value" >&2
    exit 2
  fi
}

if [[ $# -lt 2 || $# -gt 3 ]]; then
  usage
  exit 2
fi

repo="$1"
brief_input="$2"
stem_input="${3:-}"

validate_token "repository name" "$repo"

if ! command -v agy >/dev/null 2>&1; then
  echo "Error: 'agy' binary not found on PATH." >&2
  exit 1
fi

work_root="$HOME/agy-work"
inbox_root="$HOME/agy-inbox"
mkdir -p "$work_root" "$inbox_root"

work_root_real="$(resolve_path "$work_root")"
inbox_root_real="$(resolve_path "$inbox_root")"

checkout_dir="$work_root/$repo"
if [[ ! -d "$checkout_dir" ]]; then
  printf 'Error: checkout directory missing at %s. Clone the repository under %s first.\n' "$checkout_dir" "$checkout_dir" >&2
  exit 1
fi

checkout_real="$(resolve_path "$checkout_dir")"
case "$checkout_real" in
  "$work_root_real"/*) ;;
  *)
    printf 'Error: checkout path %s resolves outside %s.\n' "$checkout_real" "$work_root_real" >&2
    exit 1
    ;;
esac

if [[ ! -f "$brief_input" || ! -r "$brief_input" ]]; then
  printf 'Error: brief file missing or unreadable: %s\n' "$brief_input" >&2
  exit 1
fi

brief_real="$(resolve_path "$brief_input")"
case "$brief_real" in
  "$inbox_root_real"/*) ;;
  *)
    printf 'Error: brief path %s resolves outside %s/.\n' "$brief_real" "$inbox_root_real" >&2
    exit 1
    ;;
esac

if [[ -n "$stem_input" ]]; then
  stem="$stem_input"
else
  brief_base="$(basename -- "$brief_real")"
  stem="${brief_base%.*}"
  if [[ -z "$stem" ]]; then
    stem="$brief_base"
  fi
fi

validate_token "log stem" "$stem"

pid_file="$inbox_root/$stem.pid"
stdout_log="$inbox_root/$stem-stdout.log"
stderr_log="$inbox_root/$stem-stderr.log"

if [[ -f "$pid_file" ]]; then
  existing_pid="$(tr -d '[:space:]' <"$pid_file" || true)"
  if [[ -n "$existing_pid" ]] && kill -0 "$existing_pid" 2>/dev/null; then
    printf 'Error: existing agy process (PID %s) from %s is still running.\n' "$existing_pid" "$pid_file" >&2
    exit 1
  fi
fi

nohup agy --project "$HOME/agy-work/$repo" -p "$(cat "$brief_real")" >"$stdout_log" 2>"$stderr_log" </dev/null &
agy_pid=$!
printf '%s\n' "$agy_pid" >"$pid_file"

printf 'AGY_PID=%s\n' "$agy_pid"
printf 'PID_FILE=%s\n' "$pid_file"
printf 'STDOUT_LOG=%s\n' "$stdout_log"
printf 'STDERR_LOG=%s\n' "$stderr_log"
