# External Baseline Changes

This file tracks out-of-band fixes that are not part of Phase 11 itself but can
change what the next audit slice observes. Keep week logs and persona audit
notes historical. Record only the external baseline changes that future fresh
runner slices must know before continuing.

## Active Handoff

### 2026-03-19 - GitHub issue #2
- Status: fixed out of band in commit `0bf6cec`.
- Summary: The turn summary now uses the `SANITY` label and the live `summary-sanity-total` element instead of the legacy `HAPPINESS` label and stale happiness-era total id.
- Runner guidance: treat older Phase 11 notes that mention `HAPPINESS 0` in the turn summary as historical evidence from the pre-fix build. Only raise this again if the live app regresses.
