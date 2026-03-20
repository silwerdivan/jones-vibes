# Phase 11 Checkpoints

Durable Phase 11 continuity lives here.

- Store one exported `jones_fastlane_save` JSON file per authoritative week.
- Store the matching `*-meta.json` file beside each save with the checkpoint summary, session name, and export timestamp.
- Keep browser-session continuity as a convenience layer only. If `agent-browser` reopens to onboarding or empty storage, restore the latest checkpoint into the named session before declaring the run lost.

Recommended naming:

- `persona_a/week-10-save.json`
- `persona_a/week-10-meta.json`

Workflow commands:

- `npm run workflow:phase11:checkpoint:status`
- `npm run workflow:phase11:checkpoint:export -- --label week-10`
- `npm run workflow:phase11:checkpoint:import`
