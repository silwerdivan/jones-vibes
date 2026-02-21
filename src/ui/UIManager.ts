import EventBus from '../EventBus.js';
// --- 1. IMPORT GAME DATA TO USE FOR LOOKUPS ---
import { JOBS } from '../data/jobs.js';
import { COURSES } from '../data/courses.js';
import { LOCATIONS } from '../data/locations.js';
import { CLERKS } from '../data/clerks.js';
import { SHOPPING_ITEMS } from '../data/items.js';
import Icons from './Icons.js';
import GameState from '../game/GameState.js';
import { ChoiceModal, PlayerStatsModal, IntelTerminalModal, TurnSummaryModal } from './components/Modal.js';
import { HUD } from './components/HUD.js';

class UIManager {
  private screens: NodeListOf<Element>;
  private tabItems: NodeListOf<Element>;
  private currentScreenId: string;
  private cityBentoGrid: HTMLElement | null;
  private fabNextWeek: HTMLElement | null;
  
  // Modals
  private choiceModal: ChoiceModal;
  private playerStatsModal: PlayerStatsModal;
  private intelTerminalModal: IntelTerminalModal;
  private turnSummaryModal: TurnSummaryModal;

  // Components
  private hud: HUD;

  private lastLocation: string | null;
  private lastPlayerId: number | null;
  
  private lifeAvatar: HTMLElement | null;
  private statusChips: HTMLElement | null;
  private essentialsGrid: HTMLElement | null;
  private assetsGrid: HTMLElement | null;
  
  private loadingOverlay: HTMLElement | null;
  private locationHint: HTMLElement | null;

  constructor() {
    // Screens
    this.screens = document.querySelectorAll('.screen');
    
    // Tabs
    this.tabItems = document.querySelectorAll('.tab-item');
    this.currentScreenId = 'city';

    // Bento Grid
    this.cityBentoGrid = document.getElementById('city-bento-grid');
    this.fabNextWeek = document.getElementById('fab-next-week');

    // Location Hint
    this.locationHint = document.getElementById('location-hint');

    // --- Components ---
    this.hud = new HUD();

    // --- Modals ---
    this.choiceModal = new ChoiceModal();
    this.playerStatsModal = new PlayerStatsModal();
    this.intelTerminalModal = new IntelTerminalModal();
    this.turnSummaryModal = new TurnSummaryModal();

    this.lastLocation = null;
    this.lastPlayerId = null;

    // --- PHASE 4: NEW ELEMENTS ---
    this.lifeAvatar = document.getElementById('life-avatar');
    this.statusChips = document.getElementById('status-chips');
    this.essentialsGrid = document.getElementById('essentials-grid');
    this.assetsGrid = document.getElementById('assets-grid');

    // --- LOADING OVERLAY ---
    this.loadingOverlay = document.getElementById('loading-overlay');
    EventBus.subscribe('aiThinkingStart', () => this.showLoading());
    EventBus.subscribe('aiThinkingEnd',   () => this.hideLoading());

    EventBus.subscribe('stateChanged', (gameState: GameState) => {
      this.render(gameState);
    });

    EventBus.subscribe('turnEnded', (summary: any) => {
      this.showTurnSummary(summary);
    });

    // Listen for HUD events
    EventBus.subscribe('showPlayerStats', (playerIndex: number) => this.showPlayerStatsModal(playerIndex));
    EventBus.subscribe('showIntelTerminal', () => this.showIntelTerminal());
    
    // Subscribe to add to log event from EventNotificationManager
    EventBus.subscribe('addToLog', () => {
      if ((window as any).gameController) {
        (window as any).gameController.gameState.publishCurrentState();
      }
    });
    
    // Add click listener for Next Week FAB
    if (this.fabNextWeek) {
        this.fabNextWeek.addEventListener('click', () => {
            if ((window as any).gameController) {
                (window as any).gameController.restEndTurn();
            }
        });
    }
    
    // Initialize Screen Switching
    this.initializeScreenSwitching();
  }

