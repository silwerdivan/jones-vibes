#!/usr/bin/env bash

set -euo pipefail

# Ensure clean UTF-8 encoding in pipes
export LC_ALL=C.UTF-8
export LANG=C.UTF-8

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/.pi-runtime/cyberpunk-overhaul"
RUN_STATE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/run-state.json"
PROMPT_TEMPLATE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md"
ENSURE_DEV="${ROOT_DIR}/scripts/cyberpunk-overhaul-ensure-dev.sh"
LOG_STREAM_HELPER="${ROOT_DIR}/scripts/cyberpunk-overhaul-phase11-log-stream.mjs"
LOG_FILE="${RUNTIME_DIR}/autonomous-runner.log"
LAST_MESSAGE_FILE="${RUNTIME_DIR}/last-pi-message.txt"
PROMPT_FILE="${RUNTIME_DIR}/current-pi-prompt.md"
SLICE_ROOT_DIR="${RUNTIME_DIR}/slices"
BRIEF_SCRIPT="${ROOT_DIR}/scripts/cyberpunk-overhaul-phase11-brief.mjs"
BRIEF_FILE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/phase-11-brief.json"
BROWSER_RECIPES_FILE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json"
ISSUE_LEDGER_FILE="${ROOT_DIR}/docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md"

usage() {
  cat <<'EOF'
Usage: bash scripts/cyberpunk-overhaul-phase11-once.sh [--dry-run] [--commit] [--allow-pending-issues]

Runs exactly one fresh-context pi slice for the active Phase 11 workflow.
Refuses to start if the git worktree is dirty.
Refuses to start if a newer slice has not been triaged into the issue ledger yet,
or if the active slice issue ledger still has unresolved follow-up items.
Pass --commit to auto-commit slice changes after a clean-start slice finishes.
Pass --allow-pending-issues to bypass the slice-issue gate intentionally.
EOF
}

worktree_is_dirty() {
  [[ -n "$(git -C "${ROOT_DIR}" status --short)" ]]
}

