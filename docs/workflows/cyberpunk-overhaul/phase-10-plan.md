# Phase 10: Early Game Poverty, Sanity, and Hunger Balancing

## Status: COMPLETED

## Objective
Evaluate and rebalance the early game economy and life simulation mechanics to ensure the intended "poverty/survival" aesthetics are met, focusing on MDA (Mechanics, Dynamics, Aesthetics) and mathematical balancing.

## Key Issues Identified & Verified
1. **Excessive Early Income:** The \Network Stimulus Drop\ (\global_stimulus_windfall\) triggers with a **100% chance** at the start of any week if wealth < 500, granting **300 credits** with minimal downside. This trivializes the early game struggle.
2. **Sanity Metric is Trivial:** \TimeSystem.ts\ applies a -8 "Ambient Stress" penalty but immediately follows it with a +15 "Cycle Rest" bonus, resulting in a **net +7 sanity gain per turn** just for ending the turn.
3. **Hunger Metric is Decoupled:** Hunger increases by 20/turn but only impacts sanity when > 50. The net sanity gain from resting completely masks the hunger penalty in the early game.

## Strategy for Rebalancing (Aligned with MDA-BALANCE-LOG.md)
1. **Economy:** Reduce stimulus windfall to 100 credits, lower the trigger threshold to 200, and buff \AD_FATIGUE\ drain to -0.5/hr.
2. **Sanity:** Adjust \Cycle Rest\ to be lower than \Ambient Stress\ (-10 Stress vs. +5 Rest) to force players to seek active sanity recovery.
3. **Food:** Decouple hunger from sanity. Cheap food (Bio-Block-01) now has a sanity penalty (-2) to reflect its degrading nature. Add "Real-Meat Burger" (40 credits, +10 sanity) as a premium survival option.
4. **Hunger:** Implement cascading systemic failures (Starvation Spiral):
   - **Hunger > 50:** Cognitive Decline (Lockout of Education & Level 2+ Jobs). -5 Sanity/turn.
   - **Hunger > 70:** Exhaustion (Next turn starts with 8 hours). -15 Sanity/turn.
   - **Hunger > 90:** Starvation. -30 Sanity/turn.

## Tasks
- [x] Implement Hunger visualization in HUD (add numeric or warning state)
- [x] Update \RANDOM_EVENTS.ts\ to nerf \global_stimulus_windfall\ and \conditions.ts\ to buff \AD_FATIGUE\
- [x] Update \TimeSystem.ts\ to adjust Ambient Stress (-10) and Cycle Rest (+5)
- [x] Update \items.ts\ to adjust food sanity values and add "Real-Meat Burger"
- [x] Update \TimeSystem.ts\ and \GameState.ts\ to implement the cascading Hunger penalties (>50 lockout, >70 time penalty, scaling sanity drains)
- [x] Update UI elements (HUD/Action Cards) to reflect job/course lockouts under hunger
- [x] Update tests for Sanity, Hunger, and Random Events to reflect new balance
