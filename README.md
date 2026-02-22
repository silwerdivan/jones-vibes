# Jones in the Fast Lane

## Overview

**Jones in the Fast Lane** is a browser-based, turn-based life simulation game inspired by the 1990 Sierra classic.  
This version is built with **TypeScript, Vite, and CSS**, using a modern modular architecture and responsive foundation.

Compete to achieve career success, education milestones, happiness, and wealth faster than your rival — human or AI.

---

## 🎮 Features

- **Single-player vs AI** or **two-player (hotseat)** gameplay
- **AI-driven turns** with strategic decision-making
- **Event-driven, reactive UI** — state changes propagate automatically through a typed Event Bus
- **Modal-based actions** for interaction consistency
- **Responsive layout** scaling from widescreen to mobile
- **Thematic synthwave aesthetic**: neon borders, glowing panels, and VHS vibes

---

## 🧩 Architectural Highlights

### 🔁 Unidirectional Data Flow

The game follows a clear, event-driven flow:

```
Input → EventBus → Systems/GameState → EventBus → UIManager
```

| Layer | Responsibility |
|-------|----------------|
| **InputManager** | Abstracts mouse/touch inputs, maps UI interactions to UI events. |
| **GameController** | Orchestrates UI-specific logic (e.g. modals) and publishes game intents. |
| **Systems** | (Economy, Time) Handles specific domain logic and updates the GameState. |
| **GameState** | Holds the canonical state of the world and data entities. |
| **EventBus** | Propagates typed change events to all subscribers. |
| **UIManager** | Orchestrates rendering logic and component updates. |

This design makes the system **fully decoupled**, **modular**, and **testable**.

---

## 🧠 Key Technical Features

- **TypeScript:** Strict typing for players, items, and events ensures data integrity.
- **System-Based Logic:** Domain logic is segregated into dedicated systems (Economy, Time) for better maintainability.
- **Observer Pattern:** Game state publishes typed events; the UI re-renders automatically.
- **Component-Based UI:** UI components extend `BaseComponent` for self-rendering and lifecycle management.
- **Vite:** Modern tooling for fast development and optimized production builds.
- **AI System:** Separate module makes decisions and triggers state updates via game systems.
- **Touch-First Responsiveness:** Buttons and modals adapted for mobile ergonomics.
- **Sticky Action Bar:** Mobile usability optimization for persistent access to actions.

---

## 📱 Responsive Design Principles

- CSS Grid transitions to a stacked layout below 768px width
- Sticky bottom actions panel for thumb-friendly mobile gameplay
- Full-screen modals for inputs and choices on touch devices
- Uses `clamp()` for fluid scaling of font sizes and spacing
- Buttons meet 44×44px minimum touch area standards

---

## 🚀 Getting Started

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open the provided local URL (usually `http://localhost:5173`) in your browser.

### Production Build

To create an optimized production build and preview it:
```bash
npm run build
npm run preview
```

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode during development:
```bash
npm run test:watch
```

---

## 🧰 Repository Structure

```
src/
  main.ts                # Composition Root & Event Hub
  EventBus.ts            # Typed Event Emitter
  InputManager.ts        # Unified input routing
  data/                  # Static Game Data (typed)
  systems/               # Domain-specific logic (Economy, Time)
  game/                  # Core state and AI controllers
    GameState.ts         # Single Source of Truth
    GameController.ts    # UI orchestration controller
    AIController.ts      # AI decision engine
    Player.ts            # Player model
  models/                # Interfaces & Shared Types
  ui/                    # Rendering Logic (The "View")
    UIManager.ts         # Main UI Orchestrator
    BaseComponent.ts     # Abstract base class for UI components
    components/          # Reusable UI components (HUD, Modal)
```

---

## 🧭 Design Philosophy

- **Modular TypeScript Architecture** — logic is separated from presentation.
- **Intrinsic responsiveness** — gracefully adapts across screen sizes via CSS.
- **Event-driven communication** — UI updates flow through a central, typed bus.
- **Accessible by design** — larger touch targets, scalable text, color-contrasted UI.
- **Stylized nostalgia** — neon-glow synth aesthetic rooted in 80s arcade culture.

---

## 🧾 Documentation References

- `plan.md` — Active modernization and refactoring roadmap.
- `docs/0001-prd-responsive-evolution.md` — Responsive & architectural refactor spec (fully implemented).
- `docs/spec.md` — Core game mechanics and design.

---

## ✨ Credits

- Inspired by *Jones in the Fast Lane* (Sierra On-Line, 1990)
- Reimagined with modern web standards by the development team / contributors.
