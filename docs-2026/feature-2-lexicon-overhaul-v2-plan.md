# Implementation Plan: Feature 2 - Lexicon Overhaul (Phase 2: Gaps & Polish)

This plan addresses the gaps identified in the initial Lexicon Overhaul, focusing on Labor, Education, remaining Locations, and UI units to fully realize the "Dystopian OS" (OmniLife) branding.

## **1. Labor & Education Rebranding**

### **1.1 Labor Sector (Jobs)**
- [ ] **Update `src/data/jobs.ts`:**
    - `Dishwasher` -> `Sanitation-T3` (13 chars)
    - `Fast Food Worker` -> `Nutrient-Disp.` (14 chars)
    - `Retail Associate` -> `Asset-Acquisit` (14 chars)
    - `Office Clerk` -> `Data-Unit-01` (12 chars)
    - `Junior Accountant` -> `Cred-Reconcilr` (15 chars)

### **1.2 Cognitive Re-Ed (Courses)**
- [ ] **Update `src/data/courses.ts`:**
    - `Associate's Degree` -> `Found. Compl.` (13 chars)
    - `Bachelor's Degree` -> `Intermed. Prod` (14 chars)
    - `Master's Degree` -> `Sys-Integrate` (13 chars)

## **2. Locations & Infrastructure**

### **2.1 Remaining Locations**
- [ ] **Update `src/data/locations.ts`:**
    - `Shopping Mall` -> `Consumpt-Zone` (13 chars)
    - `Used Car Lot` -> `Mobility-Asset` (14 chars)
    - `Bank (Interest)` -> `Yield-Optimize` (14 chars)

## **3. Item & UI Finalization**

### **3.1 Item Rebranding**
- [ ] **Update `src/data/items.ts`:**
    - `Coffee` -> `Focus-Fluids`
    - `Movie Ticket` -> `Prop-Reel Tkt`
    - `New Clothes` -> `Uniform-Patch`
    - `Burger` -> `Bio-Block-01`

### **3.2 UI Units & Symbols**
- [ ] **Currency Symbol:** Update all instances of `$` to `[OC]` (Omni-Creds).
    - Check `src/ui/components/HUD.ts`, `src/ui/components/shared/ActionCard.ts`, `src/ui/components/screens/CityScreen.ts`.
- [ ] **Time Units:** Update `h` or `hr` to `CH` (Cycle Hours).
    - Check `src/ui/components/HUD.ts`, `src/ui/components/shared/ActionCard.ts`.

### **3.3 UI Labels & Status**
- [ ] **Gauges & Labels:**
    - `Edu Lvl` / `Education` -> `Compliance Level`
    - `Career` -> `Productivity Tier`
- [ ] **Status Chips:**
    - `Well-Rested` -> `Optimal Buffer`
    - `In Debt` -> `Negative Liquidity`

## **4. Log Messages & Polish**
- [ ] **Tone Check:** Review `src/game/GameState.ts` and `src/systems/TimeSystem.ts` for any remaining "friendly" or generic sim messages and update them to a clinical/dystopian tone (e.g., "Congratulations" -> "Milestone Achieved").

---

## **5. Testing & Validation**
- [ ] Run `npm test` and update any broken snapshots or string comparisons.
- [ ] Verify 15-character limit on all new strings in the UI.
- [ ] Build verification: `npm run build`.
