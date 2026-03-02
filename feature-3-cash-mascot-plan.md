# Implementation Plan: Feature 3 - C.A.S.H. Mascot & HUD Integration

This plan outlines the steps to implement the **C.A.S.H. (Corporate Asset Strategic Helper)** Mascot state machine and integrate it into the existing HUD, replacing the generic player orbs with a dynamic, reactive UI component.

## **1. Asset & Style Preparation**

### **1.1 Image Asset Mapping**
The following PNG assets will be used for the mascot's states:
- `default-smug-watchdog.png` (408x516) -> **State 1: Default**
- `profit-line-goes-up.png` (409x516) -> **State 2: Profit**
- `deficit-glitching-manager.png` (422x520) -> **State 3: Deficit / Warning**
- `helpful-sarcastic-assistant.png` (404x531) -> **State 4: Helpful**

### **1.2 CSS Styling (`style.css`)**
- [ ] Define `.mascot-container` styles to handle the layering of the **Time Ring** (background) and **Mascot PNG** (foreground).
- [ ] Implement a "floating" animation for the mascot: `@keyframes mascot-float { transform: translateY(-2px); }`.
- [ ] Add state-specific glow effects (Neon Gold for Profit, Neon Red for Deficit).
- [ ] Ensure the mascot slightly overlaps the ring to create depth (ears/head boundary).

## **2. Mascot Component Logic**

### **2.1 `MascotUI` Component (`src/ui/components/MascotUI.ts`)**
- [ ] Create a new `BaseComponent` that takes a `playerIndex` and listens to state changes.
- [ ] Implement the **Priority Hierarchy Logic**:
    1.  **Profit:** If `Money` increased on current turn (2-second duration).
    2.  **Deficit:** If `Bio-Deficit >= 50` OR `Morale <= 20` OR `Hours <= 0`.
    3.  **Helpful:** If rendered within a `ChoiceModal` context.
    4.  **Default:** Fallback.
- [ ] Handle image swapping based on state.

## **3. HUD Integration**

### **3.1 Update `HUD.ts`**
- [ ] Replace the generic `.orb-avatar` content with the `MascotUI` component.
- [ ] Adjust the `ClockVisualization` to ensure it sits behind the mascot but remains readable.
- [ ] Ensure the 52x52px slot is respected for mobile-first constraints.

### **3.2 Choice Modal Integration**
- [ ] Update `ChoiceModal.ts` (or equivalent) to use the `MascotUI` in "Helpful" mode.

## **4. Testing & Validation**

### **4.1 Visual Validation**
- [ ] Verify mascot layering (Mascot over Ring).
- [ ] Verify overlapping boundary (ears/head) doesn't obscure the clock progress.

### **4.2 Functional Testing**
- [ ] **Test Profit Trigger:** Verify mascot switches to "Profit" state when money is earned.
- [ ] **Test Deficit Trigger:** Verify mascot switches to "Deficit" state when hunger/morale/time hits thresholds.
- [ ] **Test Priority:** Verify Deficit overrides Profit if both are true (except during the 2s profit animation).
- [ ] **Test Modal State:** Verify "Helpful" state appears in shopping/choice modals.

## **5. Constraints & Considerations**
- **Mobile Space:** The 52x52px footprint is non-negotiable. Mascot PNGs must be scaled appropriately.
- **Performance:** Ensure image swapping and state checks don't cause UI lag during high-frequency events.
