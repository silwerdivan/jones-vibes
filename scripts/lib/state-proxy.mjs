import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const RUNTIME_DIR = path.join(ROOT_DIR, '.codex-runtime/cyberpunk-overhaul');
const CACHE_FILE = path.join(RUNTIME_DIR, 'last-state-proxy.json');

function getBrowserSession() {
  return process.env.AGENT_BROWSER_SESSION_NAME || 'cyberpunk-audit';
}

function parseAgentBrowserOutput(output) {
  const lines = output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return '';
  }

  // The last line is usually the eval result
  return lines[lines.length - 1];
}

function runEval(expression) {
  const session = getBrowserSession();
  const extraArgs = (process.env.AGENT_BROWSER_ARGS || '').trim();
  const argsPart = extraArgs ? `--args "${extraArgs}"` : (process.platform === 'linux' ? '--args "--no-sandbox"' : '');
  const command = `agent-browser eval ${JSON.stringify(expression)} --session-name ${session} ${argsPart}`;
  
  let payload = '';
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    payload = parseAgentBrowserOutput(output);
    if (!payload) {
      console.error('Error: agent-browser eval returned empty result.');
      process.exit(1);
    }
    return JSON.parse(payload);
  } catch (error) {
    if (payload) {
      try {
        return JSON.parse(payload);
      } catch (e) {
        console.error('Error: Failed to parse agent-browser output as JSON.');
        console.error('Raw output:', payload);
        process.exit(1);
      }
    }
    
    console.error('Error: agent-browser command failed.');
    console.error('Command:', command);
    console.error('Message:', error.message);
    if (error.stderr) console.error('Stderr:', error.stderr);
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
  const diff = {};
  if (!oldState) return null;
  
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
      console.log(`  ${key}: ${diff[key].from} -> ${diff[key].to}`);
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
