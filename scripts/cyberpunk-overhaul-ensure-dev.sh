#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.codex-runtime/cyberpunk-overhaul"
PID_FILE="${RUNTIME_DIR}/vite.pid"
LOG_FILE="${RUNTIME_DIR}/vite.log"
APP_HOST="${APP_HOST:-127.0.0.1}"
APP_PORT="${APP_PORT:-5173}"
APP_BASE="${APP_BASE:-/jones-vibes/}"
APP_URL="${APP_URL:-http://${APP_HOST}:${APP_PORT}${APP_BASE}}"

usage() {
  cat <<'EOF'
Usage: bash scripts/cyberpunk-overhaul-ensure-dev.sh

Ensures the local Vite server for Jones in the Fast Lane is available.
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

mkdir -p "${RUNTIME_DIR}"

server_ready() {
  curl -fsS "${APP_URL}" >/dev/null 2>&1
}

if server_ready; then
  echo "[ensure-dev] App already reachable at ${APP_URL}"
  exit 0
fi

if [[ ! -d "${ROOT_DIR}/node_modules" ]]; then
  echo "[ensure-dev] node_modules missing; running npm ci"
  (cd "${ROOT_DIR}" && npm ci)
fi

if [[ -f "${PID_FILE}" ]]; then
  existing_pid="$(cat "${PID_FILE}")"
  if kill -0 "${existing_pid}" >/dev/null 2>&1; then
    echo "[ensure-dev] Waiting for existing Vite process ${existing_pid}"
  else
    rm -f "${PID_FILE}"
  fi
fi

if [[ ! -f "${PID_FILE}" ]]; then
  echo "[ensure-dev] Starting Vite at ${APP_URL}"
  (
    cd "${ROOT_DIR}"
    nohup npm run dev -- --host "${APP_HOST}" >"${LOG_FILE}" 2>&1 &
    echo $! >"${PID_FILE}"
  )
fi

for _ in $(seq 1 30); do
  if server_ready; then
    echo "[ensure-dev] App ready at ${APP_URL}"
    exit 0
  fi
  sleep 1
done

echo "[ensure-dev] Timed out waiting for Vite at ${APP_URL}" >&2
if [[ -f "${LOG_FILE}" ]]; then
  echo "[ensure-dev] Recent Vite log:" >&2
  tail -n 40 "${LOG_FILE}" >&2 || true
fi
exit 1
