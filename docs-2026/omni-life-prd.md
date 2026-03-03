# **PRD: OmniLife OS Thematic Overhaul & EULA Initialization**

## **1. Overview & Objective**
**Goal:** Transition the existing generic life-simulation UI into a satirical, hyper-capitalist dystopian app called "OmniLife OS". 
**Scope:** This update includes a complete terminology reskin, the implementation of two new item buffs (Omni-Chill & Hypno-Screen), a dynamic UI mascot state machine (C.A.S.H.), and a new interactive "Terms & Conditions" initialization screen.
**Target Platform:** Mobile-First Web App (Locked at max 480px width).
**Persistence:** All new states must serialize seamlessly into the existing `SessionStorage` architecture.

---

## **2. Feature 1: EULA Initialization Screen (Character Creation)**
**Description:** A new mandatory starting screen before the main game loop begins. Disguised as a corporate End User License Agreement (EULA), it allows players to select starting buffs/debuffs via checkboxes.

### **UI / UX Requirements:**
*   **Layout:** A scrolling text box containing standard legal boilerplate mixed with dystopian jokes, followed by 4 optional checkboxes.
*   **Scroll-to-Accept Logic:** The primary `[I ACCEPT]` button must initialize in a `disabled` state. 
*   **Event Listener:** Attach an `onScroll` listener to the EULA text container. When `scrollTop + clientHeight >= scrollHeight` (or within a 5px threshold), remove the `disabled` attribute from the accept button.

### **Data & State Mutators (The Math):**
**Baseline Initial State:** `Money: $0 | Hours: 24 | Morale: 50 | Bio-Deficit (Hunger): 0`
When `[I ACCEPT]` is clicked, apply the net sum of all checked clauses to the baseline state:
*   `[ ] Clause A (Micro-Stimulus):` Apply `+200 Money` AND `+40 Bio-Deficit`.
*   `[ ] Clause B (Grindset):` Apply `+6 Hours` (Turn 1 only) AND `-20 Morale`.
*   `[ ] Clause C (Data-Harvest):` Unlock `Omni-Terminal` in inventory AND set a global `wageMultiplier = 0.9` (10% pay cut).
*   `[ ] Clause D (Liquidity):` Apply `+500 Money` AND `+500 Bank Debt` (subject to existing weekly interest logic).

---

## **3. Feature 2: Lexicon & Item Overhaul (The Reskin)**
**Description:** Update all frontend strings to match the new OmniLife branding. **Strict Constraint:** Location headers must remain under 15 characters to prevent wrapping on 480px screens.

### **Variable / String Mapping Table:**
| Old Generic Term | New OmniLife OS String |
| :--- | :--- |
| Time / Hours | Cycle Hours |
| Money | Omni-Creds |
| Happiness | Morale Quota |
| Hunger | Bio-Deficit |
| Home | Hab-Pod 404 |
| Fast Food | Sustenance Hub |
| Community College | Cognitive Re-Ed |
| Bank | Cred-Debt Ctr |

### **Item Math Implementation (Action Required):**
Update the underlying game loop to respect the math of these two specific renamed items:
1.  **Omni-Chill (Formerly Fridge):**
    *   *Logic:* Find the weekly function that increases Bio-Deficit (Hunger). Wrap it in a conditional: `if (inventory.includes('Omni-Chill')) { weeklyHungerIncrease *= 0.5; }`
2.  **Hypno-Screen (Formerly TV):**
    *   *Logic:* Find the "Rest/Sleep" action function. Wrap the Morale (Happiness) gain in a conditional: `if (inventory.includes('Hypno-Screen')) { moraleGain *= 1.1; } // Math.floor() to prevent decimals.`

---

## **4. Feature 3: Mascot State Machine (C.A.S.H.)**
**Description:** Replace the generic 52x52px player icon in the top HUD and the 64x64px icon in Choice Modals with a dynamic image component that reacts to the player's current game state.

### **Component Logic (`MascotUI.js` or equivalent):**
Create a component that listens to the global state (`Money`, `Morale`, `Bio-Deficit`, `Hours`) and returns one of 4 PNGs based on a priority hierarchy.

**State Priority hierarchy (from highest to lowest priority):**
1.  **State 2 (Profit):** *Trigger:* If the player's Money increased on the current tick/turn. (Reverts back to Default after 2 seconds or next action).
2.  **State 3 (Deficit / Warning):** *Trigger:* `IF (Bio-Deficit >= 50) OR (Morale <= 20) OR (Hours <= 0)`. (Persistent as long as conditions are met).
3.  **State 4 (Helpful):** *Trigger:* Overrides HUD logic when rendered inside a `ChoiceModal` (e.g., shopping at the Sustenance Hub).
4.  **State 1 (Default):** *Trigger:* Fallback state if none of the above are true.

---

### **Lead Designer Analysis (For Dev Consideration)**

**Pros of this Implementation Plan:**
*   Highly modular. The EULA system can easily be expanded later with new clauses without touching the core gameplay loop.
*   `SessionStorage` safe. Since the EULA just modifies baseline stats at initialization, it won't break your existing save/load architecture.

**Cons / Edge Cases to Watch:**
*   **The "Turn 1 Death" Edge Case:** If a player checks Clause A (+40 Bio) and Clause B (-20 Morale), starting at 30 Morale and 40 Bio-Deficit. If your game applies a Morale penalty the moment Bio-Deficit hits 50, the player could hit a Game Over state almost instantly. *Dev Action:* Ensure penalty triggers are evaluated *after* the player's first action, not strictly on initialization.

**3 "What If?" Suggestions for the Developer:**
*   **What If... we add a CSS shake animation to the Mascot?** When C.A.S.H. enters State 3 (Deficit), applying a simple `.shake { animation: shake 0.5s infinite; }` CSS class will draw the player's eye to the danger without needing complex GIF assets.
*   **What If... the `wageMultiplier` (Clause C) is visible in the UI?** If the player takes the 10% pay cut, ensure the "Labor Sector" UI dynamically updates the displayed wage (e.g., crossing out $10.00/hr and showing $9.00/hr in red) so they don't think the math is bugged.
*   **What If... we use a typed.js effect for the EULA?** Instead of the text just sitting there, what if the legal text types out like a terminal? It hides the "Scroll to accept" delay organically while delivering the dystopian vibe.
