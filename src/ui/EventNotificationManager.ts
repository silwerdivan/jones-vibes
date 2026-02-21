import EventBus from '../EventBus.js';
import { LogMessage } from '../models/types.js';

class EventNotificationManager {
  private displayTimeout: ReturnType<typeof setTimeout> | null;
  private displayDuration: number;
  private eventStrip!: HTMLElement;
  private eventText!: HTMLElement;

  constructor() {
    this.displayTimeout = null;
    this.displayDuration = 3500; // 3.5 seconds
    
    this.init();
  }
  
  init() {
    this.createEventStrip();
    
    // Subscribe to game events
    EventBus.subscribe('gameEvent', (event: LogMessage) => {
      this.addEvent(event);
    });
  }
  
  createEventStrip() {
    // Create event notification strip
    this.eventStrip = document.createElement('div');
    this.eventStrip.id = 'event-notification-strip';
    this.eventStrip.className = 'event-notification-strip hidden';
    
    this.eventText = document.createElement('div');
    this.eventText.className = 'event-notification-text';
    
    this.eventStrip.appendChild(this.eventText);
    
    // Add click handler to open terminal
    this.eventStrip.addEventListener('click', () => {
      EventBus.publish('logIconClicked');
      this.hideEvent();
    });

    // Swipe away logic (simple version)
    let touchStartX = 0;
    this.eventStrip.addEventListener('touchstart', (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this.eventStrip.addEventListener('touchend', (e: TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      if (Math.abs(touchEndX - touchStartX) > 50) {
        this.hideEvent();
      }
    }, { passive: true });
    
    // Insert above the action buttons panel
    const actionsPanel = document.getElementById('game-controls');
    if (actionsPanel && actionsPanel.parentNode) {
      actionsPanel.parentNode.insertBefore(this.eventStrip, actionsPanel);
    } else {
      const appShell = document.querySelector('.app-shell');
      if (appShell) appShell.appendChild(this.eventStrip);
    }
  }
  
  addEvent(event: LogMessage) {
    // Clear any existing timeout
    if (this.displayTimeout) {
      clearTimeout(this.displayTimeout);
      this.displayTimeout = null;
    }
    
    // Display the new event immediately
    this.displayEvent(event);
    
    // Set timeout to hide event
    this.displayTimeout = setTimeout(() => {
      this.hideEvent();
    }, this.displayDuration);
  }
  
  displayEvent(event: LogMessage) {
    // Set event text and category
    this.eventText.textContent = event.text;
    
    // Add category class if available
    if (event && event.category) {
      this.eventText.className = `event-notification-text log-${event.category}`;
    } else {
      this.eventText.className = 'event-notification-text';
    }
    
    // Show the strip with animation
    this.eventStrip.classList.remove('hidden');
    this.eventStrip.classList.add('show');
    this.eventStrip.classList.remove('shrinking');
  }
  
  hideEvent() {
    // Add shrinking/fade animation
    this.eventStrip.classList.add('shrinking');
    
    // After animation completes, hide the strip
    setTimeout(() => {
      this.eventStrip.classList.remove('show', 'shrinking');
      this.eventStrip.classList.add('hidden');
      this.displayTimeout = null;
    }, 500); 
  }
}

export default EventNotificationManager;