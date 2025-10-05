
import GameController from '../js/game/GameController.js';

describe('First Promotion Scenario', () => {
    it('should allow a player to get a loan, take a course, and get a promotion in a multi-turn sequence', async () => {
        // 1. Initialize a GameController with a 2-player game.
        const gameController = new GameController(2);
        const gameState = gameController.gameState;

        // 2. Player 1's Turn
        let player1 = gameState.players[0];
        const initialTime = player1.time;

        // - Travel to the bank and take a loan
        let result = await gameController.handleAction('travel', { destination: 'Bank' });
        expect(result.success).toBe(true);
        result = await gameController.handleAction('takeLoan', { amount: 800 });
        expect(result.success).toBe(true);

        // - Assert that P1's cash is now 800 and loan is 800.
        player1 = gameState.players[0];
        expect(player1.cash).toBe(800);
        expect(player1.loan).toBe(800);

        // - Travel to the college and take a course
        result = await gameController.handleAction('travel', { destination: 'Community College' });
        expect(result.success).toBe(true);
        result = await gameController.handleAction('takeCourse', { courseId: 1 });
        expect(result.success).toBe(true);

        // - Assert P1's cash is now 300 (800 - 500), educationLevel is 1, and time has been deducted.
        player1 = gameState.players[0];
        expect(player1.cash).toBe(300);
        expect(player1.educationLevel).toBe(1);
        
        // Time check: travel (2) + travel (2) + course (10) = 14 hours used.
        expect(player1.time).toBe(initialTime - 14);

        // - End turn and assert the current player is now the second player.
        result = await gameController.handleAction('endTurn', {});
        expect(result.success).toBe(true);
        expect(gameState.currentPlayerIndex).toBe(1);

        // 3. Player 2's Turn:
        // - End turn immediately. Assert the current player is back to Player 1 and the turn count has incremented.
        result = await gameController.handleAction('endTurn', {});
        expect(result.success).toBe(true);
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(2);

        // 4. Player 1's Second Turn:
        player1 = gameState.players[0];
        const cashBeforeWork = player1.cash;
        expect(cashBeforeWork).toBe(250);
        expect(player1.loan).toBe(840);

        // - Travel to the employment agency and work a shift
        result = await gameController.handleAction('travel', { destination: 'Employment Agency' });
        expect(result.success).toBe(true);
        result = await gameController.handleAction('workShift', {});
        expect(result.success).toBe(true);

        // - Assert that Player 1 worked the 'Fast Food Worker' job (Level 2), earning $70 ($10/hr * 7 hrs).
        player1 = gameState.players[0];
        const earnings = 10 * 7; // $70
        expect(player1.cash).toBe(cashBeforeWork + earnings);

        // - Assert Player 1's careerLevel is now 2, as it matches the job level.
        expect(player1.careerLevel).toBe(2);
    });

    it('should reset player location to Home at the start of a new turn', async () => {
        // 1. Initialize game
        const gameController = new GameController(2);
        const gameState = gameController.gameState;
        let player1 = gameState.players[0];

        // 2. Player 1 moves to the Mall
        await gameController.handleAction('travel', { destination: 'Shopping Mall' });
        player1 = gameState.players[0];
        expect(player1.location).toBe('Shopping Mall');

        // 3. Player 1 ends their turn
        await gameController.handleAction('endTurn', {});
        expect(gameState.currentPlayerIndex).toBe(1);

        // 4. Player 2 ends their turn
        await gameController.handleAction('endTurn', {});
        expect(gameState.currentPlayerIndex).toBe(0);
        expect(gameState.turn).toBe(2);

        // 5. Assert Player 1's location is now 'Home'
        player1 = gameState.players[0];
        expect(player1.location).toBe('Home');
    });
});
