export const LIVE_SESSION_BRIDGE_KEY = '__JONES_FASTLANE_SESSION__';
export const SAVE_STORAGE_KEY = 'jones_fastlane_save';

function visibleElementProbe(selector) {
  return `(() => {
        const node = document.querySelector(${JSON.stringify(selector)});
        if (!node) {
          return false;
        }

        return !node.classList.contains('hidden') && !node.closest('.hidden');
      })()`;
}

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
      const onboardingVisible =
        ${visibleElementProbe('#eula-accept-btn')} ||
        ${visibleElementProbe('.eula-modal-overlay')} ||
        ${visibleElementProbe('#eula-status-text')};

      return {
        href: location.href,
        hasBridge: !!bridge,
        onboardingVisible,
        hasPersistedState: typeof rawPersistedState === 'string' && rawPersistedState.length > 0,
        liveState,
        persistedState: safeParse(rawPersistedState),
      };
    })())`;
}

export function selectAuthoritativeBrowserState(snapshot) {
  if (snapshot?.onboardingVisible) {
    return null;
  }

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

export function determineContinuityStatus({
  snapshot,
  browserSummary,
  checkpointSummary,
  latestSavePath,
  matchesLatestCheckpoint,
}) {
  if (snapshot?.onboardingVisible) {
    return latestSavePath ? 'onboarding_visible' : 'onboarding_visible_no_checkpoint';
  }

  if (!browserSummary) {
    return latestSavePath ? 'missing_browser_save' : 'missing_browser_save_no_checkpoint';
  }

  if (checkpointSummary && matchesLatestCheckpoint === false) {
    return 'mismatch';
  }

  if (!checkpointSummary) {
    return 'ok_no_checkpoint';
  }

  return 'ok';
}