  showIntelTerminal() {
    const gameState = (window as any).gameController ? (window as any).gameController.gameState : null;
    if (!gameState) return;

    this.intelTerminalModal.updateEntries(gameState.log);
    this.intelTerminalModal.show();
  }

  hideIntelTerminal() {
    this.intelTerminalModal.hide();
  }

  initializeScreenSwitching() {
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

    this.tabItems.forEach(tab => {
        tab.addEventListener('click', () => {
            const screenId = (tab as HTMLElement).dataset.screen;
            if (screenId) this.switchScreen(screenId);
        });
    });
  }

  switchScreen(screenId: string) {
    if (this.currentScreenId === screenId) return;

    this.currentScreenId = screenId;

    this.screens.forEach(screen => {
        if (screen.id === `screen-${screenId}`) {
            screen.classList.remove('hidden');
        } else {
            screen.classList.add('hidden');
        }
    });

    this.tabItems.forEach(tab => {
        const iconContainer = tab.querySelector('.tab-icon');
        const iconSvg = iconContainer ? iconContainer.querySelector('svg') : null;

        if ((tab as HTMLElement).dataset.screen === screenId) {
            tab.classList.add('active');
            if (iconSvg) {
                iconSvg.setAttribute('stroke', '#00FFFF');
            }
        } else {
            tab.classList.remove('active');
            if (iconSvg) {
                iconSvg.setAttribute('stroke', 'rgba(255, 255, 255, 0.5)');
            }
        }
    });

    if ((window as any).gameController && (window as any).gameController.gameState) {
        this.render((window as any).gameController.gameState);
    }

    EventBus.publish('screenSwitched', screenId);
  }

  showChoiceModal({ title, choices, showInput = false }: { title: string, choices: any[], showInput?: boolean }) {
    const gameState = (window as any).gameController ? (window as any).gameController.gameState : null;
    const location = gameState ? gameState.getCurrentPlayer().location : null;
    const clerk = location ? (CLERKS as any)[location] : null;

    this.choiceModal.setupClerk(clerk, Icons);
    this.choiceModal.clearContent();
    this.choiceModal.showInput(showInput);

    if (location === 'Shopping Mall' || location === 'Fast Food') {
      const filteredItems = SHOPPING_ITEMS.filter(item => item.location === location);
      this.renderActionCards('shopping', filteredItems);
    } else if (location === 'Community College') {
      this.renderActionCards('college', COURSES);
    } else {
      choices.forEach(choice => {
        this.choiceModal.addPrimaryButton(choice.text, (amount) => {
          this.choiceModal.hide();
          choice.action(choice.value, amount);
        });
      });
    }

    this.choiceModal.show({ title });
  }

