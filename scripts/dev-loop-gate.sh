#!/usr/bin/env bash
# Thin local gate table for templates/dev-loop. No network, no secrets.
# Prints one status per gate: PASS, FAIL, SKIP, JUDGE, or QUIET.
# Exit 1 only on a hard preflight miss (G1). Otherwise exit 0.
set -u

expected_branch="${DEV_LOOP_BRANCH:-}"
alias_name="${DEV_LOOP_ALIAS:-}"
required_path="${DEV_LOOP_REQUIRED_PATH:-}"
soft_deny_count="${DEV_LOOP_SOFT_DENY_COUNT:-0}"
model_lane="${DEV_LOOP_MODEL_LANE:-grok}"
diff_kind="${DEV_LOOP_DIFF_KIND:-other}"
pr_state="${DEV_LOOP_PR_STATE:-draft}"
operator_ready="${DEV_LOOP_OPERATOR_READY:-false}"
vuln_silent="${DEV_LOOP_VULN_SILENT:-false}"
retro_marker="${DEV_LOOP_RETRO_MARKER:-absent}"
open_jobs="${DEV_LOOP_OPEN_JOBS:-1}"
open_prs="${DEV_LOOP_OPEN_PRS:-1}"

for name in soft_deny_count open_jobs open_prs; do
  value="${!name}"
  case "$value" in ''|*[!0-9]*) printf -v "$name" '%s' 0 ;; esac
done

status=0
row() { printf '%-4s %-30s %-6s %s\n' "$1" "$2" "$3" "$4"; }
row Gate Name Status Action
row ---- ------------------------------ ------ ------
branch_now="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || printf 'unknown')"
g1=PASS; g1_action="Continue."
if [ -n "$expected_branch" ] && [ "$branch_now" != "$expected_branch" ]; then
  g1=FAIL; g1_action="Do not start; branch is $branch_now. One-line FYI."
elif [ -n "$alias_name" ] && [ ! -d "$HOME/agy-work/$alias_name" ]; then
  g1=FAIL; g1_action="Do not start; checkout path missing. One-line FYI."
elif [ -n "$required_path" ] && [ ! -e "$required_path" ]; then
  g1=FAIL; g1_action="Do not start; required path missing. One-line FYI."
elif [ "$open_jobs" -gt 1 ] || [ "$open_prs" -gt 1 ]; then
  g1=FAIL; g1_action="Do not start; worktree lock needs 1 PR / 1 Issue per job."
fi
[ "$g1" = FAIL ] && status=1
row G1 "checkout + worktree lock" "$g1" "$g1_action"
if [ "$soft_deny_count" -lt 2 ] || [ "${model_lane#opencode}" != "$model_lane" ]; then
  g2=PASS; g2_action="Continue."
else
  g2=FAIL; g2_action="Switch to OpenCode Flash; never widen Allow."
fi
row G2 "soft-deny" "$g2" "$g2_action"
if [ "$diff_kind" = "lock_and_constraint" ]; then
  g3=SKIP; g3_action="Argon SKIP; light review only."
else
  g3=JUDGE; g3_action="Argon-need via RUBRIC tier A; not an Argon skip."
fi
row G3 "lock + matching constraint" "$g3" "$g3_action"
if [ "$pr_state" = "draft" ] || { [ "$pr_state" = "ready" ] && [ "$operator_ready" = "true" ]; }; then
  g4=PASS; g4_action="Continue."
else
  g4=FAIL; g4_action="Create or convert the pull request to draft."
fi
row G4 "draft" "$g4" "$g4_action"
if [ "$vuln_silent" = "true" ]; then
  g5=FAIL; g5_action="Block; report every finding with its source."
else
  g5=PASS; g5_action="Continue."
fi
row G5 "vulnerability silence" "$g5" "$g5_action"
if [ "$retro_marker" = "present" ]; then
  g6=PASS; g6_action="Ingest path may run."
else
  g6=QUIET; g6_action="Stay quiet; v1 silence, no invented retro."
fi
row G6 "RETRO ingest" "$g6" "$g6_action"
if [ "$open_jobs" -le 1 ] && [ "$open_prs" -le 1 ]; then
  g7=PASS; g7_action="Continue."
else
  g7=FAIL; g7_action="Refuse new job; completion report only."
fi
row G7 "one job" "$g7" "$g7_action"
exit "$status"
