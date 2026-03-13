# Overhaul History

## Phase 1

- Summary: Added the Ripperdoc Clinic, cyberware as permanent upgrades, and the first full UI terminology reskin to credits and sanity.
- Validation: Reported as 275 passing tests.
- Lessons:
  - Permanent upgrades fit well as infinite-duration conditions.
  - Full-stack terminology changes require test and UI sweeps, not just model updates.

## Phase 2

- Summary: Replaced static upkeep with Burn Rate, introduced burnout and trauma reboot penalties, and completed the `happiness` to `sanity` rename.
- Validation: Reported as 280 passing tests.
- Lessons:
  - Compound pressure mechanics work better with strong UI urgency.
  - Mixed internal and external naming creates maintenance debt.

## Phase 3

- Summary: Added the hustle loop, ambient sanity drain, event requirement logic, and fixes for modal and AI turn conflicts.
- Validation: Reported as 290 passing tests and 4 passing Playwright tests.
- Lessons:
  - Event priority and timeout cleanup matter once the UI gets denser.
  - Deterministic browser mocking is required for random-event E2E stability.

## Phase 4

- Summary: Made debt real through compounding default pressure, repaired modifier math, and rebalanced hustles versus stable labor.
- Validation: Reported as 290 passing tests and 4 passing Playwright tests.
- Lessons:
  - Debt has to create real downstream consequences or it becomes cosmetic.
  - Power-progression modifiers need explicit chaining tests.

## Phase 5

- Summary: See `2. cyberpunk-designer-overhaul-phase-5-completed.md` for the detailed legacy summary until it is migrated here.
- Validation: See the legacy completed file.
- Lessons:
  - Migrate the Phase 5 summary into this file when Phase 7 planning starts.

## Phase 6

- Summary: Replaced the faux-EULA onboarding flow with a real intro, reverted the HUD avatar treatment, and rebuilt Labor Sector mobile interactions around segmented jobs and hustles.
- Validation: `npm test` passed with `29` files / `273` tests and `npm run test:e2e` passed `7` Playwright specs on 2026-03-07. See `docs/workflows/cyberpunk-overhaul/phase-6-retro.md` for closure details.
- Lessons:
  - Remove theatrical onboarding when it obscures the actual game loop.
  - Labor Sector needs mobile-first information hierarchy instead of stacked dashboards.
  - Separate slow-render console warnings from pass/fail validation so closeout signals stay readable.

## Phase 8: Game Math Reviewer & Simulation Pipeline (COMPLETE)
- **Objective:** Structural reinforcement of the design workflow. Stop "feel-based" quick fixes by introducing a mathematical review skill and headless economy simulation.
- **Key Deliverables:**
  - .gemini/skills/game-math-reviewer/SKILL.md (Formalizing the mathematician role).
  - Mandatory math review step in cyberpunk-overhaul skill.
  - npm run simulate:economy (Headless human-player simulation).
  - Balance Testing mode in game-tester skill.
- **Status:** Structural tasks complete. Validation of simulation data in progress.

### Future Research: Hustle Depth (Philosophical Seed)
- **Problem:** Current hustles are 'taxing' but mathematically flat. They lack the high-variance 'jackpot' feel of real-world hustling.
- **Proposal:** In a future phase, explore 'Hustle Heat' (social/legal risk), rare 'Big Score' payouts (1 in 50 chance for 10x reward), and a 'Scavenger' progression track to make hustling a deep alternative to labor, not just a desperate fallback.
