# Autonomous Phase 11 Slice

Use the `cyberpunk-overhaul` skill for this run.

This invocation is one fresh-context autonomous slice of the active Phase 11 workflow. Continuity must come from repository files and persistent browser/app state, not from prior chat memory.

## Required startup reads
1. Read `docs/workflows/cyberpunk-overhaul/run-state.json`.
2. Read `docs/workflows/cyberpunk-overhaul/current-phase.md`.
3. Read `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`.
4. Read the active persona log referenced in `run-state.json`.

## Operating rules
- Respect `run-state.json` as the bounded control surface for this run.
- Reuse the existing app and browser state from the environment. `AGENT_BROWSER_SESSION_NAME` is already set for the active persona.
- On Linux, keep using `agent-browser` with the `--no-sandbox` configuration.
- Read `docs/workflows/cyberpunk-overhaul/agent-browser-learnings.md` before taking repeated UI actions in the game.
- In Labor Sector, do not trust the visible `Apply` button by itself. Prefer clicking the parent `.action-card` container and verify that state changed before proceeding.
- Complete exactly one bounded slice:
  - default bound is one completed in-game week for the active persona,
  - stop earlier only for a meaningful blocker or a clearly high-signal audit event that should be logged immediately.
- Update `run-state.json` before exiting:
  - refresh `next_slice`,
  - refresh `last_run`,
  - set `status` to `blocked` and `needs_human` to `true` if you hit a blocker or need a human decision,
  - set `status` to `complete` if the persona or phase target is finished.
- Update the relevant workflow markdown files in the same run.

## Final output contract
End the final response with exactly one of these tokens on its own line:
- `AUTONOMOUS_SLICE_COMPLETE`
- `AUTONOMOUS_BLOCKED`
- `AUTONOMOUS_COMPLETE`