enforce_issue_followup_gate() {
  local latest_slice_file="$1"
  local ledger_check_output=""
  local check_status=0

  if [[ ! -n "${latest_slice_file}" ]]; then
    return 0
  fi

  if ledger_check_output="$(
    node - "${ISSUE_LEDGER_FILE}" "${latest_slice_file}" <<'NODE'
const fs = require('fs');

const [ledgerPath, latestSlicePath] = process.argv.slice(2);

if (!latestSlicePath || !fs.existsSync(latestSlicePath)) {
  process.exit(0);
}

if (!fs.existsSync(ledgerPath)) {
  console.log(`missing\t${latestSlicePath}`);
  process.exit(2);
}

const ledgerStat = fs.statSync(ledgerPath);
const sliceStat = fs.statSync(latestSlicePath);

if (ledgerStat.mtimeMs < sliceStat.mtimeMs) {
  console.log(`stale\t${latestSlicePath}`);
  process.exit(3);
}

const unresolvedStatuses = new Set(['todo', 'in_progress', 'blocked']);
const lines = fs.readFileSync(ledgerPath, 'utf8').split(/\r?\n/);
const issues = [];

for (const line of lines) {
  if (!line.startsWith('|')) continue;
  if (/^\|\s*ID\s*\|/.test(line) || /^\|\s*---/.test(line)) continue;
  const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
  if (cells.length < 8) continue;
  issues.push({
    id: cells[0],
    status: cells[1],
    title: cells[2].replace(/`/g, ''),
  });
}

const unresolved = issues.filter((issue) => unresolvedStatuses.has(issue.status));
if (unresolved.length === 0) {
  process.exit(0);
}

const nextIssue = unresolved[0];
console.log(`unresolved\t${nextIssue.id}\t${nextIssue.status}\t${nextIssue.title}`);
process.exit(4);
NODE
  )"; then
    check_status=$?
  else
    check_status=$?
  fi

  case "${check_status}" in
    0)
      return 0
      ;;
    2)
      echo "[phase11-once] refusing to start: slice issue ledger is missing for latest slice ${latest_slice_file}" | tee -a "${LOG_FILE}" >&2
      echo "[phase11-once] run npm run p11:issues:identify -- --source-slice ${latest_slice_file} first" | tee -a "${LOG_FILE}" >&2
      return 1
      ;;
    3)
      echo "[phase11-once] refusing to start: slice issue ledger is older than latest slice ${latest_slice_file}" | tee -a "${LOG_FILE}" >&2
      echo "[phase11-once] run npm run p11:issues:identify -- --source-slice ${latest_slice_file} first" | tee -a "${LOG_FILE}" >&2
      return 1
      ;;
    4)
      IFS=$'\t' read -r issue_state next_issue_id next_issue_status next_issue_title <<<"${ledger_check_output}"
      echo "[phase11-once] refusing to start: slice issue ledger still has unresolved follow-up issue ${next_issue_id} (${next_issue_status}) - ${next_issue_title}" | tee -a "${LOG_FILE}" >&2
      echo "[phase11-once] run npm run p11:issues or npm run p11:issues:next before starting another slice" | tee -a "${LOG_FILE}" >&2
      return 1
      ;;
    *)
      echo "[phase11-once] unable to evaluate slice issue ledger gate" | tee -a "${LOG_FILE}" >&2
      return 1
      ;;
  esac
}

checkpoint_status_json() {
  node "${ROOT_DIR}/scripts/lib/run-truncated.mjs" --full-dump node "${ROOT_DIR}/scripts/cyberpunk-overhaul-phase11-checkpoint.mjs" status
}

checkpoint_status_field() {
  local payload="$1"
  local path="$2"

  node - "${payload}" "${path}" <<'NODE'
const payload = JSON.parse(process.argv[2]);
const path = process.argv[3];

let current = payload;
for (const part of path.split('.')) {
  if (!part) continue;
  current = current?.[part];
}

if (current === undefined || current === null) {
  process.exit(1);
}

if (typeof current === 'object') {
  process.stdout.write(JSON.stringify(current));
} else {
  process.stdout.write(String(current));
}
NODE
}

check_browser_health() {
  local session_name="${1:-}"
  echo "[phase11-once] performing browser health preflight..." | tee -a "${LOG_FILE}"
  
  # Ensure the basic tool is reachable and doesn't crash on startup
  if ! node "${ROOT_DIR}/scripts/lib/run-truncated.mjs" node "${ROOT_DIR}/scripts/agent-browser.mjs" --version >/dev/null 2>&1; then
    echo "[phase11-once] [FATAL] browser health preflight failed! check your AGENT_BROWSER_ARGS or installation." | tee -a "${LOG_FILE}" >&2
    exit 101
  fi

  # Perform a no-op probe to verify session accessibility if a session name is provided
  if [[ -n "${session_name}" ]]; then
    if ! node "${ROOT_DIR}/scripts/lib/run-truncated.mjs" node "${ROOT_DIR}/scripts/agent-browser.mjs" --session-name "${session_name}" eval "1" >/dev/null 2>&1; then
      # If this fails, it might be a session error, but we'll let verify_browser_continuity handle the recovery
      # unless it was a syntax error caught by run-truncated.
      local exit_code=$?
      if [[ "${exit_code}" == "101" ]]; then
        echo "[phase11-once] [FATAL] browser session preflight failed with syntax/environment error!" | tee -a "${LOG_FILE}" >&2
        exit 101
      fi
    fi
  fi
}

verify_browser_continuity() {
  local status_json=""
  local after_status_json=""
  local continuity_status=""
  local latest_checkpoint=""
  local checked_at=""
  local outcome=""
  local restored="0"
  local ok="0"

  status_json="$(checkpoint_status_json)"
  continuity_status="$(checkpoint_status_field "${status_json}" continuity_status)"
  latest_checkpoint="$(checkpoint_status_field "${status_json}" latest_checkpoint_save_path 2>/dev/null || true)"
  checked_at="$(date -Iseconds)"
  after_status_json="${status_json}"

  echo "[phase11-once] continuity status=${continuity_status} checkpoint=${latest_checkpoint:-none}" | tee -a "${LOG_FILE}"

  case "${continuity_status}" in
    ok|ok_no_checkpoint)
      outcome="live_continuity"
      ok="1"
      write_continuity_artifact "${status_json}" "${after_status_json}" "${outcome}" "${restored}" "${ok}" "${checked_at}"
      return 0
      ;;
    missing_browser_save|mismatch|onboarding_visible)
      if [[ "${continuity_status}" == "missing_browser_save" ]]; then
        echo "[phase11-once] browser save missing; restoring authoritative checkpoint ${latest_checkpoint}" | tee -a "${LOG_FILE}"
      elif [[ "${continuity_status}" == "onboarding_visible" ]]; then
        echo "[phase11-once] onboarding is still visible; treating session as reset and restoring authoritative checkpoint ${latest_checkpoint}" | tee -a "${LOG_FILE}"
      else
        echo "[phase11-once] live browser save mismatches authoritative checkpoint; restoring ${latest_checkpoint}" | tee -a "${LOG_FILE}"
      fi
      node "${ROOT_DIR}/scripts/lib/run-truncated.mjs" node "${ROOT_DIR}/scripts/cyberpunk-overhaul-phase11-checkpoint.mjs" import --quiet --save "${latest_checkpoint}" | tee -a "${LOG_FILE}"

      after_status_json="$(checkpoint_status_json)"
      continuity_status="$(checkpoint_status_field "${after_status_json}" continuity_status)"
      echo "[phase11-once] continuity status after restore=${continuity_status}" | tee -a "${LOG_FILE}"
      if [[ "${continuity_status}" != "ok" ]]; then
        outcome="restore_failed"
        restored="1"
        write_continuity_artifact "${status_json}" "${after_status_json}" "${outcome}" "${restored}" "${ok}" "${checked_at}"
        write_preflight_failure_summary "${outcome}"
        echo "[phase11-once] continuity restore failed; refusing to continue" | tee -a "${LOG_FILE}" >&2
        return 1
      fi
      outcome="auto_restore"
      restored="1"
      ok="1"
      write_continuity_artifact "${status_json}" "${after_status_json}" "${outcome}" "${restored}" "${ok}" "${checked_at}"
      return 0
      ;;
    missing_browser_save_no_checkpoint|onboarding_visible_no_checkpoint)
      outcome="${continuity_status}"
      write_continuity_artifact "${status_json}" "${after_status_json}" "${outcome}" "${restored}" "${ok}" "${checked_at}"
      write_preflight_failure_summary "${outcome}"
      if [[ "${continuity_status}" == "onboarding_visible_no_checkpoint" ]]; then
        echo "[phase11-once] onboarding is visible and no checkpoint exists; refusing to continue" | tee -a "${LOG_FILE}" >&2
      else
        echo "[phase11-once] browser save missing and no checkpoint exists; refusing to continue" | tee -a "${LOG_FILE}" >&2
      fi
      return 1
      ;;
    *)
      outcome="unknown_status"
      write_continuity_artifact "${status_json}" "${after_status_json}" "${outcome}" "${restored}" "${ok}" "${checked_at}"
      write_preflight_failure_summary "${outcome}"
      echo "[phase11-once] unknown continuity status '${continuity_status}'; refusing to continue" | tee -a "${LOG_FILE}" >&2
      return 1
      ;;
  esac
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

write_startup_context_file() {
  node - \
    "${STARTUP_CONTEXT_FILE}" \
    "${app_url}" \
    "${phase_progress_log}" \
    "${persona_name}" \
    "${persona_slug}" \
    "${persona_log}" \
    "${persona_slice_dir}" \
    "${latest_slice_file}" \
    "${persona_checkpoint_dir}" \
    "${latest_checkpoint_file}" \
    "${external_handoff_path}" \
    "${last_run_at}" \
    "${last_run_outcome}" \
    "${next_slice}" \
    "${AGENT_BROWSER_SESSION_NAME}" \
    "${CONTINUITY_FILE}" \
    "${BRIEF_FILE}" \
    "${BROWSER_RECIPES_FILE}" <<'NODE'
const fs = require('fs');
const path = require('path');

const [
  outputPath,
  appUrl,
  progressPath,
  personaName,
  personaId,
  personaLogPath,
  personaSliceDir,
  latestSliceFile,
  checkpointDir,
  latestCheckpointFile,
  externalHandoffPath,
  lastRunAt,
  lastRunOutcome,
  nextSlice,
  sessionName,
  continuityFile,
  briefFile,
  recipesFile,
] = process.argv.slice(2);

function readJson(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function compactText(value, maxLength = 240) {
  if (!value) {
    return '';
  }
  const normalized = String(value).replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1)}…`;
}

const brief = readJson(briefFile) || {};
const recipes = readJson(recipesFile) || {};
const continuity = readJson(continuityFile) || {};
const latest = brief.latest_authoritative_state || {};
const latestSlice = latest.latest_slice || {};
const recipeOrder = ['session_recovery', 'travel_city', 'apply_job', 'buy_food', 'work_shift', 'turn_summary_probe'];
const compactRecipes = {};

for (const key of recipeOrder) {
  const recipe = recipes.recipes?.[key];
  if (!recipe) {
    continue;
  }

  compactRecipes[key] = {
    goal: compactText(recipe.goal, 160),
    selectors: Array.isArray(recipe.preferred_selectors) ? recipe.preferred_selectors.slice(0, 2) : [],
    actions: Array.isArray(recipe.preferred_actions) ? recipe.preferred_actions.slice(0, 3) : [],
    verify: Array.isArray(recipe.verification) ? recipe.verification.slice(0, 3) : [],
    fallbacks: Array.isArray(recipe.fallbacks) ? recipe.fallbacks.slice(0, 2) : [],
    probe: Array.isArray(recipe.preferred_probe_fields) ? recipe.preferred_probe_fields.slice(0, 6) : [],
  };
}

const payload = {
  generated_at: new Date().toISOString(),
  runner_context_version: 3,
  startup_policy: {
    canonical_sources: [
      'docs/workflows/cyberpunk-overhaul/run-state.json',
      outputPath,
    ],
    read_more_only_when: [
      'startup context is stale or ambiguous',
      'a UI path fails',
      'gameplay evidence contradicts the checkpoint handoff',
    ],
    action_verification_policy: [
      'Do not trust click success by itself for gameplay actions.',
      'Capture the minimum relevant before/after state for the action you are taking.',
      'Treat missing intended state mutation as an action failure and use the recipe fallback before continuing.',
    ],
  },
  paths: {
    run_state: 'docs/workflows/cyberpunk-overhaul/run-state.json',
    current_phase: 'docs/workflows/cyberpunk-overhaul/current-phase.md',
    phase_progress: progressPath,
    external_handoff: externalHandoffPath || '',
    structured_phase_brief: 'docs/workflows/cyberpunk-overhaul/phase-11-brief.json',
    structured_browser_recipes: 'docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json',
    continuity: continuityFile,
  },
  persona: {
    name: personaName,
    id: personaId,
    log_path: personaLogPath,
    slice_dir: personaSliceDir,
    latest_slice_file: latestSliceFile || latestSlice.path || '',
    session_name: sessionName,
  },
  app: {
    url: appUrl,
    browser_args: brief.app?.browser_args || [],
  },
  checkpoint: {
    directory: checkpointDir,
    latest_save_file: latestCheckpointFile || brief.checkpointing?.latest_save_path || '',
    last_authoritative_checkpoint: {
      at: lastRunAt,
      outcome: lastRunOutcome,
      week: latest.week ?? null,
    },
    continuity: {
      ok: Boolean(continuity.ok),
      outcome: continuity.outcome || '',
      restored: Boolean(continuity.restored),
      latest_checkpoint_save_path: continuity.latest_checkpoint_save_path || latestCheckpointFile || '',
    },
  },
  authoritative_state: {
    next_action: nextSlice,
    latest_week: latest.week ?? null,
    latest_end_state: latestSlice.telemetry
      ? {
          cash: latestSlice.telemetry.end_cash || '',
          debt: latestSlice.telemetry.end_debt || '',
          hunger: latestSlice.telemetry.end_hunger || '',
          sanity: latestSlice.telemetry.end_sanity || '',
          net_credits: latestSlice.telemetry.net_credits || '',
          net_sanity: latestSlice.telemetry.net_sanity || '',
        }
      : null,
    active_findings: Array.isArray(brief.active_findings) ? brief.active_findings.slice(0, 3).map((entry) => compactText(entry, 200)) : [],
    followups: Array.isArray(latestSlice.blockers_and_followups)
      ? latestSlice.blockers_and_followups.slice(0, 3).map((entry) => compactText(entry, 200))
      : [],
  },
  trusted_ui_workarounds: [
    'Use stable action-card selectors first for jobs and shopping; verify state changed before assuming success.',
    'If onboarding or a reset appears unexpectedly, capture a screenshot and run a short body-text probe before clicking through.',
    'If live continuity is missing but a checkpoint file exists, restore it before replaying from onboarding.',
    'For travel, apply, shopping, and work-shift clicks, compare the relevant before/after state instead of trusting the click response alone.',
  ],
  browser_recipes: {
    global_rules: Array.isArray(recipes.global_rules) ? recipes.global_rules.slice(0, 3).map((entry) => compactText(entry, 160)) : [],
    compact_recipes: compactRecipes,
  },
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
NODE
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

  is_excluded_runtime_noise() {
    local rel_path="$1"

    case "${rel_path}" in
      agent-browser-chrome-*|agent-browser-chrome-*/*)
        return 0
        ;;
      org.chromium.Chromium.*|org.chromium.Chromium.*/*)
        return 0
        ;;
      *)
        return 1
        ;;
    esac
  }

  while IFS= read -r file; do
    [[ -z "${file}" ]] && continue
    tracked_changed+=("${file}")
  done < <(git -C "${ROOT_DIR}" diff --name-only --relative HEAD)

  while IFS= read -r file; do
    [[ -z "${file}" ]] && continue
    if is_excluded_runtime_noise "${file}"; then
      continue
    fi
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

write_continuity_artifact() {
  local before_json="$1"
  local after_json="$2"
  local outcome="$3"
  local restored="$4"
  local ok="$5"
  local checked_at="$6"

  node - \
    "${before_json}" \
    "${after_json}" \
    "${outcome}" \
    "${restored}" \
    "${ok}" \
    "${checked_at}" \
    "${CONTINUITY_FILE}" \
    "${EVENT_LOG_FILE}" \
    "${CHECKPOINT_LOG_FILE}" <<'NODE'
const fs = require('fs');
const path = require('path');

const [
  beforeJson,
  afterJson,
  outcome,
  restored,
  ok,
  checkedAt,
  continuityFile,
  eventLogFile,
  checkpointLogFile,
] = process.argv.slice(2);

const before = JSON.parse(beforeJson);
const after = JSON.parse(afterJson);
const payload = {
  type: 'continuity_preflight',
  checked_at: checkedAt,
  outcome,
  ok: ok === '1',
  restored: restored === '1',
  session_name: after.session_name || before.session_name || '',
  latest_checkpoint_save_path: after.latest_checkpoint_save_path || before.latest_checkpoint_save_path || '',
  before: before,
  after: after,
};

for (const filePath of [continuityFile, eventLogFile, checkpointLogFile]) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

fs.writeFileSync(continuityFile, `${JSON.stringify(payload, null, 2)}\n`);
const line = `${JSON.stringify(payload)}\n`;
fs.appendFileSync(eventLogFile, line);
fs.appendFileSync(checkpointLogFile, line);
NODE
}

write_preflight_failure_summary() {
  local outcome="$1"

  node - \
    "${SUMMARY_FILE}" \
    "${STREAM_SUMMARY_FILE}" \
    "${SLICE_ID}" \
    "${SLICE_DIR}" \
    "${persona_name}" \
    "${CONTINUITY_FILE}" \
    "${outcome}" <<'NODE'
const fs = require('fs');
const path = require('path');

const [
  summaryFile,
  streamSummaryFile,
  sliceId,
  sliceDir,
  personaName,
  continuityFile,
  outcome,
] = process.argv.slice(2);

const continuity = JSON.parse(fs.readFileSync(continuityFile, 'utf8'));
const startedAt = continuity.checked_at;

const base = {
  slice_id: sliceId,
  persona: personaName,
  started_at: startedAt,
  ended_at: startedAt,
  wall_time_ms: 0,
  usage: {
    input_tokens: 0,
    cached_input_tokens: 0,
    output_tokens: 0,
  },
  counts: {
    commands_total: 0,
    commands_failed: 0,
    agent_browser_commands: 0,
    startup_reads: 0,
    git_diff_commands: 0,
    checkpoints: 1,
    retries: 0,
    fallbacks: 0,
  },
  debug: {
    escalated: true,
    reasons: [`continuity_${outcome}`],
    retry_threshold: 0,
  },
  timings: {
    slowest_commands: [],
  },
  failure_candidates: [],
  fallback_messages: [],
  retry_messages: [],
};

const summary = {
  ...base,
  status: 'blocked',
  needs_human: true,
  pi_exit_code: -1,
  worktree_dirty_at_start: false,
  changed_files: [],
  continuity,
  artifacts: {
    slice_dir: sliceDir,
    prompt: path.join(sliceDir, 'prompt.md'),
    last_message: path.join(sliceDir, 'last-message.txt'),
    events: path.join(sliceDir, 'events.jsonl'),
    checkpoints: path.join(sliceDir, 'checkpoints.jsonl'),
    continuity: continuityFile,
    summary: summaryFile,
    changed_files: path.join(sliceDir, 'changed-files.txt'),
    final_diff: path.join(sliceDir, 'final.diff'),
    startup_context: path.join(sliceDir, 'startup-context.json'),
    raw_pi_events: '',
    suspicious_commands: '',
  },
  diff_bytes: 0,
};

fs.writeFileSync(streamSummaryFile, `${JSON.stringify(base, null, 2)}\n`);
fs.writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`);
NODE
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
    "${pi_exit}" \
    "${debug_preserved}" \
    "${FORCE_VERBOSE}" \
    "${DEBUG_DIR}/raw-pi-events.jsonl" \
    "${DEBUG_DIR}/suspicious-commands.jsonl" \
    "${CHANGED_FILES_FILE}" \
    "${FINAL_DIFF_FILE}" \
    "${CONTINUITY_FILE}" <<'NODE'
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
  piExit,
  debugPreserved,
  forceVerbose,
  rawTracePath,
  suspiciousPath,
  changedFilesPath,
  finalDiffPath,
  continuityFilePath,
] = process.argv.slice(2);

const base = JSON.parse(fs.readFileSync(streamSummaryFile, 'utf8'));
const continuity = fs.existsSync(continuityFilePath)
  ? JSON.parse(fs.readFileSync(continuityFilePath, 'utf8'))
  : null;
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
  pi_exit_code: Number(piExit),
  worktree_dirty_at_start: preRunDirty === '1',
  changed_files: changedFiles,
  continuity,
  artifacts: {
    slice_dir: sliceDir,
    prompt: path.join(sliceDir, 'prompt.md'),
    last_message: path.join(sliceDir, 'last-message.txt'),
    events: path.join(sliceDir, 'events.jsonl'),
    checkpoints: path.join(sliceDir, 'checkpoints.jsonl'),
    continuity: continuityFilePath,
    summary: summaryFile,
    changed_files: changedFilesPath,
    final_diff: finalDiffPath,
    startup_context: path.join(sliceDir, 'startup-context.json'),
    raw_pi_events: debugPreserved === '1' ? rawTracePath : '',
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

if (Number(piExit) !== 0) {
  summary.debug = summary.debug || {};
  summary.debug.escalated = true;
  summary.debug.reasons = [...new Set([...(summary.debug.reasons || []), 'pi_exec_failed'])];
}

fs.writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`);
NODE
}

DRY_RUN="${DRY_RUN:-0}"
AUTO_COMMIT="${AUTONOMOUS_GIT_COMMIT:-0}"
RETRY_THRESHOLD="${AUTONOMOUS_RETRY_THRESHOLD:-2}"
FORCE_VERBOSE="${AUTONOMOUS_FORCE_VERBOSE:-0}"
ALLOW_PENDING_ISSUES=0

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
    --allow-pending-issues)
      ALLOW_PENDING_ISSUES=1
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
node "${ROOT_DIR}/scripts/lib/run-truncated.mjs" node "${BRIEF_SCRIPT}"

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
persona_slice_dir="$(basename "${persona_log}" .md)"
persona_slice_dir="${persona_slice_dir#audit-log-}"
persona_slice_dir="${detail_log_root}/${persona_slice_dir}"
latest_slice_file="$(latest_persona_slice_file "${detail_log_root}" "${persona_log}")"
persona_checkpoint_dir="${checkpoint_root}/${persona_slug}"
latest_checkpoint_file="$(latest_persona_checkpoint_file "${checkpoint_root}" "${persona_slug}")"
exec_strategy="${PI_EXEC_STRATEGY:-$(json_get_or_default runner.pi_exec_strategy dangerous)}"

if [[ "${ALLOW_PENDING_ISSUES}" != "1" ]]; then
  enforce_issue_followup_gate "${latest_slice_file}"
else
  echo "[phase11-once] bypassing slice issue ledger gate because --allow-pending-issues was provided" | tee -a "${LOG_FILE}"
fi

slice_timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
SLICE_ID="${slice_timestamp}-${persona_slug}"
SLICE_DIR="${SLICE_ROOT_DIR}/${SLICE_ID}"
DEBUG_DIR="${SLICE_DIR}/debug"
SLICE_PROMPT_FILE="${SLICE_DIR}/prompt.md"
SLICE_LAST_MESSAGE_FILE="${SLICE_DIR}/last-message.txt"
STARTUP_CONTEXT_FILE="${SLICE_DIR}/startup-context.json"
EVENT_LOG_FILE="${SLICE_DIR}/events.jsonl"
CHECKPOINT_LOG_FILE="${SLICE_DIR}/checkpoints.jsonl"
STREAM_SUMMARY_FILE="${SLICE_DIR}/stream-summary.json"
SUMMARY_FILE="${SLICE_DIR}/summary.json"
CONTINUITY_FILE="${SLICE_DIR}/continuity.json"
RAW_JSONL_TEMP="${SLICE_DIR}/raw-pi-events.tmp.jsonl"
DEBUG_CANDIDATES_TEMP="${SLICE_DIR}/suspicious-commands.tmp.jsonl"
CHANGED_FILES_FILE="${SLICE_DIR}/changed-files.txt"
FINAL_DIFF_FILE="${SLICE_DIR}/final.diff"

mkdir -p "${SLICE_DIR}" "${DEBUG_DIR}"

export AGENT_BROWSER_SESSION_NAME="${AGENT_BROWSER_SESSION_NAME:-${session_name}}"
export AGENT_BROWSER_ARGS="${AGENT_BROWSER_ARGS:---no-sandbox}"
export JONES_VIBES_APP_URL="${app_url}"

check_browser_health "${AGENT_BROWSER_SESSION_NAME}"
verify_browser_continuity
write_startup_context_file

{
  cat "${PROMPT_TEMPLATE}"
  cat <<EOF

## Runner Context
- Startup context file: ${STARTUP_CONTEXT_FILE}
- Continuity artifact: ${CONTINUITY_FILE}
- App URL: ${app_url}
- Run-state path: docs/workflows/cyberpunk-overhaul/run-state.json
- Active persona: ${persona_name}
- Latest checkpoint save file: ${latest_checkpoint_file:-"(none yet)"}
- Expected next action: ${next_slice}
- agent-browser session name: ${AGENT_BROWSER_SESSION_NAME}
EOF
} >"${SLICE_PROMPT_FILE}"

cp "${SLICE_PROMPT_FILE}" "${PROMPT_FILE}"

snapshot_control_surface before

AGENT_EXEC="${AGENT_EXEC:-pi}"

case "${AGENT_EXEC}" in
  pi)
    pi_args=(
      pi
      exec
      --ephemeral
      --json
      -C "${ROOT_DIR}"
      -o "${SLICE_LAST_MESSAGE_FILE}"
    )
    ;;
  opencode)
    pi_args=(
      bash
      -c
      'opencode run --dir "${@:1:1}" --format json "$(cat "${@:2:1}")"'
      -- "${ROOT_DIR}" "${SLICE_PROMPT_FILE}"
    )
    ;;
  *)
    echo "[phase11-once] unknown AGENT_EXEC: ${AGENT_EXEC}" >&2
    exit 1
    ;;
