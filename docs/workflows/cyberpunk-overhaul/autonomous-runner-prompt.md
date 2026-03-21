# Autonomous Phase 11 Slice

Use the `cyberpunk-overhaul` skill for this run.

This invocation is one fresh-context autonomous slice of the active Phase 11 workflow. Continuity must come from repository files, durable checkpoint exports, and persistent browser/app state, not from prior chat memory.

The runner appends a `## Runner Context` section below with exact paths, checkpoint data, compact workflow excerpts, an external baseline handoff path, and trusted UI notes. Treat that section as canonical for this slice unless it directly conflicts with the bounded control surface in `run-state.json`.

## Required startup reads
1. Read `docs/workflows/cyberpunk-overhaul/run-state.json`.
2. Use the compact workflow excerpts embedded in `Runner Context` as the default startup source for `current-phase.md`, `phase-11-audit-progress.md`, the active persona log, the latest canonical slice file, and the external baseline handoff.
3. Read the full file for one of those paths only if the embedded excerpt is missing, stale, ambiguous, or insufficient for the decision you need to make.
4. Before editing a workflow markdown file, read only the smallest relevant region you need rather than reopening the whole file.

Do not scan `docs/workflows/cyberpunk-overhaul/phase-11-slices/` or probe alternate persona logs when `Runner Context` already supplies the path you need.

## Operating rules
- Respect `run-state.json` as the bounded control surface for this run.
- Prefer exact paths, checkpoint summary, compact workflow excerpts, and expected next action from `Runner Context` over reconstructing state from older slice files.
- Treat runner startup continuity verification as authoritative. The Phase 11 entrypoint now checks the named browser session against the latest checkpoint before Codex starts; if the session is missing its save, the runner restores it automatically, and if the live save disagrees with the checkpoint the runner should fail before gameplay begins.
- Treat checkpoint exports under `docs/workflows/cyberpunk-overhaul/checkpoints/` as the authoritative recovery layer when a named browser session reopens without the expected save.
- Treat the external baseline handoff as out-of-band context, not as new Phase 11 evidence. Only log it again if the live build contradicts that handoff.
- Reuse the existing app and browser state from the environment. `AGENT_BROWSER_SESSION_NAME` is already set for the active persona.
- On Linux, keep using `agent-browser` with the `--no-sandbox` configuration.
- If the browser session continuity is missing but `Runner Context` points to a latest checkpoint save file, restore that checkpoint with `npm run workflow:phase11:checkpoint:import` before resorting to a replay-from-onboarding decision.
- Use the trusted UI workaround notes from `Runner Context` first. Read `docs/workflows/cyberpunk-overhaul/agent-browser-learnings.md` only if a listed UI path fails, the notes are missing, or you need a new automation pattern that is not already covered.
- Avoid source-code spelunking during startup unless gameplay state is ambiguous, a UI path fails, or a new mechanic must be verified.
- Complete exactly one bounded slice:
  - default bound is one completed in-game week for the active persona,
  - stop earlier only for a meaningful blocker or a clearly high-signal audit event that should be logged immediately.
- Update `run-state.json` before exiting:
  - refresh `next_slice`,
  - refresh `last_run`,
  - set `status` to `blocked` and `needs_human` to `true` if you hit a blocker or need a human decision,
  - set `status` to `complete` if the persona or phase target is finished.
- Update the relevant workflow markdown files in the same run.
- Preserve detailed history:
  - write or update one canonical per-slice detail file under `docs/workflows/cyberpunk-overhaul/phase-11-slices/<persona>/week-NN.md`,
  - keep `phase-11-audit-progress.md` concise and synthesis-oriented rather than week-by-week exhaustive.
- After every authoritative completed week, export the live `jones_fastlane_save` payload to a new checkpoint file with `npm run workflow:phase11:checkpoint:export -- --label week-NN` and update the workflow docs accordingly.

## Token discipline
- Keep normal successful slices compact. Preserve audit quality without repeatedly feeding bulky tool output back into one long Codex turn.
- Save rich evidence to files, not to the live model context. Use workflow markdown files, checkpoints, screenshots, and runtime artifacts as the durable record.
- Prefer targeted probes over broad dumps. For gameplay verification, request only the fields you need, such as `screen`, `credits`, `debt`, `hunger`, `sanity`, `time`, `current shift`, `hasPendingTurnSummary`, or a short action result.
- Do not print full edited file contents after writing them. Report the updated path and a short summary of what changed.
- Do not run broad `git diff` readbacks during a normal slice. Inspect diffs only when a change looks wrong, a blocker appears, or you need to debug an unexpected side effect.
- Do not inventory the whole DOM or all `data-testid` nodes unless a selector failed. Use the known stable selectors from `Runner Context` first, then escalate only for the failing surface.
- Do not use `document.body.innerText` dumps except when the trusted workaround says the session may have reset or the UI state is genuinely ambiguous. Even then, keep the returned text short and focused.
- Keep checkpoint import/export verification concise. Confirm the restored or exported turn, player, and a few key stats instead of echoing the full save summary repeatedly.
- If a slice becomes suspicious, blocked, or fallback-heavy, it is acceptable to switch to richer diagnostics for that branch. Preserve those details in artifacts, then return to compact probes once the issue is understood.

## Final output contract
End the final response with exactly one of these tokens on its own line:
- `AUTONOMOUS_SLICE_COMPLETE`
- `AUTONOMOUS_BLOCKED`
- `AUTONOMOUS_COMPLETE`
