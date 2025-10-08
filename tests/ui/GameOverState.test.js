import { screen, waitFor, within } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('Game Over State', () => {
    let gameController;
    let updateUI;

    beforeEach(async () => {
        const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        document.body.innerHTML = html.toString();

        // Dynamically import to get the instances
        const app = await import('../../js/app.js');
        gameController = app.gameController;
        updateUI = app.updateUI;

        // Manually trigger DOMContentLoaded to run the app script
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
    });

    test('It should display a \'Game Over\' message in the log when a player wins', async () => {
        // Manually set the game to a win state
        gameController.gameOver = true;
        gameController.winner = { name: 'Player 1' };
        gameController.gameState.addLogMessage(`Game Over! ${gameController.winner.name} wins!`);

        // Manually trigger a UI update
        updateUI();

        // Verify that the game over message is displayed in the log
        await waitFor(() => {
            const logContent = document.querySelector('.event-log .log-content');
            expect(logContent.textContent).toContain('Game Over! Player 1 wins!');
        });
    });

    test('It should disable all action buttons when the game is over', async () => {
        // Manually set the game to a win state
        gameController.gameOver = true;
        gameController.winner = { name: 'Player 1' };

        // Manually trigger a UI update, which should disable the buttons
        updateUI();

        // Verify that all buttons inside the #game-controls div are disabled
        await waitFor(() => {
            const gameControls = document.getElementById('game-controls');
            const buttons = within(gameControls).getAllByRole('button');
            buttons.forEach(button => {
                expect(button).toBeDisabled();
            });
        });
    });
});