esac

if [[ "${AGENT_EXEC}" == "pi" ]]; then
  case "${exec_strategy}" in
    dangerous)
      pi_args+=(--dangerously-bypass-approvals-and-sandbox)
      ;;
    full-auto)
      pi_args+=(--full-auto)
      ;;
    *)
      ;;
  esac

  if [[ -n "${PI_MODEL:-}" ]]; then
    pi_args+=(-m "${PI_MODEL}")
  fi
fi

{
  echo
  echo "===== $(date -Iseconds) phase11-once ====="
  echo "[phase11-once] persona=${persona_name}"
  echo "[phase11-once] app_url=${app_url}"
  echo "[phase11-once] session_name=${AGENT_BROWSER_SESSION_NAME}"
  echo "[phase11-once] exec_strategy=${exec_strategy}"
  echo "[phase11-once] agent_exec=${AGENT_EXEC}"
  echo "[phase11-once] auto_commit=${AUTO_COMMIT}"
  echo "[phase11-once] force_verbose=${FORCE_VERBOSE}"
  echo "[phase11-once] slice_id=${SLICE_ID}"
  echo "[phase11-once] slice_dir=${SLICE_DIR}"
} >>"${LOG_FILE}"

if [[ "${DRY_RUN}" == "1" ]]; then
  echo "[phase11-once] dry run"
  echo "[phase11-once] prompt file: ${SLICE_PROMPT_FILE}"
  echo "[phase11-once] pi args: ${pi_args[*]} -"
  cat "${SLICE_PROMPT_FILE}"
  exit 0
