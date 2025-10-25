# Jones in the Fast Lane

## Overview

**Jones in the Fast Lane** is a browser-based, turn-based life simulation game inspired by the 1990 Sierra classic.  
This version is entirely built with **vanilla JavaScript, HTML, and CSS**, using a modern architectural and responsive foundation.

Compete to achieve career success, education milestones, happiness, and wealth faster than your rival — human or AI.

---

## 🎮 Features

- **Single-player vs AI** or **two-player (hotseat)** gameplay
- **AI-driven turns** with strategic decision-making
- **Reactively updating UI** — no manual DOM refresh logic
- **Modal-based actions** for interaction consistency
- **Responsive layout** scaling from widescreen to mobile
- **Thematic synthwave aesthetic**: neon borders, glowing panels, and VHS vibes

---

## 🧩 Architectural Highlights

### 🔁 Unidirectional Data Flow

The game follows a clear, event-driven flow:

```
Input → Controller → GameState → EventBus → GameView
```

| Layer | Responsibility |
|-------|----------------|
| **InputManager** | Abstracts mouse/touch inputs, maps UI interactions to game commands |
| **GameController** | Interprets player decisions, calls appropriate GameState actions |
| **GameState** | Holds the canonical state of the world and business rules |
| **EventBus** | Propagates change events to all subscribers |
| **GameView (ui.js)** | Renders state, shows modals, handles animations and overlays |

This design makes the system **fully decoupled**, **testable**, and **reactive**.

---

## 🧠 Key Technical Features

- **Observer Pattern:** game state publishes `stateChanged` events; view re-renders automatically
- **Command Pattern:** InputManager executes controller commands
- **AI System:** separate module makes decisions and triggers state updates
- **Touch-First Responsiveness:** buttons and modals adapted for mobile ergonomics
- **Loading Overlay for AI:** non-blocking feedback during computer's turn
- **Sticky Action Bar:** mobile usability optimization for persistent access to actions

---

## 📱 Responsive Design Principles

- CSS Grid transitions to a stacked layout below 768px width
- Sticky bottom actions panel for thumb-friendly mobile gameplay
- Full-screen modals for inputs and choices on touch devices
- Uses `clamp()` for fluid scaling of font sizes and spacing
- Buttons meet 44×44px minimum touch area standards

Example responsive behaviors include:
- `@media (max-width: 768px)` dynamically reorganizing the `.main-grid`
- Smooth animation transitions on state updates
- Adaptive typography and spacing across resolutions

---

## 🚀 Getting Started

**Run the Game**

1. Clone or download the repository.
2. Open `index.html` in your favorite browser.

**Test the Game**

```bash
npm install
npm test
```

---

## 🧰 Repository Structure

```
index.html
style.css
js/
  app.js                 # Entry point
  EventBus.js            # Observer event system
  InputManager.js        # Unified input routing
  ui.js (GameView)       # Reactive rendering and modals
  game/
    GameState.js         # Game state and rules
    GameController.js    # Command controller
    AIController.js      # AI decision engine
    Player.js            # Player model
    gameData.js          # Game constants and content
docs/
  0001-prd-responsive-evolution.md
```

---

## 🧭 Design Philosophy

- **Minimal JavaScript-driven layout** — CSS Grid does the heavy lifting.
- **Intrinsic responsiveness** — gracefully adapts across screen sizes.
- **Event-driven architecture** — every UI update flows from `EventBus` events.
- **Accessible by design** — larger touch targets, scalable text, color-contrasted UI.
- **Stylized nostalgia** — neon-glow synth aesthetic rooted in 80s arcade culture.

---

## 🧪 Testing and Quality

- Unit tests in `tests/` directory using **Jest**
- Game state, AI logic, and command execution covered
- Consistent code style with ES modules and modern syntax

---

## 🧾 Documentation References

- `docs/0001-prd-responsive-evolution.md` — Responsive & architectural refactor spec (fully implemented)
- `docs/spec.md` — Core game mechanics and design
- `docs/visual-upgrade-refactor-plan.md` — Aesthetic and UI modernization plan

---

## ✨ Credits

- Inspired by *Jones in the Fast Lane* (Sierra On-Line, 1990)
- Reimagined with modern web standards by the development team / contributors