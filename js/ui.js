import EventBus from './EventBus.js';
// --- 1. IMPORT GAME DATA TO USE FOR LOOKUPS ---
import { JOBS, COURSES } from './game/gameData.js';

class GameView {
  constructor() {

    // Player 1
    this.p1Cash = document.getElementById('p1-cash');
    this.p1Savings = document.getElementById('p1-savings');
    this.p1Loan = document.getElementById('p1-loan');
    this.p1Happiness = document.getElementById('p1-happiness');
    this.p1Education = document.getElementById('p1-education');
    this.p1Career = document.getElementById('p1-career');
    this.p1Car = document.getElementById('p1-car');
    this.p1Time = document.getElementById('p1-time');

    // Player 2
    this.p2Cash = document.getElementById('p2-cash');
    this.p2Savings = document.getElementById('p2-savings');
    this.p2Loan = document.getElementById('p2-loan');
    this.p2Happiness = document.getElementById('p2-happiness');
    this.p2Education = document.getElementById('p2-education');
    this.p2Career = document.getElementById('p2-career');
    this.p2Car = document.getElementById('p2-car');
    this.p2Time = document.getElementById('p2-time');

    // Game Info
    this.currentLocation = document.getElementById('current-location');
    this.gameTurn = document.getElementById('game-turn');

    // Log
    this.logContent = document.querySelector('.log-content');

    // Action Buttons
    this.actionButtons = document.querySelectorAll('[data-action]');

    // --- NEW: Modal Element Caching ---
    this.modalOverlay = document.getElementById('choice-modal-overlay');
    this.modalTitle = document.getElementById('choice-modal-title');
    this.modalContent = document.getElementById('choice-modal-content');
    this.modalInput = document.getElementById('choice-modal-input');
    this.modalInputField = document.getElementById('modal-input-amount');
    this.modalButtons = document.getElementById('choice-modal-buttons');
    this.modalCancel = document.getElementById('modal-cancel-button');

    EventBus.subscribe('stateChanged', (gameState) => {
      this.render(gameState);
    });

    // Add event listener for the cancel button
    this.modalCancel.addEventListener('click', () => this.hideModal()); // NEW
  }

  // --- NEW: Method to show a generic choice modal ---
  showChoiceModal({ title, choices, showInput = false }) {
    this.modalTitle.textContent = title;
    this.modalContent.innerHTML = ''; // Clear previous content
    this.modalButtons.innerHTML = ''; // Clear previous buttons

    if (showInput) {
      this.modalInput.classList.remove('hidden');
      this.modalInputField.value = ''; // Clear input field
    } else {
      this.modalInput.classList.add('hidden');
    }

    choices.forEach(choice => {
      const button = document.createElement('button');
      button.textContent = choice.text;
      // Use a callback to link button click to a controller action
      button.onclick = () => {
        const amount = showInput ? parseInt(this.modalInputField.value, 10) : null;
        this.hideModal();
        // Call the action with the chosen value (and amount if applicable)
        choice.action(choice.value, amount); 
      };
      this.modalButtons.appendChild(button);
    });

    this.modalOverlay.classList.remove('hidden');
  }

  // --- NEW: Method to hide the modal ---
  hideModal() {
    this.modalOverlay.classList.add('hidden');
  }

  render(gameState) {
    // Player 1
    const player1 = gameState.players[0];
    this.p1Cash.textContent = `$${player1.cash}`;
    this.p1Savings.textContent = `$${player1.savings}`;
    this.p1Loan.textContent = `$${player1.loan}`;
    this.p1Happiness.textContent = player1.happiness;
    const p1Course = COURSES.find(c => c.educationMilestone === player1.educationLevel);
    this.p1Education.textContent = p1Course ? p1Course.name : 'None';
    const p1Job = JOBS.find(j => j.level === player1.careerLevel);
    this.p1Career.textContent = p1Job ? p1Job.title : 'Unemployed';
    this.p1Car.textContent = player1.hasCar ? 'Yes' : 'No';
    this.p1Time.textContent = `${player1.time} hours`;

    // Player 2
    if (gameState.players.length > 1) {
        const player2 = gameState.players[1];
        this.p2Cash.textContent = `$${player2.cash}`;
        this.p2Savings.textContent = `$${player2.savings}`;
        this.p2Loan.textContent = `$${player2.loan}`;
        this.p2Happiness.textContent = player2.happiness;
        const p2Course = COURSES.find(c => c.educationMilestone === player2.educationLevel);
        this.p2Education.textContent = p2Course ? p2Course.name : 'None';
        const p2Job = JOBS.find(j => j.level === player2.careerLevel);
        this.p2Career.textContent = p2Job ? p2Job.title : 'Unemployed';
        this.p2Car.textContent = player2.hasCar ? 'Yes' : 'No';
        this.p2Time.textContent = `${player2.time} hours`;
    }

    // Game Info
    const currentPlayer = gameState.getCurrentPlayer();
    this.currentLocation.textContent = currentPlayer.location;
    this.gameTurn.textContent = gameState.turn;

    // Game Log
    this.logContent.innerHTML = ''; // Clear the log first
    gameState.log.forEach(message => {
      const p = document.createElement('p');
      p.textContent = message;
      this.logContent.appendChild(p);
    });

    // Action Buttons Visibility
    this.actionButtons.forEach(button => {
        if(button.dataset.action !== 'restEndTurn') { // restEndTurn is always visible
            button.classList.add('hidden');
        }
    });

    document.querySelector('[data-action="travel"]').classList.remove('hidden');

    switch (currentPlayer.location) {
        case 'Employment Agency':
            document.querySelector('[data-action="workShift"]').classList.remove('hidden');
            break;
        case 'Community College':
            document.querySelector('[data-action="takeCourse"]').classList.remove('hidden');
            break;
        case 'Shopping Mall':
            document.querySelector('[data-action="buyItem"]').classList.remove('hidden');
            break;
        case 'Used Car Lot':
            document.querySelector('[data-action="buyCar"]').classList.remove('hidden');
            break;
        case 'Bank':
            document.querySelector('[data-action="deposit"]').classList.remove('hidden');
            document.querySelector('[data-action="withdraw"]').classList.remove('hidden');
            document.querySelector('[data-action="takeLoan"]').classList.remove('hidden');
            document.querySelector('[data-action="repayLoan"]').classList.remove('hidden');
            break;
    }
  }
}

export default GameView;
