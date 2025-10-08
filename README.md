# Jones in the Fast Lane

## Project Overview

This project is a browser-based, single-player vs. AI or two-player 'hotseat' multiplayer game called "Jones in the Fast Lane". The game is a modern interpretation of the classic life-simulation game, built with vanilla JavaScript, HTML, and CSS. The objective is to be the first player to achieve a set of life goals: accumulating wealth, happiness, education, and career progression.

The game features a turn-based system where players spend "hours" to perform actions like working, attending courses, or traveling between locations. The UI is designed with a retro 80s synthwave aesthetic.

## Getting Started

This is a vanilla JavaScript project with no build process required for development.

### Running the Game

1.  Open the `index.html` file in a web browser.

### Running Tests

The project uses Jest for testing.

To run the tests, execute the following command in your terminal:

```bash
npm test
```

## Development Conventions

### Testing

The project uses the Jest testing framework. Tests are located in the `tests/` directory and follow the `*.test.js` naming convention. The tests cover both the core game logic and UI interactions.

### Coding Style

The project uses modern JavaScript (ES6 modules). The code is organized into classes and modules, promoting a clean and maintainable structure.

### Documentation

The `docs/` directory contains important project documentation, including:
-   `spec.md`: A detailed specification of the game mechanics, UI, and visual design.
-   `visual-upgrade-refactor-plan.md`: A plan for refactoring the visual layer of the application.
