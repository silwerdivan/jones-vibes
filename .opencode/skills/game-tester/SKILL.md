---
name: game-tester
description: Reproduce bugs, run focused gameplay regressions, verify fixes, and document test findings for Jones in the Fast Lane. Use when you need to investigate a reported game issue, perform exploratory testing on a feature, confirm whether a change broke expected behavior, map failures to likely code areas, or write a structured bug report or QA summary.
---

Use this skill to approach testing as a disciplined investigation, not a vague "play the game and see."

Read [references/report-template.md](references/report-template.md) when the task needs a bug report, a regression summary, or a reusable checklist.

## Load Context

1. Read the user request closely and extract the feature, bug claim, platform assumptions, and expected behavior.
2. Read only the relevant project context:
   - `docs/spec.md` for intended gameplay rules and UX behavior.
   - `docs/SYSTEM-TESTER.md` when the task is specifically about tester-style reporting.
   - The affected source files and related tests for the feature under investigation.
3. Inspect `package.json` to confirm available validation commands before proposing or running tests.

## Choose The Test Mode

Pick the narrowest mode that matches the request.

### Bug Reproduction

Use when the user reports a defect or suspicious behavior.

1. Restate the exact failure in concrete terms.
2. Identify the likely gameplay flow, screen, and state transitions involved.
3. Reproduce the issue with the smallest reliable set of steps.
4. Separate expected result from actual result.
5. Trace the most likely code and test surface after reproduction is clear.

### Fix Verification

Use when a change claims to fix a bug.

1. Read the claimed fix and the related code paths.
2. Re-run the original repro steps first.
3. Check nearby edge cases and likely regressions, not just the happy path.
4. Report whether the original issue is fixed, partially fixed, or shifted elsewhere.

### Focused Regression Sweep

Use when the user asks whether a feature or area is still stable.

1. Define the exact surface area under test.
2. Cover one primary flow, one edge case, and one failure or interruption case.
3. Prefer existing automated tests first, then add manual or exploratory coverage where automation is missing.
4. Call out gaps in coverage explicitly.

### Exploratory Testing

Use when the user wants broad testing on a feature without a single known bug.

1. List the most failure-prone interactions before testing.
2. Exercise unusual sequences, repeated actions, timing-sensitive flows, and UI transitions.
3. Look for state desynchronization, stale UI, incorrect enabling or disabling, broken persistence, and rule mismatches.
4. Convert any real findings into concrete repro cases.

## Run The Investigation

1. Search the codebase for the relevant gameplay systems, UI components, and existing tests before making assumptions.
2. Prefer the smallest proof:
   - targeted `vitest` runs for logic and UI behavior,
   - targeted `playwright` runs for browser flows,
   - manual browser interaction only when automation is missing or insufficient.
3. Keep exact repro steps, inputs, and observed outcomes as you go. Do not reconstruct them from memory later.
4. When a failure appears, identify the nearest credible implementation point, event flow, or state transition. Do not over-claim root cause if the evidence only supports suspicion.
5. Distinguish between:
   - confirmed defect,
   - unverified report,
   - intended behavior that conflicts with user expectation,
   - missing spec or coverage.

## Write The Result

When reporting findings:

1. Lead with whether the issue reproduced.
2. Provide exact steps, expected result, and actual result.
3. Include the environment or command context used to test.
4. Name the likely affected files or systems if they can be supported by evidence.
5. Suggest the next best engineering action:
   - add or update a specific automated test,
   - inspect a specific state flow or UI component,
   - clarify the spec,
   - or close as not reproduced.

Use the template in [references/report-template.md](references/report-template.md) for formal bug reports or concise QA summaries.

## Operating Rules

- Stay read-only unless the user explicitly asks for fixes after testing.
- Prefer evidence over theory. A short confirmed repro is better than a long speculative explanation.
- Keep outputs structured enough that an engineer can act without follow-up.
- If testing is blocked by missing tooling, unavailable browser automation, or ambiguous expected behavior, state the blocker and the smallest next step to remove it.
