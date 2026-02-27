import { LOCATIONS, LocationName } from '../data/locations.js';
import { SHOPPING_ITEMS } from '../data/items.js';
import GameState from './GameState.js';
import UIManager from '../ui/UIManager.js';
import EventBus, { UI_EVENTS } from '../EventBus.js';
import EconomySystem from '../systems/EconomySystem.js';
import TimeSystem from '../systems/TimeSystem.js';

class GameController {
  public gameState: GameState;
  public uiManager: UIManager;
  public economySystem: EconomySystem;
  public timeSystem: TimeSystem;

  // We need a reference to the view to show modals
  constructor(gameState: GameState, uiManager: UIManager, economySystem: EconomySystem, timeSystem: TimeSystem) {
    this.gameState = gameState;
    this.uiManager = uiManager; // Store the view reference
    this.economySystem = economySystem;
    this.timeSystem = timeSystem;
    
    this.initializeEventSubscriptions();
  }

  private initializeEventSubscriptions() {
    // Only subscribe to events that trigger UI logic (modals)
    EventBus.subscribe(UI_EVENTS.WORK_SHIFT, () => this.workShift());
    EventBus.subscribe(UI_EVENTS.TRAVEL, (destination: string) => this.travel(destination));
    EventBus.subscribe(UI_EVENTS.APPLY_JOB, (level: number) => this.applyForJob(level));
    EventBus.subscribe(UI_EVENTS.TAKE_COURSE, (courseId: number) => this.takeCourse(courseId));
    EventBus.subscribe(UI_EVENTS.STUDY, () => this.study());
    EventBus.subscribe(UI_EVENTS.REQUEST_STATE_REFRESH, () => this.gameState.publishCurrentState());
    
    // Direct system actions are now routed in main.ts
  }

  workShift() {
    this.gameState.workShift();
  }

  study() {
    this.gameState.study();
  }

  buyCar() {
    this.uiManager.showChoiceModal({
      title: 'Buy a Car?',
      choices: [{
        text: 'Buy Hovercar ($3,000)',
        value: null,
        actionId: 'BUY_CAR'
      }]
    });
  }

  travel(destination?: string) {
    if (destination) {
      this.gameState.travel(destination as LocationName);
      return;
    }
    const currentPlayer = this.gameState.getCurrentPlayer();
    const availableDestinations = LOCATIONS.filter(loc => loc !== currentPlayer.location);
    
    this.uiManager.showChoiceModal({
      title: 'Where to travel?',
      choices: availableDestinations.map(dest => ({
        text: dest,
        value: dest,
        actionId: 'TRAVEL'
      }))
    });
  }
  
  deposit() {
    this.uiManager.showChoiceModal({
      title: 'How much to deposit?',
      showInput: true,
      choices: [{
        text: 'Confirm Deposit',
        value: null,
        actionId: 'BANK_DEPOSIT'
      }]
    });
  }

  withdraw() {
    this.uiManager.showChoiceModal({
      title: 'How much to withdraw?',
      showInput: true,
      choices: [{
        text: 'Confirm Withdraw',
        value: null,
        actionId: 'BANK_WITHDRAW'
      }]
    });
  }

  takeLoan() {
    this.uiManager.showChoiceModal({
      title: 'How much for loan?',
      showInput: true,
      choices: [{
        text: 'Confirm Loan',
        value: null,
        actionId: 'BANK_LOAN'
      }]
    });
  }

  repayLoan() {
    this.uiManager.showChoiceModal({
      title: 'How much to repay?',
      showInput: true,
      choices: [{
        text: 'Confirm Repayment',
        value: null,
        actionId: 'BANK_REPAY'
      }]
    });
  }

  buyItem() {
    this.uiManager.showChoiceModal({
        title: 'What to buy?',
        choices: SHOPPING_ITEMS.map(item => ({
            text: `${item.name} ($${item.cost})`,
            value: item.name,
            actionId: 'BUY_ITEM'
        }))
    });
  }

  takeCourse(courseId?: number) {
    if (courseId !== undefined) {
        this.gameState.takeCourse(courseId);
        return;
    }

    const nextCourse = this.gameState.getNextAvailableCourse();
    if (!nextCourse) {
      this.gameState.addLogMessage("No more courses available.", 'warning');
      return;
    }
    
    this.uiManager.showChoiceModal({
      title: 'Take a Course?',
      choices: [{
        text: `${nextCourse.name} ($${nextCourse.cost})`,
        value: nextCourse.id,
        actionId: 'TAKE_COURSE'
      }]
    });
  }

  applyForJob(jobLevel?: number) {
    if (jobLevel !== undefined) {
      // Called from modal with specific job level
      const success = this.gameState.applyForJob(jobLevel);
      // The GameState.applyForJob method already handles logging and event publishing
      return success;
    } else {
      // Called from button click - show modal
      this.uiManager.showJobApplicationModal();
      return false;
    }
  }
}

export default GameController;
