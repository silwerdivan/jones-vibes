import { screen, fireEvent, waitFor, within } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

// Mock the GameController module
jest.mock('../../js/game/GameController.js', () => {
    const mockGameControllerInstance = {
        gameOver: false,
        winner: null,
        gameState: {
            getCurrentPlayer: () => ({ location: 'Home' }), // Default state
            turn: 1,
            players: [{ name: 'Player 1' }, { name: 'Player 2 (AI)' }],
            currentPlayerIndex: 0,
        },
        handleAction: jest.fn(() => ({ message: 'Action completed.' })),
        getNextAvailableCourse: jest.fn(),
    };

    return jest.fn(() => mockGameControllerInstance);
});

// Mock the UI functions that interact with the DOM directly
jest.mock('../../js/ui.js', () => ({
    render: jest.fn(),
    showChoiceModal: jest.fn(),
    showNumberInputModal: jest.fn(),
}));

describe('Game Over State', () => {
    let GameControllerMock; // To hold the mocked constructor
    let mockGameControllerInstance; // To hold the instance returned by the mocked constructor

    beforeEach(async () => {
        const html = fs.readFileSync(path.resolve(__dirname, '../../index.html'), 'utf8');
        document.body.innerHTML = html.toString();

        jest.resetModules();

        // Get the mocked GameController constructor
        GameControllerMock = (await import('../../js/game/GameController.js')).default;

        // Create an instance of the mock GameController
        mockGameControllerInstance = {
            gameOver: false, // Will be set to true in the test
            winner: null,    // Will be set in the test
            gameState: {
                getCurrentPlayer: () => ({ location: 'Home' }), // Default state
                turn: 1,
                players: [{ name: 'Player 1' }, { name: 'Player 2 (AI)' }],
                currentPlayerIndex: 0,
            },
            handleAction: jest.fn(() => ({ message: 'Action completed.' })),
            getNextAvailableCourse: jest.fn(),
        };
        // Make the mock constructor return our specific instance
        GameControllerMock.mockImplementation(() => mockGameControllerInstance);

        // Dynamically import the app.js to re-initialize the game for each test
        // This will cause the mocked GameController to be instantiated with our mockGameControllerInstance
        await import('../../js/app.js');

        // Now, set the game over state on the mock instance *before* DOMContentLoaded
        mockGameControllerInstance.gameOver = true;
        mockGameControllerInstance.winner = { name: 'Player 1' };

        // Manually trigger DOMContentLoaded to run the app script
        document.dispatchEvent(new Event('DOMContentLoaded', { bubbles: true, cancelable: true }));

        // Reset mocks for ui.js functions
        const uiModule = await import('../../js/ui.js');
        uiModule.render.mockClear();
        uiModule.showChoiceModal.mockClear();
        uiModule.showNumberInputModal.mockClear();
    });

    test('It should display a \'Game Over\' message in the log when a player wins', async () => {
        // The game over state is already set in beforeEach, and updateUI is called on DOMContentLoaded.
        // We just need to wait for the DOM to update.

        // Verify that the game over message is displayed in the log
        await waitFor(() => {
            expect(screen.getByText(/Game Over! Player 1 wins!/i)).toBeInTheDocument();
        });
    });

    test('It should disable all action buttons when the game is over', async () => {
        // The game over state is already set in beforeEach.
        // We just need to wait for the DOM to update and then check button states.

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