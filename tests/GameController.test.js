import GameController from '../js/game/GameController.js';
import GameState from '../js/game/GameState.js';
import Player from '../js/game/Player.js';

jest.mock('../js/game/GameState.js');
jest.mock('../js/game/Player.js');

describe('GameController', () => {
    let gameController;
    let mockGameStateInstance;
    let mockPlayerInstance;

    beforeEach(() => {
        // Reset mocks before each test
        GameState.mockClear();
        Player.mockClear();

        // Mock Player instance
        mockPlayerInstance = {
            cash: 0,
            happiness: 0,
            educationLevel: 0,
            careerLevel: 0,
            location: 'Home',
            hasCar: false,
            loan: 0,
            savings: 0,
            time: 24,
            name: 'Player 1',
            spendCash: jest.fn(() => true),
            addCash: jest.fn(),
            updateHappiness: jest.fn(),
            updateTime: jest.fn(),
            setLocation: jest.fn(),
            advanceEducation: jest.fn(),
            giveCar: jest.fn(),
            takeLoan: jest.fn(),
            repayLoan: jest.fn(),
            deposit: jest.fn(() => true),
            withdraw: jest.fn(() => true),
        };

        // Mock GameState instance
        mockGameStateInstance = {
            players: [mockPlayerInstance],
            currentPlayerIndex: 0,
            turn: 1,
            getCurrentPlayer: jest.fn(() => mockPlayerInstance),
            endTurn: jest.fn(),
            travelTo: jest.fn(() => ({ success: true, message: 'Traveled.' })),
            workShift: jest.fn(() => ({ success: true, message: 'Worked.' })),
            takeCourse: jest.fn(() => ({ success: true, message: 'Course taken.' })),
            buyItem: jest.fn(() => ({ success: true, message: 'Item bought.' })),
            deposit: jest.fn(() => ({ success: true, message: 'Deposited.' })),
            withdraw: jest.fn(() => ({ success: true, message: 'Withdrew.' })),
            takeLoan: jest.fn(() => ({ success: true, message: 'Loan taken.' })),
            repayLoan: jest.fn(() => ({ success: true, message: 'Loan repaid.' })),
            buyCar: jest.fn(() => ({ success: true, message: 'Car bought.' })),
            checkWinCondition: jest.fn(() => false),
        };

        // Mock GameState constructor to return our mock instance
        GameState.mockImplementation(() => mockGameStateInstance);

        gameController = new GameController(1);
    });

    // Test 1: Constructor initializes GameState and game over flags
    test('constructor initializes GameState and game over flags', () => {
        expect(GameState).toHaveBeenCalledTimes(1);
        expect(GameState).toHaveBeenCalledWith(1);
        expect(gameController.gameState).toBe(mockGameStateInstance);
        expect(gameController.gameOver).toBe(false);
        expect(gameController.winner).toBe(null);
    });

    // Test 2: handleAction routes to correct GameState method (travel)
    test('handleAction routes to correct GameState method (travel)', () => {
        const params = { destination: 'Bank' };
        gameController.handleAction('travel', params);
        expect(mockGameStateInstance.travelTo).toHaveBeenCalledWith(params.destination);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 3: handleAction routes to correct GameState method (work)
    test('handleAction routes to correct GameState method (work)', () => {
        gameController.handleAction('work');
        expect(mockGameStateInstance.workShift).toHaveBeenCalledTimes(1);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 4: handleAction routes to correct GameState method (takeCourse)
    test('handleAction routes to correct GameState method (takeCourse)', () => {
        const params = { courseId: 1 };
        gameController.handleAction('takeCourse', params);
        expect(mockGameStateInstance.takeCourse).toHaveBeenCalledWith(params.courseId);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 5: handleAction routes to correct GameState method (buyItem)
    test('handleAction routes to correct GameState method (buyItem)', () => {
        const params = { itemName: 'Coffee' };
        gameController.handleAction('buyItem', params);
        expect(mockGameStateInstance.buyItem).toHaveBeenCalledWith(params.itemName);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 6: handleAction routes to correct GameState method (deposit)
    test('handleAction routes to correct GameState method (deposit)', () => {
        const params = { amount: 100 };
        gameController.handleAction('deposit', params);
        expect(mockGameStateInstance.deposit).toHaveBeenCalledWith(params.amount);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 7: handleAction routes to correct GameState method (withdraw)
    test('handleAction routes to correct GameState method (withdraw)', () => {
        const params = { amount: 50 };
        gameController.handleAction('withdraw', params);
        expect(mockGameStateInstance.withdraw).toHaveBeenCalledWith(params.amount);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 8: handleAction routes to correct GameState method (takeLoan)
    test('handleAction routes to correct GameState method (takeLoan)', () => {
        const params = { amount: 500 };
        gameController.handleAction('takeLoan', params);
        expect(mockGameStateInstance.takeLoan).toHaveBeenCalledWith(params.amount);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 9: handleAction routes to correct GameState method (repayLoan)
    test('handleAction routes to correct GameState method (repayLoan)', () => {
        const params = { amount: 200 };
        gameController.handleAction('repayLoan', params);
        expect(mockGameStateInstance.repayLoan).toHaveBeenCalledWith(params.amount);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 10: handleAction routes to correct GameState method (buyCar)
    test('handleAction routes to correct GameState method (buyCar)', () => {
        gameController.handleAction('buyCar');
        expect(mockGameStateInstance.buyCar).toHaveBeenCalledTimes(1);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 11: handleAction calls endTurn for 'endTurn' action
    test('handleAction calls endTurn for \'endTurn\' action', () => {
        gameController.handleAction('endTurn');
        expect(mockGameStateInstance.endTurn).toHaveBeenCalledTimes(1);
        expect(mockGameStateInstance.checkWinCondition).not.toHaveBeenCalled(); // Should not check win condition on endTurn
    });

    // Test 12: handleAction sets gameOver and winner if win condition is met
    test('handleAction sets gameOver and winner if win condition is met', () => {
        mockGameStateInstance.checkWinCondition.mockReturnValue(true);
        const result = gameController.handleAction('work');

        expect(gameController.gameOver).toBe(true);
        expect(gameController.winner).toBe(mockPlayerInstance);
        expect(result.message).toContain(`${mockPlayerInstance.name} has won the game!`);
    });

    // Test 13: handleAction does not set gameOver if win condition is not met
    test('handleAction does not set gameOver if win condition is not met', () => {
        mockGameStateInstance.checkWinCondition.mockReturnValue(false);
        gameController.handleAction('work');

        expect(gameController.gameOver).toBe(false);
        expect(gameController.winner).toBe(null);
    });

    // Test 14: handleAction returns failure for unknown action type
    test('handleAction returns failure for unknown action type', () => {
        const result = gameController.handleAction('unknownAction');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid action type: unknownAction');
    });

    // Test 15: handleAction does nothing if game is already over
    test('handleAction does nothing if game is already over', () => {
        gameController.gameOver = true;
        gameController.winner = mockPlayerInstance;

        const result = gameController.handleAction('work');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Game is over.');
        expect(mockGameStateInstance.workShift).not.toHaveBeenCalled();
        expect(mockGameStateInstance.checkWinCondition).not.toHaveBeenCalled();
    });

    // Test 16: handleAction returns result from GameState method
    test('handleAction returns result from GameState method', () => {
        const expectedResult = { success: false, message: 'Not enough time.' };
        mockGameStateInstance.travelTo.mockReturnValue(expectedResult);

        const result = gameController.handleAction('travel', { destination: 'Mall' });

        expect(result).toBe(expectedResult);
    });
});
