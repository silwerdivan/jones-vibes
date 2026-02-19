# Phase 5 Design Spec: "Oh What a Weekend!" Turn Transitions

This document specifies the UI/UX requirements for the Phase 5 transition system, replacing generic log messages with a high-fidelity, immersive "Weekend Summary" experience.

## 1. Visual Design: The "Weekend Dashboard"

The transition should feel like a "moment of reflection" between the hectic gameplay weeks. It uses a full-screen Glassmorphism overlay to focus the player's attention on their progress (or setbacks).

### 1.1 Aesthetic Components
*   **Overlay:** `backdrop-filter: blur(15px); background: rgba(10, 10, 15, 0.85);`
*   **Typography:** 
    *   Header: "OH WHAT A WEEKEND!" (Font: Orbitron/Sans-Serif, Color: Neon Magenta, Style: Uppercase, Letter-spacing: 2px).
    *   Sub-header: "Week [X] Performance Report" (Color: Cyan).
*   **Color Palette:**
    *   `--success-green`: #00E676
    *   `--expense-red`: #FF5252
    *   `--warning-orange`: #FFAB40
    *   `--info-blue`: #2979FF

## 2. Component: The Event Card

The core of the summary is a vertical list of staggered "Event Cards".

### 2.1 Card Structure
*   **Icon:** A circular icon representing the event type (e.g., Dollar sign for rent, Burger for hunger, Graduation cap for education).
*   **Description:** Short, punchy text (e.g., "Weekly Rent & Expenses").
*   **Value:** The numerical impact (e.g., "-$50").

### 2.2 Staggered Animation
*   Cards do not appear all at once.
*   They slide in from `translateY(20px)` with `opacity: 0` to `opacity: 1` with a **0.1s stagger delay** between each card.
*   Animation curve: `cubic-bezier(0.34, 1.56, 0.64, 1)` (Back-out effect).

## 3. The "Net Impact" Footer

Below the event list, a summary section provides the "Bottom Line".

*   **Cash Flow:** Animated counter showing the net change in credits.
*   **Vitals:** Progress bars or chips showing changes in Happiness and Education (if any).
*   **The "Next Week" Button:** A prominent, wide button at the bottom of the screen.
    *   Text: "START WEEK [X+1] →"
    *   Style: Neon border, glowing effect on hover/touch.

## 4. Technical Implementation Mapping

### 4.1 Data Structure (GameState.js)
The `endTurn()` method should be refactored to return (or publish) a `summary` object:
```javascript
{
  week: 1,
  events: [
    { type: 'expense', label: 'Daily Expenses', value: -50, unit: '$', icon: 'payments' },
    { type: 'warning', label: 'Hunger Penalty', value: -5, unit: 'Happiness', icon: 'restaurant' },
    { type: 'info', label: 'Rent Due', value: -250, unit: '$', icon: 'home' }
  ],
  totals: {
    cashChange: -300,
    happinessChange: -5
  }
}
```

### 4.2 UI Structure (index.html)
A new hidden section for the modal:
```html
<section id="turn-summary-modal" class="modal-overlay hidden">
    <div class="summary-container glass">
        <header class="summary-header">
            <h1 class="neon-text-magenta">OH WHAT A WEEKEND!</h1>
            <p class="summary-subtitle">WEEK 1 REPORT</p>
        </header>
        <div id="event-list" class="event-list">
            <!-- Event cards injected here -->
        </div>
        <footer class="summary-footer">
            <div class="net-impact">
                <span id="summary-cash-total" class="total-value">-$300</span>
            </div>
            <button id="btn-start-next-week" class="btn-neon-cyan">START WEEK 2</button>
        </footer>
    </div>
</section>
```

### 4.3 CSS Logic (style.css)
*   `.event-card`: Flexbox layout, 12px padding, 8px margin.
*   `.event-card.expense`: Border-left: 4px solid var(--expense-red).
*   `.event-card.income`: Border-left: 4px solid var(--success-green).

## 5. Mobile UX Considerations
*   **Scrolling:** If there are many events, the `event-list` should be independently scrollable with a hidden scrollbar.
*   **Haptics:** A slight vibration (if supported) when the "Next Week" button is pressed.
*   **Dismissal:** Prevent accidental dismissal by clicking outside; only the button should proceed.
