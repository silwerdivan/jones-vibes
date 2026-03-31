# PRD: OmniLife Agent-Native Protocol

## 1. Executive Summary
**Objective:** Transition the game's automation layer from a high-noise, DOM-scraping model to a low-latency, semantic API model.
**Goal:** Reduce LLM turn count per in-game week from ~80 turns (2.5M tokens) to <10 turns (<100k tokens), while increasing reliability and persona fidelity.

## 2. Problem Statement
The current automation stack (Agent + Browser + DOM) is fundamentally inefficient:
*   **Information Asymmetry:** The Agent receives a raw DOM dump which is 90% noise (boilerplate, styling, hidden nodes).
*   **Lack of Intentionality:** The Agent must "find" buttons instead of "invoking" actions.
*   **Feedback Void:** The Agent has no direct confirmation of action success, leading to repetitive "check-state" turns.
*   **The "Turn Tax":** Every additional turn adds the entire previous history to the context window, causing quadratic token inflation.

## 3. Product Requirements (PRs)

### PR-1: The Unified Agent Manifest
The system must provide a single, structured JSON endpoint (`window.__OMNILIFE_AGENT__.getManifest()`) that includes:
- **State Snapshot:** Current credits, time, location, hunger, sanity, etc.
- **Action Registry:** A list of currently *valid* and *visible* actions (e.g., if at Hab-Pod, `work_shift` is not in the list).
- **Navigation Context:** Flags indicating if a modal is open, a turn summary is pending, or an AI turn is in progress.

### PR-2: Deterministic Action Invocation
The system must allow the Agent to trigger actions via a command-line-style interface (`invoke(actionId, payload)`):
- **Feedback Loop:** Every invocation must return a `Result` object: `{ status: "success" | "error", message: string, stateDelta: object }`.
- **Atomic Execution:** Actions should be processed instantly without waiting for UI animations or DOM transitions.

### PR-3: Semantic Modal Bypass
Logic must be decoupled from the Visual UI:
- **Direct Input:** Actions requiring input (like Travel destination or Bank amount) must be invocable with parameters, bypassing the need to "click" within choice modals.
- **Logic over Layout:** The Agent should interact with the *GameController logic*, not the *UIManager layout*.

### PR-4: Telemetry & Logging
- **Action Tracing:** Every Agent action must be logged in a dedicated "Automation Log" to differentiate between human and agent interactions.
- **Fail-Fast Guardrails:** If the Agent attempts an invalid action or the system returns an error, the run must abort and report a "Protocol Violation" instead of retrying blindly.

## 4. Success Metrics
| Metric | Baseline (Phase 11) | Target (Protocol) |
| :--- | :--- | :--- |
| **Turns per In-Game Week** | ~79 Turns | < 10 Turns |
| **Input Tokens per Slice** | 2,500,000 | < 250,000 |
| **Action Success Rate** | ~60% (due to retries) | > 98% |
| **Developer Lead Time** | High (Debugging DOM) | Low (API Testing) |

## 5. Constraints & Out-of-Scope
- **Human UI Integrity:** The protocol must NOT break the human-playable experience. The UI should still reflect changes triggered by the Agent.
- **Out-of-Scope:** This PRD does not cover the "Mascot AI" or visual upgrades, only the communication protocol between the Agent and the Game Engine.

## 6. Implementation Strategy (High Level)
1.  **Define Protocol Interface:** Map `UI_EVENTS` to a structured Action Schema.
2.  **Refactor GameController:** Separate business logic from modal displays.
3.  **Expose Global Bridge:** Implement `AgentProtocol.ts` as a wrapper around the Controller and State.
4.  **Update Agent Prompt:** Instruct the Agent to use the `__OMNILIFE_AGENT__` interface as its primary sensor and actuator.
