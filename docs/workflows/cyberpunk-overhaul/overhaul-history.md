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

## Phase 9: Hustle Depth & High-Variance Risk/Reward (COMPLETE)
- **Objective:** Transition the "Hustle" mechanic from a desperate fallback into a viable, high-risk/high-reward "Scavenger" progression path.
- **Key Deliverables:**
  - **Hustle Heat System:** Diminishing returns and increasing risk for repeated actions.
  - **Big Score Hustles:** Rare, high-payout opportunities (Data Snatch, Heist Driver).
  - **Scavenger Gear:** New items (Filtered-Respirator, Blood-Scrubber, Burner-Comm) to mitigate hustle risks and costs.
  - **Telemetry Validation:** Updated `simulate:economy` to verify wealth parity and high-variance outcomes for the Scavenger path.
- **Status:** Completed 2026-03-13. 277 tests passing.
- **Lessons:**
  - "Heat" creates a natural, non-punitive diversification pressure.
  - Scavenger gear provides a meaningful early-game alternative to "Career/Education" progression.
  - High-variance mechanics (Big Scores) are essential for the "Ruthless Empowerment" theme.

## Phase 10: Early Game Poverty, Sanity, and Hunger Balancing (COMPLETE)
- **Objective:** Rebalance early-game pressure to ensure "poverty/survival" aesthetics. Restore the threat of hunger and the need for active sanity management.   
- **Key Deliverables:**
  - **"Drowning Slowly" Loop:** Passive sanity shifted from +7/turn to -5/turn (Ambient Stress -10, Cycle Rest +5).
  - **Starvation Spiral:** Cascading penalties for hunger (>50 Cognitive Decline/Lockouts, >70 Exhaustion/Time Penalty, >90 Starvation Damage).
  - **Survival Economics:** Nerfed Network Stimulus windfall (¥100), decoupled cheap food from sanity (Bio-Block -2 Sanity), and added "Real-Meat Burger" (¥40, +10 Sanity).
  - **HUD Hunger Gauge:** Integrated visual Bio-Deficit tracking with critical warning states.
  - **MDA-BALANCE-LOG.md:** Established a permanent mathematical/aesthetic source of truth for game balance.
- **Status:** Completed 2026-03-15. 277 tests passing.
- **Lessons:**
  - "Time" is the most valuable currency in a life-sim; use it as a penalty for physical failure (exhaustion).
  - Documenting the "why" (Aesthetic Goals) in the Balance Log is critical for AI-human alignment.
  - Visualizing hidden metrics (Hunger) in the HUD immediately elevates their perceived importance.

## Phase 11: Gameplay Audit & MDA Deep-Dive (IN_PROGRESS)
- **Objective:** Execute a comprehensive gameplay audit to gather high-fidelity telemetry and qualitative "feel" data.
- **Key Deliverables:**
  - Extended play sessions using `agent-browser` with Persona-based strategies.
  - Turn-by-turn cognitive decision logs and MDA mismatch reports.
  - Competitive analysis of human vs. AI progression curves.
- **Status:** Planning complete. Documentation for audit protocol finalized.
