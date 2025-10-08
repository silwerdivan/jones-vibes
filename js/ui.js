// js/ui.js

let isInitialRender = true;

function updateValue(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

function updateAndAnimate(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        const oldValue = element.textContent;
        if (oldValue !== String(value)) {
            element.textContent = value;
            element.classList.add('value-changed');
            element.addEventListener('animationend', () => {
                element.classList.remove('value-changed');
            }, { once: true });
        }
    }
}

export function render(gameState) {
    if (!gameState || !gameState.players) {
        console.error("Invalid gameState object provided to render function.");
        return;
    }

    const updateFn = isInitialRender ? updateValue : updateAndAnimate;

    // Update player panels
    gameState.players.forEach((player, index) => {
        const playerPrefix = `#p${index + 1}-`;
        updateFn(`${playerPrefix}cash`, player.cash);
        updateFn(`${playerPrefix}savings`, player.savings);
        updateFn(`${playerPrefix}loan`, player.loan);
        updateFn(`${playerPrefix}happiness`, player.happiness);
        updateFn(`${playerPrefix}education`, player.educationLevel);
        updateFn(`${playerPrefix}career`, player.careerLevel);
        updateFn(`${playerPrefix}car`, player.hasCar ? 'Yes' : 'No');
        updateFn(`${playerPrefix}time`, player.time);

        // Highlight current player
        const panel = document.querySelector(`#player-${index + 1}`);
        if (index === gameState.currentPlayerIndex) {
            panel.classList.remove('active'); // Remove first to ensure re-trigger
            void panel.offsetWidth; // Force reflow
            panel.classList.add('active');
        } else {
            panel.classList.remove('active');
        }
    });

    // Update location info
    updateFn('#current-location', gameState.getCurrentPlayer().location);
    updateFn('#game-turn', gameState.turn);

    // Render event log
    const logContentDiv = document.querySelector('.event-log .log-content');
    const latestLogMessageInState = gameState.log[0];
    const latestLogMessageInDOM = logContentDiv.querySelector('p:first-child')?.textContent;

    if (latestLogMessageInState && latestLogMessageInState !== latestLogMessageInDOM) {
        const p = document.createElement('p');
        p.textContent = latestLogMessageInState;
        logContentDiv.prepend(p);
        
        if (!isInitialRender) {
            p.classList.add('value-changed');
            p.addEventListener('animationend', () => {
                p.classList.remove('value-changed');
            }, { once: true });
        }
    }

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

    // After the first render, all subsequent renders should animate
    if (isInitialRender) {
        isInitialRender = false;
    }
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
