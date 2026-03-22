# Slice Issue Follow-Up Workflow

## Purpose

Phase 11 slice runs can surface multiple workflow or gameplay issues at once. Right
now, those issues are often handled manually in separate follow-up threads. This
document defines a bounded, script-friendly workflow for:

1. identifying the issues from the latest authoritative slice artifacts,
2. writing them into one canonical markdown issue ledger,
3. generating the prompt for the next unresolved issue,
4. handling that issue with the established GitHub issue workflow, and
5. marking the issue complete in the ledger before moving to the next one.

Use this when a slice finishes with multiple failures, fallbacks, or workflow
wrinkles that should be addressed one by one outside the gameplay slice itself.

## Design Goal

Follow the same pattern used for the false `live_continuity` fix:

1. inspect the canonical slice evidence,
2. isolate one concrete issue,
3. create a GitHub issue,
4. implement the fix,
5. update the Phase 11 handoff files so the next slice treats the fix as baseline,
6. run focused validation,
7. close the GitHub issue,
8. commit the changes,
9. mark the issue complete in the issue ledger.

The difference is that the selection and prompting steps should now be explicit
enough that a script can drive them.

## Canonical Files

The issue-follow-up loop should treat these files as the bounded control surface:

- `docs/workflows/cyberpunk-overhaul/current-phase.md`
- `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`
- `docs/workflows/cyberpunk-overhaul/audit-log-persona-a.md`
- `docs/workflows/cyberpunk-overhaul/external-fixes.md`
- `docs/workflows/cyberpunk-overhaul/run-state.json`
- `docs/workflows/cyberpunk-overhaul/phase-11-slices/<persona>/week-NN.md`

The issue ledger itself should also live in this directory so the runner can read
and update it without reopening broad historical context.

## Canonical Ledger

When a slice produces multiple follow-up issues, create or update:

- `docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md`

This ledger is the canonical queue for post-slice issue handling.

## Ledger Format

Use one section per slice batch. Keep it compact and script-readable.

Recommended structure:

```md
# Slice Issue Ledger

## Active Batch
- **Source slice:** `docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-08.md`
- **Created:** 2026-03-22
- **Status:** in_progress
- **Selection rule:** oldest unchecked issue first unless the user explicitly reprioritizes

| ID | Status | Title | Type | Evidence | Follow-up prompt |
| --- | --- | --- | --- | --- | --- |
| 1 | done | False `live_continuity` report on onboarding reset | workflow | `week-08.md`, `phase-11-audit-progress.md` | `Prompt 1` |
| 2 | todo | Labor Sector `Apply` click reports success without state mutation | workflow | `phase-11-audit-progress.md`, `audit-log-persona-a.md` | `Prompt 2` |
| 3 | todo | City travel requires brittle DOM-only interaction | workflow | `phase-11-audit-progress.md`, `agent-browser-recipes.json` | `Prompt 3` |

## Prompt 2
<exact reusable prompt text>

## Prompt 3
<exact reusable prompt text>
```

## Issue Identification Step

After a slice completes and before fixing anything, run an identification pass.

The pass should:

1. read the latest authoritative slice file,
2. read the latest Phase 11 handoff files,
3. separate already fixed historical issues from still-active issues,
4. list only distinct follow-up issues worth their own GitHub issue workflow,
5. write the issue list into `slice-issue-ledger.md`,
6. generate one reusable prompt block per unresolved issue.

Do not mix these together:

- already fixed baseline issues recorded in `external-fixes.md`
- historical evidence from pre-fix slices
- new workflow friction still affecting future slices

## Next-Issue Prompt Contract

Each unresolved issue in the ledger should include a prompt that can be pasted into
a new thread unchanged.

Each prompt should:

1. point to the exact files to read first,
2. name the issue clearly,
3. require the GitHub issue workflow,
4. require Phase 11 handoff updates,
5. require focused validation,
6. require closing the issue,
7. require committing the changes,
8. require marking the issue complete in `slice-issue-ledger.md`.

Use this template:

```text
Read the relevant Phase 11 slice evidence and handoff files for the next unresolved
item in `docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md`, then address
that issue using the established post-slice issue workflow. Treat this as a GitHub
issue workflow: investigate the problem, create an issue, implement the fix, update
the Phase 11 handoff files so the next slice treats the fix as baseline behavior,
run focused validation, close the issue, commit the changes, and mark the issue as
`done` in `docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md`.
```

Each issue-specific prompt should then add the exact issue title, evidence files,
and expected scope.

## Completion Rules

An issue is only `done` in the ledger after all of the following are true:

1. a GitHub issue exists,
2. the implementation is merged locally,
3. the relevant handoff files are updated,
4. focused validation has been run,
5. the GitHub issue is closed,
6. the fix has been committed,
7. `slice-issue-ledger.md` marks the issue `done`.

Until then, keep the issue as `todo` or `in_progress`.

## Suggested Status Values

Use only these status values in the ledger:

- `todo`
- `in_progress`
- `done`
- `blocked`
- `wontfix`

This keeps the file script-friendly.

## Script Responsibilities

A future script should be able to support four commands:

### 1. `identify`

Input:

- source slice path

Behavior:

- reads the latest slice evidence and handoff files,
- writes `slice-issue-ledger.md`,
- creates prompt blocks for all unresolved issues,
- marks the first unresolved issue as the default next item.

### 2. `next`

Behavior:

- reads `slice-issue-ledger.md`,
- finds the first unresolved issue using the selection rule,
- prints the exact prompt block for that issue.

### 3. `complete`

Input:

- issue ledger ID
- optional GitHub issue number
- optional commit hash

Behavior:

- verifies the issue was handled,
- updates the ledger status to `done`,
- records the GitHub issue number and commit hash if available.

### 4. `status`

Behavior:

- prints the current batch summary,
- lists remaining unresolved issues in order,
- prints the next prompt label to run.

## Current CLI

The first helper now exists as:

- `npm run workflow:phase11:issues`
- `npm run workflow:phase11:issues:identify -- --source-slice <path>`
- `npm run workflow:phase11:issues:next`
- `npm run workflow:phase11:issues:complete -- --id <id> [--github #N] [--commit HASH]`
- `npm run workflow:phase11:issues:init -- --source-slice <path>`

Shortcut aliases:

- `npm run p11:issues`
- `npm run p11:issues:identify -- --source-slice <path>`
- `npm run p11:issues:next`
- `npm run p11:issues:complete -- --id <id> [--github #N] [--commit HASH]`
- `npm run p11:issues:init -- --source-slice <path>`

This first version now supports heuristic issue discovery through `identify` for
known recurring Phase 11 issue classes. It is intentionally conservative: it reads
the bounded handoff files, writes prompts only for issues it can match explicitly,
and skips issues already recorded as fixed baseline behavior in the handoff docs.

## Recommended Ledger Fields

To keep future automation simple, each issue row should ideally carry:

- local ledger ID
- status
- short title
- issue type: `workflow`, `automation`, `gameplay`, `ui`, `docs`
- source slice
- evidence paths
- GitHub issue number
- commit hash
- prompt label

## Relationship To Existing Workflow

This workflow does not replace:

- `run-state.json`
- per-slice canonical logs
- `external-fixes.md`
- the normal gameplay slice runner

It sits beside them and handles the repeated follow-up work that happens after a
slice reveals several discrete issues.

## Operating Rule

When a slice ends with more than one actionable follow-up issue, do not start fixing
them ad hoc from memory. First write or refresh `slice-issue-ledger.md`, then use
its next unresolved prompt as the control surface for each new issue-handling
thread.
