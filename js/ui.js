import EventBus from './EventBus.js';
// --- 1. IMPORT GAME DATA TO USE FOR LOOKUPS ---
import { JOBS, COURSES, LOCATIONS, CLERKS, SHOPPING_ITEMS } from './game/gameData.js';
import ClockVisualization from './ui/ClockVisualization.js';
import Icons from './ui/Icons.js';

class GameView {
  constructor() {
    // Screens
    this.screens = document.querySelectorAll('.screen');
    
    // Tabs
    this.tabItems = document.querySelectorAll('.tab-item');
    this.currentScreenId = 'city';

    // Bento Grid
    this.cityBentoGrid = document.getElementById('city-bento-grid');
    this.fabNextWeek = document.getElementById('fab-next-week');

    // HUD elements
    this.hudCash = document.getElementById('hud-cash');
    this.hudWeek = document.getElementById('hud-week');
    this.hudLocation = document.getElementById('hud-location');
    
    // Command-Orb Elements
    this.orbP1 = document.getElementById('orb-p1');
    this.orbP2 = document.getElementById('orb-p2');
    this.hudAvatarP1 = document.getElementById('hud-avatar-p1');
    this.hudAvatarP2 = document.getElementById('hud-avatar-p2');

    // News Ticker
    this.newsTickerContent = document.getElementById('news-ticker-content');

    // Log (legacy, now using Intel Terminal)
    this.logContent = document.querySelector('.log-content');
    this.eventLog = document.querySelector('.event-log');

    // Contextual Action Tray
    this.actionTray = document.getElementById('contextual-action-tray');
    this.trayIcon = document.getElementById('tray-icon');
    this.trayLocationName = document.getElementById('tray-location-name');
    this.trayActions = document.getElementById('tray-actions');

    // Location Hint (Repurposed for tray or hidden if unused)
    this.locationHint = document.getElementById('location-hint');

    // --- Modal Element Caching ---
    this.modalOverlay = document.getElementById('choice-modal-overlay');
    this.modalTitle = document.getElementById('choice-modal-title');
    this.modalContent = document.getElementById('choice-modal-content');
    this.modalInput = document.getElementById('choice-modal-input');
    this.modalInputField = document.getElementById('modal-input-amount');
    this.modalButtons = document.getElementById('choice-modal-buttons');
    this.modalCancel = document.getElementById('modal-cancel-button');

    // --- Clerk Element Caching ---
    this.modalClerkContainer = document.getElementById('modal-clerk-container');
    this.modalClerkAvatar = document.getElementById('modal-clerk-avatar');
    this.modalClerkName = document.getElementById('modal-clerk-name');
    this.modalClerkMessage = document.getElementById('modal-clerk-message');

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

    // --- PHASE 4: NEW ELEMENTS ---
    this.lifeAvatar = document.getElementById('life-avatar');
    this.statusChips = document.getElementById('status-chips');
    this.essentialsGrid = document.getElementById('essentials-grid');
    this.assetsGrid = document.getElementById('assets-grid');

    // --- INTEL TERMINAL ELEMENTS ---
    this.intelTerminalOverlay = document.getElementById('intel-terminal-overlay');
    this.terminalTrigger = document.getElementById('hud-terminal-trigger');
    this.terminalBadge = document.getElementById('terminal-badge');
    this.terminalEntries = document.getElementById('terminal-entries');
    this.terminalClose = document.getElementById('intel-terminal-close');
    this.unreadEvents = 0;

    // --- Turn Summary Elements ---
    this.turnSummaryModal = document.getElementById('turn-summary-modal');
    this.eventList = document.getElementById('event-list');
    this.summarySubtitle = document.getElementById('summary-subtitle');
    this.summaryCashTotal = document.getElementById('summary-cash-total');
    this.summaryHappinessTotal = document.getElementById('summary-happiness-total');
    this.btnStartNextWeek = document.getElementById('btn-start-next-week');

    // --- LOADING OVERLAY ---
    this.loadingOverlay = document.getElementById('loading-overlay');
    EventBus.subscribe('aiThinkingStart', () => this.showLoading());
    EventBus.subscribe('aiThinkingEnd',   () => this.hideLoading());

    EventBus.subscribe('stateChanged', (gameState) => {
      this.render(gameState);
    });

    // Listen for turn ended to show summary
    EventBus.subscribe('turnEnded', (summary) => {
      this.showTurnSummary(summary);
    });

    // Add event listener for the cancel button
    if (this.modalCancel) this.modalCancel.addEventListener('click', () => this.hideModal());
    
    // Add event listeners for player stats modal
    if (this.playerStatsModalClose) this.playerStatsModalClose.addEventListener('click', () => this.hidePlayerStatsModal());
    if (this.playerStatsModalOverlay) {
      this.playerStatsModalOverlay.addEventListener('click', (e) => {
        if (e.target === this.playerStatsModalOverlay) {
          this.hidePlayerStatsModal();
        }
      });
    }
    
    // Add swipe-down functionality for mobile
    if (this.playerStatsModal) this.addSwipeToClose(this.playerStatsModal);
    
    // Command-Orb click listeners
    if (this.orbP1) this.orbP1.addEventListener('click', () => this.showPlayerStatsModal(1));
    if (this.orbP2) this.orbP2.addEventListener('click', () => this.showPlayerStatsModal(2));
    
    // Listen for game events to update unread count
    EventBus.subscribe('gameEvent', (event) => {
      this.unreadEvents++;
      this.updateTerminalBadge();
    });

    // Add click listener for terminal trigger
    if (this.terminalTrigger) {
      this.terminalTrigger.addEventListener('click', () => this.showIntelTerminal());
    }

    // Add click listener for terminal close
    if (this.terminalClose) {
      this.terminalClose.addEventListener('click', () => this.hideIntelTerminal());
    }

    if (this.intelTerminalOverlay) {
      this.intelTerminalOverlay.addEventListener('click', (e) => {
        if (e.target === this.intelTerminalOverlay) this.hideIntelTerminal();
      });
    }

    // Subscribe to log icon click event
    EventBus.subscribe('logIconClicked', () => {
      this.showIntelTerminal();
    });
    
    // Subscribe to add to log event from EventNotificationManager
    EventBus.subscribe('addToLog', (event) => {
      if (window.gameController) {
        window.gameController.gameState.publishCurrentState();
      }
    });
    
    // Add click listener for Next Week FAB
    if (this.fabNextWeek) {
        this.fabNextWeek.addEventListener('click', () => {
            if (window.gameController) {
                window.gameController.restEndTurn();
            }
        });
    }
    
    // Initialize Screen Switching
    this.initializeScreenSwitching();

    // Initialize HUD clock visualizations
    this.hudClockVisualizationP1 = null;
    this.hudClockVisualizationP2 = null;
    
    this.initializeClockVisualizations();
    this.lastPlayerIndex = -1;
  }

