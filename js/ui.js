// js/ui.js

export function render(gameState) {
    if (!gameState || !gameState.players) {
        console.error("Invalid gameState object provided to render function.");
        return;
    }

    // Update player panels
    gameState.players.forEach((player, index) => {
        const playerPanelId = `#p${index + 1}-`;
        document.querySelector(`${playerPanelId}cash`).textContent = player.cash;
        document.querySelector(`${playerPanelId}savings`).textContent = player.savings;
        document.querySelector(`${playerPanelId}loan`).textContent = player.loan;
        document.querySelector(`${playerPanelId}happiness`).textContent = player.happiness;
        document.querySelector(`${playerPanelId}education`).textContent = player.educationLevel;
        document.querySelector(`${playerPanelId}career`).textContent = player.careerLevel;
        document.querySelector(`${playerPanelId}car`).textContent = player.hasCar ? 'Yes' : 'No';
        document.querySelector(`${playerPanelId}time`).textContent = player.time;

        // Highlight current player
        const panel = document.querySelector(`#player${index + 1}-status-panel`);
        if (index === gameState.currentPlayerIndex) {
            panel.classList.add('current-player');
        } else {
            panel.classList.remove('current-player');
        }
    });

    // Update location info
    document.querySelector('#current-location').textContent = gameState.getCurrentPlayer().location;
    document.querySelector('#game-turn').textContent = gameState.turn;

    // Show/hide action buttons based on location
    const currentPlayer = gameState.getCurrentPlayer();
    const locationSpecificButtons = document.querySelectorAll('.location-specific');
    locationSpecificButtons.forEach(button => button.classList.add('hidden')); // Hide all first

    switch (currentPlayer.location) {
        case 'Employment Agency':
            document.querySelector('#btn-work-shift').classList.remove('hidden');
            break;
        case 'Community College':
            document.querySelector('#btn-take-course').classList.remove('hidden');
            break;
        case 'Shopping Mall':
            document.querySelector('#btn-buy-item').classList.remove('hidden');
            break;
        case 'Bank':
            document.querySelector('#btn-deposit').classList.remove('hidden');
            document.querySelector('#btn-withdraw').classList.remove('hidden');
            document.querySelector('#btn-take-loan').classList.remove('hidden');
            document.querySelector('#btn-repay-loan').classList.remove('hidden');
            document.querySelector('#btn-buy-car').classList.remove('hidden');
            break;
        default:
            // No specific buttons for other locations like 'Home' or 'Start'
            break;
    }
    document.querySelector('#btn-travel').classList.remove('hidden'); // Travel is always an option
}

export function showChoiceModal(title, options) {
    return new Promise((resolve, reject) => {
        // Remove any existing modal before creating a new one
        const existingOverlay = document.getElementById('choice-modal-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'choice-modal-overlay';
        
        // Create modal content box
        const modal = document.createElement('div');
        modal.id = 'choice-modal';

        // Add title
        const h2 = document.createElement('h2');
        h2.textContent = title;
        modal.appendChild(h2);

        // Add option buttons
        options.forEach(optionText => {
            const button = document.createElement('button');
            button.textContent = optionText;
            button.addEventListener('click', () => {
                cleanup();
                resolve(optionText);
            });
            modal.appendChild(button);
        });

        // Add Cancel button
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            cleanup();
            reject('User cancelled.');
        });
        modal.appendChild(cancelButton);

        // Cleanup function
        const cleanup = () => {
            document.body.removeChild(overlay);
        };

        // Append to body
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
}

export function showNumberInputModal(title) {
    return new Promise((resolve, reject) => {
        // Remove any existing modal before creating a new one
        const existingOverlay = document.getElementById('choice-modal-overlay'); // Reusing the same overlay ID
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = document.createElement('div');
        overlay.id = 'choice-modal-overlay'; // Reusing the same overlay style

        const modal = document.createElement('div');
        modal.id = 'choice-modal'; // Reusing the same modal style

        const h2 = document.createElement('h2');
        h2.textContent = title;
        modal.appendChild(h2);

        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.placeholder = 'Enter amount';
        modal.appendChild(input);

        const confirmButton = document.createElement('button');
        confirmButton.textContent = 'Confirm';
        confirmButton.addEventListener('click', () => {
            const value = Number(input.value);
            if (input.value && value > 0) {
                cleanup();
                resolve(value);
            } else {
                alert('Please enter a positive number.');
            }
        });
        modal.appendChild(confirmButton);

        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.addEventListener('click', () => {
            cleanup();
            reject('User cancelled.');
        });
        modal.appendChild(cancelButton);

        const cleanup = () => {
            document.body.removeChild(overlay);
        };

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        input.focus();
    });
}
