import GameController from '../js/game/GameController.js';
import GameState from '../js/game/GameState.js';
import Player from '../js/game/Player.js';
import AIController from '../js/game/AIController.js';

jest.mock('../js/game/GameState.js');
jest.mock('../js/game/Player.js');
jest.mock('../js/game/AIController.js');

describe('GameController', () => {
    let gameController;
    let mockGameStateInstance;
    let mockPlayerInstance;
    let mockAIControllerInstance;
    let mockUpdateUICallback;

    beforeEach(() => {
        // Reset mocks before each test
        GameState.mockClear();
        Player.mockClear();
        AIController.mockClear();

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
            isAI: false,
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

        // Mock AI Player instance
        const mockAIPlayerInstance = {
            ...mockPlayerInstance,
            name: 'AI Opponent',
            isAI: true,
        };

        // Mock GameState instance
        mockGameStateInstance = {
            players: [mockPlayerInstance, mockAIPlayerInstance],
            currentPlayerIndex: 0,
            turn: 1,
            getCurrentPlayer: jest.fn(() => mockPlayerInstance),
            endTurn: jest.fn(() => {
                mockGameStateInstance.currentPlayerIndex = (mockGameStateInstance.currentPlayerIndex + 1) % mockGameStateInstance.players.length;
                // Update the getCurrentPlayer mock to return the new current player
                mockGameStateInstance.getCurrentPlayer.mockImplementation(() => mockGameStateInstance.players[mockGameStateInstance.currentPlayerIndex]);
            }),
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
        GameState.mockImplementation((numberOfPlayers, isPlayer2AI) => {
            if (isPlayer2AI) {
                mockGameStateInstance.players = [mockPlayerInstance, mockAIPlayerInstance];
            } else {
                mockGameStateInstance.players = [mockPlayerInstance];
            }
            return mockGameStateInstance;
        });

        // Mock AIController instance
        mockAIControllerInstance = {
            takeTurn: jest.fn(() => ({ action: 'endTurn' })) // Default AI action is to end turn
        };
        AIController.mockImplementation(() => mockAIControllerInstance);

        // Mock updateUICallback
        mockUpdateUICallback = jest.fn();

        gameController = new GameController(2, mockAIControllerInstance, mockUpdateUICallback);
    });

    // Test 1: Constructor initializes GameState and game over flags
    test('constructor initializes GameState and game over flags', () => {
        expect(GameState).toHaveBeenCalledTimes(1);
        expect(GameState).toHaveBeenCalledWith(2, true);
        expect(gameController.gameState).toBe(mockGameStateInstance);
        expect(gameController.gameOver).toBe(false);
        expect(gameController.winner).toBe(null);
        expect(gameController.aiController).toBe(mockAIControllerInstance);
        expect(gameController.updateUICallback).toBe(mockUpdateUICallback);
    });

    // Test 2: handleAction routes to correct GameState method (travel)
    test('handleAction routes to correct GameState method (travel)', async () => {
        const params = { destination: 'Bank' };
        await gameController.handleAction('travel', params);
        expect(mockGameStateInstance.travelTo).toHaveBeenCalledWith(params.destination);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 3: handleAction routes to correct GameState method (workShift)
    test('handleAction routes to correct GameState method (workShift)', async () => {
        await gameController.handleAction('workShift');
        expect(mockGameStateInstance.workShift).toHaveBeenCalledTimes(1);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 4: handleAction routes to correct GameState method (takeCourse)
    test('handleAction routes to correct GameState method (takeCourse)', async () => {
        const params = { courseId: 'basicProgramming' };
        await gameController.handleAction('takeCourse', params);
        expect(mockGameStateInstance.takeCourse).toHaveBeenCalledWith(params.courseId);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 5: handleAction routes to correct GameState method (buyItem)
    test('handleAction routes to correct GameState method (buyItem)', async () => {
        const params = { itemName: 'coffee' };
        await gameController.handleAction('buyItem', params);
        expect(mockGameStateInstance.buyItem).toHaveBeenCalledWith(params.itemName);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 6: handleAction routes to correct GameState method (deposit)
    test('handleAction routes to correct GameState method (deposit)', async () => {
        const params = { amount: 100 };
        await gameController.handleAction('deposit', params);
        expect(mockGameStateInstance.deposit).toHaveBeenCalledWith(params.amount);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 7: handleAction routes to correct GameState method (withdraw)
    test('handleAction routes to correct GameState method (withdraw)', async () => {
        const params = { amount: 50 };
        await gameController.handleAction('withdraw', params);
        expect(mockGameStateInstance.withdraw).toHaveBeenCalledWith(params.amount);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 8: handleAction routes to correct GameState method (takeLoan)
    test('handleAction routes to correct GameState method (takeLoan)', async () => {
        const params = { amount: 500 };
        await gameController.handleAction('takeLoan', params);
        expect(mockGameStateInstance.takeLoan).toHaveBeenCalledWith(params.amount);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 9: handleAction routes to correct GameState method (repayLoan)
    test('handleAction routes to correct GameState method (repayLoan)', async () => {
        const params = { amount: 200 };
        await gameController.handleAction('repayLoan', params);
        expect(mockGameStateInstance.repayLoan).toHaveBeenCalledWith(params.amount);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 10: handleAction routes to correct GameState method (buyCar)
    test('handleAction routes to correct GameState method (buyCar)', async () => {
        await gameController.handleAction('buyCar');
        expect(mockGameStateInstance.buyCar).toHaveBeenCalledTimes(1);
        expect(mockGameStateInstance.checkWinCondition).toHaveBeenCalledWith(mockPlayerInstance);
    });

    // Test 11: handleAction calls endTurn for 'endTurn' action
    test('handleAction calls endTurn for \'endTurn\' action', async () => {
        // Mock getCurrentPlayer to ensure the next player is NOT an AI for this test
        mockGameStateInstance.getCurrentPlayer.mockReturnValueOnce(mockPlayerInstance); // Human player
        mockGameStateInstance.getCurrentPlayer.mockReturnValueOnce({ ...mockPlayerInstance, isAI: false }); // Next player is also human

        await gameController.handleAction('endTurn');
        expect(mockGameStateInstance.endTurn).toHaveBeenCalledTimes(1);
        expect(mockGameStateInstance.checkWinCondition).not.toHaveBeenCalled(); // Should not check win condition on endTurn
    });

    // Test 12: handleAction sets gameOver and winner if win condition is met
    test('handleAction sets gameOver and winner if win condition is met', async () => {
        mockGameStateInstance.checkWinCondition.mockReturnValue(true);
        const result = await gameController.handleAction('workShift');

        expect(gameController.gameOver).toBe(true);
        expect(gameController.winner).toBe(mockPlayerInstance);
        expect(result.message).toContain(`${mockPlayerInstance.name} has won the game!`);
    });

    // Test 13: handleAction does not set gameOver if win condition is not met
    test('handleAction does not set gameOver if win condition is not met', async () => {
        mockGameStateInstance.checkWinCondition.mockReturnValue(false);
        await gameController.handleAction('workShift');

        expect(gameController.gameOver).toBe(false);
        expect(gameController.winner).toBe(null);
    });

    // Test 14: handleAction returns failure for unknown action type
    test('handleAction returns failure for unknown action type', async () => {
        const result = await gameController.handleAction('unknownAction');
        expect(result.success).toBe(false);
        expect(result.message).toBe('Invalid action type: unknownAction');
    });

    // Test 15: handleAction does nothing if game is already over
    test('handleAction does nothing if game is already over', async () => {
        gameController.gameOver = true;
        gameController.winner = mockPlayerInstance;

        const result = await gameController.handleAction('workShift');

        expect(result.success).toBe(false);
        expect(result.message).toBe('Game is over.');
        expect(mockGameStateInstance.workShift).not.toHaveBeenCalled();
        expect(mockGameStateInstance.checkWinCondition).not.toHaveBeenCalled();
    });

    // Test 16: handleAction returns result from GameState method
    test('handleAction returns result from GameState method', async () => {
        const expectedResult = { success: false, message: 'Not enough time.' };
        mockGameStateInstance.travelTo.mockReturnValue(expectedResult);

        const result = await gameController.handleAction('travel', { destination: 'Mall' });

        expect(result).toBe(expectedResult);
    });

    // New Test: AI takes turn after human player ends turn
    test('AI takes turn after human player ends turn', async () => {
        // Set current player to human, next player to AI
        mockGameStateInstance.getCurrentPlayer.mockReturnValueOnce(mockPlayerInstance); // Human player
        mockGameStateInstance.getCurrentPlayer.mockReturnValueOnce(mockGameStateInstance.players[1]); // AI player after endTurn

        mockAIControllerInstance.takeTurn.mockReturnValueOnce({ action: 'workShift' });
        mockGameStateInstance.workShift.mockReturnValueOnce({ success: true, message: 'AI worked.' });
        mockAIControllerInstance.takeTurn.mockReturnValueOnce({ action: 'endTurn' });

        await gameController.handleAction('endTurn');

        expect(mockGameStateInstance.endTurn).toHaveBeenCalledTimes(2); // Once for human, once for AI
        expect(mockAIControllerInstance.takeTurn).toHaveBeenCalledTimes(2);
        expect(mockGameStateInstance.workShift).toHaveBeenCalledTimes(1);
        expect(mockUpdateUICallback).toHaveBeenCalled();
    });
});
