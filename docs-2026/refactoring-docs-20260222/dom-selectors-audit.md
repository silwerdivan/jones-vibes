# DOM Selectors Audit

**Generated:** 2026-02-22
**Purpose:** Inventory of all DOM selector calls for refactoring

---

## Summary

| Selector Type | Count |
|---------------|-------|
| `getElementById()` | 58 |
| `querySelector()` | 2 |
| `querySelectorAll()` | 2 |
| **Total** | **62** |

---

## getElementById() Calls

### Modal.ts (32 calls)

| Selector | Line | Usage | Priority |
|----------|------|-------|----------|
| `overlayId` (param) | 13 | Single | High |
| `titleId` (param) | 14 | Single | High |
| `choice-modal-content` | 115 | Single | High |
| `choice-modal-input` | 116 | Single | High |
| `modal-input-amount` | 117 | Single | High |
| `choice-modal-buttons` | 118 | Single | High |
| `dashboard-secondary-actions` | 119 | Single | High |
| `modal-cancel-button` | 120 | Single | High |
| `modal-clerk-container` | 122 | Single | High |
| `modal-clerk-avatar` | 123 | Single | High |
| `modal-clerk-name` | 124 | Single | High |
| `modal-clerk-message` | 125 | Single | High |
| `modal-cash` | 212 | Single | Medium |
| `modal-savings` | 213 | Single | Medium |
| `modal-loan` | 214 | Single | Medium |
| `modal-happiness` | 215 | Single | Medium |
| `modal-education` | 216 | Single | Medium |
| `modal-career` | 217 | Single | Medium |
| `modal-car` | 218 | Single | Medium |
| `modal-time` | 219 | Single | Medium |
| `player-stats-modal-close` | 221 | Single | Medium |
| `player-stats-modal` | 224, 229 | Multiple | Medium |
| `terminal-entries` | 253 | Single | Medium |
| `intel-terminal-close` | 255 | Single | Medium |
| `event-list` | 293 | Single | Medium |
| `summary-subtitle` | 294 | Single | Medium |
| `summary-cash-total` | 295 | Single | Medium |
| `summary-happiness-total` | 296 | Single | Medium |
| `btn-start-next-week` | 297 | Single | Medium |

### HUD.ts (12 calls)

| Selector | Line | Usage | Priority |
|----------|------|-------|----------|
| `hud-cash` | 20 | Single | High |
| `hud-week` | 21 | Single | High |
| `hud-location` | 22 | Single | High |
| `orb-p1` | 23, 62 | Multiple | High |
| `orb-p2` | 24, 63 | Multiple | High |
| `terminal-badge` | 25 | Single | Medium |
| `news-ticker-content` | 26 | Single | Medium |
| `hud-time-ring-p1` | 33 | Single | Medium |
| `hud-time-ring-p2` | 44 | Single | Medium |
| `hud-terminal-trigger` | 67 | Single | Medium |

### UIManager.ts (16 calls)

| Selector | Line | Usage | Priority |
|----------|------|-------|----------|
| `city-bento-grid` | 53 | Single | High |
| `fab-next-week` | 54 | Single | High |
| `location-hint` | 57 | Single | Medium |
| `life-avatar` | 72 | Single | Medium |
| `status-chips` | 73 | Single | Medium |
| `essentials-grid` | 74 | Single | Medium |
| `assets-grid` | 75 | Single | Medium |
| `loading-overlay` | 78 | Single | Medium |
| `icon-city` | 123 | Single | Low |
| `icon-life` | 124 | Single | Low |
| `icon-inventory` | 125 | Single | Low |
| `icon-social` | 126 | Single | Low |
| `icon-menu` | 127 | Single | Low |
| `gauge-${id}` (dynamic) | 694 | Multiple | Medium |

### EventNotificationManager.ts (1 call)

| Selector | Line | Usage | Priority |
|----------|------|-------|----------|
| `game-controls` | 57 | Single | Medium |

### ClockVisualization.ts (1 call)

| Selector | Line | Usage | Priority |
|----------|------|-------|----------|
| `containerId` (param) | 23 | Single | Medium |

---

## querySelector() Calls

| Selector | File | Line | Usage | Priority |
|----------|------|------|-------|----------|
| `.app-shell` | EventNotificationManager.ts | 61 | Single | Medium |
| `.app-shell` | InputManager.ts | 14 | Single | Medium |

---

## querySelectorAll() Calls

| Selector | File | Line | Usage | Priority |
|----------|------|------|-------|----------|
| `.screen` | UIManager.ts | 46 | Single | High |
| `.tab-item` | UIManager.ts | 49 | Single | High |

---

## Refactoring Recommendations

### High Priority (Immediate)
1. **HUD.ts** - Most critical; constructor has 7 direct getElementById calls. Should become self-rendering.
2. **Modal.ts** - 32 calls; modal content should be created dynamically.
3. **UIManager.ts screens** - `city-bento-grid`, `fab-next-week` need component extraction.

### Medium Priority
1. **ClockVisualization.ts** - Already parameterized, minor refactor needed.
2. **EventNotificationManager.ts** - Single call, easy fix.

### Low Priority
1. **Tab icons** - Can be replaced with icon components that self-render.

---

## Pattern to Implement

Replace:
```typescript
this.element = document.getElementById('some-id');
```

With:
```typescript
this.element = document.createElement('div');
this.element.id = 'some-id';
```

Or use BaseComponent pattern:
```typescript
class MyComponent extends BaseComponent<State> {
    constructor() {
        super('div', 'my-class', 'some-id');
    }
}
```
