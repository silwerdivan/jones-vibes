# MDA Balance Record (Decision Log)

This document serves as the permanent record for mathematical and systemic design decisions in Jones in the Fastlane. Its purpose is to preserve the "why" behind the game's balance and prevent regressions during future iterations.

## Core Aesthetic Mandates
- **Poverty is Degrading:** Early-game survival should feel like a constant squeeze. Cheap options should keep you alive but carry high mental or social costs.
- **Pressure Management:** Sanity should be a resource that requires active maintenance, not something that recovers for free.
- **Bio-Deficit (Hunger) is Primary:** Hunger is the physical foundation of the simulation. Ignoring it should lead to rapid systemic failure (starvation, exhaustion).

## Decision History

### Phase 10: Early Game Poverty & Hunger Squeeze

#### 1. Passive Sanity Loop
- **Component:** TimeSystem.ts (Ambient Stress & Cycle Rest)
- **Rule:** Ending a turn must result in a **net Sanity loss** of at least 5 points.
- **Values:** Ambient Stress: -10, Cycle Rest: +5.
- **Intent:** Forces the player to engage with sanity-recovery mechanics (hustles, items, entertainment) rather than relying on the turn-end bonus to stay sane.

#### 2. Survival Economics (Sustenance Hub)
- **Component:** data/items.ts (Bio-Block-01, Synth-Salad)
- **Rule:** Survival-tier food (cost < ₡20) must have **zero or negative Sanity value**.
- **Values:** 
  - Bio-Block-01 (₡10): -2 Sanity.
  - Synth-Salad (₡12): 0 Sanity.
- **Intent:** Decouples caloric survival from mental health. Eating "textured wall spackle" should keep you alive but crush your soul.

#### 3. Network Stimulus Nerf
- **Component:** data/randomEvents.ts (global_stimulus_windfall)
- **Rule:** Global windfalls for the poor must be high-cost, low-reward "traps."
- **Values:** 
  - Credits: 100 (was 300).
  - Condition: AD_FATIGUE drain increased to -0.5/hr (was -0.2/hr).
  - Prerequisite: maxWealth 200 (was 500).
- **Intent:** Prevents the early game from being trivialized by a guaranteed 300-credit drop.

#### 4. The Starvation Spiral
- **Component:** TimeSystem.ts, Player.ts, GameState.ts
- **Rule:** High Hunger (>50) must trigger cascading systemic failures.
- **Thresholds:**
  - **Hunger > 50:** Cognitive Decline. Lockout from Education and Level 2+ Jobs. -5 Sanity/turn.
  - **Hunger > 70:** Exhaustion. Start next turn with **8 Hours** (instead of 16). -15 Sanity/turn.
  - **Hunger > 90:** Starvation. -30 Sanity/turn.
- **Intent:** Creates a "death spiral" that makes Hunger the most immediate threat to progress.
