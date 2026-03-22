# External Baseline Changes

This file tracks out-of-band fixes that are not part of Phase 11 itself but can
change what the next audit slice observes. Keep week logs and persona audit
notes historical. Record only the external baseline changes that future fresh
runner slices must know before continuing.

## Active Handoff

### 2026-03-22 - GitHub issue #6
- Status: fixed out of band on `main` in commit `376f9fe`.
- Summary: Burnout recovery now records a visible `Emergency Trauma Team` sanity row, and turn summaries finalize after the 24-hour condition tick so late end-turn sanity changes reconcile with `pendingTurnSummary.totals.sanityChange`.
- Resolved date: 2026-03-22
- Runner guidance: treat older Phase 11 notes that describe burnout weeks with visible sanity lines that do not match the reported sanity total as historical evidence from the pre-fix build. On the live app, a burnout-triggered end turn should now show the recovery line item and a reconciled sanity total. Only reopen this if a fresh run still shows divergence between the visible sanity rows, the reported total, and the checkpointed end state.

### 2026-03-20 - GitHub issue #5
- Status: fixed out of band on `main`.
- Summary: The turn summary now carries in-week sanity-affecting events into `pendingTurnSummary.events`, so the visible detail list can include random-event and shopping sanity changes instead of only end-of-turn passive modifiers.
- Resolved date: 2026-03-20
- Runner guidance: treat older Phase 11 notes that describe a correct `SANITY` total with missing sanity detail lines as historical evidence from the pre-fix build. On the live app, the Week 6 / Week 7 / Week 10 style omissions should no longer appear for sanity-affecting event choices or item purchases. Only reopen this if a fresh run shows the summary total and visible sanity breakdown diverging again.

### 2026-03-19 - GitHub issue #4
- Status: fixed out of band on `main`.
- Summary: Shared action cards now pass the actual clicked control into `UIManager`, so visible `Apply` and `Buy` buttons are direct reliable action targets and feedback no longer depends on `document.activeElement`.
- Resolved date: 2026-03-19
- Runner guidance: treat older Phase 11 notes that recommend focusing the inner button and then clicking the parent `.action-card` as historical evidence from the pre-fix build. On the live app, use the visible button or card `data-testid` directly and only reopen this if a fresh run shows job applications or purchases still failing without the old focus workaround.
- Validation note (2026-03-20): Persona A fresh Week 1 still reproduced an automation wrinkle on the live app. A direct `agent-browser click` on `[data-testid="action-card-btn-jobs-level-1-sanitation-t3"]` returned success but left `CURRENT SHIFT` at `No active job yet.` until a DOM `btn.click()` retried the same control. Treat the issue as partially verified rather than fully closed for browser-driven Phase 11 slices, and always confirm the resulting job or purchase state before continuing.

### 2026-03-19 - GitHub issue #3
- Status: closed as fixed out of band in commit `0bf6cec`.
- Summary: The same DOM cleanup that fixed issue `#2` also fixed the stale weekly sanity total render path by renaming the shell element from `summary-happiness-total` to `summary-sanity-total`, which matches the modal code again.
- Resolved date: 2026-03-19
- Runner guidance: treat older Phase 11 notes that mention a rendered `HAPPINESS 0` total despite a non-zero underlying sanity delta as historical evidence from the pre-fix build. Only reopen this if a fresh run on the live app shows the summary total flattening back to `0` when `pendingTurnSummary.totals.sanityChange` is non-zero.

### 2026-03-19 - GitHub issue #2
- Status: fixed out of band in commit `0bf6cec`.
- Summary: The turn summary now uses the `SANITY` label and the live `summary-sanity-total` element instead of the legacy `HAPPINESS` label and stale happiness-era total id.
- Resolved date: 2026-03-19
- Runner guidance: treat older Phase 11 notes that mention `HAPPINESS 0` in the turn summary as historical evidence from the pre-fix build. Only raise this again if the live app regresses.
