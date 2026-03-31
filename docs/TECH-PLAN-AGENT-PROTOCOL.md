# Technical Implementation Plan: OmniLife Agent-Native Protocol

## Overview
This plan details the structural and functional changes required to implement the **Agent-Native Protocol** (PRD-AGENT-PROTOCOL). The goal is to move from "Visual Scraping" to "Semantic Interaction," reducing LLM turn count from ~80 to <10 per in-game week.

## 1. Data Model Updates (`src/models/types.ts`)
Add structured types for deterministic feedback and state snapshots.

- **`ActionResult`**: The standard return type for all agent-invoked actions.
  - `status`: "success" | "error"
  - `message`: Descriptive feedback (e.g., "Insufficient credits").
  - `stateDelta`: (Optional) The specific fields that changed.
- **`AgentManifest`**: The "Sensor" payload.
  - `state`: Clean `PlayerState`.
  - `availableActions`: Array of valid `actionIds` for the current context.
  - `context`: Active modals, turn state, and AI status.

## 2. The Protocol Bridge (`src/game/AgentProtocol.ts`)
Create a new service to act as the "Agent HUD."

- **`getManifest()`**: 
  - Aggregates `GameState.toJSON()` and `UIManager` state.
  - Filters `availableActions` based on:
    - Current Location (e.g., "work_shift" only in Labor Sector).
    - Player Stats (e.g., "take_course" only if credits >= cost).
    - Active UI (e.g., "close_modal" if a modal is open).
- **`invoke(actionId, payload)`**:
  - Maps `actionId` to `GameController` methods.
  - Returns an `ActionResult`.
  - **Fail-Fast**: Throws a structured error if the `actionId` is invalid for the current state.

## 3. GameController Refactoring (`src/game/GameController.ts`)
Refactor methods to support **Direct Execution** (PR-3).

- **Parametric Support**: Update `travel`, `buyItem`, `takeCourse`, `applyForJob`, `deposit`, etc., to accept optional parameters.
  - *Current:* `travel()` -> shows modal.
  - *New:* `travel(dest?: string)` -> if `dest`, execute immediately; else, show modal.
- **Return Values**: Update all action methods to return `ActionResult`.
- **Decoupling**: Move business logic from `uiManager` callbacks into the `GameController` or `GameState` directly.

## 4. Initialization & Exposure (`src/main.ts`)
- Initialize `AgentProtocol` in `main()`.
- Expose it globally: `window.__OMNILIFE_AGENT__ = agentProtocol;`.
- Ensure the protocol is available immediately after `PHASE 4` of initialization.

## 5. Verification Strategy
- **Console Test**: 
  1. `__OMNILIFE_AGENT__.getManifest()` -> Verify actions list.
  2. `__OMNILIFE_AGENT__.invoke('travel', 'Labor Sector')` -> Verify `status: "success"`.
  3. `__OMNILIFE_AGENT__.invoke('work_shift')` -> Verify credits increase.
- **Automation Prompt Update**: Update `autonomous-runner-prompt.md` to prioritize the protocol.
- **Metrics Check**: Run a test week (Persona A) and verify turn count is <10.

## 6. Implementation Phases
1. **Phase I (Types):** Update `types.ts`.
2. **Phase II (Bridge):** Implement `AgentProtocol.ts` with basic `getManifest`.
3. **Phase III (Refactor):** Update `GameController` for `travel` and `workShift`.
4. **Phase IV (Parameters):** Update `GameController` for `buyItem`, `takeCourse`, and `banking`.
5. **Phase V (Integration):** Final wiring in `main.ts` and prompt update.

## 7. Risk Assessment & Mitigation
Based on an audit of `UIManager.ts` and `GameController.ts`, the following risks must be addressed during implementation:

- **Ghost Logic (Orphaned Events):** Banking actions (`BANK_DEPOSIT`, etc.) are currently handled via global events that bypass `GameController`. 
  - *Mitigation:* Centralize all action handling into `GameController` or a unified `ActionHandler` to ensure the Protocol can invoke them.
- **UI-Enforced Visibility:** Logic for "Tabbed" views (e.g., Jobs vs. Hustles in Labor Sector) currently lives in `UIManager`'s DOM manipulation.
  - *Mitigation:* Move "Action Availability" logic into `GameState` or `Systems` so `getManifest()` can accurately report valid actions regardless of UI state.
- **Race Conditions:** `UIManager` and `GameState` use multiple `setTimeout` calls (100ms-1000ms) to "refresh" views or auto-end turns.
  - *Mitigation:* Ensure `GameState` updates are strictly synchronous and atomic. The Protocol should provide a deterministic `acknowledge()` method to clear "Blocking" states (like Graduation or Turn Summaries) instantly, bypassing the need for UI `modalHidden` events.
- **Auto-Arrival & Turn Finalization:** The `_checkAutoEndTurn` logic in `GameState` introduces a 1s delay before turn transition.
  - *Mitigation:* The Protocol's `invoke()` must handle (or suppress) these asynchronous transitions to prevent "Action Spells" (actions attempted during the 1s finalization window).
- **AI Mutex Conflict:** The `isAIThinking` flag blocks all input, including potential Protocol commands.
  - *Mitigation:* The Protocol must return a clear `ActionResult.status: "error"` if an action is attempted while the internal AI is processing, or provide a way to "Yield" the AI turn.
- **State Acknowledgement:** `GameState` currently relies on UI events (e.g., `modalHidden`) to clear internal flags like `activeGraduation`.
  - *Mitigation:* Implement `AgentProtocol.acknowledge(contextType)` to allow the Agent to programmatically "close" modals and clear state flags.
