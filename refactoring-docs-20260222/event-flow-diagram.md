# Event Flow Diagram

**Generated:** 2026-02-22
**Purpose:** Document all EventBus subscriptions and publications

---

## Event Summary

| Event Name | Publishers | Subscribers | Purpose |
|------------|------------|-------------|---------|
| `stateChanged` | 4 files | UIManager | Core state update |
| `gameEvent` | GameState | HUD, EventNotificationManager | Game log messages |
| `turnEnded` | TimeSystem | UIManager | Turn summary display |
| `aiThinkingStart` | TimeSystem | UIManager | Loading indicator |
| `aiThinkingEnd` | GameState, TimeSystem | UIManager | Hide loading |
| `showPlayerStats` | HUD | UIManager | Stats modal |
| `showIntelTerminal` | HUD, EventNotificationManager | UIManager | Terminal modal |
| `modalShown` | Modal | - | Modal lifecycle |
| `modalHidden` | Modal | - | Modal lifecycle |
| `screenSwitched` | UIManager | - | Screen navigation |
| `gameOver` | GameState | - | Game end |
| `logIconClicked` | EventNotificationManager | HUD | Terminal trigger |
| `addToLog` | UIManager | - | Add to log |
| `jobApplicationError` | GameState | - | Job error |
| `jobApplicationSuccess` | GameState | - | Job success |

### UI Events (from UI_EVENTS constant)

| Event | Publisher | Subscriber | Action |
|-------|-----------|------------|--------|
| `REST_END_TURN` | UIManager | TimeSystem | End turn |
| `ADVANCE_TURN` | UIManager | TimeSystem | Advance turn |
| `BANK_DEPOSIT` | Modal (via UIManager) | EconomySystem | Deposit cash |
| `BANK_WITHDRAW` | Modal (via UIManager) | EconomySystem | Withdraw cash |
| `BANK_LOAN` | Modal (via UIManager) | EconomySystem | Take loan |
| `BANK_REPAY` | Modal (via UIManager) | EconomySystem | Repay loan |
| `BUY_ITEM` | UIManager | EconomySystem | Purchase item |
| `BUY_CAR` | UIManager | EconomySystem | Purchase car |
| `WORK_SHIFT` | UIManager | GameController | Work action |
| `TRAVEL` | UIManager | GameController | Travel to location |
| `APPLY_JOB` | UIManager | GameController | Apply for job |
| `TAKE_COURSE` | UIManager | GameController | Take course |
| `REQUEST_STATE_REFRESH` | UIManager | GameController | Refresh state |

---

## Detailed Event Map

### State Flow

```
User Action
    │
    ▼
UIManager (publishes UI_EVENT)
    │
    ▼
GameController / EconomySystem / TimeSystem (subscribes)
    │
    ▼
GameState (modifies state, publishes 'stateChanged')
    │
    ▼
UIManager (subscribes to 'stateChanged', re-renders)
```

---

## Publishers by File

### GameState.ts
| Event | Line | Trigger |
|-------|------|---------|
| `stateChanged` | 58 | Constructor (initial) |
| `gameEvent` | 70 | `logMessage()` |
| `stateChanged` | 72 | `logMessage()` |
| `aiThinkingEnd` | 94, 105, 173 | Error recovery |
| `gameOver` | 194 | Game end check |
| `stateChanged` | 286, 333, 362, 380, 434 | Various state changes |
| `jobApplicationError` | 396, 415 | Job application failures |
| `jobApplicationSuccess` | 430 | Job application success |

### TimeSystem.ts
| Event | Line | Trigger |
|-------|------|---------|
| `aiThinkingEnd` | 150 | AI turn complete |
| `turnEnded` | 154 | Turn end |
| `stateChanged` | 156, 171 | State update |
| `aiThinkingStart` | 176 | AI turn start |

### EconomySystem.ts
| Event | Line | Trigger |
|-------|------|---------|
| `stateChanged` | 74, 101, 135, 179, 223, 263 | All financial operations |

### UIManager.ts
| Event | Line | Trigger |
|-------|------|---------|
| `REQUEST_STATE_REFRESH` | 97 | Initialization |
| `REST_END_TURN` | 103 | Rest action |
| `screenSwitched` | 177 | Screen change |
| `BANK_DEPOSIT` | 257 | Bank modal |
| `BANK_WITHDRAW` | 258 | Bank modal |
| `BANK_LOAN` | 259 | Bank modal |
| `BANK_REPAY` | 260 | Bank modal |
| `APPLY_JOB` | 347 | Job application |
| `TAKE_COURSE` | 362 | Course enrollment |
| `BUY_ITEM` | 380 | Item purchase |
| `ADVANCE_TURN` | 455 | Next week button |
| `REST_END_TURN` | 502 | Rest modal |
| `WORK_SHIFT` | 510 | Work modal |
| `BUY_CAR` | 542 | Car purchase |
| `TRAVEL` | 610 | Location click |

### HUD.ts
| Event | Line | Trigger |
|-------|------|---------|
| `showPlayerStats` | 64, 65 | Orb click |
| `showIntelTerminal` | 72, 80 | Terminal trigger |

### Modal.ts
| Event | Line | Trigger |
|-------|------|---------|
| `modalShown` | 31 | Modal open |
| `modalHidden` | 37 | Modal close |