  updateTerminalBadge() {
    if (this.terminalBadge) {
      if (this.unreadEvents > 0) {
        this.terminalBadge.textContent = this.unreadEvents > 99 ? '99+' : this.unreadEvents;
        this.terminalBadge.classList.remove('hidden');
      } else {
        this.terminalBadge.classList.add('hidden');
      }
    }
  }

  showIntelTerminal() {
    const gameState = window.gameController ? window.gameController.gameState : null;
    if (!gameState) return;

    this.unreadEvents = 0;
    this.updateTerminalBadge();

    this.terminalEntries.innerHTML = '';
    
    // Chronological order (oldest at top, newest at bottom)
    // The log is stored in chronological order in GameState? 
    // Usually log is pushed to the end. Let's assume it's chronological.
    const logEntries = gameState.log; 

    logEntries.forEach(message => {
      const p = document.createElement('p');
      if (typeof message === 'string') {
        p.textContent = message;
      } else {
        p.textContent = message.text;
        p.className = `log-${message.category}`;
      }
      this.terminalEntries.appendChild(p);
    });

    this.intelTerminalOverlay.classList.remove('hidden');
    
    // Auto-scroll to bottom
    const content = this.terminalEntries.parentElement;
    setTimeout(() => {
      content.scrollTop = content.scrollHeight;
    }, 50);

    document.body.style.overflow = 'hidden';
  }