fi

pi_exit=0
parser_exit=0
tee_exit=0

set +e
"${pi_args[@]}" - <"${SLICE_PROMPT_FILE}" \
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

pi_exit="${pipeline_status[0]}"
parser_exit="${pipeline_status[1]}"
tee_exit="${pipeline_status[2]}"

if [[ "${parser_exit}" != "0" || "${tee_exit}" != "0" ]]; then
  echo "[phase11-once] logging pipeline failed: pi_exit=${pi_exit} parser_exit=${parser_exit} tee_exit=${tee_exit}" | tee -a "${LOG_FILE}"
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
if [[ "${FORCE_VERBOSE}" == "1" || "${pi_exit}" != "0" || "${status_after}" == "blocked" || "${needs_human_after}" == "true" ]]; then
  debug_preserved=1
fi

if [[ "${debug_preserved}" == "0" && -f "${STREAM_SUMMARY_FILE}" ]]; then
  if node -e 'const fs = require("fs"); const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.exit(data.debug?.escalated ? 0 : 1);' "${STREAM_SUMMARY_FILE}"; then
    debug_preserved=1
  fi
fi

if [[ "${debug_preserved}" == "1" ]]; then
  mv "${RAW_JSONL_TEMP}" "${DEBUG_DIR}/raw-pi-events.jsonl"
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
echo "[phase11-once] post-run status=${status_after} needs_human=${needs_human_after} pi_exit=${pi_exit} ${metrics_line}" | tee -a "${LOG_FILE}"

if [[ "${AUTO_COMMIT}" != "1" ]]; then
  exit "${pi_exit}"
fi

if ! worktree_is_dirty; then
  echo "[phase11-once] auto-commit skipped: slice produced no git changes" | tee -a "${LOG_FILE}"
  exit "${pi_exit}"
fi

last_run_at="$(json_get_or_default last_run.at "$(date -Iseconds)")"
commit_message="Phase 11 slice: ${persona_slug} (${status_after}) ${last_run_at}"

git -C "${ROOT_DIR}" add -A
git -C "${ROOT_DIR}" commit -m "${commit_message}" | tee -a "${LOG_FILE}"
echo "[phase11-once] auto-commit created: ${commit_message}" | tee -a "${LOG_FILE}"
exit "${pi_exit}"
