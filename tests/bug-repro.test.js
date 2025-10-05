
/** @jest-environment jsdom */

import GameState from '../js/game/GameState.js';
import { render } from '../js/ui.js';
import fs from 'fs';
import path from 'path';

describe('Bug: "Take Course" button visibility', () => {
    beforeEach(() => {
        // Load index.html content into the DOM
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
    });

    it('should only display the "Take Course" button when at the Community College', () => {
        const gameState = new GameState(1);
        const player = gameState.getCurrentPlayer();
        const takeCourseButton = document.querySelector('#btn-take-course');

        // 1. Start at Home, button should be hidden
        player.setLocation('Home');
        render(gameState);
        // The button is bugged and doesn't have the right classes, so querySelector won't find it with .location-specific
        // We will check for the 'hidden' class. Initially it should not be there.
        // Let's assume the default state is visible for the buggy button.
        // The bug is that it's not getting hidden.

        // Let's correct the test logic.
        // The button in index.html is `<button id="btn-take-course" class.location-specific.hidden">Take Course</button>`
        // This means it has no classes.

        // Let's trace the ui.js logic.
        // `locationSpecificButtons.forEach(button => button.classList.add('hidden'));`
        // This won't grab our button.

        // `document.querySelector('#btn-take-course').classList.remove('hidden');` in the 'Community College' case.
        // This will remove 'hidden' if it exists.

        // So, if we are at the college, it should be visible (no 'hidden' class).
        // If we are elsewhere, it should be hidden. But since it's not being targeted by the initial hiding logic,
        // once it's visible, it stays visible.

        // Test Plan:
        // 1. Go to Community College. Render. Button should be visible.
        player.setLocation('Community College');
        render(gameState);
        expect(takeCourseButton.classList.contains('hidden')).toBe(false);

        // 2. Go to another location (e.g., Home). Render. Button should become hidden.
        player.setLocation('Home');
        render(gameState);
        expect(takeCourseButton.classList.contains('hidden')).toBe(true);
    });
});
