#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  buildCheckpointPaths,
  buildLocalStorageImportExpression,
  summarizeSaveState,
} from './lib/phase11-checkpoint-utils.mjs';
import {
  buildCheckpointSessionProbeExpression,
  determineContinuityStatus,
  isAppSessionSnapshot,
  selectAuthoritativeBrowserState,
} from './lib/phase11-checkpoint-session-utils.mjs';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DEFAULT_RUN_STATE = path.join(ROOT_DIR, 'docs/workflows/cyberpunk-overhaul/run-state.json');

function usage() {
  console.log(`Usage:
  node scripts/cyberpunk-overhaul-phase11-checkpoint.mjs status [--run-state <path>] [--quiet]
  node scripts/cyberpunk-overhaul-phase11-checkpoint.mjs export --label <label> [--run-state <path>] [--quiet]
  node scripts/cyberpunk-overhaul-phase11-checkpoint.mjs import [--save <path>] [--run-state <path>] [--quiet]
`);
}

function parseArgs(argv) {
  const args = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = true;
    }
  }

  return args;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
}

function updateRunState(runStatePath, mutate) {
  const runState = readJson(runStatePath);
  mutate(runState);
  writeJson(runStatePath, runState);
}

function parseAgentBrowserOutput(output) {
  const trimmed = output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (trimmed.length === 0) {
    return '';
  }

  return trimmed[trimmed.length - 1];
}

function getBrowserArgs(configuredArgs = []) {
  const extraArgs = (process.env.AGENT_BROWSER_ARGS || '').trim();
  if (extraArgs) {
    return ['--args', extraArgs];
  }

  if (Array.isArray(configuredArgs) && configuredArgs.length > 0) {
    return ['--args', configuredArgs.join(' ')];
  }

  return [];
}

function runAgentBrowser(browserArgs, commandArgs) {
  return execFileSync('agent-browser', [...getBrowserArgs(browserArgs), ...commandArgs], {
    cwd: ROOT_DIR,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 10 * 1024 * 1024,
  });
}

function evalInSession(sessionName, expression, browserArgs) {
  const output = runAgentBrowser(browserArgs, ['--session-name', sessionName, 'eval', expression]);
  const payload = parseAgentBrowserOutput(output);
  if (!payload) {
    return null;
  }
  return JSON.parse(payload);
}

function openApp(sessionName, appUrl, browserArgs) {
  runAgentBrowser(browserArgs, ['--session-name', sessionName, 'open', appUrl]);
  runAgentBrowser(browserArgs, ['--session-name', sessionName, 'wait', '--load', 'networkidle']);
}

function tryEvalInSession(sessionName, expression, browserArgs) {
  try {
    return evalInSession(sessionName, expression, browserArgs);
  } catch {
    return null;
  }
}

function decodeSessionSnapshot(snapshot) {
  if (typeof snapshot !== 'string') {
    return snapshot;
  }

  try {
    return JSON.parse(snapshot);
  } catch {
    return null;
  }
}

function readBrowserSessionState(context, options = {}) {
  const { sessionName, appUrl, browserArgs } = context;
  const ensureApp = options.ensureApp !== false;
  let snapshot = decodeSessionSnapshot(tryEvalInSession(
    sessionName,
    buildCheckpointSessionProbeExpression(),
    browserArgs
  ));

  if ((!snapshot || !isAppSessionSnapshot(snapshot, appUrl)) && ensureApp) {
    openApp(sessionName, appUrl, browserArgs);
    snapshot = decodeSessionSnapshot(tryEvalInSession(
      sessionName,
      buildCheckpointSessionProbeExpression(),
      browserArgs
    ));
  }

  return {
    snapshot,
    authoritativeBrowserState: selectAuthoritativeBrowserState(snapshot),
  };
}

function latestCheckpointSavePath(personaDir) {
  if (!fs.existsSync(personaDir)) {
    return '';
  }

  const saveFiles = fs
    .readdirSync(personaDir)
    .filter((name) => name.endsWith('-save.json'))
    .sort();

  return saveFiles.length > 0 ? path.join(personaDir, saveFiles[saveFiles.length - 1]) : '';
}

