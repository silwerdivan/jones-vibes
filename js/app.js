import { GameState } from './game/GameState.js';
import GameController from './game/GameController.js';
import AIController from './game/AIController.js';
import { render } from './ui.js';

// Initialize GameState and GameController
const aiController = new AIController();
const gameController = new GameController(2, aiController, updateUI); // 2 players, with AI for player 2

// Function to log messages to the UI
function logMessage(message) {
    const logDiv = document.getElementById('log');
    const p = document.createElement('p');
    p.textContent = message;
    logDiv.prepend(p); // Add new messages to the top
}

// Function to update the UI
function updateUI() {
    render(gameController.gameState);

    if (gameController.gameOver) {
        logMessage(`Game Over! ${gameController.winner.name} wins!`);
        // Disable all action buttons
        document.querySelectorAll('#game-controls button').forEach(button => {
            button.disabled = true;
        });
    }
}

// Initial render of the UI
document.addEventListener('DOMContentLoaded', () => {
    updateUI();

    // Get references to buttons
    const btnRestEndTurn = document.getElementById('btn-rest-end-turn');
    const btnTravel = document.getElementById('btn-travel');
    const btnWorkShift = document.getElementById('btn-work-shift');
    const btnTakeCourse = document.getElementById('btn-take-course');
    const btnBuyItem = document.getElementById('btn-buy-item');
    const btnDeposit = document.getElementById('btn-deposit');
    const btnWithdraw = document.getElementById('btn-withdraw');
    const btnTakeLoan = document.getElementById('btn-take-loan');
    const btnRepayLoan = document.getElementById('btn-repay-loan');
    const btnBuyCar = document.getElementById('btn-buy-car');

    // Add event listeners
    btnRestEndTurn.addEventListener('click', async () => {
        const result = await gameController.handleAction('endTurn', {});
        logMessage(result.message);
        updateUI();
    });

    btnWorkShift.addEventListener('click', async () => {
        const result = await gameController.handleAction('workShift', {});
        logMessage(result.message);
        updateUI();
    });

    btnBuyCar.addEventListener('click', async () => {
        const result = await gameController.handleAction('buyCar', {});
        logMessage(result.message);
        updateUI();
    });

    // Placeholder event listeners for actions requiring dynamic input
    btnTravel.addEventListener('click', async () => {
        // TODO: Implement dynamic destination selection
        const result = await gameController.handleAction('travel', { destination: 'Bank' });
        logMessage(result.message);
        updateUI();
    });

    btnTakeCourse.addEventListener('click', async () => {
        // TODO: Implement dynamic course selection
        const result = await gameController.handleAction('takeCourse', { courseId: 'basicProgramming' });
        logMessage(result.message);
        updateUI();
    });

    btnBuyItem.addEventListener('click', async () => {
        // TODO: Implement dynamic item selection
        const result = await gameController.handleAction('buyItem', { itemName: 'coffee' });
        logMessage(result.message);
        updateUI();
    });

    btnDeposit.addEventListener('click', async () => {
        // TODO: Implement dynamic amount input
        const result = await gameController.handleAction('deposit', { amount: 100 });
        logMessage(result.message);
        updateUI();
    });

    btnWithdraw.addEventListener('click', async () => {
        // TODO: Implement dynamic amount input
        const result = await gameController.handleAction('withdraw', { amount: 50 });
        logMessage(result.message);
        updateUI();
    });

    btnTakeLoan.addEventListener('click', async () => {
        // TODO: Implement dynamic amount input
        const result = await gameController.handleAction('takeLoan', { amount: 500 });
        logMessage(result.message);
        updateUI();
    });

    btnRepayLoan.addEventListener('click', async () => {
        // TODO: Implement dynamic amount input
        const result = await gameController.handleAction('repayLoan', { amount: 100 });
        logMessage(result.message);
        updateUI();
    });
});
