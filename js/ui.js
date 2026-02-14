import EventBus from './EventBus.js';
// --- 1. IMPORT GAME DATA TO USE FOR LOOKUPS ---
import { JOBS, COURSES } from './game/gameData.js';
import ClockVisualization from './ui/ClockVisualization.js';

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
    this.player1Panel = document.getElementById('player-1');

    // Player 2
    this.p2Cash = document.getElementById('p2-cash');
    this.p2Savings = document.getElementById('p2-savings');
    this.p2Loan = document.getElementById('p2-loan');
    this.p2Happiness = document.getElementById('p2-happiness');
    this.p2Education = document.getElementById('p2-education');
    this.p2Career = document.getElementById('p2-career');
    this.p2Car = document.getElementById('p2-car');
    this.p2Time = document.getElementById('p2-time');
    this.player2Panel = document.getElementById('player-2');

    // Game Info
    this.currentLocation = document.getElementById('current-location');
    this.gameTurn = document.getElementById('game-turn');
    this.locationHint = document.getElementById('location-hint');

    // Log
    this.logContent = document.querySelector('.log-content');
    this.eventLog = document.querySelector('.event-log');
    this.logToggleBtn = document.getElementById('log-toggle-btn');
    this.logToggleIcon = document.querySelector('.log-toggle-icon');

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

    // --- MOBILE STATS BAR ELEMENTS ---
    this.mobileStatP1 = document.getElementById('mobile-stat-p1');
    this.mobileStatP2 = document.getElementById('mobile-stat-p2');
    this.mobileP1Cash = document.getElementById('mobile-p1-cash');
    this.mobileP1Savings = document.getElementById('mobile-p1-savings');
    this.mobileP1Loan = document.getElementById('mobile-p1-loan');
    this.mobileP1Happiness = document.getElementById('mobile-p1-happiness');
    this.mobileP1Time = document.getElementById('mobile-p1-time');
    this.mobileP2Cash = document.getElementById('mobile-p2-cash');
    this.mobileP2Savings = document.getElementById('mobile-p2-savings');
    this.mobileP2Loan = document.getElementById('mobile-p2-loan');
    this.mobileP2Happiness = document.getElementById('mobile-p2-happiness');
    this.mobileP2Time = document.getElementById('mobile-p2-time');

    // --- PLAYER STATS MODAL ELEMENTS ---
    this.playerStatsModalOverlay = document.getElementById('player-stats-modal-overlay');
    this.playerStatsModal = document.getElementById('player-stats-modal');
    this.playerStatsModalTitle = document.getElementById('player-stats-modal-title');
    this.playerStatsModalClose = document.getElementById('player-stats-modal-close');
    this.modalCash = document.getElementById('modal-cash');
    this.modalSavings = document.getElementById('modal-savings');
    this.modalLoan = document.getElementById('modal-loan');
    this.modalHappiness = document.getElementById('modal-happiness');
    this.modalEducation = document.getElementById('modal-education');
    this.modalCareer = document.getElementById('modal-career');
    this.modalCar = document.getElementById('modal-car');
    this.modalTime = document.getElementById('modal-time');

    // --- GAME LOG MODAL ELEMENTS ---
    this.gameLogModalOverlay = document.getElementById('game-log-modal-overlay');
    this.gameLogModal = document.getElementById('game-log-modal');
    this.gameLogModalClose = document.getElementById('game-log-modal-close');
    this.gameLogModalEntries = document.getElementById('game-log-modal-entries');

    // --- LOADING OVERLAY ---
    this.loadingOverlay = document.getElementById('loading-overlay');
    EventBus.subscribe('aiThinkingStart', () => this.showLoading());
    EventBus.subscribe('aiThinkingEnd',   () => this.hideLoading());

    EventBus.subscribe('stateChanged', (gameState) => {
      this.render(gameState);
    });

    // Add event listener for the cancel button
    this.modalCancel.addEventListener('click', () => this.hideModal()); // NEW
    
    // Add event listeners for player stats modal
    this.playerStatsModalClose.addEventListener('click', () => this.hidePlayerStatsModal());
    this.playerStatsModalOverlay.addEventListener('click', (e) => {
      if (e.target === this.playerStatsModalOverlay) {
        this.hidePlayerStatsModal();
      }
    });
    
    // Add swipe-down functionality for mobile
    this.addSwipeToClose(this.playerStatsModal);
    
    // Add click listeners to mobile stat cards
    this.mobileStatP1.addEventListener('click', () => this.showPlayerStatsModal(1));
    this.mobileStatP2.addEventListener('click', () => this.showPlayerStatsModal(2));
    
    // Subscribe to log icon click event
    EventBus.subscribe('logIconClicked', () => {
      this.scrollToLog();
      EventBus.publish('logOpened');
    });
    
    // Subscribe to add to log event from EventNotificationManager
    EventBus.subscribe('addToLog', (event) => {
      // This event is already handled by the regular log update in render()
      // We just need to ensure the state is updated
      if (window.gameController) {
        window.gameController.gameState.publishCurrentState();
      }
    });
    
    // Add click listener to event log to publish logOpened event
    if (this.eventLog) {
        this.eventLog.addEventListener('click', () => {
            EventBus.publish('logOpened');
        });
    }
    
    // Add click listener for log toggle button
    if (this.logToggleBtn) {
        this.logToggleBtn.addEventListener('click', () => {
            this.toggleLogVisibility();
        });
    }
    
    // Add event listeners for game log modal
    this.gameLogModalClose.addEventListener('click', () => this.hideGameLogModal());
    this.gameLogModalOverlay.addEventListener('click', (e) => {
      if (e.target === this.gameLogModalOverlay) {
        this.hideGameLogModal();
      }
    });
    
    // Add swipe-down functionality for mobile game log modal
    this.addSwipeToClose(this.gameLogModal);
    
    // Initialize ClockVisualization components
    this.p1ClockVisualization = null;
    this.p2ClockVisualization = null;
    this.mobileP1ClockVisualization = null;
    this.mobileP2ClockVisualization = null;
    
    // Initialize clock visualizations after DOM is ready
    this.initializeClockVisualizations();
  }

  initializeClockVisualizations() {
    // Initialize desktop clock visualizations
    if (this.p1Time) {
      this.p1ClockVisualization = new ClockVisualization('p1-time', {
        size: 50,
        strokeWidth: 6,
        backgroundColor: 'rgba(255, 0, 255, 0.2)',
        foregroundColor: '#FF00FF',
        textColor: '#FFFFFF',
        fontSize: '12px'
      });
    }
    
    if (this.p2Time) {
      this.p2ClockVisualization = new ClockVisualization('p2-time', {
        size: 50,
        strokeWidth: 6,
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        foregroundColor: '#00FFFF',
        textColor: '#FFFFFF',
        fontSize: '12px'
      });
    }
    
    // Initialize mobile clock visualizations
    if (this.mobileP1Time) {
      this.mobileP1ClockVisualization = new ClockVisualization('mobile-p1-time', {
        size: 40,
        strokeWidth: 4,
        backgroundColor: 'rgba(255, 0, 255, 0.2)',
        foregroundColor: '#FF00FF',
        textColor: '#FFFFFF',
        fontSize: '10px'
      });
    }
    
    if (this.mobileP2Time) {
      this.mobileP2ClockVisualization = new ClockVisualization('mobile-p2-time', {
        size: 40,
        strokeWidth: 4,
        backgroundColor: 'rgba(0, 255, 255, 0.2)',
        foregroundColor: '#00FFFF',
        textColor: '#FFFFFF',
        fontSize: '10px'
      });
    }
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
      button.classList.add('btn', 'btn-primary');
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

  // --- NEW: Method to show job application modal ---
  showJobApplicationModal() {
    this.modalTitle.textContent = 'Apply for a Job';
    this.modalContent.innerHTML = ''; // Clear previous content
    this.modalButtons.innerHTML = ''; // Clear previous buttons
    this.modalInput.classList.add('hidden'); // Hide input field

    // Create job list content
    const jobList = document.createElement('div');
    jobList.className = 'job-list';
    
    JOBS.forEach(job => {
      const jobItem = document.createElement('div');
      jobItem.className = 'job-item';
      
      const jobTitle = document.createElement('div');
      jobTitle.className = 'job-title';
      jobTitle.textContent = job.title;
      
      const jobDetails = document.createElement('div');
      jobDetails.className = 'job-details';
      jobDetails.innerHTML = `
        <div>Wage: $${job.wage}/hour</div>
        <div>Shift: ${job.shiftHours} hours</div>
        <div>Education Required: Level ${job.educationRequired}</div>
      `;
      
      jobItem.appendChild(jobTitle);
      jobItem.appendChild(jobDetails);
      
      // Add apply button for each job
      const applyButton = document.createElement('button');
      applyButton.classList.add('btn', 'btn-primary', 'job-apply-btn');
      applyButton.textContent = 'Apply';
      applyButton.onclick = () => {
        this.hideModal();
        // Call the controller method with the job level parameter
        if (window.gameController) {
          window.gameController.applyForJob(job.level);
        }
      };
      
      jobItem.appendChild(applyButton);
      jobList.appendChild(jobItem);
    });
    
    this.modalContent.appendChild(jobList);

    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('btn', 'btn-secondary');
    cancelButton.onclick = () => this.hideModal();
    this.modalButtons.appendChild(cancelButton);

    this.modalOverlay.classList.remove('hidden');
  }

  // --- NEW: Player Stats Modal Methods ---
  showPlayerStatsModal(playerIndex) {
    // Get current game state to populate the modal
    const gameState = window.gameController ? window.gameController.gameState : null;
    if (!gameState || !gameState.players[playerIndex - 1]) return;
    
    const player = gameState.players[playerIndex - 1];
    
    // Set the modal title based on player
    this.playerStatsModalTitle.textContent = playerIndex === 1 ? 'Your Stats' : 'AI Stats';
    
    // Set the player-specific color theme
    this.playerStatsModal.className = playerIndex === 1 ? 'player-1' : 'player-2';
    
    // Populate the modal with player data
    this.modalCash.textContent = `$${player.cash}`;
    this.modalSavings.textContent = `$${player.savings}`;
    this.modalLoan.textContent = `$${player.loan}`;
    this.modalHappiness.textContent = player.happiness;
    
    // Get education and career information
    const course = JOBS.find(c => c.educationMilestone === player.educationLevel);
    this.modalEducation.textContent = course ? course.name : 'None';
    
    const job = JOBS.find(j => j.level === player.careerLevel);
    this.modalCareer.textContent = job ? job.title : 'Unemployed';
    
    this.modalCar.textContent = player.hasCar ? 'Yes' : 'No';
    this.modalTime.textContent = `${player.time} hours`;
    
    // Show the modal
    this.playerStatsModalOverlay.classList.remove('hidden');
    
    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden';
  }
  
  hidePlayerStatsModal() {
    this.playerStatsModalOverlay.classList.add('hidden');
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
  
  // Add swipe-to-close functionality for mobile modals
  addSwipeToClose(modalElement) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    const handleTouchStart = (e) => {
      // Only start tracking if touch is near the top of the modal
      const touch = e.touches[0];
      const rect = modalElement.getBoundingClientRect();
      
      // Check if touch is in the top 25% of the modal
      if (touch.clientY - rect.top < rect.height * 0.25) {
        startY = touch.clientY;
        isDragging = true;
        modalElement.style.transition = 'none';
      }
    };
    
    const handleTouchMove = (e) => {
      if (!isDragging) return;
      
      currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      // Only allow downward swipe
      if (deltaY > 0) {
        // Apply transform to create the swipe effect
        modalElement.style.transform = `translateY(${deltaY}px)`;
        
        // Add opacity based on swipe distance
        const opacity = Math.max(0, 1 - (deltaY / window.innerHeight));
        this.playerStatsModalOverlay.style.backgroundColor = `rgba(0, 0, 0, ${0.8 * opacity})`;
      }
    };
    
    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      isDragging = false;
      const deltaY = currentY - startY;
      const threshold = window.innerHeight * 0.3; // 30% of screen height
      
      // Reset transition
      modalElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      
      if (deltaY > threshold) {
        // If swiped far enough, close the modal
        modalElement.style.transform = `translateY(100%)`;
        modalElement.style.opacity = '0';
        
        setTimeout(() => {
          this.hidePlayerStatsModal();
          // Reset styles after closing
          modalElement.style.transform = '';
          modalElement.style.opacity = '';
          this.playerStatsModalOverlay.style.backgroundColor = '';
        }, 300);
      } else {
        // If not swiped far enough, snap back
        modalElement.style.transform = '';
        this.playerStatsModalOverlay.style.backgroundColor = '';
      }
    };
    
    // Add touch event listeners
    modalElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    modalElement.addEventListener('touchend', handleTouchEnd, { passive: true });
  }
  
  // Method to scroll to the log
  scrollToLog() {
    if (this.eventLog) {
      this.eventLog.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
  
  // Method to toggle log visibility
  toggleLogVisibility() {
    if (this.eventLog) {
      const isCollapsed = this.eventLog.classList.contains('collapsed');
      
      if (isCollapsed) {
        // On mobile, show the modal instead of expanding inline
        if (window.innerWidth <= 768) {
          this.showGameLogModal();
        } else {
          // Expand the log on desktop
          this.eventLog.classList.remove('collapsed');
          this.logToggleIcon.textContent = '▼';
        }
      } else {
        // Collapse the log
        this.eventLog.classList.add('collapsed');
        this.logToggleIcon.textContent = '▲';
      }
    }
  }
  
  // --- NEW: Game Log Modal Methods ---
  showGameLogModal() {
    // Get current game state to populate the modal
    const gameState = window.gameController ? window.gameController.gameState : null;
    if (!gameState) return;
    
    // Clear existing content
    this.gameLogModalEntries.innerHTML = '';
    
    // Get only the log entries from the last player turn and last AI turn
    const recentLogEntries = this.getRecentLogEntries(gameState);
    
    // Populate the modal with recent log entries
    recentLogEntries.forEach(message => {
      const p = document.createElement('p');
      // Handle both old string format and new object format
      if (typeof message === 'string') {
        p.textContent = message;
      } else {
        p.textContent = message.text;
        p.classList.add(`log-${message.category}`);
      }
      this.gameLogModalEntries.appendChild(p);
    });
    
    // Show the modal
    this.gameLogModalOverlay.classList.remove('hidden');
    
    // Prevent body scroll on mobile
    document.body.style.overflow = 'hidden';
    
    // Publish logOpened event to clear notification badge
    EventBus.publish('logOpened');
  }
  
  // Helper method to get log entries from the last player turn and last AI turn
  getRecentLogEntries(gameState) {
    if (!gameState.log || gameState.log.length === 0) return [];
    
    // Find the indices of turn boundaries in the log
    const turnBoundaries = [];
    
    // Look for turn end messages to identify turn boundaries
    for (let i = 0; i < gameState.log.length; i++) {
      const message = gameState.log[i];
      const text = typeof message === 'string' ? message : message.text;
      
      // Check if this message indicates the end of a turn
      if (text.includes('returned home.') || text.includes('paid $50 for daily expenses.')) {
        turnBoundaries.push(i);
      }
    }
    
    // If we have at least 2 turn boundaries, get entries from the last two turns
    if (turnBoundaries.length >= 2) {
      const lastTurnStart = turnBoundaries[turnBoundaries.length - 2];
      return gameState.log.slice(0, lastTurnStart);
    }
    
    // If we have only one turn boundary, get entries from the current turn
    if (turnBoundaries.length === 1) {
      const lastTurnStart = turnBoundaries[0];
      return gameState.log.slice(0, lastTurnStart);
    }
    
    // If no turn boundaries found, return all entries (fallback)
    return gameState.log;
  }
  
  hideGameLogModal() {
    this.gameLogModalOverlay.classList.add('hidden');
    
    // Restore body scroll
    document.body.style.overflow = '';
  }

  // --- NEW: Loading handlers ---
// Show the loading overlay and disable action buttons
showLoading() {
  this.loadingOverlay.classList.remove('hidden');
  this.actionButtons.forEach(btn => btn.disabled = true);
  // Mobile fix: Prevent body scroll
  document.body.classList.add('loading-active');
}

// Hide the loading overlay and re-enable action buttons
hideLoading() {
  this.loadingOverlay.classList.add('hidden');
  this.actionButtons.forEach(btn => btn.disabled = false);
  // Mobile fix: Re-enable body scroll
  document.body.classList.remove('loading-active');
}

  render(gameState) {
    // Get player data at the beginning to avoid initialization issues
    const player1 = gameState.players[0];
    const player2 = gameState.players.length > 1 ? gameState.players[1] : null;
    
    // --- START: ACTIVE PLAYER HIGHLIGHT ---
    this.player1Panel.classList.remove('active');
    this.player2Panel.classList.remove('active');
    if (gameState.currentPlayerIndex === 0) {
      this.player1Panel.classList.add('active');
    } else {
      this.player2Panel.classList.add('active');
    }
    // --- END: ACTIVE PLAYER HIGHLIGHT ---

    // --- MOBILE STATS UPDATE ---
    // Update mobile stats bar (only visible on mobile)
    if (this.mobileP1Cash) {
        // Update Player 1 mobile stats
        this.mobileP1Cash.textContent = `$${player1.cash}`;
        this.mobileP1Savings.textContent = `$${player1.savings}`;
        this.mobileP1Loan.textContent = `$${player1.loan}`;
        this.mobileP1Happiness.textContent = player1.happiness;
        if (this.mobileP1ClockVisualization) {
          this.mobileP1ClockVisualization.updateTime(player1.time);
        } else {
          this.mobileP1Time.textContent = `${player1.time}h`;
        }
        
        // Update active state for mobile
        if (this.mobileStatP1) {
            if (gameState.currentPlayerIndex === 0) {
                this.mobileStatP1.classList.add('active');
            } else {
                this.mobileStatP1.classList.remove('active');
            }
        }
    }

    // Update Player 2 mobile stats
    if (this.mobileP2Cash && player2) {
        this.mobileP2Cash.textContent = `$${player2.cash}`;
        this.mobileP2Savings.textContent = `$${player2.savings}`;
        this.mobileP2Loan.textContent = `$${player2.loan}`;
        this.mobileP2Happiness.textContent = player2.happiness;
        if (this.mobileP2ClockVisualization) {
          this.mobileP2ClockVisualization.updateTime(player2.time);
        } else {
          this.mobileP2Time.textContent = `${player2.time}h`;
        }
        
        // Update active state for mobile
        if (this.mobileStatP2) {
            if (gameState.currentPlayerIndex === 1) {
                this.mobileStatP2.classList.add('active');
            } else {
                this.mobileStatP2.classList.remove('active');
            }
        }
    }
    // --- END MOBILE STATS UPDATE ---

    // Player 1
    this.p1Cash.textContent = `$${player1.cash}`;
    this.p1Savings.textContent = `$${player1.savings}`;
    this.p1Loan.textContent = `$${player1.loan}`;
    this.p1Happiness.textContent = player1.happiness;
    const p1Course = COURSES.find(c => c.educationMilestone === player1.educationLevel);
    this.p1Education.textContent = p1Course ? p1Course.name : 'None';
    const p1Job = JOBS.find(j => j.level === player1.careerLevel);
    this.p1Career.textContent = p1Job ? p1Job.title : 'Unemployed';
    this.p1Car.textContent = player1.hasCar ? 'Yes' : 'No';
    if (this.p1ClockVisualization) {
      this.p1ClockVisualization.updateTime(player1.time);
    } else {
      this.p1Time.textContent = `${player1.time} hours`;
    }

    // Player 2
    if (player2) {
        this.p2Cash.textContent = `$${player2.cash}`;
        this.p2Savings.textContent = `$${player2.savings}`;
        this.p2Loan.textContent = `$${player2.loan}`;
        this.p2Happiness.textContent = player2.happiness;
        const p2Course = COURSES.find(c => c.educationMilestone === player2.educationLevel);
        this.p2Education.textContent = p2Course ? p2Course.name : 'None';
        const p2Job = JOBS.find(j => j.level === player2.careerLevel);
        this.p2Career.textContent = p2Job ? p2Job.title : 'Unemployed';
        this.p2Car.textContent = player2.hasCar ? 'Yes' : 'No';
        if (this.p2ClockVisualization) {
          this.p2ClockVisualization.updateTime(player2.time);
        } else {
          this.p2Time.textContent = `${player2.time} hours`;
        }
    }

    // Game Info
    const currentPlayer = gameState.getCurrentPlayer();
    this.currentLocation.textContent = currentPlayer.location;
    this.gameTurn.textContent = gameState.turn;
    
    // Update location hint with count of available actions
    this.updateLocationHint(currentPlayer.location);

    // Game Log
    this.logContent.innerHTML = ''; // Clear the log first
    
    // Get only the log entries from the last player turn and last AI turn
    const recentLogEntries = this.getRecentLogEntries(gameState);
    
    recentLogEntries.forEach(message => {
      const p = document.createElement('p');
      // Handle both old string format and new object format
      if (typeof message === 'string') {
        p.textContent = message;
      } else {
        p.textContent = message.text;
        p.classList.add(`log-${message.category}`);
      }
      this.logContent.appendChild(p);
    });

    // Action Buttons Visibility
    this.actionButtons.forEach(button => {
        // Remove location-specific class from all buttons first
        button.classList.remove('location-specific');
        
        if(button.dataset.action !== 'restEndTurn') { // restEndTurn is always visible
            button.classList.add('hidden');
        }
    });

    document.querySelector('[data-action="travel"]').classList.remove('hidden');

    switch (currentPlayer.location) {
    case 'Employment Agency':
        document.querySelector('[data-action="workShift"]').classList.remove('hidden');
        document.querySelector('[data-action="workShift"]').classList.add('location-specific');
        document.querySelector('[data-action="applyForJob"]').classList.remove('hidden');
        document.querySelector('[data-action="applyForJob"]').classList.add('location-specific');
        break;
        case 'Community College':
            document.querySelector('[data-action="takeCourse"]').classList.remove('hidden');
            document.querySelector('[data-action="takeCourse"]').classList.add('location-specific');
            break;
        case 'Shopping Mall':
            document.querySelector('[data-action="buyItem"]').classList.remove('hidden');
            document.querySelector('[data-action="buyItem"]').classList.add('location-specific');
            break;
        case 'Used Car Lot':
            document.querySelector('[data-action="buyCar"]').classList.remove('hidden');
            document.querySelector('[data-action="buyCar"]').classList.add('location-specific');
            break;
        case 'Bank':
            document.querySelector('[data-action="deposit"]').classList.remove('hidden');
            document.querySelector('[data-action="deposit"]').classList.add('location-specific');
            document.querySelector('[data-action="withdraw"]').classList.remove('hidden');
            document.querySelector('[data-action="withdraw"]').classList.add('location-specific');
            document.querySelector('[data-action="takeLoan"]').classList.remove('hidden');
            document.querySelector('[data-action="takeLoan"]').classList.add('location-specific');
            document.querySelector('[data-action="repayLoan"]').classList.remove('hidden');
            document.querySelector('[data-action="repayLoan"]').classList.add('location-specific');
            break;
    }
  }
  
  // Method to update location hint based on available actions
  updateLocationHint(location) {
    let hintText = '';
    
    switch (location) {
        case 'Home':
            hintText = 'Rest and end your turn here';
            break;
        case 'Employment Agency':
            hintText = 'Find work and earn money';
            break;
        case 'Community College':
            hintText = 'Improve your education for better jobs';
            break;
        case 'Shopping Mall':
            hintText = 'Buy items to boost your happiness';
            break;
        case 'Used Car Lot':
            hintText = 'Purchase a car for faster travel';
            break;
        case 'Bank':
            hintText = 'Manage your finances: deposit, withdraw, or take a loan';
            break;
        default:
            hintText = 'Travel to other locations';
    }
    
    this.locationHint.textContent = hintText;
  }
}

export default GameView;
