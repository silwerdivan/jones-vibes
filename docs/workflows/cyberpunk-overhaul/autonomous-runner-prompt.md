# Autonomous Phase 11 Slice

Use the `cyberpunk-overhaul` skill for this run.

This invocation is one fresh-context autonomous slice of the active Phase 11 workflow. Continuity must come from repository files, durable checkpoint exports, and persistent browser/app state, not from prior chat memory.

The runner appends a compact `## Runner Context` section below. Treat the `startup-context.json` path in that section as the canonical handoff for this slice unless it directly conflicts with `run-state.json`.

## Required startup reads
1. Read `docs/workflows/cyberpunk-overhaul/run-state.json`.
2. Read the `startup-context.json` file named in `Runner Context` and use it as the default source for persona state, checkpoint state, next action, and browser tactics.
3. Read the larger JSON or markdown sources only if the startup context is stale, ambiguous, contradicted by live gameplay, or missing a tactic you need.
4. Before editing a workflow markdown file, read only the smallest relevant region you need rather than reopening the whole file.

Do not scan `docs/workflows/cyberpunk-overhaul/phase-11-slices/` or probe alternate persona logs when `run-state.json` plus `startup-context.json` already supply the path you need.

## Operating rules
- Respect `run-state.json` as the bounded control surface for this run.
- Prefer exact paths, compact checkpoint state, compact recipe notes, and expected next action from `startup-context.json` over reconstructing state from older slice files.
- Treat runner startup continuity verification as authoritative. The Phase 11 entrypoint now checks the named browser session against the latest checkpoint before Codex starts; if the session is missing its save, the runner restores it automatically, and if the live save disagrees with the checkpoint the runner should fail before gameplay begins.
- Treat checkpoint exports under `docs/workflows/cyberpunk-overhaul/checkpoints/` as the authoritative recovery layer when a named browser session reopens without the expected save.
- Treat the external baseline handoff as out-of-band context, not as new Phase 11 evidence. Only log it again if the live build contradicts that handoff.
- Reuse the existing app and browser state from the environment. `AGENT_BROWSER_SESSION_NAME` is already set for the active persona.
- **Linux Correct Syntax**: On Linux, `agent-browser` requires `--no-sandbox` to be passed via the `--args` option *after* the command.
    - **Template**: `agent-browser <command> [args] --session-name <name> --args "--no-sandbox"`
    - **Correct**: `agent-browser eval "window.localStorage.getItem('save')" --session-name phase11 --args "--no-sandbox"`
    - **Incorrect**: `agent-browser --no-sandbox ...` or `agent-browser eval "..." --no-sandbox` (this will cause syntax errors).
- **Tool Reliability**: To prevent "Tool Limping" (repeated failures that bloat history):
    - **Use State Proxy**: For general game state checks (Credits, Hunger, Location, Turn, etc.), ALWAYS prefer `node scripts/lib/state-proxy.mjs get`. It returns only changes and a compact summary, minimizing history bloat.
    - **Consolidate State Probes**: If you need a field not covered by the proxy, use ONE batched `eval` call: `agent-browser eval "({ ... })"`. Never return full objects or the entire `jones_fastlane_save` string.
    - **Wait for Render**: After a `click` or `travel` action, wait for the UI to settle before the next probe (e.g., `agent-browser click "..." && sleep 1`).
    - **No JSON Dumps**: Never return full objects. Parse and return only the specific fields you need.
- **Fair Play & Integrity**:
    - **Prohibit Rewinding**: Explicitly forbid using `checkpoint:import` to undo gameplay failures (Burnout, Debt-Trap, Arrest). These must be logged as "Audit Results" and the slice should exit.
    - **Modal Verification**: ALWAYS verify "Modal Context" (e.g., check for `.modal-overlay` or `.location-modal`) before attempting background actions. If a modal is open, background actions are strictly forbidden.
    - **State-Proxy Enforcement**: Use the state-proxy `get` command after EVERY action to verify that the internal state changed as expected (e.g., did Credits actually go down?). If not, the action failed; do not hallucinate success.
