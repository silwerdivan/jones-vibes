# Phase 10 Retro: Early Game Poverty, Sanity, and Hunger Balancing

## Status: COMPLETED
**Date:** 2026-03-15

## Summary of Changes
Rebalanced the early game "pressure" systems to align with MDA (Mechanics, Dynamics, Aesthetics) goals. Shifted the passive loop to be net-negative, decoupled cheap sustenance from mental relief, and introduced a cascading failure system for hunger.

## Key Implementation Details

### 1. The "Drowning Slowly" Sanity Loop
- **Ambient Stress:** Increased from -8 to **-10**.
- **Cycle Rest:** Reduced from +15 to **+5**.
- **Net Passive:** Players now lose **5 Sanity per turn** by default. This forces active engagement with entertainment or items to avoid burnout.

### 2. The Starvation Spiral
- **Hunger > 50 (Cognitive Decline):** -5 Sanity/turn. **Lockout** from Education and Level 2+ Jobs (UI reflects "Focus Lost").
- **Hunger > 70 (Exhaustion):** -15 Sanity/turn. Player starts next turn with only **8 Hours** (timeDeficit 8).
- **Hunger > 90 (Starvation):** -30 Sanity/turn. Critical mental collapse risk.

### 3. Survival Economics
- **Network Stimulus Drop:** Nerfed from ₡300 to **₡100**. Trigger threshold reduced to **₡200** max wealth. \AD_FATIGUE\ drain buffed to **-0.5/hr**.
- **Cheap Sustenance:** \Bio-Block-01\ now gives **-2 Sanity**. \Synth-Salad\ gives **0 Sanity**.
- **Premium Sustenance:** Added \Real-Meat Burger\ (₡40, +10 Sanity) as the only food way to gain sanity early.

### 4. UI/UX Enhancements
- **HUD:** Integrated a visible **Bio-Deficit (Hunger) Gauge** with color-coding and warning states.
- **Action Cards:** Implemented "Starvation Lockout" visual state for jobs and courses.

## Validation Status
- **TimeSystem.test.ts:** Updated and passing. Confirms net-negative sanity loop and Exhaustion Protocol sanity drain.
- **GameState.test.ts:** Passing.
- **Manual Verification:** UI elements (Gauge, Lockouts) correctly reflect state changes.

## Lessons & Future Knobs
- The **timeDeficit** mechanism is a very powerful "soft death" knob. We should monitor if 8 hours is too punishing for new players.
- The **MDA-BALANCE-LOG.md** now serves as the source of truth for these mathematical boundaries to prevent future regressions.
