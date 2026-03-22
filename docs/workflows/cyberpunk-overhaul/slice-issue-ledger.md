# Slice Issue Ledger

## Active Batch

- **Source slice:** `docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-08.md`
- **Created:** 2026-03-22
- **Status:** in_progress
- **Selection rule:** oldest unchecked issue first unless the user explicitly reprioritizes

| ID | Status | Title | Type | Evidence | GitHub | Commit | Prompt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | done | Labor Sector `Apply` click can report success without mutating `CURRENT SHIFT` | automation | `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`, `docs/workflows/cyberpunk-overhaul/audit-log-persona-a.md`, `docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json` | `#10` | `219a96b` | `Prompt 1` |
| 2 | todo | City travel still depends on brittle DOM-only interaction with custom location cards | automation | `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`, `docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json` |  |  | `Prompt 2` |
| 3 | todo | Runner actions still need stronger post-click state verification guardrails | workflow | `docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json`, `docs/workflows/cyberpunk-overhaul/autonomous-runner.md`, `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md` |  |  | `Prompt 3` |

## Next Issue

- **Default next item:** `2`
- **Reason:** It is the first unresolved issue in the current batch and should be handled next.

## Prompt 1

```text
Read `docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md` first, then read `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`, `docs/workflows/cyberpunk-overhaul/audit-log-persona-a.md`, `docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json`, and address the next unresolved item in the ledger: Labor Sector `Apply` click can report success without mutating `CURRENT SHIFT`.

Treat this as a GitHub issue workflow following the established false-`live_continuity` pattern: investigate why direct `agent-browser click` on the visible Labor Sector `Apply` button can report success without mutating the underlying game state, create a GitHub issue, implement the fix or the runner-side hardening, update the Phase 11 handoff files so the next slice knows the fix is baseline behavior, run focused validation, close the GitHub issue, commit the changes, and mark issue `1` as `done` in `docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md` with the GitHub issue number and commit hash.
```

## Prompt 2

```text
Read `docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md` first, then read `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`, `docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json`, and address the next unresolved item in the ledger: City travel still depends on brittle DOM-only interaction with custom location cards.

Treat this as a GitHub issue workflow following the established false-`live_continuity` pattern: investigate why city travel still requires targeted DOM interaction because location cards are custom divs instead of reliable automation controls, create a GitHub issue, implement the fix or the runner-side hardening, update the Phase 11 handoff files so the next slice knows the fix is baseline behavior, run focused validation, close the GitHub issue, commit the changes, and mark issue `2` as `done` in `docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md` with the GitHub issue number and commit hash.
```

## Prompt 3

```text
Read `docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md` first, then read `docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json`, `docs/workflows/cyberpunk-overhaul/autonomous-runner.md`, `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`, and address the next unresolved item in the ledger: Runner actions still need stronger post-click state verification guardrails.

Treat this as a GitHub issue workflow following the established false-`live_continuity` pattern: investigate where the Phase 11 runner still trusts UI click success without verifying resulting game state after actions like job application or travel, create a GitHub issue, implement the fix or the runner-side hardening, update the Phase 11 handoff files so the next slice knows the fix is baseline behavior, run focused validation, close the GitHub issue, commit the changes, and mark issue `3` as `done` in `docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md` with the GitHub issue number and commit hash.
```
