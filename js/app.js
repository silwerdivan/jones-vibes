import GameController from './game/GameController.js';
import AIController from './game/AIController.js';
import { render, showChoiceModal, showNumberInputModal } from './ui.js';
import { LOCATIONS, SHOPPING_ITEMS } from './game/gameData.js';

// Initialize GameState and GameController
const aiController = new AIController();
export const gameController = new GameController(2, aiController, () => updateUI());

// Function to update the UI
export function updateUI() {
    render(gameController.gameState);

    if (gameController.gameOver) {
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
        await gameController.handleAction('endTurn', {});
        updateUI();
    });

    btnWorkShift.addEventListener('click', async () => {
        await gameController.handleAction('workShift', {});
        updateUI();
    });

    btnBuyCar.addEventListener('click', async () => {
        await gameController.handleAction('buyCar', {});
        updateUI();
    });

    btnTravel.addEventListener('click', async () => {
        try {
            const destination = await showChoiceModal('Travel to...', LOCATIONS);
            await gameController.handleAction('travel', { destination });
            updateUI();
        } catch (error) {
            console.log(`Travel cancelled. ${error}`);
        }
    });

    btnTakeCourse.addEventListener('click', async () => {
        const course = gameController.getNextAvailableCourse();
        if (!course) {
            // This case should be handled by the UI disabling the button, but as a fallback:
            const p = document.createElement('p');
            p.textContent = "No more courses available.";
            document.querySelector('.event-log .log-content').prepend(p);
            return;
        }
        try {
            await showChoiceModal(`Take course: ${course.name}?`, [course.name]);
            await gameController.handleAction('takeCourse', { courseId: course.id });
            updateUI();
        } catch (error) {
            console.log(`Course selection cancelled. ${error}`);
        }
    });

    btnBuyItem.addEventListener('click', async () => {
        const itemNames = SHOPPING_ITEMS.map(item => item.name);
        try {
            const itemName = await showChoiceModal('Buy an Item', itemNames);
            await gameController.handleAction('buyItem', { itemName });
            updateUI();
        } catch (error) {
            console.log(`Purchase cancelled. ${error}`);
        }
    });

    btnDeposit.addEventListener('click', async () => {
        try {
            const amount = await showNumberInputModal('Enter amount to deposit:');
            await gameController.handleAction('deposit', { amount });
            updateUI();
        } catch (error) {
            console.log('Action cancelled.');
        }
    });

    btnWithdraw.addEventListener('click', async () => {
        try {
            const amount = await showNumberInputModal('Enter amount to withdraw:');
            await gameController.handleAction('withdraw', { amount });
            updateUI();
        } catch (error) {
            console.log('Action cancelled.');
        }
    });

    btnTakeLoan.addEventListener('click', async () => {
        try {
            const amount = await showNumberInputModal('Enter amount to take loan:');
            await gameController.handleAction('takeLoan', { amount });
            updateUI();
        } catch (error) {
            console.log('Action cancelled.');
        }
    });

    btnRepayLoan.addEventListener('click', async () => {
        try {
            const amount = await showNumberInputModal('Enter amount to repay loan:');
            await gameController.handleAction('repayLoan', { amount });
            updateUI();
        } catch (error) {
            console.log('Action cancelled.');
        }
    });
});
