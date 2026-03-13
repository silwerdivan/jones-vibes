# Phase 8 Plan: Game Math Reviewer & Headless Simulation

## Objective
Formalize the "Game Math Reviewer" persona into an actionable skill, require mathematical validation for all game economy changes within the `cyberpunk-overhaul` skill, and build a headless economy simulation script to provide concrete telemetry to the AI.

## Tasks

### 1. Formalize the `game-math-reviewer` Skill [COMPLETE]
- [x] Create the directory `.gemini/skills/game-math-reviewer/`.
- [x] Convert `game-math-reviewer-persona.md` into `.gemini/skills/game-math-reviewer/SKILL.md`.
- [x] Ensure the skill clearly defines triggers and output structure (MDA Mismatch analysis).

### 2. Update `cyberpunk-overhaul` Workflow [COMPLETE]
- [x] Modify `.gemini/skills/cyberpunk-overhaul/SKILL.md`.
- [x] Update the "Execute the current phase" and "Plan a new phase" sections to include a mandatory "Systems & Math Review" step using the `game-math-reviewer` skill *before* any economy code is written or altered.
- [x] Forbid "quick fixes" (like flat `+20` value overrides) for any stats, probabilities, or economy values unless mathematically justified by the reviewer.

### 3. Build Headless AI Playtesting (Simulation) Script [COMPLETE]
- [x] Create `tests/simulate-economy.test.ts`.
- [x] The script initializes a head-less `GameState` and runs a "Human Driver" (not AI controller) over multiple games.
- [x] Collect telemetry (bankruptcies, wealth, sanity at milestones).
- [x] Output the telemetry as a clean JSON or formatted text report.

### 3.5. Fix Simulation Fidelity [COMPLETE]
- [x] Fix property checks (`player.hasJob` -> `player.careerLevel > 0`).
- [x] Standardize action time costs against game mechanics.
- [x] Implement graceful turn exits.
- [x] Replace direct system calls with UI-equivalent calls.

### 4. Wire Up `package.json` Commands [COMPLETE]
- [x] Add an NPM script `"simulate:economy": "vitest run tests/simulate-economy.test.ts"` to `package.json` so the AI can easily run it.

### 5. Expand `game-tester` for Balance Regressions [COMPLETE]
- [x] Update `.gemini/skills/game-tester/SKILL.md` to include a "Balance Testing" mode.
- [x] Instruct the game tester to use the new `npm run simulate:economy` script to assert on feel and balance.

## Validation [COMPLETE]
- [x] Run the simulation script locally to ensure it outputs realistic data without crashing. (Fidelity fixed; producing valid baseline telemetry).
- [x] Have the `game-math-reviewer` analyze simulation data and implement the Hustle Yield Boost ($100 reward). Verified: Turn 20 debt dropped from $1,000 to $0.
