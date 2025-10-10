import fs from 'fs';
import path from 'path';
import { gameController } from '../../js/app.js';

describe('Long Gameplay Session Stability', () => {
    beforeAll(() => {
        const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        document.body.innerHTML = html;
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));
    });

    test('should run for 50 turns and reflect player stat changes', async () => {
        const numberOfTurns = 50;
        jest.setTimeout(120000);

        const player1 = gameController.gameState.players[0];
        
        // Setup: Give player enough cash to take a course
        player1.cash = 500;

        const initialPlayerState = { ...player1 };
        const initialTurn = gameController.gameState.turn;

        // --- Run the game loop ---
        for (let i = 0; i < numberOfTurns; i++) {
            const currentPlayer = gameController.gameState.getCurrentPlayer();
            currentPlayer.time = 24;

            if (i === 0) {
                // First turn: Go to college and get an education
                await gameController.handleAction('travel', { destination: 'Community College' });
                await gameController.handleAction('takeCourse', { courseId: 1 }); // Intro to Business
            } else {
                // Subsequent turns: Go to work with the new qualification
                await gameController.handleAction('travel', { destination: 'Employment Agency' });
                await gameController.handleAction('workShift', {});
            }

            await gameController.handleAction('endTurn', {});
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        const finalGameState = gameController.gameState;
        const finalPlayerState = finalGameState.players[0];
        const finalTurn = finalGameState.turn;

        // --- Assertions ---
        expect(finalTurn).toBe(initialTurn + numberOfTurns);
        expect(gameController.gameOver).toBe(false);

        // After working for ~49 turns with a better job, cash should have increased significantly.
        expect(finalPlayerState.cash).toBeGreaterThan(initialPlayerState.cash);
        
        // Education level should have increased.
        expect(finalPlayerState.educationLevel).toBeGreaterThan(initialPlayerState.educationLevel);

        // After ending a turn, time is reset to 24.
        expect(finalPlayerState.time).toBe(24);

    }, 120000);
});