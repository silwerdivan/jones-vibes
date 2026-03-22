import { describe, expect, it } from 'vitest';
import {
  buildCheckpointSessionProbeExpression,
  isAppSessionSnapshot,
  LIVE_SESSION_BRIDGE_KEY,
  SAVE_STORAGE_KEY,
  selectAuthoritativeBrowserState,
} from '../../scripts/lib/phase11-checkpoint-session-utils.mjs';

describe('phase11 checkpoint session utils', () => {
  it('prefers live session state over persisted storage', () => {
    const selected = selectAuthoritativeBrowserState({
      liveState: { turn: 8, pendingTurnSummary: { title: 'Week 7' } },
      persistedState: { turn: 6 },
    });

    expect(selected).toEqual({
      source: 'live_session',
      state: { turn: 8, pendingTurnSummary: { title: 'Week 7' } },
    });
  });

  it('falls back to local storage when no live bridge is present', () => {
    const selected = selectAuthoritativeBrowserState({
      liveState: null,
      persistedState: { turn: 6 },
    });

    expect(selected).toEqual({
      source: 'local_storage',
      state: { turn: 6 },
    });
  });

  it('builds a probe expression that reads both live and persisted browser state', () => {
    const expression = buildCheckpointSessionProbeExpression();
    const storage = new Map<string, string>([
      [SAVE_STORAGE_KEY, '{"turn":6,"pendingTurnSummary":{"title":"Week 5"}}'],
    ]);
    const result = JSON.parse(Function(
      'window',
      'localStorage',
      'location',
      `"use strict"; return ${expression};`
    )(
      {
        [LIVE_SESSION_BRIDGE_KEY]: {
          getGameStateSnapshot: () => ({ turn: 8, pendingTurnSummary: { title: 'Week 7' } }),
        },
      },
      {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
      },
      {
        href: 'http://127.0.0.1:5173/jones-vibes/',
      }
    ));

    expect(result).toEqual({
      href: 'http://127.0.0.1:5173/jones-vibes/',
      hasBridge: true,
      liveState: { turn: 8, pendingTurnSummary: { title: 'Week 7' } },
      persistedState: { turn: 6, pendingTurnSummary: { title: 'Week 5' } },
    });
  });

  it('recognizes snapshots that already point at the app', () => {
    expect(isAppSessionSnapshot(
      { href: 'http://127.0.0.1:5173/jones-vibes/#/city' },
      'http://127.0.0.1:5173/jones-vibes/'
    )).toBe(true);
    expect(isAppSessionSnapshot(
      { href: 'https://example.com/' },
      'http://127.0.0.1:5173/jones-vibes/'
    )).toBe(false);
  });
});
