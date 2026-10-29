#!/usr/bin/env bash
# Collect status, git state, open pull requests, and recent log tails for a
# headless Antigravity CLI (agy -p) documentation run in one shell call.
#
# Usage:
#   scripts/agy-docs-collect.sh <repo> [log-stem]
#
# Safety properties:
# - Read-only inspection only (process table, git status/log, gh pr list, log
#   tails).
# - Rejects <repo> values that are not a single directory basename under
#   $HOME/agy-work/<repo>.
# - Never mutates git state, GitHub state, or Antigravity settings.

set -euo pipefail

usage() {
  cat >&2 <<'EOF'
Usage: scripts/agy-docs-collect.sh <repo> [log-stem]

Arguments:
  <repo>      Repository directory basename under $HOME/agy-work/<repo>
  [log-stem]  Optional log/PID stem under $HOME/agy-inbox/ (defaults to newest .pid)
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

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 2
fi

repo="$1"
stem="${2:-}"

validate_token "repository name" "$repo"

work_root="$HOME/agy-work"
inbox_root="$HOME/agy-inbox"

if [[ ! -d "$work_root" ]]; then
  printf 'Error: work root missing at %s\n' "$work_root" >&2
  exit 1
fi

work_root_real="$(resolve_path "$work_root")"
checkout_dir="$work_root/$repo"

if [[ ! -d "$checkout_dir" ]]; then
  printf 'Error: checkout directory missing at %s\n' "$checkout_dir" >&2
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

if [[ -z "$stem" && -d "$inbox_root" ]]; then
  newest_pid_file="$(ls -t "$inbox_root"/*.pid 2>/dev/null | head -n 1 || true)"
  if [[ -n "$newest_pid_file" ]]; then
    pid_base="$(basename -- "$newest_pid_file")"
    stem="${pid_base%.pid}"
  fi
fi

if [[ -n "$stem" ]]; then
  validate_token "log stem" "$stem"
fi

echo "=== AGY PROCESS STATUS ==="
if [[ -n "$stem" && -f "$inbox_root/$stem.pid" ]]; then
  pid_file="$inbox_root/$stem.pid"
  agy_pid="$(tr -d '[:space:]' <"$pid_file" || true)"
  if [[ -n "$agy_pid" ]] && kill -0 "$agy_pid" 2>/dev/null; then
    printf 'STATUS=RUNNING PID=%s STEM=%s PID_FILE=%s\n' "$agy_pid" "$stem" "$pid_file"
    ps -p "$agy_pid" -o pid=,stat=,etime=,command= || true
  else
    printf 'STATUS=EXITED PID=%s STEM=%s PID_FILE=%s\n' "${agy_pid:-unknown}" "$stem" "$pid_file"
  fi
else
  printf 'STATUS=NO_PID_FILE STEM=%s\n' "${stem:-none}"
  pgrep -fl "agy.*$repo" || echo "No matching agy process found via pgrep."
fi

echo
echo "=== GIT BRANCH & STATUS ($checkout_dir) ==="
git -C "$checkout_dir" rev-parse --abbrev-ref HEAD
git -C "$checkout_dir" status -sb

echo
echo "=== LAST 3 COMMITS ==="
git -C "$checkout_dir" log -n 3 --oneline --decorate

echo
echo "=== OPEN PULL REQUESTS (LIMIT 5) ==="
if command -v gh >/dev/null 2>&1; then
  (cd "$checkout_dir" && gh pr list --state open --limit 5) || echo "Warning: gh pr list failed."
else
  echo "Warning: gh CLI not found on PATH."
fi

if [[ -n "$stem" ]]; then
  stdout_log="$inbox_root/$stem-stdout.log"
  stderr_log="$inbox_root/$stem-stderr.log"

  echo
  printf '=== STDOUT LOG (LAST 80 LINES: %s) ===\n' "$stdout_log"
  if [[ -f "$stdout_log" ]]; then
    tail -n 80 "$stdout_log"
  else
    echo "(stdout log file not found)"
  fi

  echo
  printf '=== STDERR LOG (LAST 80 LINES: %s) ===\n' "$stderr_log"
  if [[ -f "$stderr_log" ]]; then
    tail -n 80 "$stderr_log"
  else
    echo "(stderr log file not found)"
  fi
else
  echo
  echo "=== LOGS ==="
  echo "No log stem provided or discovered under $inbox_root."
fi