function deriveContext(runStatePath) {
  const runState = readJson(runStatePath);
  const checkpointRoot = runState.checkpointing?.root || 'docs/workflows/cyberpunk-overhaul/checkpoints';

  return {
    runState,
    runStatePath,
    appUrl: runState.runtime?.app_url,
    browserArgs: Array.isArray(runState.runtime?.browser_args) ? runState.runtime.browser_args : [],
    sessionName: runState.current_persona?.agent_browser_session_name,
    personaId: runState.current_persona?.id || 'persona',
    checkpointRootAbs: path.resolve(ROOT_DIR, checkpointRoot),
    checkpointRootRel: checkpointRoot,
  };
}

function printResult(payload, quiet = false) {
  if (quiet) {
    return;
  }

  console.log(JSON.stringify(payload, null, 2));
}

function exportCheckpoint(context, label, options = {}) {
  const { sessionName, appUrl, browserArgs, personaId, checkpointRootAbs, runStatePath, checkpointRootRel } = context;
  if (!label) {
    throw new Error('Export requires --label <label>.');
  }

  const { authoritativeBrowserState } = readBrowserSessionState(context, { ensureApp: true });
  if (!authoritativeBrowserState) {
    throw new Error(`No live session state or jones_fastlane_save value found in session '${sessionName}'.`);
  }

  const saveState = authoritativeBrowserState.state;
  const summary = summarizeSaveState(saveState);
  const paths = buildCheckpointPaths({ rootDir: checkpointRootAbs, personaId, label });
  const exportedAt = new Date().toISOString();

  fs.mkdirSync(paths.personaDir, { recursive: true });
  fs.writeFileSync(paths.savePath, `${JSON.stringify(saveState, null, 2)}\n`);
  writeJson(paths.metaPath, {
    exported_at: exportedAt,
    session_name: sessionName,
    app_url: appUrl,
    checkpoint_root: checkpointRootRel,
    checkpoint_label: paths.label,
    browser_state_source: authoritativeBrowserState.source,
    summary,
  });

  updateRunState(runStatePath, (runState) => {
    runState.checkpointing = runState.checkpointing || {};
    runState.checkpointing.root = checkpointRootRel;
    runState.checkpointing.latest_save_path = path.relative(ROOT_DIR, paths.savePath);
    runState.checkpointing.latest_metadata_path = path.relative(ROOT_DIR, paths.metaPath);
    runState.checkpointing.last_exported_at = exportedAt;
  });

  printResult({
    action: 'export',
    save_path: path.relative(ROOT_DIR, paths.savePath),
    metadata_path: path.relative(ROOT_DIR, paths.metaPath),
    browser_state_source: authoritativeBrowserState.source,
    summary,
  }, options.quiet);
}

function importCheckpoint(context, savePathArg, options = {}) {
  const { sessionName, appUrl, browserArgs, checkpointRootAbs, personaId, runStatePath, checkpointRootRel } = context;
  const defaultSavePath =
    (context.runState.checkpointing?.latest_save_path && path.resolve(ROOT_DIR, context.runState.checkpointing.latest_save_path)) ||
    latestCheckpointSavePath(path.join(checkpointRootAbs, personaId));
  const savePath = savePathArg ? path.resolve(ROOT_DIR, savePathArg) : defaultSavePath;

  if (!savePath || !fs.existsSync(savePath)) {
    throw new Error('Import requires an existing checkpoint save file. Pass --save <path> or export one first.');
  }

  const rawSave = fs.readFileSync(savePath, 'utf8').trim();
  const parsedSave = JSON.parse(rawSave);
  const summary = summarizeSaveState(parsedSave);

  openApp(sessionName, appUrl, browserArgs);
  evalInSession(
    sessionName,
    buildLocalStorageImportExpression('jones_fastlane_save', rawSave),
    browserArgs
  );
  openApp(sessionName, appUrl, browserArgs);

  const restoredSave = evalInSession(sessionName, "localStorage.getItem('jones_fastlane_save')", browserArgs);
  if (!restoredSave) {
    throw new Error(`Checkpoint import wrote no jones_fastlane_save value into session '${sessionName}'.`);
  }

  const importedAt = new Date().toISOString();
  updateRunState(runStatePath, (runState) => {
    runState.checkpointing = runState.checkpointing || {};
    runState.checkpointing.root = checkpointRootRel;
    runState.checkpointing.latest_save_path = path.relative(ROOT_DIR, savePath);
    runState.checkpointing.last_restored_at = importedAt;
    runState.checkpointing.last_restored_save_path = path.relative(ROOT_DIR, savePath);
  });

  printResult({
    action: 'import',
    restored_save_path: path.relative(ROOT_DIR, savePath),
    summary,
  }, options.quiet);
}

