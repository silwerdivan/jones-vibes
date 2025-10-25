# GEMINI.md

## Project Overview

This project is a browser-based, single-player vs. AI or two-player "hotseat" multiplayer game called **Jones in the Fast Lane** — a modern, responsive reimagining of the classic 1990s life-simulation game.

Built entirely in **vanilla JavaScript, HTML, and CSS**, the game challenges players to achieve goals of wealth, happiness, education, and career advancement before their rival.

Key highlights of the architecture:

- **Turn-based gameplay loop** between one or two players (with AI capabilities).
- **Reactive decoupled architecture** powered by an internal `EventBus`.
- **Cross-platform responsive UI** supporting both desktop and mobile browsers.
- **Command Pattern**–based input routing via an `InputManager`.
- **Single-direction data flow:** Input → Controller → GameState → EventBus → View.

The UI features a **retro synthwave aesthetic** combined with contemporary web design best practices — such as fluid typography, responsive grid stacking, touch-friendly buttons, and accessibility-respecting relative units.

---

## 🏗️ Architecture Overview

### Core Layers

**1. Game State Layer (`GameState.js`)**

Holds all mutable game data (player stats, turn logic, finances, location, etc.).  
Implements all business rules and publishes updates through the global `EventBus`.

- Publishes events: `"stateChanged"`, `"aiThinkingStart"`, `"aiThinkingEnd"`, and `"gameOver"`.
- Handles AI-controlled turns via `AIController`.
- Implements the *Observer Pattern* and announces all changes reactively.

**2. Game Controller Layer (`GameController.js`)**

Acts as the mediator between inputs and game state.  
Receives abstracted input commands from the `InputManager`, invokes the relevant game logic, and in some cases triggers the `GameView` modal interfaces.

Implements *Command Pattern*–style methods like:
- `workShift()`
- `travel()`
- `buyItem()`
- `takeCourse()`
- `deposit()`, `withdraw()`, `takeLoan()`, `repayLoan()`, etc.

**3. Input System Layer (`InputManager.js`)**

A unified event handler that normalizes input handling across mouse and touch devices.

- Detects device type (touch vs. pointer)
- Uses a single event listener for efficient delegation
- Dispatches semantic, high-level game actions (instead of raw DOM events)
- Prevents mobile 300ms delay and accidental double triggering

**4. Event System (`EventBus.js`)**

Implements a lightweight publish/subscribe (Observer) system.

- Allows state and view to be fully decoupled
- Enables any module to listen for `publish('stateChanged', data)` updates
- Makes the architecture scalable, testable, and modular

**5. View Layer (`ui.js` → `GameView` class)**

Purely reactive — listens to `EventBus` events and re-renders UI elements.

- Dynamically updates DOM elements on `stateChanged`
- Displays modals for player choices, numeric inputs, and confirmations
- Shows and hides a responsive, full-viewport loading overlay when the AI is "thinking"
- Responsive actions panel becomes a sticky footer on smaller devices

**6. AI System (`AIController.js`)**

Implements simple strategic heuristics for computer-controlled turns.

Priorities:
1. Pay down large loans
2. Work to build wealth
3. Study to advance education
4. Shop to increase happiness
5. Purchase a car to improve travel efficiency
6. Pass turn if insufficient time or resources

---

## 📱 Responsive Strategy

Adopts a **CSS Grid** and **intrinsic layout philosophy**:

- Desktop: `grid-template-columns: 1fr 1fr`
- Mobile: collapses into a stacked single-column layout at widths ≤ 768px
- `@media` queries dynamically reposition `.actions-panel` as a sticky bottom bar
- `clamp()` used for fluid typography and scalable padding
- Minimum tap targets (≥ 44×44px)

Media query sections handle differences in interaction models and modal layout, ensuring consistent usability across devices.

---

## 🧩 Project Structure

```
index.html
style.css
js/
  app.js
  EventBus.js
  InputManager.js
  ui.js               // Reimplemented as GameView
  game/
    GameState.js
    GameController.js
    AIController.js
    Player.js
    gameData.js
docs/
  0001-prd-responsive-evolution.md
tests/
```

---

## ⚙️ Running, Building, and Testing

### Run the Game
Simply open `index.html` in any modern web browser (desktop or mobile).

### Testing
Jest is used for automated tests of `GameState`, `AIController`, and controller logic.

```bash
npm install
npm test
```

---

## ✨ Development Conventions and Design Philosophy

**Code Style**
- ES6 modules and classes (no frameworks)
- Publish/subscribe event flow
- Command-based controllers over DOM coupling
- Responsive-first CSS

**UI Philosophy**
- CSS Grid for layout
- Seamless transitions between devices
- Fluid spacing, accessibility, and visual legibility
- Retro neon aesthetic layered with modern responsiveness

**Documentation**
- `0001-prd-responsive-evolution.md`: detailed responsive redesign specification (implemented)
- `spec.md`: gameplay rules and mechanics
- `visual-upgrade-refactor-plan.md`: aesthetic and UI evolution roadmap