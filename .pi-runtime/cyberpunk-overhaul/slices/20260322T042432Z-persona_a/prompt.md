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
- On Linux, keep using `agent-browser` with the `--no-sandbox` configuration.
- If the browser session continuity is missing but `startup-context.json` points to a latest checkpoint save file, restore that checkpoint with `npm run workflow:phase11:checkpoint:import` before resorting to a replay-from-onboarding decision.
- Use the trusted UI workaround notes from `startup-context.json` first. Read `docs/workflows/cyberpunk-overhaul/agent-browser-learnings.md` only if a listed UI path fails, the notes are missing, or you need a new automation pattern that is not already covered.
- Do not spend a startup command on `agent-browser --help` or other CLI-surface probes during a normal slice; the runner has already established the browser tool path.
- Avoid source-code spelunking during startup unless gameplay state is ambiguous, a UI path fails, or a new mechanic must be verified.
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
- Keep checkpoint import/export verification concise. Confirm the restored or exported turn, player, and a few key stats instead of echoing the full save summary repeatedly.
- Avoid narration-heavy progress updates during the slice. Emit short stage changes or blockers only when they materially change the plan.
- If a slice becomes suspicious, blocked, or fallback-heavy, it is acceptable to switch to richer diagnostics for that branch. Preserve those details in artifacts, then return to compact probes once the issue is understood.

## Final output contract
End the final response with exactly one of these tokens on its own line:
- `AUTONOMOUS_SLICE_COMPLETE`
- `AUTONOMOUS_BLOCKED`
- `AUTONOMOUS_COMPLETE`

## Runner Context
- Startup context file: /home/silwerdivan/code/jones-vibes/.pi-runtime/cyberpunk-overhaul/slices/20260322T042432Z-persona_a/startup-context.json
- Continuity artifact: /home/silwerdivan/code/jones-vibes/.pi-runtime/cyberpunk-overhaul/slices/20260322T042432Z-persona_a/continuity.json
- App URL: http://127.0.0.1:5173/jones-vibes/
- Run-state path: docs/workflows/cyberpunk-overhaul/run-state.json
- Active persona: The Safe Grinder
- Latest checkpoint save file: docs/workflows/cyberpunk-overhaul/checkpoints/persona_a/week-07-save.json
- Expected next action: Resume Persona A from the authoritative Week 7 checkpoint or live summary state in `phase11-safe-grinder`, advance exactly one completed in-game week, start from the Week 7 summary anchor `₡286 / Debt ₡0 / Hunger 40% / Sanity 35 / Trauma Reboot 312h`, confirm whether the AI handoff remains stable, and verify whether any deterministic labor route survives while `TRAUMA_REBOOT` is active. Treat GitHub issues #6, #7, and #8 as fixed baseline behavior: a burnout-triggered end turn should now show a visible `Emergency Trauma Team` sanity row with a reconciled sanity total, an automatic global week opener should only fire when at least two valid branches remain after requirement filtering, and `workflow:phase11:checkpoint:status` / `workflow:phase11:checkpoint:export` should report `browser_state_source: live_session` whenever the live browser page is already authoritative. Only flag any of those bugs again if a fresh Week 8 run still diverges on the live build. Write the canonical `docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-08.md` before exporting the Week 8 checkpoint.
- agent-browser session name: phase11-safe-grinder
