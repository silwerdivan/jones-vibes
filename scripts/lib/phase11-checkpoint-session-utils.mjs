export const LIVE_SESSION_BRIDGE_KEY = '__JONES_FASTLANE_SESSION__';
export const SAVE_STORAGE_KEY = 'jones_fastlane_save';

export function buildCheckpointSessionProbeExpression({
  bridgeKey = LIVE_SESSION_BRIDGE_KEY,
  storageKey = SAVE_STORAGE_KEY,
} = {}) {
  return `JSON.stringify((() => {
      const safeParse = (raw) => {
        if (typeof raw !== 'string' || raw.length === 0) {
          return null;
        }

        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      };

      const bridge = window[${JSON.stringify(bridgeKey)}];
      const liveState =
        bridge && typeof bridge.getGameStateSnapshot === 'function'
          ? bridge.getGameStateSnapshot()
          : null;
      const rawPersistedState = localStorage.getItem(${JSON.stringify(storageKey)});

      return {
        href: location.href,
        hasBridge: !!bridge,
        liveState,
        persistedState: safeParse(rawPersistedState),
      };
    })())`;
}

export function selectAuthoritativeBrowserState(snapshot) {
  if (snapshot?.liveState && typeof snapshot.liveState === 'object') {
    return {
      source: 'live_session',
      state: snapshot.liveState,
    };
  }

  if (snapshot?.persistedState && typeof snapshot.persistedState === 'object') {
    return {
      source: 'local_storage',
      state: snapshot.persistedState,
    };
  }

  return null;
}

export function isAppSessionSnapshot(snapshot, appUrl) {
  if (!snapshot?.href || !appUrl) {
    return false;
  }

  return snapshot.href === appUrl || snapshot.href.startsWith(`${appUrl}#`);
}
