#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.codex-runtime/cyberpunk-overhaul"
RUN_STATE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/run-state.json"
ONCE_SCRIPT="${ROOT_DIR}/scripts/cyberpunk-overhaul-phase11-once.sh"
LOG_FILE="${RUNTIME_DIR}/autonomous-runner.log"

usage() {
  cat <<'EOF'
Usage: bash scripts/cyberpunk-overhaul-phase11-loop.sh [--commit]

Runs the active Phase 11 workflow continuously, but each iteration launches a
brand-new `codex exec --ephemeral` process to guarantee fresh context.
Pass --commit to let each iteration auto-commit its slice when the worktree was
clean at the start of that slice.
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

AUTO_COMMIT="${AUTONOMOUS_GIT_COMMIT:-0}"

while (($# > 0)); do
  case "${1}" in
    --help|-h)
      usage
      exit 0
      ;;
    --commit)
      AUTO_COMMIT=1
      ;;
    *)
      echo "[phase11-loop] unknown argument: ${1}" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

mkdir -p "${RUNTIME_DIR}"
touch "${LOG_FILE}"

max_iterations="${AUTONOMOUS_MAX_ITERATIONS:-0}"
iteration=0

while true; do
  status="$(json_get_or_default status unknown)"
  needs_human="$(json_get_or_default needs_human false)"

  if [[ "${status}" == "complete" ]]; then
    echo "[phase11-loop] workflow complete; exiting" | tee -a "${LOG_FILE}"
    break
  fi

  if [[ "${status}" == "blocked" || "${needs_human}" == "true" ]]; then
    echo "[phase11-loop] workflow blocked or awaiting human input; exiting" | tee -a "${LOG_FILE}"
    break
  fi

  if (( max_iterations > 0 && iteration >= max_iterations )); then
    echo "[phase11-loop] reached AUTONOMOUS_MAX_ITERATIONS=${max_iterations}; exiting" | tee -a "${LOG_FILE}"
    break
  fi

  iteration=$((iteration + 1))
  echo "[phase11-loop] starting iteration ${iteration}" | tee -a "${LOG_FILE}"
  if [[ "${AUTO_COMMIT}" == "1" ]]; then
    "${ONCE_SCRIPT}" --commit
  else
    "${ONCE_SCRIPT}"
  fi

  status="$(json_get_or_default status unknown)"
  needs_human="$(json_get_or_default needs_human false)"
  if [[ "${status}" == "complete" ]]; then
    echo "[phase11-loop] workflow complete after iteration ${iteration}" | tee -a "${LOG_FILE}"
    break
  fi
  if [[ "${status}" == "blocked" || "${needs_human}" == "true" ]]; then
    echo "[phase11-loop] workflow blocked after iteration ${iteration}" | tee -a "${LOG_FILE}"
    break
  fi

  if (( max_iterations > 0 && iteration >= max_iterations )); then
    echo "[phase11-loop] reached AUTONOMOUS_MAX_ITERATIONS=${max_iterations}; exiting" | tee -a "${LOG_FILE}"
    break
  fi

  sleep_seconds="${AUTONOMOUS_SLEEP_SECONDS:-$(json_get_or_default runner.sleep_seconds 5)}"
  echo "[phase11-loop] sleeping ${sleep_seconds}s before next fresh-context run" | tee -a "${LOG_FILE}"
  sleep "${sleep_seconds}"
done
