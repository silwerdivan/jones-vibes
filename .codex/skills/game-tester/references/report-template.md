# Testing Report Template

Use this reference when the user wants a durable bug report, fix-verification note, or regression summary.

## Bug Report

```markdown
# Bug Report: [Short Title]

## Status
- Reproduced: Yes | No | Intermittent
- Severity: Low | Medium | High | Critical
- Area: [System or feature]

## Environment
- Branch or revision: [if known]
- Validation used: [manual flow, vitest command, playwright command]

## Steps To Reproduce
1. [Step one]
2. [Step two]
3. [Trigger step]

## Expected Result
[Describe the intended behavior.]

## Actual Result
[Describe the observed behavior.]

## Evidence
- Screenshot, video, log, or test output summary: [details]

## Likely Affected Surface
- Files, systems, or state transitions that appear relevant based on evidence

## Notes
- Edge cases checked
- Repro frequency
- Open questions or blockers
```

## Fix Verification Note

```markdown
# Fix Verification: [Issue or feature]

## Result
- Outcome: Pass | Partial | Fail
- Validation used: [command or manual flow]

## Original Repro
1. [Original repro step one]
2. [Original repro step two]

## Verification Outcome
- Original issue: [fixed, not fixed, partially fixed]
- Nearby regressions checked: [list]
- Remaining risks: [list or none]
```

## Regression Sweep Summary

```markdown
# Regression Sweep: [Feature Area]

## Coverage
- Primary flow: Pass | Fail
- Edge case: Pass | Fail
- Failure case: Pass | Fail

## Commands
- [Exact automated commands run]

## Findings
- [Finding or "No confirmed defects found"]

## Gaps
- [Missing automation, unclear spec, unavailable environment]
```

## Severity Heuristic

- `Low`: cosmetic issue or minor friction with an obvious workaround.
- `Medium`: incorrect behavior that affects normal play but does not block progression.
- `High`: major gameplay break, repeated state corruption, or feature unusable for common flows.
- `Critical`: crash, hard lock, data loss, or progression blocked for core gameplay.
