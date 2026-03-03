# AI Implementation Prompt: Feature 3 - C.A.S.H. Mascot & HUD Integration

**Goal:** Implement the C.A.S.H. Mascot state machine and integrate it into the HUD. Replace generic player orbs with a reactive mascot that sits on top of the circular time ring.

---

## **1. Core Directive**
Follow the **Modern Neumorphism / Cyberpunk Dashboard** aesthetic defined in `SYSTEM-UI-UX.md`. Ensure all changes are mobile-first and maintain the 52x52px footprint in the HUD.

---

## **2. Step-by-Step Instructions**

### **Step 1: CSS & Visuals (`style.css`)**
- Implement `.mascot-container` with `position: relative` and `width: 52px; height: 52px`.
- Layer the **Time Ring** (background) using `z-index: 1`.
- Layer the **Mascot PNG** (foreground) using `z-index: 2`.
- Apply a `mascot-float` animation:
  ```css
  @keyframes mascot-float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
  }
  ```
- Define state-specific glows:
  - `.mascot-profit`: `filter: drop-shadow(0 0 10px var(--neon-green))`.
  - `.mascot-deficit`: `filter: drop-shadow(0 0 10px var(--neon-red))`.
- Handle overlap: The mascot PNG should have a slight `margin-top: -4px` or similar to allow ears/head to "break" the top boundary of the ring.

### **Step 2: Mascot Component (`src/ui/components/MascotUI.ts`)**
- Create a new component `MascotUI` inheriting from `BaseComponent`.
- **Properties:** `playerIndex`, `isModalMode` (boolean).
- **Asset Paths (assume `/assets/ui/illustrations/`):**
  - Default: `default-smug-watchdog.png`
  - Profit: `profit-line-goes-up.png`
  - Deficit: `deficit-glitching-manager.png`
  - Helpful: `helpful-sarcastic-assistant.png`
- **Logic:**
  - Listen to `STATE_EVENTS.CASH_CHANGED`, `TIME_CHANGED`, `PLAYER_CHANGED`.
  - Maintain a `currentState` (Default, Profit, Deficit, Helpful).
  - **Priority:** `Deficit` (Bio-Deficit >= 50, Morale <= 20, Time <= 0) > `Profit` (2s timer) > `Helpful` (if `isModalMode`) > `Default`.

### **Step 3: HUD Integration (`src/ui/components/HUD.ts`)**
- Locate `initializeClockVisualizations` and ensure the rings are correctly layered *behind* the avatar slot.
- Replace `orb-avatar` content with an instance of `MascotUI`.
- Ensure the `ClockVisualization` size (52px) matches the container.

### **Step 4: Modal Integration (`src/ui/components/Modal.ts` or `UIManager.ts`)**
- Locate the choice modal logic where a clerk avatar is shown.
- Replace the clerk with `MascotUI` initialized with `isModalMode: true`.

---

## **3. Constraints & Validation**
- **Mobile First:** Vertical layouts only. Max width 480px.
- **Juice:** Every state change must be visual (glow, jitter, or animation).
- **Verification:** Run `npm test` after implementation to ensure no regressions in HUD logic.
