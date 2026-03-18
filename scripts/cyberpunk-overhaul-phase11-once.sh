#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.codex-runtime/cyberpunk-overhaul"
RUN_STATE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/run-state.json"
PROMPT_TEMPLATE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md"
ENSURE_DEV="${ROOT_DIR}/scripts/cyberpunk-overhaul-ensure-dev.sh"
LOG_FILE="${RUNTIME_DIR}/autonomous-runner.log"
LAST_MESSAGE_FILE="${RUNTIME_DIR}/last-codex-message.txt"
PROMPT_FILE="${RUNTIME_DIR}/current-codex-prompt.md"

usage() {
  cat <<'EOF'
Usage: bash scripts/cyberpunk-overhaul-phase11-once.sh [--dry-run]

Runs exactly one fresh-context Codex slice for the active Phase 11 workflow.
EOF
}

json_get() {
  node - "$RUN_STATE" "$1" <<'NODE'
const fs = require('fs');

const file = process.argv[2];
const path = process.argv[3];
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

let current = data;
for (const part of path.split('.')) {
  if (!part) continue;
  current = current?.[part];
}

if (current === undefined) {
  process.exit(1);
}

if (typeof current === 'object') {
  process.stdout.write(JSON.stringify(current));
} else {
  process.stdout.write(String(current));
}
NODE
}

json_get_or_default() {
  local path="$1"
  local fallback="$2"
  if value="$(json_get "${path}" 2>/dev/null)"; then
    printf '%s' "${value}"
  else
    printf '%s' "${fallback}"
  fi
}

DRY_RUN="${DRY_RUN:-0}"
if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=1
fi

mkdir -p "${RUNTIME_DIR}"
touch "${LOG_FILE}"

status="$(json_get status)"
needs_human="$(json_get needs_human)"

if [[ "${status}" != "in_progress" ]]; then
  echo "[phase11-once] run-state status is ${status}; nothing to do"
  exit 0
fi

if [[ "${needs_human}" == "true" ]]; then
  echo "[phase11-once] run-state requests human intervention; stopping"
  exit 0
fi

"${ENSURE_DEV}"

persona_name="$(json_get current_persona.name)"
persona_log="$(json_get current_persona.log_path)"
session_name="$(json_get current_persona.agent_browser_session_name)"
app_url="$(json_get runtime.app_url)"
next_slice="$(json_get next_slice)"
exec_strategy="${CODEX_EXEC_STRATEGY:-$(json_get_or_default runner.codex_exec_strategy dangerous)}"

export AGENT_BROWSER_SESSION_NAME="${AGENT_BROWSER_SESSION_NAME:-${session_name}}"
export AGENT_BROWSER_ARGS="${AGENT_BROWSER_ARGS:---no-sandbox}"
export JONES_VIBES_APP_URL="${app_url}"

{
  cat "${PROMPT_TEMPLATE}"
  cat <<EOF

## Runner Context
- App URL: ${app_url}
- Run-state path: docs/workflows/cyberpunk-overhaul/run-state.json
- Active persona: ${persona_name}
- Active persona log: ${persona_log}
- agent-browser session name: ${AGENT_BROWSER_SESSION_NAME}
- Next slice: ${next_slice}
EOF
} >"${PROMPT_FILE}"

codex_args=(
  codex
  exec
  --ephemeral
  -C "${ROOT_DIR}"
  -o "${LAST_MESSAGE_FILE}"
)

case "${exec_strategy}" in
  dangerous)
    codex_args+=(--dangerously-bypass-approvals-and-sandbox)
    ;;
  full-auto)
    codex_args+=(--full-auto)
    ;;
  *)
    ;;
esac

if [[ -n "${CODEX_MODEL:-}" ]]; then
  codex_args+=(-m "${CODEX_MODEL}")
fi

{
  echo
  echo "===== $(date -Iseconds) phase11-once ====="
  echo "[phase11-once] persona=${persona_name}"
  echo "[phase11-once] app_url=${app_url}"
  echo "[phase11-once] session_name=${AGENT_BROWSER_SESSION_NAME}"
  echo "[phase11-once] exec_strategy=${exec_strategy}"
} >>"${LOG_FILE}"

if [[ "${DRY_RUN}" == "1" ]]; then
  echo "[phase11-once] dry run"
  echo "[phase11-once] prompt file: ${PROMPT_FILE}"
  echo "[phase11-once] codex args: ${codex_args[*]} -"
  cat "${PROMPT_FILE}"
  exit 0
fi

"${codex_args[@]}" - <"${PROMPT_FILE}" 2>&1 | tee -a "${LOG_FILE}"

status_after="$(json_get_or_default status unknown)"
needs_human_after="$(json_get_or_default needs_human false)"
echo "[phase11-once] post-run status=${status_after} needs_human=${needs_human_after}" | tee -a "${LOG_FILE}"
