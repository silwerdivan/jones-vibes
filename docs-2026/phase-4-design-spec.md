# Design Spec: Phase 4 - Life Dashboard & Inventory

**Status:** Ready for Implementation  
**Role:** UI/UX Design Guidance for Frontend Engineer  
**Theme:** Cyberpunk Dashboard / Modern Neumorphism

---

## 1. Overview
Phase 4 transitions the "Life" and "Inventory" tabs from placeholders to high-fidelity, interactive screens. The goal is to provide a "Status at a Glance" experience using circular gauges and bento-style grids.

---

## 2. Screen: Life Dashboard (`#screen-life`)

### A. Layout Strategy
- **Container:** Use a CSS Grid with `grid-template-columns: 1fr 1fr`.
- **Spacing:** Use `--space-md` (16px) for gaps.
- **Components:**
    1. **Player Avatar Header:** Circular avatar (existing) with Status Chips floating to the right.
    2. **The "Big Four" Gauges:** A 2x2 grid of circular progress bars.

### B. Circular Progress Gauges (`.gauge-container`)
Each gauge represents one of the four win conditions.
- **Visuals:** 
    - Outer ring: Transparent track with a neon stroke (2px).
    - Progress fill: Vibrant neon color matching the category.
    - Center: Large percentage value (ExtraBold) with a small label (Medium) underneath.
- **Colors:**
    - **Wealth:** `--neon-green` (#00E676)
    - **Happiness:** `--neon-yellow` (#FFD600)
    - **Education:** `--neon-blue` (#2979FF)
    - **Career:** `--neon-pink` (#FF00FF)

### C. Status Chips (`.status-chip`)
Small, rounded "pills" displayed at the top of the Life screen.
- **HTML Structure:** `<span class="status-chip chip-warning">Hungry</span>`
- **Styles:**
    - `border-radius: 20px`
    - `padding: 4px 12px`
    - `font-size: 10px`
    - `text-transform: uppercase`
    - **Classes:**
        - `.chip-success`: Green glow (e.g., "Well-Rested")
        - `.chip-warning`: Orange glow (e.g., "Hungry")
        - `.chip-danger`: Red glow (e.g., "Sick")

---

## 3. Screen: Inventory (`#screen-inventory`)

### A. Layout Strategy
- **Container:** Vertical stack.
- **Section 1: Essentials:** A grid (3 columns) for small items (Clothes, etc.).
- **Section 2: Assets:** Full-width bento cards for major equipment (Computer, Fridge, TV).

### B. Inventory Card (`.inventory-card`)
- **Visuals:** Glassmorphic background with a subtle inner glow.
- **Content:**
    - **Left:** Large SVG icon of the item.
    - **Right:** Item Name (Bold) + Benefit Tag (e.g., "Work Efficiency +5%").
- **State:** If an item is not owned, use `filter: grayscale(1)` and `opacity: 0.3`.

---

## 4. Technical Implementation Notes (For Frontend Engineer)

### HTML Structure Suggestions
```html
<!-- Life Screen -->
<section id="screen-life" class="screen hidden">
    <div class="life-header">
        <div class="avatar-sm"></div>
        <div class="status-chips">
            <!-- Dynamic Chips -->
        </div>
    </div>
    <div class="gauge-grid">
        <div class="gauge-card glass" data-gauge="wealth">
            <div class="gauge-svg-container"></div>
            <div class="gauge-label">Wealth</div>
        </div>
        <!-- Repeat for Happiness, Edu, Career -->
    </div>
</section>

<!-- Inventory Screen -->
<section id="screen-inventory" class="screen hidden">
    <div class="inventory-section">
        <h3>Home Assets</h3>
        <div id="inventory-grid" class="inventory-grid">
            <!-- Dynamic Inventory Cards -->
        </div>
    </div>
</section>
```

### CSS Requirements
- Use `clamp()` for gauge sizes to ensure they scale from mobile to tablet.
- Implement a `stroke-dasharray` transition for the SVG gauges to animate the fill when state changes.
- Ensure all cards use the `.glass` class for consistency.

### Data Mapping
- **Wealth Gauge:** Calculate as `(player.cash + player.savings) / 10000 * 100`.
- **Education Gauge:** Calculate as `(player.educationLevel / 5) * 100`.
- **Career Gauge:** Calculate as `(player.careerLevel / 5) * 100`.
- **Happiness Gauge:** Use `player.happiness` directly.
- **Inventory:** Iterate through `player.inventory` array.

---

## 5. Interaction Design (The "Juice")
- **Gauges:** Should "pulse" slightly when the value increases.
- **Chips:** Should have a subtle breathing animation (opacity 0.8 to 1.0).
- **Cards:** Use `transform: scale(0.98)` on active/tap.