  showLocationDashboard(location: string) {
    const gameState = (window as any).gameController ? (window as any).gameController.gameState : null;
    if (!gameState) return;

    const player = gameState.getCurrentPlayer();
    const clerk = (CLERKS as any)[location];

    this.choiceModal.setupClerk(clerk, Icons);
    this.choiceModal.clearContent();
    this.choiceModal.showInput(false);

    // List Primary Actions (Jobs, Courses, Items)
    if (location === 'Employment Agency') {
        this.renderActionCards('jobs', JOBS);
    } else if (location === 'Community College') {
        this.renderActionCards('college', COURSES);
    } else if (location === 'Shopping Mall' || location === 'Fast Food') {
        const filteredItems = SHOPPING_ITEMS.filter(item => item.location === location);
        this.renderActionCards('shopping', filteredItems);
    }

    // Secondary Actions (Work Shift, etc.)
    const actions = this.getLocationActions(location);
    actions.forEach(action => {
        this.choiceModal.addSecondaryButton(action.label, action.icon, action.primary, (e) => {
            // Visual Feedback for Work Shift
            if (action.label === 'Work Shift') {
                const job = JOBS.find(j => j.level === player.careerLevel);
                if (job) {
                    this.spawnFeedback(e.currentTarget as HTMLElement, `+$${job.wage * 8}`, 'success');
                }
            }

            // Keep modal open for Work Shift, but hide for others like End Turn
            if (action.label !== 'Work Shift') {
                this.choiceModal.hide();
            }
            action.onClick();
            
            // If it was Work Shift, re-render to update UI
            if (action.label === 'Work Shift') {
                setTimeout(() => {
                    this.showLocationDashboard(location);
                }, 100);
            }
        });
    });

    // Special case: Bank
    if (location === 'Bank') {
        this.choiceModal.showInput(true);
        
        const bankActions = [
            { text: 'Deposit', value: 'deposit', action: (_: string, a: number) => (window as any).gameController.deposit(a) },
            { text: 'Withdraw', value: 'withdraw', action: (_: string, a: number) => (window as any).gameController.withdraw(a) },
            { text: 'Take Loan', value: 'loan', action: (_: string, a: number) => (window as any).gameController.takeLoan(a) },
            { text: 'Repay Loan', value: 'repay', action: (_: string, a: number) => (window as any).gameController.repayLoan(a) }
        ];

        bankActions.forEach(choice => {
            this.choiceModal.addSecondaryButton(choice.text, 'payments', false, (e) => {
                const amount = this.choiceModal.getInputValue();
                
                // Visual feedback
                if (choice.value === 'deposit' || choice.value === 'repay') {
                    this.spawnFeedback(e.currentTarget as HTMLElement, `-$${amount}`, 'error');
                } else {
                    this.spawnFeedback(e.currentTarget as HTMLElement, `+$${amount}`, 'success');
                }

                choice.action(choice.value, amount);
                setTimeout(() => {
                    this.showLocationDashboard('Bank');
                }, 100);
            });
        });
    }

    this.choiceModal.show({ title: location });
  }

