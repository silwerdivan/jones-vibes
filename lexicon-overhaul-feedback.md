# Feedback: Lexicon & Item Overhaul (OmniLife OS)

The current **Feature 2: Lexicon & Item Overhaul** is partially implemented, but several generic "Life Sim" terms remain in the codebase. To achieve the full "dystopian app" vibe, the following gaps need to be addressed in the next iteration of the PRD and Implementation Plan.

---

## **1. Critical Lexicon Gaps (Missing from PRD)**

The following generic categories were not included in the original mapping table but are still present in the UI and data layers:

### **A. Locations (Remaining Generic)**
*   **Shopping Mall** → *Suggestion:* `Consumption Zone` or `Lifestyle Plaza`.
*   **Used Car Lot** → *Suggestion:* `Mobility Liquidator` or `Asset Resale`.

### **B. Job Titles (Labor Sector)**
Currently, jobs use standard generic titles. They should be rebranded to sound more clinical and corporate:
*   `Dishwasher` → `Sanitation Technician 3rd Class`
*   `Fast Food Worker` → `Sustenance Dispenser`
*   `Retail Associate` → `Customer Acquisition Drone`
*   `Office Clerk` → `Data Entry Unit`
*   `Junior Accountant` → `Credit Reconciler`

### **C. Education / Courses (Cognitive Re-Ed)**
Degrees are currently standard academic titles:
*   `Associate's in Business` → `Foundational Compliance Certificate`
*   `Bachelor's Degree` → `Intermediate Productivity Diploma`
*   `Master's Degree` → `Advanced System Integration Degree`

### **D. Items & Consumption**
While "Fridge" and "TV" were renamed, other items are still generic:
*   `Coffee` → `Focus-Fluids`
*   `Movie Ticket` → `Propaganda Reel Pass`
*   `New Clothes` → `Uniform Upgrade`
*   `Computer` → `Omni-Terminal` (Note: Computer still exists in `items.ts` separate from the Clause C reward).
*   `Monolith Burger` → `Patriot-Patty` or `Bio-Block`.

---

## **2. UI & Unit Rebranding**

The PRD and Plan missed the "small text" that breaks immersion:

*   **Currency Symbol (`$`)** → Should be replaced with a custom icon or `OC` (Omni-Creds) throughout the HUD and Action Cards.
*   **Time Units (`h`, `hr`, `hours`)** → PRD mentions "Cycle Hours" but HUD and Action Cards still use `h`. Suggestion: `CH` or `Cycles`.
*   **Education Labels** → "Edu Lvl" and "Education" gauge should be `Compliance Level` or `Cognitive Index`.
*   **Career Labels** → "Career" gauge should be `Productivity Tier`.
*   **Status Chips** → "Well-Rested" should be `Optimal Buffer`; "In Debt" should be `Negative Liquidity`.

---

## **3. Implementation Plan Discrepancies**

*   **Consistency:** The Plan used `Morale` for tags but `Morale Quota` for gauges. We should stick to one (PRD says `Morale Quota`).
*   **Missing PRD Requirements:** The Plan missed the **Mascot State Machine (C.A.S.H.)** logic entirely, which is a core part of the thematic identity.
*   **Action Card Tags:** The Plan updated the "Hunger" tag but missed the "Happy" tag's transition to "Morale Quota".

---

## **4. Technical Debt / Risks**

*   **Hardcoded Strings:** Many success/error messages in `GameState.ts` (e.g., "Congratulations!", "Time is up!") are still too "friendly" for a dystopian OS.
*   **Internal Consistency:** We need to ensure that renaming "Home" to "Hab-Pod 404" is reflected in the `InventoryScreen` ("Home Assets" -> "Hab-Pod Assets") and all log messages.

---

### **Action Items for Designer:**
1.  Provide a definitive mapping for **all** Job and Course titles.
2.  Define the official "Time" unit abbreviation (if not `h`).
3.  Confirm if "Shopping Mall" should be renamed.
4.  Specify Mascot PNG asset names for the 4 states.
