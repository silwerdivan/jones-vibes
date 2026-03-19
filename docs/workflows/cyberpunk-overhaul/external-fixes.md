# External Baseline Changes

This file tracks out-of-band fixes that are not part of Phase 11 itself but can
change what the next audit slice observes. Keep week logs and persona audit
notes historical. Record only the external baseline changes that future fresh
runner slices must know before continuing.

## Active Handoff

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
