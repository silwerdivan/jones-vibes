# External Baseline Changes

This file tracks out-of-band fixes that are not part of Phase 11 itself but can
change what the next audit slice observes. Keep week logs and persona audit
notes historical. Record only the external baseline changes that future fresh
runner slices must know before continuing.

## Active Handoff

### 2026-03-22 - GitHub issue #10
- Status: fixed out of band on `main`.
- Summary: Phase 11 Labor Sector job-application automation now treats the first `Apply` action as an offscreen-pointer risk instead of a fully reliable raw click. The canonical browser recipe now requires `scrollintoview` before direct `agent-browser click`, immediate state verification against `CURRENT SHIFT` or persisted `careerLevel`, and a bounded retry before any DOM-eval escalation.
- Resolved date: 2026-03-22
- Runner guidance: treat the 2026-03-20 Week 1 note about `[data-testid="action-card-btn-jobs-level-1-sanitation-t3"]` reporting success without mutating state as historical pre-fix evidence from the old recipe contract. On the live app, Labor `Apply` automation should scroll the target into view, click it directly, and confirm that `CURRENT SHIFT` or `careerLevel` changed before continuing. Only reopen this if a fresh slice still fails after the scroll-and-verify sequence.

### 2026-03-22 - GitHub issue #9
- Status: fixed out of band on `main`.
- Summary: The Phase 11 continuity probe now checks whether onboarding is visibly active before trusting browser state. Fresh reset sessions no longer count as `live_continuity` just because the app URL is open and `window.__JONES_FASTLANE_SESSION__` exposes a default `GameState`; `workflow:phase11:checkpoint:status` reports onboarding explicitly, and `workflow:phase11:once` auto-restores the latest checkpoint instead.
- Resolved date: 2026-03-22
- Runner guidance: treat older Phase 11 notes that describe a startup artifact claiming `live_continuity` while the named browser session is visibly back on onboarding as historical evidence from the pre-fix build. On the live app, visible onboarding should force checkpoint recovery instead of a false continuity pass. Only reopen this if a fresh slice still reports `live_continuity` while `WELCOME_TO_FASTLANE` / `START THE RUN` is visibly active.

### 2026-03-22 - GitHub issue #7
- Status: fixed out of band on `main`.
- Summary: Week-start global event selection now skips events that collapse to a single valid choice after requirement filtering, so automatic openers preserve at least one real branch decision before manual play begins.
- Resolved date: 2026-03-22
- Runner guidance: treat older Phase 11 notes that describe a one-choice week opener, especially the Week 7 `Panic Attack on the Mag-Lev` collapse, as historical evidence from the pre-fix build. On the live app, an automatic global opener should only appear when at least two branches remain valid. Only reopen this if a fresh slice still starts on a single-option global event.

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
- Historical note (2026-03-20): Persona A fresh Week 1 still reproduced an automation wrinkle on the live app. A direct `agent-browser click` on `[data-testid="action-card-btn-jobs-level-1-sanitation-t3"]` returned success but left `CURRENT SHIFT` at `No active job yet.` until a DOM `btn.click()` retried the same control. GitHub issue `#10` supersedes that caveat with the current scroll-and-verify baseline for Labor job application.

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
