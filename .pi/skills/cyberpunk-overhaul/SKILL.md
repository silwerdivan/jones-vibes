---
name: cyberpunk-overhaul
description: Plan, execute, validate, and summarize phased cyberpunk redesign work for Jones in the Fast Lane. Use when the agent needs to turn the game's cyberpunk direction into the next phase plan, continue the current overhaul phase, implement a scoped phase task, update workflow state docs, or roll lessons from completed work into overhaul history.
---

# Cyberpunk Overhaul

Use the workflow state in `docs/workflows/cyberpunk-overhaul/` as the default control surface.

Read `references/file-map.md` if the task requires old prompt-chain context or migration mapping.

## Load context

1. If `docs/workflows/cyberpunk-overhaul/run-state.json` exists, read it first and treat it as the bounded control surface for autonomous continuation.
2. Read `docs/workflows/cyberpunk-overhaul/current-phase.md`.
3. Read `docs/workflows/cyberpunk-overhaul/overhaul-history.md`.
4. Read the design inputs `0. designer-1-input.md` and `0. designer-2-input.md` when planning a new phase or checking thematic fit.
5. Read the relevant code, tests, and existing phase plan or retro files only as needed.

## Plan a new phase

1. Inspect the current game state, recent history, and unresolved pressure points.
2. Propose one core systemic change and at most one smaller thematic or UI follow-up.
3. Create a new phase plan from `docs/workflows/cyberpunk-overhaul/phase-plan-template.md`.
4. Make tasks explicit and file-oriented. Do not leave vague tasks like "add a clinic" or "improve labor."
5. Include validation that checks both behavior and terminology cleanup.
6. Update `docs/workflows/cyberpunk-overhaul/current-phase.md` to point at the new active plan.

## Execute the current phase

1. Pick the highest-priority unchecked task unless the user directs otherwise.
2. Research affected files first with targeted search.
3. Implement the task and update related tests in the same pass.
4. Run the smallest validation that proves the change, then broader validation when the phase is ready to close.
5. Record concise progress notes in `docs/workflows/cyberpunk-overhaul/current-phase.md`.

## Close a phase

1. Run full validation for the touched surface area.
2. Write the retro from `docs/workflows/cyberpunk-overhaul/phase-retro-template.md`.
3. Update `docs/workflows/cyberpunk-overhaul/overhaul-history.md` with the phase summary, validation status, and lessons.
4. Advance `docs/workflows/cyberpunk-overhaul/current-phase.md` to the next active phase or explicitly mark the workflow idle.

## Operating rules

- Prefer one task at a time when executing a live phase.
- Preserve the repo's existing TypeScript, test, and UI conventions.
- Treat root-level numbered prompt files as legacy workflow artifacts. Consult them only when state is missing from the new workflow docs.
