# Autonomous Phase 11 Slice

Use the `cyberpunk-overhaul` skill for this run.

This invocation is one fresh-context autonomous slice of the active Phase 11 workflow. Continuity must come from repository files, durable checkpoint exports, and persistent browser/app state, not from prior chat memory.

The runner appends a `## Runner Context` section below with exact paths, checkpoint data, compact structured summaries, an external baseline handoff path, and trusted UI notes. Treat that section as canonical for this slice unless it directly conflicts with the bounded control surface in `run-state.json`.

## Required startup reads
1. Read `docs/workflows/cyberpunk-overhaul/run-state.json`.
2. Use the structured brief summary and browser recipe summary embedded in `Runner Context` as the default startup source for persona state, checkpoint state, next action, and common interaction tactics.
3. Read the full JSON or markdown file for one of those paths only if the embedded summary is missing, stale, ambiguous, or insufficient for the decision you need to make.
5. Before editing a workflow markdown file, read only the smallest relevant region you need rather than reopening the whole file.

Do not scan `docs/workflows/cyberpunk-overhaul/phase-11-slices/` or probe alternate persona logs when `Runner Context` already supplies the path you need.

## Operating rules
- Respect `run-state.json` as the bounded control surface for this run.
- Prefer exact paths, checkpoint summary, structured brief summary, structured browser recipe summary, and expected next action from `Runner Context` over reconstructing state from older slice files.
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

## Runner Context
- App URL: http://127.0.0.1:5173/jones-vibes/
- Run-state path: docs/workflows/cyberpunk-overhaul/run-state.json
- Phase progress rollup: docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md
- Active persona: The Safe Grinder
- Active persona log: docs/workflows/cyberpunk-overhaul/audit-log-persona-a.md
- Canonical persona slice directory: docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a
- Canonical latest slice file: docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-05.md
- Canonical checkpoint directory: docs/workflows/cyberpunk-overhaul/checkpoints/persona_a
- Latest checkpoint save file: docs/workflows/cyberpunk-overhaul/checkpoints/persona_a/week-05-save.json
- External baseline handoff: docs/workflows/cyberpunk-overhaul/external-fixes.md
- Structured phase brief: docs/workflows/cyberpunk-overhaul/phase-11-brief.json
- Structured browser recipes: docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json
- Last authoritative checkpoint: 2026-03-21 (phase11_persona_a_week_05_complete)
- Current checkpoint summary: Persona A restored the Week 4 checkpoint after browser continuity failed, advanced through the AI handoff, and regained manual control at a harsher Week 5 baseline of `₡416 / Debt ₡0 / Hunger 50% / Sanity 15 / Sore Legs 99h`. Safe Grinder again spent `₡40` on `Real-Meat Burger`, completed `Sanitation-T3` plus `Work Shift x2`, and closed authoritative Week 5 at `₡464 / Debt ₡0 / Hunger 20% / Sanity 20` with a fresh Week 5 checkpoint. The travel-taxed route is still capped at two labor shifts, but the Week 5 summary finally reconciled its sanity lines, modal total, and checkpointed end state at `+5`.
- Expected next action: Resume Persona A from the authoritative Week 5 checkpoint or live summary state in `phase11-safe-grinder`, advance exactly one completed in-game week, start from the Week 5 summary anchor `₡464 / Debt ₡0 / Hunger 20% / Sanity 20 / Sore Legs 54h`, account for the AI handoff before manual control returns, and verify whether the shorter remaining travel tax finally reopens a third labor shift or whether Safe Grinder is still locked into the burger-assisted two-shift route. Write the canonical `docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-06.md` before exporting the Week 6 checkpoint.
- agent-browser session name: phase11-safe-grinder

