#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.codex-runtime/cyberpunk-overhaul"
RUN_STATE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/run-state.json"
PROMPT_TEMPLATE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md"
ENSURE_DEV="${ROOT_DIR}/scripts/cyberpunk-overhaul-ensure-dev.sh"
LOG_STREAM_HELPER="${ROOT_DIR}/scripts/cyberpunk-overhaul-phase11-log-stream.mjs"
LOG_FILE="${RUNTIME_DIR}/autonomous-runner.log"
LAST_MESSAGE_FILE="${RUNTIME_DIR}/last-codex-message.txt"
PROMPT_FILE="${RUNTIME_DIR}/current-codex-prompt.md"
SLICE_ROOT_DIR="${RUNTIME_DIR}/slices"

usage() {
  cat <<'EOF'
Usage: bash scripts/cyberpunk-overhaul-phase11-once.sh [--dry-run] [--commit]

Runs exactly one fresh-context Codex slice for the active Phase 11 workflow.
Refuses to start if the git worktree is dirty.
Pass --commit to auto-commit slice changes after a clean-start slice finishes.
EOF
}

worktree_is_dirty() {
  [[ -n "$(git -C "${ROOT_DIR}" status --short)" ]]
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

list_control_surface_paths() {
  node - "$RUN_STATE" <<'NODE'
const fs = require('fs');

const file = process.argv[2];
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const seen = new Set(['docs/workflows/cyberpunk-overhaul/run-state.json']);

for (const entry of data.slice_policy?.update_paths || []) {
  if (typeof entry === 'string' && entry.length > 0) {
    seen.add(entry);
  }
}

for (const entry of seen) {
  process.stdout.write(`${entry}\n`);
}
NODE
}

latest_persona_slice_file() {
  local detail_log_root="$1"
  local persona_log_path="$2"
  local persona_dir_name=""
  local persona_slice_dir=""

  persona_dir_name="$(basename "${persona_log_path}" .md)"
  persona_dir_name="${persona_dir_name#audit-log-}"
  persona_slice_dir="${detail_log_root}/${persona_dir_name}"

  if [[ ! -d "${ROOT_DIR}/${persona_slice_dir}" ]]; then
    return 0
  fi

  (
    cd "${ROOT_DIR}"
    find "${persona_slice_dir}" -maxdepth 1 -type f -name 'week-*.md' | sort | tail -n 1
  )
}

latest_persona_checkpoint_file() {
  local checkpoint_root="$1"
  local persona_id="$2"

  if [[ ! -d "${ROOT_DIR}/${checkpoint_root}/${persona_id}" ]]; then
    return 0
  fi

  (
    cd "${ROOT_DIR}"
    find "${checkpoint_root}/${persona_id}" -maxdepth 1 -type f -name '*-save.json' | sort | tail -n 1
  )
}

append_ui_workaround_notes() {
  cat <<'EOF'
- Labor Sector job applications: prefer the stable `[data-testid="action-card-jobs-..."]` or `[data-testid="action-card-btn-jobs-..."]` selectors when targeting a known job card, then verify the `CURRENT SHIFT` panel or persisted state changed before moving on.
- Sustenance Hub purchases: prefer the stable `[data-testid="action-card-shopping-..."]` or `[data-testid="action-card-btn-shopping-..."]` selectors when targeting a known food card, then verify `credits`, `hunger`, or `sanity` changed before assuming the purchase worked.
- If the session appears reset or onboarding reappears unexpectedly: capture a screenshot and run `agent-browser eval "document.body.innerText"` before clicking through anything.
- If expected continuity is missing but a checkpoint file exists, prefer restoring that checkpoint with `npm run workflow:phase11:checkpoint:import` before replaying from onboarding.
EOF
}

append_file_excerpt() {
  local label="$1"
  local rel_path="$2"
  local max_lines="$3"
  local abs_path="${ROOT_DIR}/${rel_path}"

  if [[ ! -f "${abs_path}" ]]; then
    return 0
  fi

  cat <<EOF

### ${label} (${rel_path})
EOF
  sed -n "1,${max_lines}p" "${abs_path}"
}

snapshot_control_surface() {
  local phase="$1"
  local rel_path=""
  while IFS= read -r rel_path; do
    [[ -z "${rel_path}" ]] && continue
    local src="${ROOT_DIR}/${rel_path}"
    local dest="${SLICE_DIR}/state/${phase}/${rel_path}"
    mkdir -p "$(dirname "${dest}")"
    if [[ -f "${src}" ]]; then
      cp "${src}" "${dest}"
    else
      : >"${dest}.missing"
    fi
  done < <(list_control_surface_paths)
}

write_changed_file_artifacts() {
  local tracked_changed=()
  local untracked_changed=()
  local file=""

  while IFS= read -r file; do
    [[ -z "${file}" ]] && continue
    tracked_changed+=("${file}")
  done < <(git -C "${ROOT_DIR}" diff --name-only --relative HEAD)

  while IFS= read -r file; do
    [[ -z "${file}" ]] && continue
    untracked_changed+=("${file}")
  done < <(git -C "${ROOT_DIR}" ls-files --others --exclude-standard)

  {
    if ((${#tracked_changed[@]} > 0)); then
      printf '%s\n' "${tracked_changed[@]}"
    fi
    if ((${#untracked_changed[@]} > 0)); then
      printf '%s\n' "${untracked_changed[@]}"
    fi
  } | sed '/^$/d' | sort -u >"${CHANGED_FILES_FILE}"

  : >"${FINAL_DIFF_FILE}"
  if ((${#tracked_changed[@]} > 0)); then
    git -C "${ROOT_DIR}" diff --binary --no-ext-diff HEAD -- "${tracked_changed[@]}" >"${FINAL_DIFF_FILE}"
  fi

  if ((${#untracked_changed[@]} > 0)); then
    local untracked_file=""
    for untracked_file in "${untracked_changed[@]}"; do
      if [[ -f "${ROOT_DIR}/${untracked_file}" ]]; then
        git -C "${ROOT_DIR}" diff --binary --no-index -- /dev/null "${ROOT_DIR}/${untracked_file}" >>"${FINAL_DIFF_FILE}" || true
      fi
    done
  fi
}

write_slice_summary() {
  node - \
    "${STREAM_SUMMARY_FILE}" \
    "${SUMMARY_FILE}" \
    "${SLICE_ID}" \
    "${SLICE_DIR}" \
    "${persona_name}" \
    "${status_after}" \
    "${needs_human_after}" \
    "${pre_run_dirty}" \
    "${codex_exit}" \
    "${debug_preserved}" \
    "${FORCE_VERBOSE}" \
    "${DEBUG_DIR}/raw-codex-events.jsonl" \
    "${DEBUG_DIR}/suspicious-commands.jsonl" \
    "${CHANGED_FILES_FILE}" \
    "${FINAL_DIFF_FILE}" <<'NODE'
const fs = require('fs');
const path = require('path');

const [
  streamSummaryFile,
  summaryFile,
  sliceId,
  sliceDir,
  personaName,
  statusAfter,
  needsHumanAfter,
  preRunDirty,
  codexExit,
  debugPreserved,
  forceVerbose,
  rawTracePath,
  suspiciousPath,
  changedFilesPath,
  finalDiffPath,
] = process.argv.slice(2);

const base = JSON.parse(fs.readFileSync(streamSummaryFile, 'utf8'));
const changedFiles = fs
  .readFileSync(changedFilesPath, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean);

let diffBytes = 0;
try {
  diffBytes = fs.statSync(finalDiffPath).size;
} catch (error) {
  diffBytes = 0;
}

const summary = {
  ...base,
  slice_id: sliceId,
  persona: personaName,
  status: statusAfter,
  needs_human: needsHumanAfter === 'true',
  codex_exit_code: Number(codexExit),
  worktree_dirty_at_start: preRunDirty === '1',
  changed_files: changedFiles,
  artifacts: {
    slice_dir: sliceDir,
    prompt: path.join(sliceDir, 'prompt.md'),
    last_message: path.join(sliceDir, 'last-message.txt'),
    events: path.join(sliceDir, 'events.jsonl'),
    checkpoints: path.join(sliceDir, 'checkpoints.jsonl'),
    summary: summaryFile,
    changed_files: changedFilesPath,
    final_diff: finalDiffPath,
    raw_codex_events: debugPreserved === '1' ? rawTracePath : '',
    suspicious_commands: debugPreserved === '1' ? suspiciousPath : '',
  },
  diff_bytes: diffBytes,
};

if (summary.status === 'blocked') {
  summary.debug = summary.debug || {};
  summary.debug.escalated = true;
  summary.debug.reasons = [...new Set([...(summary.debug.reasons || []), 'status_blocked'])];
}

if (forceVerbose === '1') {
  summary.debug = summary.debug || {};
  summary.debug.escalated = true;
  summary.debug.reasons = [...new Set([...(summary.debug.reasons || []), 'forced_verbose'])];
}

if (summary.needs_human) {
  summary.debug = summary.debug || {};
  summary.debug.escalated = true;
  summary.debug.reasons = [...new Set([...(summary.debug.reasons || []), 'needs_human'])];
}

if (Number(codexExit) !== 0) {
  summary.debug = summary.debug || {};
  summary.debug.escalated = true;
  summary.debug.reasons = [...new Set([...(summary.debug.reasons || []), 'codex_exec_failed'])];
}

fs.writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`);
NODE
}

DRY_RUN="${DRY_RUN:-0}"
AUTO_COMMIT="${AUTONOMOUS_GIT_COMMIT:-0}"
RETRY_THRESHOLD="${AUTONOMOUS_RETRY_THRESHOLD:-2}"
FORCE_VERBOSE="${AUTONOMOUS_FORCE_VERBOSE:-0}"

while (($# > 0)); do
  case "${1}" in
    --help|-h)
      usage
      exit 0
      ;;
    --dry-run)
      DRY_RUN=1
      ;;
    --commit)
      AUTO_COMMIT=1
      ;;
    *)
      echo "[phase11-once] unknown argument: ${1}" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

mkdir -p "${RUNTIME_DIR}"
mkdir -p "${SLICE_ROOT_DIR}"
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

pre_run_dirty=0
if worktree_is_dirty; then
  pre_run_dirty=1
  echo "[phase11-once] refusing to start: git worktree is dirty" | tee -a "${LOG_FILE}" >&2
  exit 1
fi

"${ENSURE_DEV}"

persona_name="$(json_get current_persona.name)"
persona_slug="$(json_get_or_default current_persona.id persona)"
persona_log="$(json_get current_persona.log_path)"
session_name="$(json_get current_persona.agent_browser_session_name)"
app_url="$(json_get runtime.app_url)"
detail_log_root="$(json_get_or_default slice_policy.detail_log_root docs/workflows/cyberpunk-overhaul/phase-11-slices)"
checkpoint_root="$(json_get_or_default checkpointing.root docs/workflows/cyberpunk-overhaul/checkpoints)"
phase_progress_log="docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md"
external_handoff_path="$(json_get_or_default runner.external_handoff_path "")"
next_slice="$(json_get next_slice)"
last_run_at="$(json_get_or_default last_run.at unknown)"
last_run_outcome="$(json_get_or_default last_run.outcome unknown)"
last_run_summary="$(json_get_or_default last_run.summary "No prior checkpoint summary recorded.")"
persona_slice_dir="$(basename "${persona_log}" .md)"
persona_slice_dir="${persona_slice_dir#audit-log-}"
persona_slice_dir="${detail_log_root}/${persona_slice_dir}"
latest_slice_file="$(latest_persona_slice_file "${detail_log_root}" "${persona_log}")"
persona_checkpoint_dir="${checkpoint_root}/${persona_slug}"
latest_checkpoint_file="$(latest_persona_checkpoint_file "${checkpoint_root}" "${persona_slug}")"
exec_strategy="${CODEX_EXEC_STRATEGY:-$(json_get_or_default runner.codex_exec_strategy dangerous)}"

slice_timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
SLICE_ID="${slice_timestamp}-${persona_slug}"
SLICE_DIR="${SLICE_ROOT_DIR}/${SLICE_ID}"
DEBUG_DIR="${SLICE_DIR}/debug"
SLICE_PROMPT_FILE="${SLICE_DIR}/prompt.md"
SLICE_LAST_MESSAGE_FILE="${SLICE_DIR}/last-message.txt"
EVENT_LOG_FILE="${SLICE_DIR}/events.jsonl"
CHECKPOINT_LOG_FILE="${SLICE_DIR}/checkpoints.jsonl"
STREAM_SUMMARY_FILE="${SLICE_DIR}/stream-summary.json"
SUMMARY_FILE="${SLICE_DIR}/summary.json"
RAW_JSONL_TEMP="${SLICE_DIR}/raw-codex-events.tmp.jsonl"
DEBUG_CANDIDATES_TEMP="${SLICE_DIR}/suspicious-commands.tmp.jsonl"
CHANGED_FILES_FILE="${SLICE_DIR}/changed-files.txt"
FINAL_DIFF_FILE="${SLICE_DIR}/final.diff"

mkdir -p "${SLICE_DIR}" "${DEBUG_DIR}"

export AGENT_BROWSER_SESSION_NAME="${AGENT_BROWSER_SESSION_NAME:-${session_name}}"
export AGENT_BROWSER_ARGS="${AGENT_BROWSER_ARGS:---no-sandbox}"
export JONES_VIBES_APP_URL="${app_url}"

{
  cat "${PROMPT_TEMPLATE}"
  cat <<EOF

## Runner Context
- App URL: ${app_url}
- Run-state path: docs/workflows/cyberpunk-overhaul/run-state.json
- Phase progress rollup: ${phase_progress_log}
- Active persona: ${persona_name}
- Active persona log: ${persona_log}
- Canonical persona slice directory: ${persona_slice_dir}
- Canonical latest slice file: ${latest_slice_file:-"(none yet)"}
- Canonical checkpoint directory: ${persona_checkpoint_dir}
- Latest checkpoint save file: ${latest_checkpoint_file:-"(none yet)"}
- External baseline handoff: ${external_handoff_path:-"(none)"}
- Last authoritative checkpoint: ${last_run_at} (${last_run_outcome})
- Current checkpoint summary: ${last_run_summary}
- Expected next action: ${next_slice}
- agent-browser session name: ${AGENT_BROWSER_SESSION_NAME}

### Trusted UI Workarounds
EOF
  append_ui_workaround_notes
  append_file_excerpt "Compact Current Phase Excerpt" "docs/workflows/cyberpunk-overhaul/current-phase.md" 24
  append_file_excerpt "Compact Audit Progress Excerpt" "${phase_progress_log}" 28
  append_file_excerpt "Compact Persona Log Excerpt" "${persona_log}" 40
  if [[ -n "${latest_slice_file}" ]]; then
    append_file_excerpt "Compact Latest Slice Excerpt" "${latest_slice_file}" 48
  fi
  if [[ -n "${external_handoff_path}" && "${external_handoff_path}" != "(none)" ]]; then
    append_file_excerpt "Compact External Handoff Excerpt" "${external_handoff_path}" 32
  fi
} >"${SLICE_PROMPT_FILE}"

cp "${SLICE_PROMPT_FILE}" "${PROMPT_FILE}"

snapshot_control_surface before

codex_args=(
  codex
  exec
  --ephemeral
  --json
  -C "${ROOT_DIR}"
  -o "${SLICE_LAST_MESSAGE_FILE}"
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
  echo "[phase11-once] auto_commit=${AUTO_COMMIT}"
  echo "[phase11-once] force_verbose=${FORCE_VERBOSE}"
  echo "[phase11-once] slice_id=${SLICE_ID}"
  echo "[phase11-once] slice_dir=${SLICE_DIR}"
} >>"${LOG_FILE}"

if [[ "${DRY_RUN}" == "1" ]]; then
  echo "[phase11-once] dry run"
  echo "[phase11-once] prompt file: ${SLICE_PROMPT_FILE}"
  echo "[phase11-once] codex args: ${codex_args[*]} -"
  cat "${SLICE_PROMPT_FILE}"
  exit 0
fi

codex_exit=0
parser_exit=0
tee_exit=0

set +e
"${codex_args[@]}" - <"${SLICE_PROMPT_FILE}" \
  | node "${LOG_STREAM_HELPER}" \
      --slice-id "${SLICE_ID}" \
      --persona "${persona_name}" \
      --retry-threshold "${RETRY_THRESHOLD}" \
      --event-log "${EVENT_LOG_FILE}" \
      --checkpoint-log "${CHECKPOINT_LOG_FILE}" \
      --summary "${STREAM_SUMMARY_FILE}" \
      --raw-jsonl "${RAW_JSONL_TEMP}" \
      --debug-candidates "${DEBUG_CANDIDATES_TEMP}" \
  | tee -a "${LOG_FILE}"
pipeline_status=("${PIPESTATUS[@]}")
set -e

codex_exit="${pipeline_status[0]}"
parser_exit="${pipeline_status[1]}"
tee_exit="${pipeline_status[2]}"

if [[ "${parser_exit}" != "0" || "${tee_exit}" != "0" ]]; then
  echo "[phase11-once] logging pipeline failed: codex_exit=${codex_exit} parser_exit=${parser_exit} tee_exit=${tee_exit}" | tee -a "${LOG_FILE}"
  exit 1
fi

if [[ -f "${SLICE_LAST_MESSAGE_FILE}" ]]; then
  cp "${SLICE_LAST_MESSAGE_FILE}" "${LAST_MESSAGE_FILE}"
fi

status_after="$(json_get_or_default status unknown)"
needs_human_after="$(json_get_or_default needs_human false)"
snapshot_control_surface after
write_changed_file_artifacts

debug_preserved=0
if [[ "${FORCE_VERBOSE}" == "1" || "${codex_exit}" != "0" || "${status_after}" == "blocked" || "${needs_human_after}" == "true" ]]; then
  debug_preserved=1
fi

if [[ "${debug_preserved}" == "0" && -f "${STREAM_SUMMARY_FILE}" ]]; then
  if node -e 'const fs = require("fs"); const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.exit(data.debug?.escalated ? 0 : 1);' "${STREAM_SUMMARY_FILE}"; then
    debug_preserved=1
  fi
fi

if [[ "${debug_preserved}" == "1" ]]; then
  mv "${RAW_JSONL_TEMP}" "${DEBUG_DIR}/raw-codex-events.jsonl"
  if [[ -s "${DEBUG_CANDIDATES_TEMP}" ]]; then
    mv "${DEBUG_CANDIDATES_TEMP}" "${DEBUG_DIR}/suspicious-commands.jsonl"
  else
    rm -f "${DEBUG_CANDIDATES_TEMP}"
  fi
else
  rm -f "${RAW_JSONL_TEMP}" "${DEBUG_CANDIDATES_TEMP}"
  rmdir "${DEBUG_DIR}" 2>/dev/null || true
fi

write_slice_summary

metrics_line="$(node -e 'const fs = require("fs"); const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); const parts = []; parts.push(`input_tokens=${data.usage?.input_tokens ?? 0}`); parts.push(`cached_tokens=${data.usage?.cached_input_tokens ?? 0}`); parts.push(`output_tokens=${data.usage?.output_tokens ?? 0}`); parts.push(`wall_time_ms=${data.wall_time_ms ?? 0}`); parts.push(`commands=${data.counts?.commands_total ?? 0}`); parts.push(`changed_files=${(data.changed_files || []).length}`); parts.push(`debug=${data.debug?.escalated ? "on" : "off"}`); if (data.debug?.escalated && Array.isArray(data.debug.reasons) && data.debug.reasons.length > 0) { parts.push(`debug_reasons=${data.debug.reasons.join(",")}`); } process.stdout.write(parts.join(" "));' "${SUMMARY_FILE}")"
echo "[phase11-once] post-run status=${status_after} needs_human=${needs_human_after} codex_exit=${codex_exit} ${metrics_line}" | tee -a "${LOG_FILE}"

if [[ "${AUTO_COMMIT}" != "1" ]]; then
  exit "${codex_exit}"
fi

if ! worktree_is_dirty; then
  echo "[phase11-once] auto-commit skipped: slice produced no git changes" | tee -a "${LOG_FILE}"
  exit "${codex_exit}"
fi

last_run_at="$(json_get_or_default last_run.at "$(date -Iseconds)")"
commit_message="Phase 11 slice: ${persona_slug} (${status_after}) ${last_run_at}"

git -C "${ROOT_DIR}" add -A
git -C "${ROOT_DIR}" commit -m "${commit_message}" | tee -a "${LOG_FILE}"
echo "[phase11-once] auto-commit created: ${commit_message}" | tee -a "${LOG_FILE}"
exit "${codex_exit}"