### EventNotificationManager.ts
| Event | Line | Trigger |
|-------|------|---------|
| `logIconClicked` | 39 | Log icon click |

---

## Subscribers by File

### main.ts
| Event | Handler |
|-------|---------|
| `REST_END_TURN` | `timeSystem.endTurn()` |
| `ADVANCE_TURN` | `timeSystem.advanceTurn()` |
| `BANK_DEPOSIT` | `economySystem.deposit()` |
| `BANK_WITHDRAW` | `economySystem.withdraw()` |
| `BANK_LOAN` | `economySystem.takeLoan()` |
| `BANK_REPAY` | `economySystem.repayLoan()` |
| `BUY_ITEM` | `economySystem.buyItem()` |
| `BUY_CAR` | `economySystem.buyCar()` |

### GameController.ts
| Event | Handler |
|-------|---------|
| `WORK_SHIFT` | `this.workShift()` |
| `TRAVEL` | `this.travel()` |
| `APPLY_JOB` | `this.applyForJob()` |
| `TAKE_COURSE` | `this.takeCourse()` |
| `REQUEST_STATE_REFRESH` | `this.gameState.publishCurrentState()` |

### UIManager.ts
| Event | Handler |
|-------|---------|
| `aiThinkingStart` | `this.showLoading()` |
| `aiThinkingEnd` | `this.hideLoading()` |
| `stateChanged` | `this.render()` |
| `turnEnded` | `this.showTurnSummary()` |
| `showPlayerStats` | `this.showPlayerStatsModal()` |
| `showIntelTerminal` | `this.showIntelTerminal()` |
| `addToLog` | (handler) |

### HUD.ts
| Event | Handler |
|-------|---------|
| `gameEvent` | (anonymous) |
| `logIconClicked` | (anonymous) |

### EventNotificationManager.ts
| Event | Handler |
|-------|---------|
| `gameEvent` | `this.handleGameEvent()` |

---

## Event Flow Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERACTION                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                UIManager                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Publishes: UI_EVENTS (TRAVEL, APPLY_JOB, TAKE_COURSE, etc.)         │    │
│  │ Subscribes: stateChanged, turnEnded, aiThinkingStart/End,           │    │
│  │             showPlayerStats, showIntelTerminal                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
          │                           │                           │
          ▼                           ▼                           ▼
┌──────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  GameController  │    │    EconomySystem     │    │     TimeSystem       │
│  ─────────────── │    │  ──────────────────  │    │  ──────────────────  │
│  Subscribes:     │    │  Subscribes:         │    │  Subscribes:         │
│  - WORK_SHIFT    │    │  - BANK_DEPOSIT      │    │  - REST_END_TURN     │
│  - TRAVEL        │    │  - BANK_WITHDRAW     │    │  - ADVANCE_TURN      │
│  - APPLY_JOB     │    │  - BANK_LOAN         │    │                      │
│  - TAKE_COURSE   │    │  - BANK_REPAY        │    │  Publishes:          │
│  - REQUEST_STATE │    │  - BUY_ITEM          │    │  - turnEnded         │
│    _REFRESH      │    │  - BUY_CAR           │    │  - stateChanged      │
│                  │    │                      │    │  - aiThinkingStart   │
│  Calls:          │    │  Publishes:          │    │  - aiThinkingEnd     │
│  GameState       │    │  - stateChanged      │    │                      │
│  methods         │    │                      │    │                      │
└──────────────────┘    └──────────────────────┘    └──────────────────────┘
          │                           │                           │
          └───────────────────────────┼───────────────────────────┘
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                GameState                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ Publishes: stateChanged, gameEvent, gameOver,                        │    │
│  │            jobApplicationError, jobApplicationSuccess, aiThinkingEnd │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UI Components                                   │
│  ┌─────────────┐  ┌───────────────────────┐  ┌───────────────────────────┐ │
│  │    HUD      │  │ EventNotificationMgr  │  │      Modal instances      │ │
│  │ Subscribes: │  │ Subscribes:           │  │ Publishes: modalShown,    │ │
│  │ - gameEvent │  │ - gameEvent           │  │           modalHidden     │ │
│  │ - logIcon   │  │                       │  │                           │ │
│  │   Clicked   │  │ Publishes:            │  │                           │ │
│  │             │  │ - logIconClicked      │  │                           │ │
│  │ Publishes:  │  │                       │  │                           │ │
│  │ - showPlayer│  │                       │  │                           │ │
│  │   Stats     │  │                       │  │                           │ │
│  │ - showIntel │  │                       │  │                           │ │
│  │   Terminal  │  │                       │  │                           │ │
│  └─────────────┘  └───────────────────────┘  └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Recommendations

### 1. Consolidate Event Types
Create a single `GameEvents` enum/constant object:
```typescript
export const GameEvents = {
    STATE_CHANGED: 'stateChanged',
    GAME_EVENT: 'gameEvent',
    TURN_ENDED: 'turnEnded',
    // ... etc
} as const;
```

### 2. Type Event Payloads
Define interfaces for each event's data:
```typescript
interface StateChangedEvent {
    gameState: GameState;
}
interface TurnEndedEvent {
    summary: TurnSummary;
}
```

### 3. Reduce stateChanged Spammers
Consider more granular events:
- `cashChanged` instead of `stateChanged` for cash updates
- `locationChanged` for travel
- `inventoryChanged` for purchases

This would reduce unnecessary re-renders in Phase 3.
