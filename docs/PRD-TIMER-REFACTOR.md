# PRD: Deterministic Delay & Timer Refactoring

## 1. Executive Summary
**Objective:** Replace all non-deterministic `setTimeout` calls with a centralized, cancellable, and promise-based timing service.
**Goal:** Eliminate "ghost" UI events, resolve race conditions during state transitions, and provide a stable foundation for the Agent Protocol's deterministic execution.

## 2. Problem Statement
The codebase currently relies on scattered `setTimeout` calls (ranging from 100ms to 1000ms) to manage game flow (e.g., AI turns, auto-arrival, UI particles). This pattern is problematic for several reasons:
*   **Race Conditions:** Closing a modal while a `setTimeout` is pending often leads to the modal "re-popping" after 1s (e.g., Labor Sector glitch).
*   **Non-Determinism:** The "Agent Protocol" needs to invoke actions instantly. `setTimeout` forces the protocol to either wait artificially or risk overlapping state changes.
*   **Leakage:** Orphaned timers continue to execute callbacks even after the associated component has been unmounted or the game state has shifted.

## 3. Product Requirements (PRs)

### PR-1: Centralized `TimerService`
The system must provide a unified `TimerService` (`src/services/TimerService.ts`):
- **Cancellable Delays:** Support for `await timerService.wait(ms, tag)` where a "tag" allows for group-based cancellation.
- **AbortController Integration:** Under-the-hood use of `AbortController` to stop all pending logic instantly upon location change or game reset.

### PR-2: Tagged Execution
Timers must be categorized to allow granular control:
- `AI_TURN`: Delays between AI decision-making steps.
- `UI_TRANSITION`: Modal fade-outs and view refreshes.
- `FEEDBACK`: Particle effects and notification timeouts.
- `STATE_LOCK`: Grace periods for turn finalization.

### PR-3: Modal & State Synchronization
- **Lifecycle Hooks:** When a UI modal is hidden or a location is changed, all timers tagged for that context must be automatically purged.
- **Auto-Arrival Refactor:** The 1s delay in `GameState._checkAutoEndTurn` must be converted to a trackable task that can be "skipped" or "acknowledged" by the Agent Protocol.

### PR-4: Testing Support
- **Time Dilation:** The service should allow tests to "fast-forward" or "instant-resolve" all pending timers without manual `vi.runAllTimers()` manipulation where possible.

## 4. Success Metrics
| Metric | Baseline | Target |
| :--- | :--- | :--- |
| **"Ghost" UI Popups** | Reported (Labor Sector) | 0% occurrence |
| **Agent Action Latency** | High (waiting for UI) | Instant (skipping timers) |
| **Memory Leaks** | Low (orphaned timers) | 0 (fully purged) |
| **Test Stability** | Flaky (async races) | High (deterministic) |

## 5. Constraints & Out-of-Scope
- **CSS Animations:** This refactor does not replace CSS-based transitions, only the *logical* delays that trigger state changes.
- **Real-Time Loop:** This is not a high-frequency game loop (60fps); it's for discrete "turn-based" delays.

## 6. Implementation Strategy (High Level)
1.  **Introduce `TimerService`:** Implement the class and a global instance.
2.  **Refactor Core Logic:** Convert `GameState` and `TimeSystem` from `setTimeout` to `await wait()`.
3.  **Refactor UI Layer:** Replace `trackedTimeouts` in `UIManager` with the new service.
4.  **Enforce Lifecycle Purge:** Hook `locationChanged` and `modalHidden` events to the `cancel(tag)` methods.
