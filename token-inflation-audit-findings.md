# Deep Audit of Phase 11 Token Inflation

## Research Findings
- **Baseline System Prompt**: `docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md` is approximately 140 lines and ~1500 words (roughly 2000-2500 tokens). Combined with `startup-context.json` (which compiles recipes, brief findings, and state) and `run-state.json`, the "Baseline Tax" per slice is likely starting at 3000-4000 tokens before any actions are taken.
- **Latest Slice Log (`week-02.md`)**: The log reveals a single run ("Turn Range: 2") handled multiple sequential steps: a startup verification, an infrastructure tooling fix, a failed labor attempt, a fallback action, an unexpected event (Tetanus), and boundary resolution. This indicates 6+ separate tool execution cycles occurred in one slice.
- **History Leaks**:
  - `agent-browser` syntax errors (e.g., the `--args=--no-sandbox` failure mentioned in the log) add verbose error traces to the history.
  - Repeated tool interactions for Fallbacks and Event Clearings mean the context includes the initial probe, the failure, the fallback decision, and the subsequent probes.
  - "State-proxy" is meant to be compact, but if used sequentially instead of consolidated, it still adds multiple discrete tool-call/response pairs to the turn tax.
- **Context Handling in `scripts/cyberpunk-overhaul-phase11-once.sh`**:
  - The script does a good job of creating a rich `startup-context.json` that distills multiple workflow files into one payload.
  - However, for the agent executor, the script feeds the system prompt + runner context as the initial message. The history then naturally accumulates every tool execution during the slice without any built-in compression mechanism during the run itself.

## Strategy
1. **Identify the "Baseline Tax"**: The constant cost includes the ~1500 word system prompt and the `startup-context.json` file. 
2. **Identify the "Turn Tax"**: Each additional turn adds the tool input and output. Browser interactions (even when restricted to `state-proxy` or truncated bash) stack up linearly. A sequence of 6 actions in one slice (like in Week 02) will easily double the context size by the end of the run due to repetitive context windows.
3. **Propose "Context Compression" step**:
   - Introduce a "Milestone Summary" mechanism: After a sequence of actions (e.g., handling a random event or finishing a shift), the agent should be able to summarize the intermediate state and "flush" or compress the previous turns.
   - Alternatively, have the agent explicitly request a "Delta Only" state from the `agent-browser` or `state-proxy` to avoid full state dumps, ensuring only the exact modified fields are returned.

## Implementation Plan
1. **Optimize System Prompt**: [DONE] Review and condense `autonomous-runner-prompt.md`. Added authoritative wrapper instructions and consolidated syntax rules to prevent hallucinated Linux flags.
2. **Enhance `state-proxy.mjs` for Delta-Only Output**: [DONE] `state-proxy.mjs` already caches state and returns only changed fields (`State: CHANGED` with from/to deltas), minimizing history bloat.
3. **Implement Turn Consolidation (Context Compression)**: [DONE] Added `scripts/lib/milestone-summary.mjs` and updated the log-stream to recognize it. Added explicit "Context Management" instructions to the runner prompt to encourage breaking long slices at milestones.
4. **Tool Failure Truncation & Fail-Fast**: [DONE] Implemented `scripts/lib/agent-browser-wrapper.mjs` and updated `run-truncated.mjs` to detect fatal syntax/environment errors. These now trigger a `[FAIL-FAST]` abort (exit code 101) to prevent the LLM from "limping" through a broken environment and bloating the context history.
