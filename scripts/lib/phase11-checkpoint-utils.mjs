import path from 'node:path';

export function sanitizeLabel(label) {
  const normalized = String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!normalized) {
    throw new Error('Checkpoint label must contain at least one alphanumeric character.');
  }

  return normalized;
}

export function buildCheckpointPaths({ rootDir, personaId, label }) {
  const safeLabel = sanitizeLabel(label);
  const personaDir = path.join(rootDir, personaId);

  return {
    personaDir,
    label: safeLabel,
    savePath: path.join(personaDir, `${safeLabel}-save.json`),
    metaPath: path.join(personaDir, `${safeLabel}-meta.json`),
  };
}

function summarizePlayer(player) {
  if (!player || typeof player !== 'object') {
    return null;
  }

  return {
    id: player.id ?? null,
    name: player.name ?? null,
    credits: player.credits ?? null,
    savings: player.savings ?? null,
    debt: player.debt ?? 0,
    loan: player.loan ?? 0,
    hunger: player.hunger ?? null,
    sanity: player.sanity ?? null,
    educationLevel: player.educationLevel ?? null,
    careerLevel: player.careerLevel ?? null,
    time: player.time ?? null,
    location: player.location ?? null,
    activeConditions: Array.isArray(player.activeConditions) ? player.activeConditions : [],
  };
}

export function summarizeSaveState(saveState) {
  if (!saveState || typeof saveState !== 'object') {
    throw new Error('Cannot summarize empty save state.');
  }

  const players = Array.isArray(saveState.players) ? saveState.players : [];
  const currentPlayerIndex = Number.isInteger(saveState.currentPlayerIndex) ? saveState.currentPlayerIndex : 0;
  const currentPlayer = players[currentPlayerIndex] ?? players[0] ?? null;

  return {
    turn: saveState.turn ?? null,
    currentPlayerIndex,
    gameOver: saveState.gameOver ?? false,
    activeScreenId: saveState.activeScreenId ?? 'city',
    activeLocationDashboard: saveState.activeLocationDashboard ?? null,
    hasPendingTurnSummary: !!saveState.pendingTurnSummary,
    isAIThinking: !!saveState.isAIThinking,
    playerCount: players.length,
    currentPlayer: summarizePlayer(currentPlayer),
  };
}