### Trusted UI Workarounds
- Labor Sector job applications: prefer the stable `[data-testid="action-card-jobs-..."]` or `[data-testid="action-card-btn-jobs-..."]` selectors when targeting a known job card, then verify the `CURRENT SHIFT` panel or persisted state changed before moving on.
- Sustenance Hub purchases: prefer the stable `[data-testid="action-card-shopping-..."]` or `[data-testid="action-card-btn-shopping-..."]` selectors when targeting a known food card, then verify `credits`, `hunger`, or `sanity` changed before assuming the purchase worked.
- If the session appears reset or onboarding reappears unexpectedly: capture a screenshot and run `agent-browser eval "document.body.innerText"` before clicking through anything.
- If expected continuity is missing but a checkpoint file exists, prefer restoring that checkpoint with `npm run workflow:phase11:checkpoint:import` before replaying from onboarding.

### Structured Phase 11 Brief Summary (docs/workflows/cyberpunk-overhaul/phase-11-brief.json)
- Persona: The Safe Grinder (persona_a)
- Status: in_progress
- Latest authoritative week: 5
- Latest checkpoint: docs/workflows/cyberpunk-overhaul/checkpoints/persona_a/week-05-save.json
- Latest slice file: docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-05.md
- Next action: Resume Persona A from the authoritative Week 5 checkpoint or live summary state in `phase11-safe-grinder`, advance exactly one completed in-game week, start from the Week 5 summary anchor `₡464 / Debt ₡0 / Hunger 20% / Sanity 20 / Sore Legs 54h`, account for the AI handoff before manual control returns, and verify whether the shorter remaining travel tax finally reopens a third labor shift or whether Safe Grinder is still locked into the burger-assisted two-shift route. Write the canonical `docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-06.md` before exporting the Week 6 checkpoint.
- Latest end state: cash=₡464 debt=₡0 hunger=20% sanity=20 net_credits=+₡48 net_sanity=?
- Finding: Week 5 confirms Safe Grinder is still locked into a food-assisted two-shift route while `Sore Legs` remains active. The run stabilized, but only after paying `₡40` up front and accepting that the travel-taxed week could not support a third `Sanitation-T3` shift.
- Finding: The summary-to-playable handoff is harsher than the Week 4 checkpoint alone implies. Although the authoritative Week 4 close was `₡496 / Hunger 30% / Sanity 20`, the actual manual Week 5 start after the AI handoff reopened at `₡416 / Hunger 50% / Sanity 15`.
- Finding: Unlike Weeks 2-4, the Week 5 summary reconciled cleanly. The visible lines showed `Real-Meat Burger +10`, `Ambient Stress -10`, and `Cycle Recovery +5`, the modal total reported `SANITY +5`, and the exported checkpoint matched the `15 -> 20` close.

### Structured Agent Browser Recipe Summary (docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json)
- Rule: Prefer targeted eval probes that return compact JSON over document-wide text dumps.
- Rule: Prefer stable data-testid selectors first; verify the resulting game state after any job application or purchase.
- Rule: If continuity is missing, capture one screenshot, confirm the reset state, and restore the latest checkpoint before replaying from onboarding.
- Rule: Treat broad DOM inventories and full-page text dumps as debug-only fallbacks.
- Recipe session_recovery: Recover authoritative play when the named browser session opens on onboarding or has no save state.
- Recipe travel_city: Move between city locations.; selectors=Use known location-card or city-card text targets only when the surface is stable. | Use targeted DOM eval to click a specific location card when plain click-by-text is unreliable.; verify=Check the active location label or dashboard title.
- Recipe apply_job: Secure a labor shift job such as Sanitation-T3.; selectors=[data-testid="action-card-btn-jobs-level-1-sanitation-t3"] | [data-testid="action-card-jobs-level-1-sanitation-t3"]; verify=Check CURRENT SHIFT or the persisted game state for the selected job id.
- Recipe buy_food: Buy food in Sustenance Hub.; selectors=[data-testid="action-card-btn-shopping-sustenance-hub-real-meat-burger"] | [data-testid="action-card-shopping-sustenance-hub-real-meat-burger"]; verify=Confirm credits changed by the expected amount.
- Recipe work_shift: Execute a labor shift once the current job is active.; verify=Credits increase by the shift yield.
- Recipe turn_summary_probe: Capture the authoritative end-of-week state with minimal context cost.; probe=turn,hasPendingTurnSummary,credits,debt,hunger,sanity,time,location,conditions
