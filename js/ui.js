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