- If the browser session continuity is missing but `startup-context.json` points to a latest checkpoint save file, restore that checkpoint with `npm run workflow:phase11:checkpoint:import -- --quiet` before resorting to a replay-from-onboarding decision.
- Use the trusted UI workaround notes from `startup-context.json` first. Read `docs/workflows/cyberpunk-overhaul/agent-browser-learnings.md` only if a listed UI path fails, the notes are missing, or you need a new automation pattern that is not already covered.
- Do not spend a startup command on `agent-browser --help` or other CLI-surface probes during a normal slice; the runner has already established the browser tool path.
- Avoid source-code spelunking during startup unless gameplay state is ambiguous, a UI path fails, or a new mechanic must be verified.
- Do not treat a successful `agent-browser click` response as authoritative evidence that gameplay changed. For travel, job application, shopping, and work-shift actions, check the minimum relevant before/after state fields immediately after the action.
- If the intended state mutation does not appear, treat the action as failed, apply the bounded fallback from `startup-context.json`, and only continue once the game state confirms success.
- Complete exactly one bounded slice. The default bound is one completed in-game week for the active persona. Stop earlier only for a meaningful blocker or a clearly high-signal audit event that should be logged immediately.
- Update `run-state.json` before exiting. Refresh `next_slice` and `last_run`. Set `status = "blocked"` with `needs_human = true` for blockers or required human decisions. Set `status = "complete"` only if the persona or phase target is finished.
- Update the relevant workflow markdown files in the same run.
- Preserve detailed history by writing or updating one canonical per-slice detail file under `docs/workflows/cyberpunk-overhaul/phase-11-slices/<persona>/week-NN.md`. Keep `phase-11-audit-progress.md` concise and synthesis-oriented rather than week-by-week exhaustive.
- After every authoritative completed week, export the live `jones_fastlane_save` payload to a new checkpoint file with `npm run workflow:phase11:checkpoint:export -- --label week-NN` and update the workflow docs accordingly.

## Token discipline
- Keep normal successful slices compact. Preserve audit quality without repeatedly feeding bulky tool output back into one long Codex turn.
- Save rich evidence to files, not to the live model context. Use workflow markdown files, checkpoints, screenshots, and runtime artifacts as the durable record.
- Prefer targeted probes over broad dumps. For gameplay verification, request only the fields you need, such as `screen`, `credits`, `debt`, `hunger`, `sanity`, `time`, `current shift`, `hasPendingTurnSummary`, or a short action result.
- Do not print full edited file contents after writing them. Report the updated path and a short summary of what changed.
- Do not run broad `git diff` readbacks during a normal slice. Inspect diffs only when a change looks wrong, a blocker appears, or you need to debug an unexpected side effect.
- Do not inventory the whole DOM or all `data-testid` nodes unless a selector failed. Use the stable selectors from `startup-context.json` first, then escalate only for the failing surface.
- Do not use `document.body.innerText` dumps except when the trusted workaround says the session may have reset or the UI state is genuinely ambiguous. Even then, keep the returned text short and focused.
- Keep checkpoint import/export verification concise. Use the `--quiet` flag with `npm run workflow:phase11:checkpoint:import` and `export` to get a compact summary instead of echoing the full save summary.
- Avoid narration-heavy progress updates during the slice. Emit short stage changes or blockers only when they materially change the plan.
- If a slice becomes suspicious, blocked, or fallback-heavy, it is acceptable to switch to richer diagnostics for that branch. Preserve those details in artifacts, then return to compact probes once the issue is understood.

## Final output contract
End the final response with exactly one of these tokens on its own line:
- `AUTONOMOUS_SLICE_COMPLETE`
- `AUTONOMOUS_BLOCKED`
- `AUTONOMOUS_COMPLETE`
