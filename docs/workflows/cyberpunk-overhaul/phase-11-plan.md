# Phase 11: Gameplay Audit & MDA Deep-Dive

## Status: IN_PROGRESS

## Objective
Execute a comprehensive gameplay audit using `agent-browser` and specialized "Player Personas" to gather high-fidelity telemetry, decision-making logs, and qualitative "feel" data. This phase aims to identify remaining balance wrinkles, broken math, and opportunities to enrich the game's depth.

## Strategy: Data-Rich Telemetry Gathering
Instead of simple bug hunting, this phase focuses on simulating distinct player archetypes and recording the "cognitive" rationale behind every decision alongside raw game state deltas.

### 1. Player Personas for Audit
- **Persona A: The Safe Grinder:** Focuses on low-tier stability, avoiding all risks and debt. Tests the "Poverty Trap" baseline.
- **Persona B: The High-Risk Scholar:** Aggressive debt-leveraging for fast education. Tests the "Debt Spiral" and "Education Payoff" curves.
- **Persona C: The Street Hustler:** High-variance playstyle relying on Hustles and Random Events. Tests "Scavenger" viability and RNG frustration.
- **Persona D: The AI Opponent Control:** Parallel tracking of the built-in AI's progression to evaluate human vs. AI parity.

### 2. Audit Logging Protocol (Per Turn)
For every week played, the following data points will be captured:
- **Quantitative (The Math):** Cash, Debt, Health/Stress, Hunger, Education, Time Efficiency (Commute vs. Action).
- **Qualitative (The Feel):** Available Options, Decision Rationale ("Why this action?"), Friction Points ("What felt punishing?"), Reward Sensation ("Did this feel rewarding?").
- **Storage Rule:** Detailed week-by-week history should live in per-slice files under `docs/workflows/cyberpunk-overhaul/phase-11-slices/`. Keep `phase-11-audit-progress.md` as the executive rollup and keep persona logs as compact indexes plus milestone synthesis layers.

### 3. Milestone Vibe Checks
Deep-dive evaluations at Week 10, 25, and 50 to assess:
- **Snowballing vs. Stagnation:** Is progress meaningful or just "treading water"?
- **Decision Space:** Does the game open up or narrow down over time?
- **Pacing:** Aesthetic evaluation of the game's speed and tension.

## Tasks
- [ ] **Task 1: Setup Audit Infrastructure**
    - Configure `agent-browser` for extended play sessions.
    - Create a structured logging template for Persona runs.
- [ ] **Task 2: Execute "The Safe Grinder" Run (Persona A)**
    - Play 50 weeks focusing on entry-level labor.
    - Log all telemetry and decision-making friction.
- [ ] **Task 3: Execute "The High-Risk Scholar" Run (Persona B)**
    - Play 50 weeks focusing on max debt and education.
    - Analyze the viability of the "Debt-to-Success" pipeline.
- [ ] **Task 4: Execute "The Street Hustler" Run (Persona C)**
    - Play 50 weeks focusing on Scavenger/Hustle mechanics.
    - Evaluate RNG impact and "Heat" system dynamics.
- [ ] **Task 5: Comparative AI Analysis (Persona D)**
    - Monitor AI progression across all runs.
    - Identify any "AI Cheating" or "AI Stagnation" issues.
- [ ] **Task 6: Synthesis & "Wrinkle" Report**
    - Compile all data into a final audit report.
    - Propose Phase 12 tasks based on identified MDA mismatches.

## Expected Deliverables
1. **Raw Telemetry Package:** Structured stats for all Persona runs.
2. **The Player Journey Journal:** Qualitative narrative of "The Feel" of each playstyle.
3. **The "Wrinkle" Report:** Specific list of identified friction points and broken math.
4. **Phase 12 Strategy:** Data-backed recommendations for the next overhaul phase.
