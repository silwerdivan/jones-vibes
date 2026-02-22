# HTML Strings Audit

**Generated:** 2026-02-22
**Purpose:** Inventory of all innerHTML assignments containing template strings

---

## Summary

| File | Total innerHTML Assignments | Template Strings |
|------|----------------------------|------------------|
| Modal.ts | 10 | 3 |
| UIManager.ts | 11 | 5 |
| ClockVisualization.ts | 1 | 0 |
| **Total** | **22** | **8** |

---

## Template String Details

### UIManager.ts

#### `renderActionCards()` - Lines 388-398
**Size:** ~11 lines per card (iterated)
**Complexity:** High - Contains conditional logic for locked/hired states

```typescript
card.innerHTML = `
    <div class="action-card-icon">${icon}</div>
    <div class="action-card-content">
        <div class="action-card-title">${title}</div>
        <div class="action-card-details">${details}</div>
        ${locked ? '<div class="locked-overlay"><i class="material-icons">lock</i></div>' : ''}
    </div>
`;
```
**Refactor Target:** `ActionCard` factory function or component

---

#### `renderCityGrid()` - Lines 602-606
**Size:** ~5 lines per card (iterated)
**Complexity:** Medium - Contains SVG icon injection

```typescript
card.innerHTML = `
    <div class="bento-card-icon">${icon}</div>
    <div class="bento-card-content">
        <div class="bento-card-title">${location.name}</div>
    </div>
`;
```
**Refactor Target:** `BentoCard` factory function

---

#### `updateGauge()` - Lines 701-709
**Size:** ~9 lines
**Complexity:** Medium - SVG with calculations

```typescript
container.innerHTML = `
    <svg viewBox="0 0 36 36" class="gauge-svg">
        <path class="gauge-bg" d="M18 2.0845..."></path>
        <path class="gauge-fill" style="stroke: ${color}" stroke-dasharray="${percent}, 100" d="M18 2.0845..."></path>
    </svg>
    <div class="gauge-label">${label}</div>
`;
```
**Refactor Target:** `Gauge` component

---

#### `renderLifeScreen()` - Lines 653-673 (statusChips)
**Size:** ~3 lines per chip (iterated)
**Complexity:** Low

```typescript
chip.innerHTML = `<span class="chip-icon">${icon}</span> ${text}`;
```
**Refactor Target:** `StatusChip` factory function

---

#### `renderInventoryScreen()` - Lines 716-745
**Size:** ~12 lines per card (iterated for essentials and assets)
**Complexity:** Medium - Contains icon lookup

```typescript
// Essentials
div.innerHTML = (Icons as unknown as IconRegistry)[item.icon](32, isOwned ? '#00FFFF' : 'rgba(255,255,255,0.2)');

// Assets
card.innerHTML = `
    <div class="inventory-card-icon">${icon}</div>
    <div class="inventory-card-content">
        <div class="inventory-card-title">${item.name}</div>
        <div class="inventory-card-details">${details}</div>
    </div>
`;
```
**Refactor Target:** `InventoryCard` factory function

---

### Modal.ts

#### Clerk Avatar - Line 135
**Size:** 1 line
**Complexity:** Low - Icon lookup

```typescript
this.clerkAvatar.innerHTML = Icons[clerk.icon](40, '#00FFFF');
```
**Refactor Target:** Keep as-is or create icon component

---

#### Button Template - Line 182
**Size:** 1 line
**Complexity:** Low

```typescript
btn.innerHTML = `<i class="material-icons">${icon}</i> <span>${label}</span>`;
```
**Refactor Target:** `Button` component or factory

---

#### Event Card - Line 322
**Size:** ~8 lines
**Complexity:** Medium - Contains event details

```typescript
card.innerHTML = `
    <div class="event-card-icon">${icon}</div>
    <div class="event-card-content">
        <div class="event-card-title">${event.message}</div>
        <div class="event-card-details">${details}</div>
    </div>
`;
```
**Refactor Target:** `EventCard` component

---

## Refactor Priority Matrix

| Method | Lines | Complexity | Reusability | Priority |
|--------|-------|------------|-------------|----------|
| `renderActionCards()` | ~11 | High | High | **Critical** |
| `updateGauge()` | ~9 | Medium | High | **High** |
| `renderCityGrid()` | ~5 | Medium | Medium | High |
| `renderInventoryScreen()` | ~12 | Medium | Medium | Medium |
| `renderLifeScreen()` (chips) | ~3 | Low | Medium | Low |
| Modal button | ~1 | Low | High | Low |

---

## Recommended Factory Functions

### 1. `createActionCard(data: ActionCardData, onClick: () => void): HTMLElement`
- Handles jobs, courses, shopping items
- Manages locked/hired state internally
- Emits click callback

### 2. `createGauge(value: number, max: number, config: GaugeConfig): HTMLElement`
- SVG gauge with customizable colors
- Label support
- Reusable across screens

### 3. `createBentoCard(title: string, icon: string, onClick?: () => void): HTMLElement`
- Simple card with icon and title
- Used for city grid

### 4. `createStatusChip(text: string, icon: string, type: 'warning' | 'info' | 'danger'): HTMLElement`
- Status indicators for Life screen

### 5. `createInventoryCard(item: InventoryItem, isOwned: boolean): HTMLElement`
- Handles both essentials and assets
- Icon lookup internally
