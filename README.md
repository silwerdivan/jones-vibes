# Jones in the Fast Lane

## Overview

**Jones in the Fast Lane** is a browser-based, turn-based life simulation game inspired by the 1990 Sierra classic.  
This version is built with **TypeScript, Vite, and CSS**, using a modern modular architecture and responsive foundation.

Compete to achieve career success, education milestones, happiness, and wealth faster than your rival — human or AI.

---

## 🎮 Features

- **Single-player vs AI** or **two-player (hotseat)** gameplay
- **AI-driven turns** with strategic decision-making
- **Auto-save persistence** — Game state (stats, progress, and current UI context) is automatically saved to `localStorage` on every change and restored on startup.
- **State-Driven UI** — The interface is a reflection of the persisted `GameState`, ensuring you return to the same screen, location dashboard, and even open choice modals after a refresh.
- **System Menu** — Restart the simulation anytime to start a fresh game.
- **Event-driven, reactive UI** — state changes propagate automatically through a typed Event Bus
- **Modal-based actions** for interaction consistency
- **Responsive layout** scaling from widescreen to mobile
- **Glassmorphism**, **Bento Grid** layouts

---

## 🧠 Key Technical Features

- **TypeScript:** Strict typing for players, items, and events ensures data integrity.
- **System-Based Logic:** Domain logic is segregated into dedicated systems (Economy, Time) for better maintainability.
- **Observer Pattern:** Game state publishes typed events; the UI re-renders automatically.
- **Component-Based UI:** Self-rendering components extend `BaseComponent` with encapsulated DOM and lifecycle management:
  - `CityScreen`, `LifeScreen`, `InventoryScreen` - Main screen components
  - `HUD`, `Gauge`, `ActionCard` - Reusable UI widgets
  - `ScreenManager` - Handles screen switching and tab navigation
- **Vite:** Modern tooling for fast development and optimized production builds.
- **AI System:** Separate module makes decisions and triggers state updates via game systems.
- **Touch-First Responsiveness:** Buttons and modals adapted for mobile ergonomics.
- **Sticky Action Bar:** Mobile usability optimization for persistent access to actions.

---

## 🧭 Design Philosophy

- **Modular TypeScript Architecture** — logic is separated from presentation.
- **Intrinsic responsiveness** — gracefully adapts across screen sizes via CSS.
- **Event-driven communication** — UI updates flow through a central, typed bus.
- **Accessible by design** — larger touch targets, scalable text, color-contrasted UI.
- **Aesthetic** — Flat glass panels, neon borders, high contrast. | Deep, translucent glass with inner glows, soft drop shadows, and vibrant neon accents on a deep violet/black background.

---

## Workflow Shortcuts

Use the short phase-11 aliases when you do not want to remember the full `workflow:phase11:*` names.

- `npm run p11` shows the available phase-11 commands
- `npm run p11:oncec` runs the same flow as `npm run workflow:phase11:once:commit`
- `npm run wf -- oncec` uses the generic workflow launcher and is easier to extend later

The canonical scripts still exist in [`package.json`](/home/silwerdivan/code/jones-vibes/package.json).

---

## ✨ Credits

- Inspired by *Jones in the Fast Lane* (Sierra On-Line, 1990)
- Reimagined with modern web standards by the development team / contributors.
