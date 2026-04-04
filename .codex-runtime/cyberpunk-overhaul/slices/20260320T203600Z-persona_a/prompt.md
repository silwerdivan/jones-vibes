# Autonomous Phase 11 Slice

Use the `cyberpunk-overhaul` skill for this run.

This invocation is one fresh-context autonomous slice of the active Phase 11 workflow. Continuity must come from repository files, durable checkpoint exports, and persistent browser/app state, not from prior chat memory.

The runner appends a `## Runner Context` section below with exact paths, checkpoint data, an external baseline handoff path, and trusted UI notes. Treat that section as canonical for this slice unless it directly conflicts with the bounded control surface in `run-state.json`.

## Required startup reads
1. Read `docs/workflows/cyberpunk-overhaul/run-state.json`.
2. Read `docs/workflows/cyberpunk-overhaul/current-phase.md`.
3. Read `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`.
4. Read the exact active persona log path provided in `Runner Context`.
5. Read the exact `Canonical latest slice file` from `Runner Context` if one is provided.
6. Read the exact `External baseline handoff` path from `Runner Context` if one is provided.

Do not scan `docs/workflows/cyberpunk-overhaul/phase-11-slices/` or probe alternate persona logs when `Runner Context` already supplies the path you need.

## Operating rules
- Respect `run-state.json` as the bounded control surface for this run.
- Prefer exact paths, checkpoint summary, and expected next action from `Runner Context` over reconstructing state from older slice files.
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
- Canonical latest slice file: docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-01.md
- Canonical checkpoint directory: docs/workflows/cyberpunk-overhaul/checkpoints/persona_a
- Latest checkpoint save file: docs/workflows/cyberpunk-overhaul/checkpoints/persona_a/week-01-save.json
- External baseline handoff: docs/workflows/cyberpunk-overhaul/external-fixes.md
- Last authoritative checkpoint: 2026-03-20 (phase11_persona_a_week_01_complete)
- Current checkpoint summary: Persona A completed the fresh-restart Week 1 slice from onboarding, closed at ₡4 / Debt ₡0 / Hunger 20% / Sanity 50%, and exported the new authoritative checkpoint to docs/workflows/cyberpunk-overhaul/checkpoints/persona_a/week-01-save.json.
- Expected next action: Resume Persona A from the Week 1 summary/checkpoint in `phase11-safe-grinder`, complete exactly one authoritative Week 2 slice, write `docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-02.md`, and export a durable checkpoint immediately after the week closes.
- agent-browser session name: phase11-safe-grinder

### Trusted UI Workarounds
- Labor Sector job applications: prefer the stable `[data-testid="action-card-jobs-..."]` or `[data-testid="action-card-btn-jobs-..."]` selectors when targeting a known job card, then verify the `CURRENT SHIFT` panel or persisted state changed before moving on.
- Sustenance Hub purchases: prefer the stable `[data-testid="action-card-shopping-..."]` or `[data-testid="action-card-btn-shopping-..."]` selectors when targeting a known food card, then verify `credits`, `hunger`, or `sanity` changed before assuming the purchase worked.
- If the session appears reset or onboarding reappears unexpectedly: capture a screenshot and run `agent-browser eval "document.body.innerText"` before clicking through anything.
- If expected continuity is missing but a checkpoint file exists, prefer restoring that checkpoint with `npm run workflow:phase11:checkpoint:import` before replaying from onboarding.
