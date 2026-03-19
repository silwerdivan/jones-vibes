# Autonomous Runner Refactor Plan

## Status

- Current next work item: `Task A: Compact Logging + Failure-Preserving Debug Mode`
- [ ] Task A: Compact Logging + Failure-Preserving Debug Mode
- [ ] Task B: Prompt and Handoff Tightening
- [ ] Task C: Documentation Refresh
- [ ] Task D: Optional Automation Hardening Follow-Up

## Purpose

This plan exists to refactor the Phase 11 autonomous runner so it stays efficient in normal operation without losing the forensic detail needed when `agent-browser` or the UI automation path becomes unreliable.

The goal is not to make the runner "quiet" at all costs. The goal is to:

1. Cut token waste and log spam during successful slices.
2. Preserve high-value evidence when a slice fails, retries, blocks, or changes strategy.
3. Make each fresh-context slice easier to resume correctly with less repeated discovery work.

## Background

During review of `autonomous-runner.log` from `2026-03-18T19:31:20+02:00` onward, the main inefficiencies were not gameplay decisions. They were observability and control-surface problems:

- One bounded Week 7 slice used `147,882` tokens.
- The same slice emitted repeated `diff --git` blocks and repeated final summaries.
- The same `agent-browser` interaction patterns had to be rediscovered in-line instead of being handed off cleanly.
- Fixed waits consumed meaningful wall time even when state could have been polled directly.
- The runner prompt still left enough ambiguity that the agent performed avoidable path checks and repeated context gathering.

The key design constraint from this point onward:

**Do not trade away debugging visibility just to make the logs smaller.**

If `agent-browser` struggles in a future slice, we still need a reliable way to answer:

- What command was attempted?
- What state was expected?
- What state actually happened?
- What fallback was tried?
- Why did the agent decide the fallback was necessary?

## Refactor Principles

### 1. Compact by default

Successful, routine slices should produce a compact structured log and a short human-readable summary instead of a full transcript firehose.

### 2. Verbose on trouble

If a slice fails, retries, blocks, or changes strategy because UI automation is not behaving, the runner should keep richer evidence automatically.

### 3. Keep state evidence, not noise

What matters most is state at meaningful checkpoints, not every repeated copy of diffs or final prose.

### 4. Tight handoff beats repeated rediscovery

Fresh-context runs are expected. Repeatedly rediscovering canonical slice paths, checkpoints, and proven UI workarounds is not.

## What Must Be Preserved

The following information must remain available after the refactor:

- Failed `agent-browser` commands and their stdout/stderr.
- Retry and fallback chains for UI actions.
- Key checkpoint state snapshots:
  - slice start
  - after week transition
  - after each meaningful action
  - week summary / stop point
- Final changed-file list.
- One final consolidated diff artifact per slice.
- Token count, wall time, and step timings.
- Blocker/`needs_human` context when a slice stops early.

The following can be compressed or deduplicated safely:

- Repeated successful `diff --git` dumps.
- Repeated final summaries.
- Repeated startup reads that add no new information.
- Routine successful tool invocations once the path is stable.

## Recommended Implementation Order

### Task A: Compact Logging + Failure-Preserving Debug Mode

These two belong together and should be implemented in the same pass.

Why they go together:

- Compact logging without debug preservation is risky.
- Debug preservation without compact normal-mode logging does not solve the waste problem.

What Task A should do:

- Add a compact structured log format for each slice, preferably JSONL.
- Record slice metadata:
  - timestamp
  - persona
  - status
  - token count
  - wall time
  - changed files
- Record structured action events for meaningful milestones:
  - startup reads
  - browser session verification
  - state checkpoints
  - retries/fallbacks
  - final outcome
- Suppress repeated `diff --git` emission during the live stream.
- Keep one final diff artifact per slice instead of many repeated copies.
- Add automatic debug escalation when any of these happen:
  - nonzero tool exit
  - repeated retry threshold exceeded
  - fallback strategy invoked
  - `status = blocked`
  - `needs_human = true`
- Preserve raw `agent-browser` evidence for failed or suspicious commands.

Definition of done for Task A:

- A successful slice produces materially less transcript/log volume than today.
- A failed or blocked slice still preserves enough evidence to debug UI automation later.
- Token/time metrics remain visible.

### Task B: Prompt and Handoff Tightening

This should land immediately after Task A.

Why second:

- Better logging makes it easier to verify whether the handoff tightening actually reduces duplicated work.
- Handoff tightening is lower risk once the observability layer is already improved.

What Task B should do:

- Expand runner-provided context with exact canonical handoff data:
  - canonical latest slice file path
  - current checkpoint summary
  - expected next action
  - trusted known UI workarounds for the active persona/slice type
- Reduce prompt ambiguity around per-persona slice lookup.
- Prefer explicit paths from `run-state.json` or runner-generated context over directory inference.
- Make the prompt instruct the agent to avoid source-code spelunking unless:
  - gameplay state is ambiguous
  - a UI path fails
  - a new mechanic must be verified

