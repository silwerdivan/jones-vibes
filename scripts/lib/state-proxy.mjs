#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runAgentBrowserBatch } from './agent-browser-wrapper.mjs';

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
  
  try {
    const batchResults = runAgentBrowserBatch([['eval', expression]], {
      sessionName: session,
    });
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
    const state = raw ? JSON.parse(raw) : null;
    const p = (state && state.players) ? state.players[state.currentPlayerIndex] : {};
    
    return {
      turn: state ? state.turn : null,
      gameOver: state ? !!state.gameOver : false,
      activeScreenId: state ? state.activeScreenId : null,
      activeLocationDashboard: state ? state.activeLocationDashboard : null,
      activeChoiceContext: state ? state.activeChoiceContext : null,
      activeEvent: state ? state.activeEvent : null,
      activeGraduation: state ? state.activeGraduation : null,
      isAIThinking: state ? !!state.isAIThinking : false,
      hasPendingTurnSummary: state ? !!state.pendingTurnSummary : false,
      
      // Player stats
      credits: p.credits ?? null,
      savings: p.savings ?? null,
      sanity: p.sanity ?? null,
      hunger: p.hunger ?? null,
      location: p.location ?? null,
      time: p.time ?? null,
      debt: p.debt ?? null,
      loan: p.loan ?? null,
      educationLevel: p.educationLevel ?? 0,
      careerLevel: p.careerLevel ?? 0,
      hasCar: !!p.hasCar,
      inventoryCount: (p.inventory || []).length,
      activeConditions: (p.activeConditions || []).map(c => c.name),
      
      // UI / Modal state
      modalActive: document.body.classList.contains('modal-active') && (
        (!!document.querySelector('.modal-overlay:not(.hidden)') && document.querySelector('.modal-overlay:not(.hidden)').offsetParent !== null) ||
        (!!document.querySelector('#choice-modal-overlay:not(.hidden)') && document.querySelector('#choice-modal-overlay:not(.hidden)').offsetParent !== null) ||
        (!!document.querySelector('#player-stats-modal-overlay:not(.hidden)') && document.querySelector('#player-stats-modal-overlay:not(.hidden)').offsetParent !== null) ||
        (!!document.querySelector('#intel-terminal-overlay:not(.hidden)') && document.querySelector('#intel-terminal-overlay:not(.hidden)').offsetParent !== null) ||
        (!!document.querySelector('#turn-summary-modal:not(.hidden)') && document.querySelector('#turn-summary-modal:not(.hidden)').offsetParent !== null) ||
        (!!document.querySelector('#graduation-modal:not(.hidden)') && document.querySelector('#graduation-modal:not(.hidden)').offsetParent !== null)
      ),
      locationModalOpen: (!!document.querySelector('.location-modal:not(.hidden)') && document.querySelector('.location-modal:not(.hidden)').offsetParent !== null) ||
                        (!!document.querySelector('.location-dashboard:not(.hidden)') && document.querySelector('.location-dashboard:not(.hidden)').offsetParent !== null),
      onboardingVisible: (!!document.querySelector('.onboarding-screen') && document.querySelector('.onboarding-screen').offsetParent !== null) || (!!document.querySelector('.eula-container') && document.querySelector('.eula-container').offsetParent !== null),
      eulaVisible: (!!document.querySelector('.eula-modal-overlay') && document.querySelector('.eula-modal-overlay').offsetParent !== null) || (!!document.querySelector('.eula-container') && document.querySelector('.eula-container').offsetParent !== null),
      hudVisible: !!document.querySelector('.hud') && document.querySelector('.hud').offsetParent !== null
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

  const summary = `Location: ${newState.location} | Turn: ${newState.turn} | Credits: ${newState.credits} | Hunger: ${newState.hunger} | Sanity: ${newState.sanity} | Time: ${newState.time}CH`;
  console.log(`Screen: ${newState.activeScreenId}${newState.activeChoiceContext ? ' | Choice: ' + JSON.stringify(newState.activeChoiceContext) : ''}`);
  console.log(summary);
  console.log(`Education: ${newState.educationLevel} | Career: ${newState.careerLevel}`);
  if (newState.savings > 0 || newState.debt > 0 || newState.loan > 0) {
    console.log(`Savings: ${newState.savings} | Debt: ${newState.debt} | Loan: ${newState.loan}`);
  }

  if (!diff) {
    console.log('State: UNCHANGED');
  } else {
    console.log('State: CHANGED');
    for (const key in diff) {
      console.log(`  ${key}: ${JSON.stringify(diff[key].from)} -> ${JSON.stringify(diff[key].to)}`);
    }
  }
  
  if (newState.isAIThinking) console.log('!! AI is thinking');
  if (newState.hasPendingTurnSummary) console.log('!! Pending turn summary visible');
  if (newState.modalActive) console.log('!! Modal active');
  if (newState.locationModalOpen) console.log('!! Location modal open');
  if (newState.onboardingVisible) console.log('!! Onboarding screen visible');
  if (newState.eulaVisible) console.log('!! EULA modal visible');
  if (newState.gameOver) console.log('!! GAME OVER');
  if (newState.activeEvent) console.log(`!! Active Event: ${newState.activeEvent.title || 'Unknown'}`);
  
} else if (command === 'reset') {
  if (fs.existsSync(CACHE_FILE)) {
    fs.unlinkSync(CACHE_FILE);
    console.log('Cache reset.');
  }
} else {
  console.log('Usage: node scripts/lib/state-proxy.mjs [get|reset]');
}
