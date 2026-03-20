import { describe, expect, it } from 'vitest';
import { buildCheckpointPaths, sanitizeLabel, summarizeSaveState } from '../../scripts/lib/phase11-checkpoint-utils.mjs';

describe('phase11 checkpoint utils', () => {
  it('normalizes checkpoint labels into stable filenames', () => {
    expect(sanitizeLabel('Week 10 Summary')).toBe('week-10-summary');
    expect(sanitizeLabel('  persona_a/week#11  ')).toBe('persona_a-week-11');
  });

  it('builds persona-scoped checkpoint paths', () => {
    const paths = buildCheckpointPaths({
      rootDir: '/tmp/checkpoints',
      personaId: 'persona_a',
      label: 'Week 10',
    });

    expect(paths.personaDir).toBe('/tmp/checkpoints/persona_a');
    expect(paths.savePath).toBe('/tmp/checkpoints/persona_a/week-10-save.json');
    expect(paths.metaPath).toBe('/tmp/checkpoints/persona_a/week-10-meta.json');
  });

  it('summarizes the current player from a saved game payload', () => {
    const summary = summarizeSaveState({
      players: [
        {
          id: 1,
          name: 'Safe Grinder',
          credits: 1188,
          savings: 0,
          debt: 0,
          loan: 0,
          hunger: 60,
          sanity: 20,
          educationLevel: 0,
          careerLevel: 1,
          time: 24,
          location: 'Hab-Pod 404',
          activeConditions: [],
        },
        {
          id: 2,
          name: 'AI Opponent',
          credits: 0,
          savings: 0,
          debt: 89,
          loan: 0,
          hunger: 0,
          sanity: 80,
          educationLevel: 0,
          careerLevel: 0,
          time: 24,
          location: 'Hab-Pod 404',
          activeConditions: [],
        },
      ],
      currentPlayerIndex: 0,
      turn: 10,
      gameOver: false,
      activeScreenId: 'city',
      activeLocationDashboard: null,
      pendingTurnSummary: { title: 'Week 10' },
      isAIThinking: false,
    });

    expect(summary.turn).toBe(10);
    expect(summary.hasPendingTurnSummary).toBe(true);
    expect(summary.currentPlayer?.credits).toBe(1188);
    expect(summary.currentPlayer?.hunger).toBe(60);
    expect(summary.currentPlayer?.sanity).toBe(20);
  });
});
