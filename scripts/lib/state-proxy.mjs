#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const RUNTIME_DIR = path.join(ROOT_DIR, '.codex-runtime/cyberpunk-overhaul');
const CACHE_FILE = path.join(RUNTIME_DIR, 'last-state-proxy.json');
const RUN_STATE_FILE = path.join(ROOT_DIR, 'docs/workflows/cyberpunk-overhaul/run-state.json');

function getBrowserSession() {
  if (process.env.AGENT_BROWSER_SESSION_NAME) {
    return process.env.AGENT_BROWSER_SESSION_NAME;
  }
  
  try {
    const runState = JSON.parse(fs.readFileSync(RUN_STATE_FILE, 'utf8'));
    return runState.current_persona?.agent_browser_session_name || 'cyberpunk-audit';
  } catch (e) {
    return 'cyberpunk-audit';
  }
}

function runEval(expression) {
  const session = getBrowserSession();
  const extraArgs = (process.env.AGENT_BROWSER_ARGS || '').trim();
  const browserArgs = extraArgs ? [`--args=${extraArgs}`] : (process.platform === 'linux' ? ['--args=--no-sandbox'] : []);
  
  // Use batch mode with --json for robust UTF-8 and multi-line support
  const batchCommands = [['eval', expression]];
  const commandArgs = ['--session-name', session, '--json'];
  
  try {
    // Command FIRST, then options
    const output = execFileSync('agent-browser', ['batch', ...commandArgs, ...browserArgs], {
      input: JSON.stringify(batchCommands),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'], // Capture stderr for debugging
      maxBuffer: 20 * 1024 * 1024,
    });
    
    const batchResults = JSON.parse(output);
    const firstResult = batchResults[0];
    
    if (!firstResult || !firstResult.success) {
      throw new Error(firstResult?.error || 'Unknown evaluation error in batch');
    }
    
    return firstResult.result?.result ?? null;
  } catch (error) {
    if (error.stderr) console.error(`Stderr: ${error.stderr}`);
    console.error(`Error: agent-browser eval failed: ${error.message}`);
    process.exit(1);
  }
}

function getFullState() {
  const expression = `(() => {
    const raw = localStorage.getItem('jones_fastlane_save');
    if (!raw) return null;
    const state = JSON.parse(raw);
    const p = state.players[state.currentPlayerIndex] || {};
    return {
      turn: state.turn,
      activeScreenId: state.activeScreenId,
      credits: p.credits,
      savings: p.savings,
      sanity: p.sanity,
      hunger: p.hunger,
      location: p.location,
      time: p.time,
      debt: p.debt,
      activeConditions: (p.activeConditions || []).map(c => c.name),
      isAIThinking: !!state.isAIThinking,
      hasPendingTurnSummary: !!state.pendingTurnSummary
    };
  })()`;
  return runEval(expression);
}

function getDiff(oldState, newState) {
  if (!oldState) return null;
  
  const diff = {};
  let hasChanges = false;
  for (const key in newState) {
    if (JSON.stringify(oldState[key]) !== JSON.stringify(newState[key])) {
      diff[key] = {
        from: oldState[key],
        to: newState[key]
      };
      hasChanges = true;
    }
  }
  return hasChanges ? diff : null;
}

const args = process.argv.slice(2);
const command = args[0] || 'get';

if (command === 'get') {
  const newState = getFullState();
  if (!newState) {
    console.log('No game state found in browser.');
    process.exit(0);
  }

  let oldState = null;
  if (fs.existsSync(CACHE_FILE)) {
    try {
      oldState = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (e) {
      // ignore
    }
  }

  const diff = getDiff(oldState, newState);
  
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(newState, null, 2));

  if (!diff) {
    console.log('State: UNCHANGED');
    console.log(`Location: ${newState.location} | Turn: ${newState.turn} | Credits: ${newState.credits} | Hunger: ${newState.hunger} | Sanity: ${newState.sanity}`);
  } else {
    console.log('State: CHANGED');
    for (const key in diff) {
      console.log(`  ${key}: ${JSON.stringify(diff[key].from)} -> ${JSON.stringify(diff[key].to)}`);
    }
    console.log('---');
    console.log(`Location: ${newState.location} | Turn: ${newState.turn} | Credits: ${newState.credits} | Hunger: ${newState.hunger} | Sanity: ${newState.sanity}`);
  }
  
  if (newState.isAIThinking) console.log('!! AI is thinking');
  if (newState.hasPendingTurnSummary) console.log('!! Pending turn summary visible');
  
} else if (command === 'reset') {
  if (fs.existsSync(CACHE_FILE)) {
    fs.unlinkSync(CACHE_FILE);
    console.log('Cache reset.');
  }
} else {
  console.log('Usage: node scripts/lib/state-proxy.mjs [get|reset]');
}