  spawnFeedback(element: HTMLElement, text: string, type: string) {
    const rect = element.getBoundingClientRect();
    const particle = document.createElement('div');
    particle.className = `feedback-particle log-${type}`;
    particle.textContent = text;
    
    // Position at the center of the element
    particle.style.left = `${rect.left + rect.width / 2}px`;
    particle.style.top = `${rect.top}px`;
    
    document.body.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => {
      particle.remove();
    }, 800);
  }

  hideModal() {
    this.choiceModal.hide();
  }

  showJobApplicationModal() {
    this.showLocationDashboard('Employment Agency');
  }

  renderActionCards(type: string, data: any[]) {
    const gameState = (window as any).gameController ? (window as any).gameController.gameState : null;
    const player = gameState ? gameState.getCurrentPlayer() : null;
    
    const cardList = document.createElement('div');
    cardList.className = 'action-card-list';

    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'action-card';
      
      let title = '';
      let metaHtml = '';
      let isLocked = false;
      let isHired = false;
      let action = () => {};
      let btnText = '';
      let feedbackType = 'success';
      let feedbackText = '';

      if (type === 'jobs') {
        title = item.title;
        isLocked = player && player.educationLevel < item.educationRequired;
        isHired = player && player.careerLevel === item.level;
        const isBetterJob = player && player.careerLevel > item.level;
        
        btnText = isHired ? 'Hired' : (isBetterJob ? 'Lower Level' : 'Apply');
        if (isBetterJob) isLocked = true; // Can't re-apply for lower level

        metaHtml = `
          <span class="action-card-tag price"><i class="material-icons">payments</i>$${item.wage}/hr</span>
          <span class="action-card-tag"><i class="material-icons">schedule</i>${item.shiftHours}h</span>
          <span class="action-card-tag requirement ${isLocked ? 'locked' : ''}">
            <i class="material-icons">${isLocked ? 'lock' : 'school'}</i>Edu Lvl ${item.educationRequired}
          </span>
        `;
        action = () => (window as any).gameController.applyForJob(item.level);
        feedbackText = 'HIRED!';
      } else if (type === 'college') {
        title = item.name;
        isLocked = player && player.educationLevel < (item.educationMilestone - 1);
        const alreadyTaken = player && player.educationLevel >= item.educationMilestone;
        
        btnText = alreadyTaken ? 'Completed' : 'Study';
        if (alreadyTaken) isLocked = true;

        metaHtml = `
          <span class="action-card-tag price ${isLocked && !alreadyTaken ? 'locked' : ''}"><i class="material-icons">payments</i>$${item.cost}</span>
          <span class="action-card-tag"><i class="material-icons">history</i>${item.time}h total</span>
        `;
        action = () => (window as any).gameController.gameState.takeCourse(item.id);
        feedbackText = `-$${item.cost}`;
        feedbackType = 'error';
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
        action = () => (window as any).gameController.gameState.buyItem(item.name);
        feedbackText = `-$${item.cost}`;
        feedbackType = 'error';
      }

      if (isLocked || isHired) card.classList.add('locked');
      if (isHired) card.classList.add('hired');

      card.innerHTML = `
        <div class="action-card-content">
          <div class="action-card-title">${title}</div>
          <div class="action-card-meta">${metaHtml}</div>
        </div>
        <div class="action-card-action">
          <button class="btn btn-primary action-card-btn" ${isLocked || isHired ? 'disabled' : ''}>
            ${btnText}
          </button>
        </div>
      `;

      if (!isLocked && !isHired) {
        card.onclick = (e) => {
          // Visual feedback
          this.spawnFeedback(e.currentTarget as HTMLElement, feedbackText, feedbackType);

          // Keep modal open for jobs, hide for others
          if (type !== 'jobs') {
            this.choiceModal.hide();
          }
          action();
          
          // Re-render dashboard for jobs to show potential "Work Shift" update
          if (type === 'jobs' && (window as any).gameController) {
              setTimeout(() => {
                  this.showLocationDashboard('Employment Agency');
              }, 100);
          }
        };
      }

      cardList.appendChild(card);
    });

    this.choiceModal.setContent(cardList);
  }

  showPlayerStatsModal(playerIndex: number) {
    const gameState = (window as any).gameController ? (window as any).gameController.gameState : null;
    if (!gameState || !gameState.players[playerIndex - 1]) return;
    
    const player = gameState.players[playerIndex - 1];
    this.playerStatsModal.update(player, COURSES, JOBS, playerIndex);
    this.playerStatsModal.show();
  }
  
  hidePlayerStatsModal() {
    this.playerStatsModal.hide();
  }

  showLoading() {
    this.loadingOverlay?.classList.remove('hidden');
    document.body.classList.add('loading-active');
  }

  hideLoading() {
    this.loadingOverlay?.classList.add('hidden');
    document.body.classList.remove('loading-active');
  }

  showTurnSummary(summary: any) {
    this.turnSummaryModal.update(summary, () => {
      if ((window as any).navigator && (window as any).navigator.vibrate) {
        (window as any).navigator.vibrate(10);
      }
      
      this.turnSummaryModal.hide();
      if ((window as any).gameController) {
        (window as any).gameController.advanceTurn();
      }
    });
    this.turnSummaryModal.show();
  }

  hideTurnSummary() {
    this.turnSummaryModal.hide();
  }

  render(gameState: GameState) {
    this.hud.update(gameState);

    const currentPlayer = gameState.getCurrentPlayer();

    this.updateLocationHint(currentPlayer.location);

    // --- AUTO-ARRIVAL LOGIC ---
    const isNewTurn = this.lastPlayerId !== null && this.lastPlayerId !== currentPlayer.id;
    const isNewLocation = this.lastLocation !== null && this.lastLocation !== currentPlayer.location;
    
    if (isNewLocation && currentPlayer.location !== 'Home' && !isNewTurn && !currentPlayer.isAI) {
        setTimeout(() => {
            this.showLocationDashboard(currentPlayer.location);
        }, 300);
    }

    this.lastLocation = currentPlayer.location;
    this.lastPlayerId = currentPlayer.id;

    if (this.currentScreenId === 'city') {
      this.renderCityGrid(gameState);
    } else if (this.currentScreenId === 'life') {
      this.renderLifeScreen(gameState);
    } else if (this.currentScreenId === 'inventory') {
      this.renderInventoryScreen(gameState);
    }
  }

  getLocationActions(location: string) {
    const actions: any[] = [];
    
    switch (location) {
        case 'Home':
            actions.push({
                label: 'Rest / End Turn',
                icon: 'bedtime',
                primary: true,
                onClick: () => (window as any).gameController.restEndTurn()
            });
            break;
        case 'Employment Agency':
            actions.push({
                label: 'Work Shift',
                icon: 'work',
                primary: true,
                onClick: () => (window as any).gameController.workShift()
            });
            break;
        case 'Community College':
            actions.push({
                label: 'Browse Courses',
                icon: 'school',
                primary: true,
                onClick: () => this.showLocationDashboard('Community College')
            });
            break;
        case 'Shopping Mall':
            actions.push({
                label: 'Browse Items',
                icon: 'shopping_bag',
                primary: true,
                onClick: () => this.showLocationDashboard('Shopping Mall')
            });
            break;
        case 'Fast Food':
            actions.push({
                label: 'Browse Menu',
                icon: 'lunch_dining',
                primary: true,
                onClick: () => this.showLocationDashboard('Fast Food')
            });
            break;
        case 'Used Car Lot':
            actions.push({
                label: 'View Inventory',
                icon: 'directions_car',
                primary: true,
                onClick: () => (window as any).gameController.buyCar()
            });
            break;
        case 'Bank':
            actions.push({
                label: 'Financial Services',
                icon: 'account_balance',
                primary: true,
                onClick: () => this.showLocationDashboard('Bank')
            });
            break;
    }
    
    return actions;
  }

  showBankModal() {
      this.showLocationDashboard('Bank');
  }

  updateLocationHint(location: string) {
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

  renderCityGrid(gameState: GameState) {
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
          if ((window as any).gameController) {
            (window as any).gameController.travel(location);
          }
        } else {
            this.showLocationDashboard(location);
        }
      };

      this.cityBentoGrid?.appendChild(card);
    });

    if (this.fabNextWeek) {
      if (currentPlayer.location === 'Home') {
        this.fabNextWeek.classList.remove('hidden');
      } else {
        this.fabNextWeek.classList.add('hidden');
      }
    }
  }

  getLocationSummary(location: string) {
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

  renderLifeScreen(gameState: GameState) {
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

  updateGauge(id: string, percentage: number, color: string) {
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

  renderInventoryScreen(gameState: GameState) {
    const player = gameState.getCurrentPlayer();
    
    if (this.essentialsGrid) {
      this.essentialsGrid.innerHTML = '';
      const essentials = SHOPPING_ITEMS.filter(i => i.type === 'essential' && i.icon);
      
      essentials.forEach(item => {
        const isOwned = player.inventory.some((i: any) => i.name === item.name);
        const div = document.createElement('div');
        div.className = `essential-item ${isOwned ? 'owned' : ''}`;
        if (item.icon) div.innerHTML = (Icons as any)[item.icon](32, isOwned ? '#00FFFF' : 'rgba(255,255,255,0.2)');
        div.title = item.name;
        this.essentialsGrid?.appendChild(div);
      });
    }

    if (this.assetsGrid) {
      this.assetsGrid.innerHTML = '';
      const assets = SHOPPING_ITEMS.filter(i => i.type === 'asset');

      assets.forEach(item => {
        const isOwned = player.inventory.some((i: any) => i.name === item.name);
        const card = document.createElement('div');
        card.className = `inventory-card glass ${isOwned ? 'owned' : ''}`;
        card.innerHTML = `
          <div class="inventory-card-icon">
            ${item.icon ? (Icons as any)[item.icon](40, isOwned ? '#00FFFF' : 'rgba(255,255,255,0.2)') : ''}
          </div>
          <div class="inventory-card-content">
            <div class="inventory-card-name">${item.name}</div>
            <div class="inventory-card-benefit">${(item as any).benefit}</div>
          </div>
        `;
        this.assetsGrid?.appendChild(card);
      });
    }
  }
}

export default UIManager;
