# Phase 11 Token Efficiency & History Optimization Plan

## Status: Researching / Interrogating
## Goal: Reduce per-slice token consumption by 70-80% without losing reasoning continuity.

---

## 1. Root Cause Analysis (The "Under the Hood" Findings)

### A. The "History Tax" (Quadratic Growth)
- **Problem:** Every turn (exchange) sends the entire history of previous tool results back to the model.
- **Evidence:** Week 10 took 92 commands over ~50 turns. By Turn 50, the agent was re-reading the logs of the previous 49 turns.
- **Impact:** Total input tokens hit 4.2M.

### B. Massive Payload Bloat (The JSON Dump)
- **Problem:** `agent-browser eval` calls often return the full `jones_fastlane_save` object (~56KB).
- **Evidence:** 10 checks = 560KB (~150k tokens) of redundant history.
- **Impact:** Primary driver of "black box" growth.

### C. Encoding Inflation (The Mojibake Tax)
- **Problem:** Currency symbols (₡) and emojis are being expanded into long junk strings (e.g., `ÃÂ¢ÃÂÃÂ¡`).
- **Impact:** High token "noise" and model confusion/retries.

### D. Sequential Verification Loops
- **Problem:** The agent performs "Check -> Act -> Check -> Log" as 4-5 separate turns.
- **Impact:** Each turn multiplies the "History Tax" cost of all previous turns.

### E. "Tool Limping" & Failure Baggage (NEW)
- **Problem:** The agent frequently "fights" with `agent-browser`, leading to multiple failed turns. These failures (and their large error logs) become permanent, expensive baggage in the session history.
- **Evidence from Slice 20260323T143151Z:**
  - **Syntax Errors (4x):** Fighting with `--no-sandbox` placement.
  - **DOM Misses (3x):** Attempting to click elements before they are rendered/visible.
  - **JS Eval Errors (4x):** Syntax errors in complex injected scripts.
  - **Blind Probing (1x):** Dumping the entire DOM to find a missing button.
- **Impact:** Every "limp" turn costs 10k-50k tokens in the *subsequent* turns of the same session.

---

## 2. Mitigation Strategies

### Phase 1: Surgical Data Probing (Immediate)
- **Rule:** Never `eval` a full object if you only need one field.
- **Implementation:** Use `eval("JSON.parse(...).field")` instead of returning the whole save.

### Phase 2: Tool Result Truncation
- **Rule:** The runner should automatically truncate tool results over 2000 chars unless "Full Dump" is explicitly requested.

### Phase 3: Turn Consolidation
- **Rule:** Batch state-checks. Perform Location, Credits, Hunger, and Sanity checks in **one** `eval` call.

### Phase 4: Encoding Sanitization
- **Rule:** Fix the bridge between the browser and the CLI to handle UTF-8 symbols correctly.

### Phase 5: Tool Hygiene & Reliability (NEW)
- **Rule:** Force the agent to use a single, verified command format for `agent-browser`.
- **Implementation:** 
  - Strict "flags first" policy.
  - Mandatory `sleep 1` or "Wait for Selector" logic in the skill to prevent "Element not found" retries.
  - **Recipe Enforcement:** Force the agent to check `agent-browser-recipes.json` before trying a new selector.

### Phase 6: Gameplay & Automation Guardrails (NEW)
- **Rule**: Implement "Fair Play" and "Spatial Context" rules to prevent hallucination and cheating.
- **Implementation**:
    - **Prohibit Rewinding**: Explicitly forbid `checkpoint:import` to undo gameplay failures.
    - **Modal-Aware CSS**: Added `body.modal-active` to blur and disable the background, preventing the agent from clicking "through the wall" when a modal is open.
    - **State-Proxy Enforcement**: Mandatory `state-proxy get` after every action to verify the result.

---

## 3. Pending Investigations (Further Interrogation Needed)

### A. The `--no-sandbox` Flag Mystery
- **Investigation:** Why does the agent keep putting this flag in positions that break the parser? Is there a discrepancy between the CLI documentation and the model's training? 
- **Status**: COMPLETE.
- **Outcome**: Documented the "Incorrect Flag Placement" pattern in `agent-browser-learnings.md`. The model was treating `--no-sandbox` as a direct CLI flag rather than a browser launch argument. The `autonomous-runner-prompt.md` now explicitly mandates the correct Linux syntax: `agent-browser <command> [args] --args "--no-sandbox"`.

### B. "State-Aware" Tool Proxy
- **Investigation**: Can we build a tiny helper tool that "remembers" the game state, so the LLM only has to ask for *changes* rather than re-reading the whole world every turn?
- **Status**: COMPLETE. Implemented `scripts/lib/state-proxy.mjs`.
- **Outcome**: The agent now uses `node scripts/lib/state-proxy.mjs get` which caches state in `.codex-runtime/cyberpunk-overhaul/last-state-proxy.json` and returns only diffs + compact summary. This prevents ~56KB JSON dumps from entering the history.

### C. Checkpoint Import Redundancy
- **Investigation:** Is the `npm run workflow:phase11:checkpoint:import` command returning too much output when called by the agent?
- **Status**: COMPLETE.
- **Outcome**: Modified `scripts/cyberpunk-overhaul-phase11-checkpoint.mjs` to include a `--quiet` flag. It now returns a single-line summary (Label + Turn + Status) instead of a massive JSON payload, drastically reducing history noise during session recovery.

---

## 4. Interrogation & Refinement
*This section is for active investigation of the "Right Approach."*

- **Question 1:** Should we force a "Context Reset" (Fresh Session) every X turns?
- **Question 2:** Can we provide a "System Proxy" that handles state-tracking so the LLM doesn't have to re-read it?