  hideIntelTerminal() {
    this.intelTerminalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  initializeScreenSwitching() {
    // Populate tab icons
    const iconCity = document.getElementById('icon-city');
    const iconLife = document.getElementById('icon-life');
    const iconInventory = document.getElementById('icon-inventory');
    const iconSocial = document.getElementById('icon-social');
    const iconMenu = document.getElementById('icon-menu');

    if (iconCity) iconCity.innerHTML = Icons.cityGrid(20, 'rgba(255, 255, 255, 0.5)');
    if (iconLife) iconLife.innerHTML = Icons.bioMetrics(20, 'rgba(255, 255, 255, 0.5)');
    if (iconInventory) iconInventory.innerHTML = Icons.cyberDeck(20, 'rgba(255, 255, 255, 0.5)');
    if (iconSocial) iconSocial.innerHTML = Icons.comms(20, 'rgba(255, 255, 255, 0.5)');
    if (iconMenu) iconMenu.innerHTML = Icons.system(20, 'rgba(255, 255, 255, 0.5)');

    // Add click listeners to tabs
    this.tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const screenId = tab.dataset.screen;
            this.switchScreen(screenId);
        });
    });
  }

  switchScreen(screenId) {
    if (this.currentScreenId === screenId) return;

    // Update state
    this.currentScreenId = screenId;

    // Update screens visibility
    this.screens.forEach(screen => {
        if (screen.id === `screen-${screenId}`) {
            screen.classList.remove('hidden');
        } else {
            screen.classList.add('hidden');
        }
    });

    // Update tab active state
    this.tabItems.forEach(tab => {
        const iconContainer = tab.querySelector('.tab-icon');
        const iconSvg = iconContainer ? iconContainer.querySelector('svg') : null;

        if (tab.dataset.screen === screenId) {
            tab.classList.add('active');
            if (iconSvg) {
                iconSvg.setAttribute('stroke', '#00FFFF'); // neon-cyan
            }
        } else {
            tab.classList.remove('active');
            if (iconSvg) {
                iconSvg.setAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
            }
        }
    });

    // Trigger immediate render for the new screen
    if (window.gameController && window.gameController.gameState) {
        this.render(window.gameController.gameState);
    }

    // Publish event for other components if needed
    EventBus.publish('screenSwitched', screenId);
  }

  initializeClockVisualizations() {
    // Initialize HUD clock visualizations for Command-Orbs
    if (document.getElementById('hud-time-ring-p1')) {
      this.hudClockVisualizationP1 = new ClockVisualization('hud-time-ring-p1', {
        size: 52,
        strokeWidth: 4,
        backgroundColor: 'rgba(255, 0, 255, 0.1)',
        foregroundColor: '#FF00FF',
        textColor: 'transparent',
        showNumeric: false
      });
    }

    if (document.getElementById('hud-time-ring-p2')) {
      this.hudClockVisualizationP2 = new ClockVisualization('hud-time-ring-p2', {
        size: 52,
        strokeWidth: 4,
        backgroundColor: 'rgba(0, 255, 255, 0.1)',
        foregroundColor: '#00FFFF',
        textColor: 'transparent',
        showNumeric: false
      });
    }
  }

  showChoiceModal({ title, choices, showInput = false }) {
    const gameState = window.gameController ? window.gameController.gameState : null;
    const location = gameState ? gameState.getCurrentPlayer().location : null;
    const clerk = CLERKS[location];

    if (clerk) {
      this.modalClerkContainer.classList.remove('hidden');
      this.modalClerkAvatar.innerHTML = Icons[clerk.icon](40, '#00FFFF');
      this.modalClerkName.textContent = clerk.name;
      this.modalClerkMessage.textContent = clerk.message;
      this.modalTitle.classList.add('hidden');
    } else {
      this.modalClerkContainer.classList.add('hidden');
      this.modalTitle.classList.remove('hidden');
      this.modalTitle.textContent = title;
    }

    this.modalContent.innerHTML = '';
    this.modalButtons.innerHTML = '';

    if (showInput) {
      this.modalInput.classList.remove('hidden');
      this.modalInputField.value = '';
    } else {
      this.modalInput.classList.add('hidden');
    }

    if (location === 'Shopping Mall' || location === 'Fast Food') {
      const filteredItems = SHOPPING_ITEMS.filter(item => item.location === location);
      this.renderActionCards('shopping', filteredItems);
    } else if (location === 'Community College') {
      this.renderActionCards('college', COURSES);
    } else {
      choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.classList.add('btn', 'btn-primary');
        button.onclick = () => {
          const amount = showInput ? parseInt(this.modalInputField.value, 10) : null;
          this.hideModal();
          choice.action(choice.value, amount); 
        };
        this.modalButtons.appendChild(button);
      });
    }

    this.modalOverlay.classList.remove('hidden');
  }

  hideModal() {
    this.modalOverlay.classList.add('hidden');
  }

  showJobApplicationModal() {
    const clerk = CLERKS["Employment Agency"];
    if (clerk) {
      this.modalClerkContainer.classList.remove('hidden');
      this.modalClerkAvatar.innerHTML = Icons[clerk.icon](40, '#00FFFF');
      this.modalClerkName.textContent = clerk.name;
      this.modalClerkMessage.textContent = clerk.message;
      this.modalTitle.classList.add('hidden');
    } else {
      this.modalClerkContainer.classList.add('hidden');
      this.modalTitle.classList.remove('hidden');
      this.modalTitle.textContent = 'Apply for a Job';
    }

    this.modalContent.innerHTML = '';
    this.modalButtons.innerHTML = '';
    this.modalInput.classList.add('hidden');

    this.renderActionCards('jobs', JOBS);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.classList.add('btn', 'btn-secondary');
    cancelButton.onclick = () => this.hideModal();
    this.modalButtons.appendChild(cancelButton);

    this.modalOverlay.classList.remove('hidden');
  }

  renderActionCards(type, data) {
    const gameState = window.gameController ? window.gameController.gameState : null;
    const player = gameState ? gameState.getCurrentPlayer() : null;
    
    const cardList = document.createElement('div');
    cardList.className = 'action-card-list';

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'action-card';
      
      let title = '';
      let metaHtml = '';
      let isLocked = false;
      let action = () => {};
      let btnText = '';

      if (type === 'jobs') {
        title = item.title;
        isLocked = player && player.educationLevel < item.educationRequired;
        btnText = 'Apply';
        metaHtml = `
          <span class="action-card-tag price"><i class="material-icons">payments</i>$${item.wage}/hr</span>
          <span class="action-card-tag"><i class="material-icons">schedule</i>${item.shiftHours}h</span>
          <span class="action-card-tag requirement ${isLocked ? 'locked' : ''}">
            <i class="material-icons">${isLocked ? 'lock' : 'school'}</i>Edu Lvl ${item.educationRequired}
          </span>
        `;
        action = () => window.gameController.applyForJob(item.level);
      } else if (type === 'college') {
        title = item.name;
        isLocked = player && player.educationLevel < (item.educationMilestone - 1);
        btnText = 'Study';
        metaHtml = `
          <span class="action-card-tag price ${isLocked ? 'locked' : ''}"><i class="material-icons">payments</i>$${item.cost}</span>
          <span class="action-card-tag"><i class="material-icons">history</i>${item.time}h total</span>
        `;
        action = () => window.gameController.gameState.takeCourse(item.id);
      } else if (type === 'shopping') {
        title = item.name;
        isLocked = player && player.cash < item.cost;
        btnText = 'Buy';
        
        let boostHtml = `<span class="action-card-tag"><i class="material-icons">sentiment_very_satisfied</i>+${item.happinessBoost} Happy</span>`;
        if (item.hungerReduction) {
          boostHtml += `<span class="action-card-tag"><i class="material-icons">restaurant</i>-${item.hungerReduction} Hunger</span>`;
        }

        metaHtml = `
          <span class="action-card-tag price ${isLocked ? 'locked' : ''}"><i class="material-icons">payments</i>$${item.cost}</span>
          ${boostHtml}
        `;
        action = () => window.gameController.gameState.buyItem(item.name);
      }

      if (isLocked) card.classList.add('locked');

      card.innerHTML = `
        <div class="action-card-content">
          <div class="action-card-title">${title}</div>
          <div class="action-card-meta">${metaHtml}</div>
        </div>
        <div class="action-card-action">
          <button class="btn btn-primary action-card-btn" ${isLocked ? 'disabled' : ''}>
            ${btnText}
          </button>
        </div>
      `;

      if (!isLocked) {
        card.onclick = () => {
          this.hideModal();
          action();
        };
      }

      cardList.appendChild(card);
    });

    this.modalContent.appendChild(cardList);
  }

  showPlayerStatsModal(playerIndex) {
    const gameState = window.gameController ? window.gameController.gameState : null;
    if (!gameState || !gameState.players[playerIndex - 1]) return;
    
    const player = gameState.players[playerIndex - 1];
    
    this.playerStatsModalTitle.textContent = playerIndex === 1 ? 'Your Stats' : 'AI Stats';
    this.playerStatsModal.className = playerIndex === 1 ? 'player-1' : 'player-2';
    
    this.modalCash.textContent = `$${player.cash}`;
    this.modalSavings.textContent = `$${player.savings}`;
    this.modalLoan.textContent = `$${player.loan}`;
    this.modalHappiness.textContent = player.happiness;
    
    const course = COURSES.find(c => c.educationMilestone === player.educationLevel);
    this.modalEducation.textContent = course ? course.name : 'None';
    
    const job = JOBS.find(j => j.level === player.careerLevel);
    this.modalCareer.textContent = job ? job.title : 'Unemployed';
    
    this.modalCar.textContent = player.hasCar ? 'Yes' : 'No';
    this.modalTime.textContent = `${player.time} hours`;
    
    this.playerStatsModalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  
  hidePlayerStatsModal() {
    this.playerStatsModalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }
  
  addSwipeToClose(modalElement) {
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const rect = modalElement.getBoundingClientRect();
      
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
      
      if (deltaY > 0) {
        modalElement.style.transform = `translateY(${deltaY}px)`;
        const opacity = Math.max(0, 1 - (deltaY / window.innerHeight));
        this.playerStatsModalOverlay.style.backgroundColor = `rgba(0, 0, 0, ${0.8 * opacity})`;
      }
    };
    
    const handleTouchEnd = () => {
      if (!isDragging) return;
      
      isDragging = false;
      const deltaY = currentY - startY;
      const threshold = window.innerHeight * 0.3;
      
      modalElement.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      
      if (deltaY > threshold) {
        modalElement.style.transform = `translateY(100%)`;
        modalElement.style.opacity = '0';
        
        setTimeout(() => {
          this.hidePlayerStatsModal();
          modalElement.style.transform = '';
          modalElement.style.opacity = '';
          this.playerStatsModalOverlay.style.backgroundColor = '';
        }, 300);
      } else {
        modalElement.style.transform = '';
        this.playerStatsModalOverlay.style.backgroundColor = '';
      }
    };
    
    modalElement.addEventListener('touchstart', handleTouchStart, { passive: true });
    modalElement.addEventListener('touchmove', handleTouchMove, { passive: true });
    modalElement.addEventListener('touchend', handleTouchEnd, { passive: true });
  }

  showLoading() {
    this.loadingOverlay.classList.remove('hidden');
    document.body.classList.add('loading-active');
  }

  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
    document.body.classList.remove('loading-active');
  }

  showTurnSummary(summary) {
    if (!this.turnSummaryModal) return;

    this.summarySubtitle.textContent = `${summary.playerName.toUpperCase()} - WEEK ${summary.week} REPORT`;
    
    // Update totals
    this.summaryCashTotal.textContent = (summary.totals.cashChange >= 0 ? '+$' : '-$') + Math.abs(summary.totals.cashChange).toLocaleString();
    this.summaryCashTotal.className = `total-value ${summary.totals.cashChange >= 0 ? 'log-success' : 'log-error'}`;
    
    this.summaryHappinessTotal.textContent = (summary.totals.happinessChange >= 0 ? '+' : '') + summary.totals.happinessChange;
    this.summaryHappinessTotal.className = `total-value ${summary.totals.happinessChange >= 0 ? 'log-success' : 'log-error'}`;

    this.btnStartNextWeek.textContent = "START NEXT WEEK →";

    this.eventList.innerHTML = '';
    
    summary.events.forEach((event, index) => {
      const card = document.createElement('div');
      card.className = `event-card ${event.type}`;
      
      const valueText = (event.value >= 0 ? '+' : '-') + Math.abs(event.value).toLocaleString() + (event.unit === '$' ? '$' : ' ' + event.unit);
      
      card.innerHTML = `
        <div class="event-icon-circle">
          <i class="material-icons">${event.icon}</i>
        </div>
        <div class="event-info">
          <span class="event-name">${event.label}</span>
          <span class="event-amount">${valueText}</span>
        </div>
      `;
      
      this.eventList.appendChild(card);
      
      // Staggered animation
      setTimeout(() => {
        card.classList.add('animate-in');
      }, 100 * (index + 1));
    });

    this.btnStartNextWeek.onclick = () => {
      // Haptic Feedback Simulation
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(10);
      }
      
      this.hideTurnSummary();
      if (window.gameController) {
        window.gameController.advanceTurn();
      }
    };

    this.turnSummaryModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Animate totals after a short delay
    setTimeout(() => {
      this.animateValue(this.summaryCashTotal, 0, summary.totals.cashChange, 1000, '$');
      this.animateValue(this.summaryHappinessTotal, 0, summary.totals.happinessChange, 1000);
    }, 500);
  }

  /**
   * Animates a numerical value in a DOM element.
   * @param {HTMLElement} obj The element to update.
   * @param {number} start The starting value.
   * @param {number} end The target value.
   * @param {number} duration Animation duration in ms.
   * @param {string} prefix Optional prefix (e.g., '$').
   */
  animateValue(obj, start, end, duration, prefix = '') {
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      
      const isPositive = current >= 0;
      const sign = isPositive ? '+' : '-';
      const absValue = Math.abs(current).toLocaleString();
      
      if (prefix === '$') {
        obj.textContent = `${sign}$${absValue}`;
      } else {
        obj.textContent = `${sign}${absValue}`;
      }
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  hideTurnSummary() {
    if (this.turnSummaryModal) {
      this.turnSummaryModal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  render(gameState) {
    const player1 = gameState.players[0];
    const player2 = gameState.players.length > 1 ? gameState.players[1] : null;
    const currentPlayer = gameState.getCurrentPlayer();
    const currentPlayerIndex = gameState.currentPlayerIndex;

    // Update Command-Orbs
    if (this.orbP1) {
      this.orbP1.classList.toggle('active', currentPlayerIndex === 0);
      this.orbP1.classList.toggle('inactive', currentPlayerIndex !== 0);
      
      // Pulse animation on turn switch
      if (this.lastPlayerIndex !== currentPlayerIndex && currentPlayerIndex === 0) {
        this.orbP1.classList.add('pulse');
        setTimeout(() => this.orbP1.classList.remove('pulse'), 600);
      }
    }

    if (this.orbP2) {
      this.orbP2.classList.toggle('active', currentPlayerIndex === 1);
      this.orbP2.classList.toggle('inactive', currentPlayerIndex !== 1);
      
      // Pulse animation on turn switch
      if (this.lastPlayerIndex !== currentPlayerIndex && currentPlayerIndex === 1) {
        this.orbP2.classList.add('pulse');
        setTimeout(() => this.orbP2.classList.remove('pulse'), 600);
      }
    }

    this.lastPlayerIndex = currentPlayerIndex;

    // Update HUD Clock Visualizations
    if (this.hudClockVisualizationP1) {
      this.hudClockVisualizationP1.updateTime(player1.time);
    }
    if (this.hudClockVisualizationP2 && player2) {
      this.hudClockVisualizationP2.updateTime(player2.time);
    }

    // Update HUD Values
    if (this.hudCash) this.hudCash.textContent = `$${currentPlayer.cash}`;
    if (this.hudWeek) this.hudWeek.textContent = gameState.turn;
    if (this.hudLocation) this.hudLocation.textContent = currentPlayer.location;

    // News Ticker
    if (this.newsTickerContent && gameState.log.length > 0) {
      const recentEvents = gameState.log
        .slice(-5)
        .map(entry => typeof entry === 'string' ? entry : entry.text)
        .join('  •  ');
      this.newsTickerContent.textContent = recentEvents;
    }

    this.updateLocationHint(currentPlayer.location);

    if (this.currentScreenId === 'city') {
      this.renderCityGrid(gameState);
    } else if (this.currentScreenId === 'life') {
      this.renderLifeScreen(gameState);
    } else if (this.currentScreenId === 'inventory') {
      this.renderInventoryScreen(gameState);
    }

    this.renderActionTray(gameState);
  }

  renderActionTray(gameState) {
    if (!this.actionTray) return;

    const currentPlayer = gameState.getCurrentPlayer();
    const location = currentPlayer.location;

    // Update Tray Info
    if (this.trayLocationName) this.trayLocationName.textContent = location;
    if (this.trayIcon) {
        let iconSvg = '';
        switch (location) {
            case 'Home': iconSvg = Icons.apartment(32, '#FF00FF'); break;
            case 'Employment Agency': iconSvg = Icons.agency(32, '#00FFFF'); break;
            case 'Community College': iconSvg = Icons.cyberChip(32, '#2979FF'); break;
            case 'Shopping Mall': iconSvg = Icons.smartBag(32, '#FFD600'); break;
            case 'Fast Food': iconSvg = Icons.restaurant(32, '#FF9100'); break;
            case 'Used Car Lot': iconSvg = Icons.hoverCar(32, '#00E676'); break;
            case 'Bank': iconSvg = Icons.cryptoVault(32, '#FF5252'); break;
        }
        this.trayIcon.innerHTML = iconSvg;
    }

    // Populate Buttons
    if (this.trayActions) {
        this.trayActions.innerHTML = '';
        
        const actions = this.getLocationActions(location);
        
        actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = `btn btn-sm ${action.primary ? 'btn-primary' : 'btn-secondary'}`;
            btn.innerHTML = `<i class="material-icons">${action.icon}</i> ${action.label}`;
            btn.onclick = action.onClick;
            this.trayActions.appendChild(btn);
        });
    }

    // Show/Hide Tray (Only on City screen or if actions available)
    if (this.currentScreenId === 'city') {
        this.actionTray.classList.remove('hidden');
    } else {
        this.actionTray.classList.add('hidden');
    }
  }

  getLocationActions(location) {
    const actions = [];
    
    switch (location) {
        case 'Home':
            actions.push({
                label: 'Rest / End Turn',
                icon: 'bedtime',
                primary: true,
                onClick: () => window.gameController.restEndTurn()
            });
            break;
        case 'Employment Agency':
            actions.push({
                label: 'Work Shift',
                icon: 'work',
                primary: true,
                onClick: () => window.gameController.workShift()
            });
            actions.push({
                label: 'Apply',
                icon: 'description',
                primary: false,
                onClick: () => this.showJobApplicationModal()
            });
            break;
        case 'Community College':
            actions.push({
                label: 'Browse Courses',
                icon: 'school',
                primary: true,
                onClick: () => this.showChoiceModal({ title: 'Select a Course' })
            });
            break;
        case 'Shopping Mall':
            actions.push({
                label: 'Browse Items',
                icon: 'shopping_bag',
                primary: true,
                onClick: () => this.showChoiceModal({ title: 'Select an Item' })
            });
            break;
        case 'Fast Food':
            actions.push({
                label: 'Browse Menu',
                icon: 'lunch_dining',
                primary: true,
                onClick: () => this.showChoiceModal({ title: 'Monolith Burger Menu' })
            });
            break;
        case 'Used Car Lot':
            actions.push({
                label: 'View Inventory',
                icon: 'directions_car',
                primary: true,
                onClick: () => window.gameController.buyCar()
            });
            break;
        case 'Bank':
            actions.push({
                label: 'Financial Services',
                icon: 'account_balance',
                primary: true,
                onClick: () => this.showBankModal()
            });
            break;
    }
    
    return actions;
  }

  showBankModal() {
      const choices = [
          { text: 'Deposit', value: 'deposit', action: (v, a) => window.gameController.deposit(a) },
          { text: 'Withdraw', value: 'withdraw', action: (v, a) => window.gameController.withdraw(a) },
          { text: 'Take Loan', value: 'loan', action: (v, a) => window.gameController.takeLoan(a) },
          { text: 'Repay Loan', value: 'repay', action: (v, a) => window.gameController.repayLoan(a) }
      ];
      this.showChoiceModal({ title: 'Bank Services', choices, showInput: true });
  }

  updateLocationHint(location) {
    let hintText = '';
    
    switch (location) {
        case 'Home': hintText = 'Rest and end your turn here'; break;
        case 'Employment Agency': hintText = 'Find work and earn money'; break;
        case 'Community College': hintText = 'Improve your education for better jobs'; break;
        case 'Shopping Mall': hintText = 'Buy items to boost your happiness'; break;
        case 'Fast Food': hintText = 'Grab a quick bite to eat'; break;
        case 'Used Car Lot': hintText = 'Purchase a car for faster travel'; break;
        case 'Bank': hintText = 'Manage your finances: deposit, withdraw, or take a loan'; break;
        default: hintText = 'Travel to other locations';
    }
    
    if (this.locationHint) {
        this.locationHint.textContent = hintText;
    }
  }

  renderCityGrid(gameState) {
    if (!this.cityBentoGrid) return;

    const currentPlayer = gameState.getCurrentPlayer();
    this.cityBentoGrid.innerHTML = '';

    LOCATIONS.forEach(location => {
      const card = document.createElement('div');
      card.className = `bento-card ${currentPlayer.location === location ? 'active' : ''}`;
      
      let iconSvg = '';
      switch (location) {
        case 'Home': iconSvg = Icons.apartment(32, '#FF00FF'); break;
        case 'Employment Agency': iconSvg = Icons.agency(32, '#00FFFF'); break;
        case 'Community College': iconSvg = Icons.cyberChip(32, '#2979FF'); break;
        case 'Shopping Mall': iconSvg = Icons.smartBag(32, '#FFD600'); break;
        case 'Fast Food': iconSvg = Icons.restaurant(32, '#FF9100'); break;
        case 'Used Car Lot': iconSvg = Icons.hoverCar(32, '#00E676'); break;
        case 'Bank': iconSvg = Icons.cryptoVault(32, '#FF5252'); break;
      }

      card.innerHTML = `
        <div class="bento-card-icon">${iconSvg}</div>
        <div class="bento-card-title">${location}</div>
        <div class="bento-card-info">${this.getLocationSummary(location)}</div>
      `;

      card.onclick = () => {
        if (currentPlayer.location !== location) {
          if (window.gameController) {
            window.gameController.travel(location);
          }
        } else {
          // Trigger primary interaction for current location
          const actions = this.getLocationActions(location);
          if (actions.length > 0) {
            // If it's a "Browse" type action that opens a modal, trigger it
            const primaryAction = actions.find(a => a.primary) || actions[0];
            primaryAction.onClick();
          }
        }
      };

      this.cityBentoGrid.appendChild(card);
    });

    if (this.fabNextWeek) {
      if (currentPlayer.location === 'Home') {
        this.fabNextWeek.classList.remove('hidden');
      } else {
        this.fabNextWeek.classList.add('hidden');
      }
    }
  }

  getLocationSummary(location) {
    switch (location) {
      case 'Home': return 'Rest and end turn';
      case 'Employment Agency': return 'Find work';
      case 'Community College': return 'Study courses';
      case 'Shopping Mall': return 'Buy items';
      case 'Fast Food': return 'Eat food';
      case 'Used Car Lot': return 'Buy a car';
      case 'Bank': return 'Savings & Loans';
      default: return '';
    }
  }

  renderLifeScreen(gameState) {
    const player = gameState.getCurrentPlayer();
    const index = gameState.currentPlayerIndex;

    if (this.lifeAvatar) {
      this.lifeAvatar.textContent = index === 0 ? 'P1' : 'AI';
      this.lifeAvatar.style.background = index === 0 
        ? 'linear-gradient(135deg, var(--neon-pink), #D500F9)' 
        : 'linear-gradient(135deg, var(--neon-cyan), var(--neon-blue))';
    }

    if (this.statusChips) {
      this.statusChips.innerHTML = '';
      
      if (player.time > 12) {
        const chip = document.createElement('span');
        chip.className = 'status-chip chip-success';
        chip.textContent = 'Well-Rested';
        this.statusChips.appendChild(chip);
      }

      if (player.hunger > 50) {
        const chip = document.createElement('span');
        chip.className = `status-chip ${player.hunger > 80 ? 'chip-danger' : 'chip-warning'}`;
        chip.textContent = player.hunger > 80 ? 'Starving' : 'Hungry';
        this.statusChips.appendChild(chip);
      } else {
        const chip = document.createElement('span');
        chip.className = 'status-chip chip-success';
        chip.textContent = 'Satiated';
        this.statusChips.appendChild(chip);
      }

      if (player.loan > 0) {
        const chip = document.createElement('span');
        chip.className = 'status-chip chip-danger';
        chip.textContent = 'In Debt';
        this.statusChips.appendChild(chip);
      }
    }

    const wealth = Math.min(100, Math.round(((player.cash + player.savings) / 10000) * 100));
    const happiness = player.happiness;
    const education = Math.min(100, Math.round((player.educationLevel / 5) * 100));
    const career = Math.min(100, Math.round((player.careerLevel / 5) * 100));

    this.updateGauge('wealth', wealth, '#00E676');
    this.updateGauge('happiness', happiness, '#FFD600');
    this.updateGauge('education', education, '#2979FF');
    this.updateGauge('career', career, '#FF00FF');
  }

  updateGauge(id, percentage, color) {
    const container = document.getElementById(`gauge-${id}`);
    if (!container) return;

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    container.innerHTML = `
      <svg viewBox="0 0 100 100" class="gauge-svg">
        <circle class="gauge-ring-background" cx="50" cy="50" r="${radius}"></circle>
        <circle class="gauge-ring-fill" cx="50" cy="50" r="${radius}" 
                style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${offset}; stroke: ${color};">
        </circle>
      </svg>
      <div class="gauge-percentage">${percentage}%</div>
    `;
  }

  renderInventoryScreen(gameState) {
    const player = gameState.getCurrentPlayer();
    
    if (this.essentialsGrid) {
      this.essentialsGrid.innerHTML = '';
      const essentials = SHOPPING_ITEMS.filter(i => i.type === 'essential' && i.icon);
      
      essentials.forEach(item => {
        const isOwned = player.inventory.some(i => i.name === item.name);
        const div = document.createElement('div');
        div.className = `essential-item ${isOwned ? 'owned' : ''}`;
        div.innerHTML = Icons[item.icon](32, isOwned ? '#00FFFF' : 'rgba(255,255,255,0.2)');
        div.title = item.name;
        this.essentialsGrid.appendChild(div);
      });
    }

    if (this.assetsGrid) {
      this.assetsGrid.innerHTML = '';
      const assets = SHOPPING_ITEMS.filter(i => i.type === 'asset');

      assets.forEach(item => {
        const isOwned = player.inventory.some(i => i.name === item.name);
        const card = document.createElement('div');
        card.className = `inventory-card glass ${isOwned ? 'owned' : ''}`;
        card.innerHTML = `
          <div class="inventory-card-icon">
            ${Icons[item.icon](40, isOwned ? '#00FFFF' : 'rgba(255,255,255,0.2)')}
          </div>
          <div class="inventory-card-content">
            <div class="inventory-card-name">${item.name}</div>
            <div class="inventory-card-benefit">${item.benefit}</div>
          </div>
        `;
        this.assetsGrid.appendChild(card);
      });
    }
  }
}

export default GameView;