function statusCheckpoint(context, options = {}) {
  const { sessionName, checkpointRootAbs, personaId, runState } = context;
  const { snapshot, authoritativeBrowserState } = readBrowserSessionState(context, { ensureApp: true });
  const browserSummary = authoritativeBrowserState
    ? summarizeSaveState(authoritativeBrowserState.state)
    : null;
  const liveBrowserSummary = snapshot?.liveState ? summarizeSaveState(snapshot.liveState) : null;
  const persistedBrowserSummary = snapshot?.persistedState
    ? summarizeSaveState(snapshot.persistedState)
    : null;
  const discoveredLatestSave = latestCheckpointSavePath(path.join(checkpointRootAbs, personaId));
  const latestSavePath = runState.checkpointing?.latest_save_path ||
    (discoveredLatestSave ? path.relative(ROOT_DIR, discoveredLatestSave) : '');
  const resolvedLatestSavePath = latestSavePath ? path.resolve(ROOT_DIR, latestSavePath) : '';
  const checkpointSummary = resolvedLatestSavePath && fs.existsSync(resolvedLatestSavePath)
    ? summarizeSaveState(readJson(resolvedLatestSavePath))
    : null;
  const matchesLatestCheckpoint = browserSummary && checkpointSummary
    ? JSON.stringify(browserSummary) === JSON.stringify(checkpointSummary)
    : null;
  const continuityStatus = determineContinuityStatus({
    snapshot,
    browserSummary,
    checkpointSummary,
    latestSavePath,
    matchesLatestCheckpoint,
  });

  printResult({
    action: 'status',
    session_name: sessionName,
    continuity_status: continuityStatus,
    continuity_ok: continuityStatus === 'ok' || continuityStatus === 'ok_no_checkpoint',
    has_browser_save: !!browserSummary,
    onboarding_visible: !!snapshot?.onboardingVisible,
    has_persisted_browser_save: !!snapshot?.hasPersistedState,
    has_live_browser_bridge: !!snapshot?.hasBridge,
    browser_state_source: authoritativeBrowserState?.source || null,
    latest_checkpoint_save_path: latestSavePath || '',
    browser_summary: browserSummary,
    live_browser_summary: liveBrowserSummary,
    persisted_browser_summary: persistedBrowserSummary,
    checkpoint_summary: checkpointSummary,
    matches_latest_checkpoint: matchesLatestCheckpoint,
  }, options.quiet);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command || args.help || args.h) {
    usage();
    process.exit(command ? 0 : 1);
  }

  const runStatePath = path.resolve(ROOT_DIR, args['run-state'] || DEFAULT_RUN_STATE);
  const context = deriveContext(runStatePath);
  const options = {
    quiet: !!args.quiet,
  };

  if (!context.sessionName || !context.appUrl) {
    throw new Error('Run-state is missing current persona session name or app URL.');
  }

  switch (command) {
    case 'status':
      statusCheckpoint(context, options);
      break;
    case 'export':
      exportCheckpoint(context, args.label, options);
      break;
    case 'import':
      importCheckpoint(context, args.save, options);
      break;
    default:
      usage();
      process.exit(1);
  }
}

try {
  main();
} catch (error) {
  console.error(`[phase11-checkpoint] ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