Definition of done for Task B:

- The agent no longer does avoidable slice-path probing.
- Startup context gathering is smaller and more deterministic.
- Routine slices reach gameplay faster.

### Task C: Documentation Refresh

This can be done in the same branch as Task B if convenient.

What Task C should do:

- Update `docs/workflows/cyberpunk-overhaul/autonomous-runner.md`.
- Document:
  - compact logging behavior
  - debug escalation behavior
  - where structured logs live
  - where raw failure traces live
  - how to force verbose mode if needed
- Add brief operator guidance for reading the new artifacts after a blocked slice.

Definition of done for Task C:

- A future operator can understand the new logging model without reading the code first.

### Task D: Optional Automation Hardening Follow-Up

This should be a separate follow-up unless the implementing thread still has time and clear scope.

Why separate:

- It touches app/UI behavior rather than just runner observability.
- It is easier to tune once Tasks A-C make failures more legible.

Potential scope:

- Add stable `data-testid` or equivalent selectors for important action cards.
- Consider an audit bridge for trusted automation actions if appropriate.
- Replace fixed waits with condition polling where possible.

Definition of done for Task D:

- The runner depends less on brittle text/ref discovery.
- Wait-heavy sequences are reduced.

## Concrete Work Breakdown

### Task A checklist

- [ ] Inspect current runner output path and log-writing flow in `scripts/cyberpunk-overhaul-phase11-once.sh`.
- [ ] Decide artifact layout under `.codex-runtime/cyberpunk-overhaul/`.
- [ ] Add compact per-slice event log format.
- [ ] Add final summary artifact per slice.
- [ ] Add final diff artifact per slice.
- [ ] Add failure-triggered raw trace preservation.
- [ ] Ensure token count and wall time are still captured.
- [ ] Verify a success path emits less noise than the current runner.
- [ ] Verify a forced-failure path still preserves actionable evidence.

### Task B checklist

- [ ] Inspect current prompt assembly in `scripts/cyberpunk-overhaul-phase11-once.sh`.
- [ ] Tighten `docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md`.
- [ ] Pass canonical slice file path and checkpoint details explicitly.
- [ ] Pass proven UI workaround notes explicitly when available.
- [ ] Reduce startup read ambiguity without weakening the bounded control surface.
- [ ] Verify a fresh-context slice reaches the first meaningful action with fewer exploratory reads.

### Task C checklist

- [ ] Update `docs/workflows/cyberpunk-overhaul/autonomous-runner.md`.
- [ ] Document artifact locations and debug behavior.
- [ ] Add operator notes for blocked slices and UI automation failures.

### Task D checklist

- [ ] Identify the highest-friction UI paths from recent slices.
- [ ] Add stable selectors or equivalent support only where it materially improves automation.
- [ ] Replace obvious blind waits with state polling where safe.
- [ ] Re-run one bounded slice to compare retry count and wait time.

## Guardrails

### Do not do these in Task A

- Do not change gameplay logic.
- Do not redesign the whole workflow state format unless necessary.
- Do not silently drop failure output from `agent-browser`.

### Be careful about these

- If compact logging depends on `codex exec --json`, make sure the resulting artifacts are still easy to inspect after a failed unattended run.
- If diff output is suppressed in the live transcript, store the final diff somewhere deterministic.
- If raw trace retention is conditional, make the trigger rules explicit and conservative.

## Validation Strategy

Minimum validation for the refactor:

1. Run one dry run and inspect generated prompt/context artifacts.
2. Run one normal successful slice and compare:
   - token count
   - log size
   - duplicated diff/final-summary output
3. Run one intentionally troublesome or replay-style slice and confirm:
   - failed commands are preserved
   - retry/fallback chain is visible
   - checkpoint states are still reconstructable
4. Confirm the operator can tell, from artifacts alone:
   - what happened
   - where it failed
   - what changed
   - what the next action should be

## Suggested New-Thread Execution Order

If this work is kicked off in a fresh thread, use this order:

1. Task A
2. Task B
3. Task C
4. Task D only if time remains and the observability refactor is already stable

## Suggested New-Thread Prompt

Use the `cyberpunk-overhaul` skill. Implement Task A, Task B, and Task C from `docs/workflows/cyberpunk-overhaul/autonomous-runner-refactor-plan.md`.

Constraints:

- Preserve failure/debug visibility for future `agent-browser` UI automation issues.
- Reduce normal successful-slice log and token noise.
- Do not change gameplay logic.
- Keep the workflow bounded to the existing Phase 11 runner/doc surfaces unless a small supporting helper is clearly necessary.

Deliverables:

- updated runner script(s)
- updated prompt and/or handoff docs
- updated autonomous runner documentation
- a concise validation summary comparing before/after behavior

## Progress Notes

- 2026-03-18: Initial refactor plan created from review of the Week 7 autonomous slice log. Plan favors compact default logging plus automatic debug preservation instead of a blanket reduction in output.
