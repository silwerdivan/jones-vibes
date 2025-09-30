import GameController from '../js/game/GameController.js';

describe('GameController Integration Test', () => {
    test('simulates a multi-step turn and updates state correctly', async () => {
        // 1. Instantiate GameController for a 1-player game
        const gameController = new GameController(1);
        const player = gameController.gameState.getCurrentPlayer();

        // Manually set cash to 500 for this test, as per original intent, though constructor sets it to 0.
        player.cash = 500;

        // Check initial state
        expect(player.location).toBe('Home');
        expect(player.time).toBe(24);
        expect(player.cash).toBe(500);
        expect(player.careerLevel).toBe(0);

        // 2. Call handleAction to travel
        await gameController.handleAction('travel', { destination: 'Employment Agency' });

        // 3. Assert player's location and time after traveling
        expect(player.location).toBe('Employment Agency');
        expect(player.time).toBe(22); // Travel time is 2 hours without a car

        // 4. Call handleAction to work a shift
        await gameController.handleAction('workShift', {});

        // 5. Assert cash, time, and career level have been updated
        // The first job is 'Dishwasher', which pays $8/hr for a 6-hour shift.
        const earnings = 8 * 6;
        expect(player.cash).toBe(500 + earnings); // 500 + 48 = 548
        expect(player.time).toBe(22 - 6); // 22 - 6 = 16
        expect(player.careerLevel).toBe(1); // Promoted to level 1
    });
});
