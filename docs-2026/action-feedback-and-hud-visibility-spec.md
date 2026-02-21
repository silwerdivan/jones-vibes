# Design Spec: Action Feedback & HUD Visibility Overhaul

## Problem Statement
The current "Location Dashboard" (modal) obscures the HUD, preventing players from seeing their Credits and Time during interactions. Furthermore, performing actions like "Work Shift" provides no immediate visual feedback, leading to a disconnected experience.

## Proposed Solutions

### 1. HUD Visibility (The Z-Index Fix)
- **Goal:** Keep the global HUD visible even when a location dashboard is open.
- **Implementation:** 
    - Increase `.hud` z-index from `10` to `1100`.
    - Adjust `.location-dashboard-overlay` to start below the HUD or use a backdrop that doesn't obscure it.
    - *Correction:* Actually, since the dashboard is a bottom-sheet (90vh), keeping the HUD (85px) on top is the best "always-on" info approach.

### 2. Mirror HUD in Modal (Contextual Awareness)
- **Goal:** Ensure the player sees their *current* wallet right where they are making decisions.
- **Implementation:** Add a "Contextual Wallet" bar at the top of the `location-dashboard`.

### 3. Visual Feedback ("Juice")
- **Goal:** Make every action feel impactful.
- **Mechanism A: Floating Particles:** When earning money, a floating `+$50` should drift up from the "Work" button.
- **Mechanism B: Clerk Reactions:** The clerk's speech bubble should update with a confirmation (e.g., "Good shift! Here's your pay.")
- **Mechanism C: HUD Pulse:** The HUD Credits value should "pop" (scale up/down) when it changes.

## UI/UX Blueprint

### CSS Variables (New)
```css
--feedback-success: var(--neon-green);
--feedback-error: var(--neon-red);
--particle-animation-speed: 0.8s;
```

### HTML Structure Changes (`index.html`)
Inside `#choice-modal`:
```html
<div class="dashboard-stats-mirror">
    <div class="stat-mirror-item">
        <span class="label">CREDITS</span>
        <span id="modal-mirror-cash" class="value currency">$0</span>
    </div>
    <div class="stat-mirror-item">
        <span class="label">TIME</span>
        <span id="modal-mirror-time" class="value">0h</span>
    </div>
</div>
```

### CSS Overhaul (`style.css`)
```css
/* Ensure HUD stays on top */
.hud {
    z-index: 1100 !important; 
}

/* Floating Feedback Particle */
.feedback-particle {
    position: absolute;
    pointer-events: none;
    font-weight: 800;
    font-size: 1.2rem;
    z-index: 2500;
    animation: float-up var(--particle-animation-speed) ease-out forwards;
}

@keyframes float-up {
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-50px); opacity: 0; }
}

/* Stats Mirror in Modal */
.dashboard-stats-mirror {
    display: flex;
    justify-content: space-around;
    padding: var(--space-sm);
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-md);
    border: 1px solid var(--glass-border);
}

.stat-mirror-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.stat-mirror-item .label {
    font-size: 8px;
    color: var(--neon-cyan);
}

.stat-mirror-item .value {
    font-size: 14px;
    font-weight: 800;
}
```

### JavaScript Implementation Logic (`js/ui.js`)
- **`render(gameState)`:** Update the `modal-mirror-cash` and `modal-mirror-time` alongside the HUD.
- **New Method: `spawnFeedback(element, text, type)`:** 
    - Calculates the bounding rect of the clicked button.
    - Injects a `.feedback-particle` at that position.
    - Removes it after the animation ends.
- **Update Clerk Message:** Modify `showLocationDashboard` to accept an optional "result message" or update it via a new event.

## Hand-off Instructions for Frontend Engineer
1. Update `style.css` with the new z-index and particle animations.
2. Add the `dashboard-stats-mirror` to the `choice-modal` in `index.html`.
3. Implement `spawnFeedback` in `GameView` class and call it during `workShift`, `buyItem`, etc.
4. Ensure the HUD `z-index` is high enough to be seen through the modal's backdrop.
