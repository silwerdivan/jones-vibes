# Implementation Plan: Feature 2 - Lexicon & Item Overhaul (OmniLife OS)

This plan outlines the steps to transition the game's generic terminology to the dystopian "OmniLife OS" branding and implement the mathematical buffs for the "Omni-Chill" and "Hypno-Screen" items.

## **1. Lexicon Reskin (Strings & UI Labels)**

### **1.1 Data Layer Updates**
- [x] **Rename Locations:** Update `src/data/locations.ts`
    - `Home` -> `Hab-Pod 404`
    - `Fast Food` -> `Sustenance Hub`
    - `Community College` -> `Cognitive Re-Ed`
    - `Bank` -> `Cred-Debt Ctr`
    - `Employment Agency` -> `Labor Sector`
- [ ] **Rename Items:** Update `src/data/items.ts`
    - `Fridge` -> `Omni-Chill`
    - `Television` -> `Hypno-Screen`
    - Update `benefit` descriptions to match new math (e.g., "Reduces weekly Bio-Deficit increase by 50%").
- [ ] **Rename EULA Penalties:** Update `src/data/eula.ts` labels (e.g., "Hunger" -> "Bio-Deficit").

### **1.2 UI Layer Updates**
- [ ] **HUD:** Update `src/ui/components/HUD.ts`
    - `CREDITS` -> `OMNI-CREDS`
    - `WEEK` -> `CYCLE`
    - `ZONE` -> `SECTOR`
- [ ] **Life Screen Gauges:** Update `src/ui/components/screens/LifeScreen.ts`
    - `Wealth` -> `Omni-Creds`
    - `Happiness` -> `Morale Quota`
- [ ] **Life Screen Chips:** Update `src/ui/components/screens/LifeScreen.ts`
    - `Hungry` -> `Deficit Warning`
    - `Starving` -> `CRITICAL DEFICIT`
    - `Satiated` -> `Optimal`
- [ ] **Inventory Screen:** Update `src/ui/components/screens/InventoryScreen.ts`
    - `Home Assets` -> `Hab-Pod Assets`
- [ ] **City Screen:** Update `src/ui/components/screens/CityScreen.ts`
    - Update bento card titles, summaries, and hint text to use new terminology.
- [ ] **Gauges:** Update `src/ui/components/shared/Gauge.ts` (if it contains hardcoded labels).
- [ ] **Action Cards:** Update `src/ui/components/shared/ActionCard.ts`
    - Change "Hunger" tag to "Bio-Deficit".
    - Change "Happy" tag to "Morale".

### **1.3 Game Logic Strings**
- [ ] **Log Messages:** Update `src/game/GameState.ts` and `src/systems/TimeSystem.ts`
    - Replace all instances of "Hunger", "Happiness", and location names in `addLogMessage` calls.

---

## **2. Item Math Implementation**

### **2.1 Omni-Chill (Fridge) Logic**
- [ ] **Modify `TimeSystem.endTurn()` in `src/systems/TimeSystem.ts`**
    - Identify the hunger increase logic (currently +20).
    - Check player inventory: `const hasOmniChill = player.inventory.some(i => i.name === 'Omni-Chill')`.
    - If `hasOmniChill`, multiply the weekly hunger increase by 0.5 (result: +10).

### **2.2 Hypno-Screen (Television) Logic**
- [ ] **Implement "Rest" Morale Gain**
    - The current `endTurn()` does not grant happiness. According to the PRD, "Resting" should now provide a morale gain.
    - Add a base `moraleGain = 10` to the `endTurn()` logic.
    - Check player inventory: `const hasHypnoScreen = player.inventory.some(i => i.name === 'Hypno-Screen')`.
    - If `hasHypnoScreen`, apply `moraleGain = Math.floor(moraleGain * 1.1)` (result: +11).
    - Apply this gain to `player.updateHappiness(moraleGain)`.

---

## **3. Testing & Validation**

### **3.1 Regression Testing**
- [ ] Run `npm test` to identify broken tests due to string changes.
- [ ] Update `tests/ui/components/HUD.test.ts` and other UI tests with new labels.
- [ ] Update `tests/TimeSystem.test.ts` to match new location names.

### **3.2 New Feature Tests**
- [ ] **Test Omni-Chill Buff:**
    - Create a test case where a player with an Omni-Chill in inventory ends their turn and verifies hunger increases by 10 instead of 20.
- [ ] **Test Hypno-Screen Buff:**
    - Create a test case where a player with a Hypno-Screen in inventory ends their turn and verifies morale increases by 11.
- [ ] **Test Baseline Rest:**
    - Verify that resting without a Hypno-Screen still grants the base +10 morale gain.

---

## **4. Constraints & Considerations**
- **Header Length:** Ensure location names in `HUD.ts` and `CityScreen.ts` remain under 15 characters.
    - `Cognitive Re-Ed` (15 chars) - **OK**
    - `Sustenance Hub` (14 chars) - **OK**
    - `Cred-Debt Ctr` (13 chars) - **OK**
- **Persistence Safety:** Internal property names (`player.hunger`, `player.happiness`) will remain unchanged to ensure backward compatibility with existing `SessionStorage` saves. Only display strings are modified.
