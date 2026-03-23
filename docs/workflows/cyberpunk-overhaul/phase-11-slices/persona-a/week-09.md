# Week 9 Audit: Persona A (The Safe Grinder)

## Session Context
- **Date:** 2026-03-23
- **Objective:** Verify survival of `Sanitation-T3` route under harsher hunger floor.
- **Game Version:** Cyberpunk Overhaul Phase 11

## Status At Start of Week
- **Credits:** ₡458
- **Hunger:** 60%
- **Sanity:** 25
- **Conditions:** TRAUMA_REBOOT (266h)

## Actions Taken
1. **Travel to Labor Sector:** -2CH.
2. **Work Sanitation-T3:** Shift 1. Yield ₡84.
3. **Work Sanitation-T3:** Shift 2. Yield ₡84.
4. **Work Sanitation-T3:** Shift 3. Yield ₡84.
5. **Travel to Hab-Pod 404:** -2CH.
6. **End Turn:** 0CH remaining.

## Results & Events
- **Hunger Increase:** +20% (No Thermal-Regulator). Total: 80%.
- **Exhaustion Protocol Triggered:** Hunger 80% >= Max Energy 80% (Trauma Reboot penalty).
- **Sanity Drain:**
    - Ambient Stress: -10
    - Exhaustion Protocol: -15
    - Cycle Recovery: +5
    - Cognitive Decline: -5 (Hunger > 50%)
    - **Total Net Change:** -25 Sanity.
- **CRITICAL EVENT: BURNOUT:** Sanity hit 0. Emergency Trauma Team dispatched.
    - Medical Fee: ₡250.
    - Sanity Recovery: +40 (Trauma Team) + 5 (Cycle) = 45 final.
    - Condition Reset: TRAUMA_REBOOT duration refreshed to 336h (14 days).

## Final State
- **Credits:** ₡380
- **Hunger:** 80%
- **Sanity:** 45
- **Trauma Reboot:** 312h (post-turn tick)

## Observations
- The "Safe Grinder" route (3x shifts, no food) is **no longer viable** once `TRAUMA_REBOOT` is active.
- The 20% Max Energy penalty from `TRAUMA_REBOOT` lowers the ceiling to 80% hunger.
- Reaching 80% hunger triggers `Exhaustion Protocol` (-15 sanity), which combined with `Ambient Stress` (-10) creates a 25-point sanity cliff.
- Starting a week with 25 sanity and 60% hunger is a guaranteed burnout loop if no food is consumed.
- **MDA Insight:** The "Starvation Spiral" is working as intended, forcing players to prioritize sustenance over pure credit grinding once sanity reserves are low.
