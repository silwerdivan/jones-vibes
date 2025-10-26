import EventBus from '../EventBus.js';

class EventNotificationManager {
  constructor() {
    this.currentEvent = null;
    this.displayTimeout = null;
    this.unreadCount = 0;
    this.displayDuration = 2000; // 2 seconds minimum display time
    
    // DOM elements
    this.eventStrip = null;
    this.eventText = null;
    this.logIcon = null;
    this.badge = null;
    
    this.init();
  }
  
  init() {
    this.createEventStrip();
    this.createLogIcon();
    
    // Subscribe to game events
    EventBus.subscribe('gameEvent', (event) => {
      this.addEvent(event);
    });
    
    // Subscribe to log opened event
    EventBus.subscribe('logOpened', () => {
      this.resetUnreadCount();
    });
    
    // Subscribe to add to log event
    EventBus.subscribe('addToLog', (event) => {
      // This event is handled by the regular log update in GameState
      // We don't need to do anything here as the event is already in the log
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
    
    // Insert above the action buttons panel
    const actionsPanel = document.getElementById('game-controls');
    actionsPanel.parentNode.insertBefore(this.eventStrip, actionsPanel);
  }
  
  createLogIcon() {
    // Create log icon with badge
    const logIconContainer = document.createElement('div');
    logIconContainer.id = 'log-icon-container';
    logIconContainer.className = 'log-icon-container';
    
    this.logIcon = document.createElement('div');
    this.logIcon.id = 'log-icon';
    this.logIcon.className = 'log-icon';
    this.logIcon.innerHTML = '📋';
    
    this.badge = document.createElement('div');
    this.badge.id = 'notification-badge';
    this.badge.className = 'notification-badge hidden';
    
    logIconContainer.appendChild(this.logIcon);
    logIconContainer.appendChild(this.badge);
    
    // Add click handler to open log
    logIconContainer.addEventListener('click', () => {
      EventBus.publish('logIconClicked');
    });
    
    // Position it in the event log header
    const eventLogHeader = document.querySelector('.event-log h3');
    if (eventLogHeader) {
      eventLogHeader.appendChild(logIconContainer);
    }
  }
  
  addEvent(event) {
    // Clear any existing timeout
    if (this.displayTimeout) {
      clearTimeout(this.displayTimeout);
      this.displayTimeout = null;
    }
    
    // If there's a current event, send it to log first
    if (this.currentEvent) {
      EventBus.publish('addToLog', this.currentEvent);
    }
    
    // Set the new event as current
    this.currentEvent = event;
    this.unreadCount++;
    this.updateBadge();
    
    // Display the new event immediately
    this.displayEvent(event);
    
    // Set timeout to send current event to log after display duration
    this.displayTimeout = setTimeout(() => {
      this.sendCurrentEventToLog();
    }, this.displayDuration);
  }
  
  sendCurrentEventToLog() {
    if (this.currentEvent) {
      this.animateToLog(() => {
        EventBus.publish('addToLog', this.currentEvent);
        this.currentEvent = null;
        this.displayTimeout = null;
      });
    }
  }
  
  displayEvent(event) {
    // Set event text and category
    this.eventText.textContent = typeof event === 'string' ? event : event.text;
    
    // Add category class if available
    if (event && event.category) {
      this.eventText.className = `event-notification-text log-${event.category}`;
    } else {
      this.eventText.className = 'event-notification-text';
    }
    
    // Show the strip with animation
    this.eventStrip.classList.remove('hidden');
    this.eventStrip.classList.add('show');
  }
  
  animateToLog(callback) {
    // Add shrinking animation
    this.eventStrip.classList.add('shrinking');
    
    // After animation completes, hide the strip
    setTimeout(() => {
      this.eventStrip.classList.remove('show', 'shrinking');
      this.eventStrip.classList.add('hidden');
      
      if (callback) callback();
    }, 500); // Animation duration
  }
  
  updateBadge() {
    if (this.unreadCount > 0) {
      this.badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      this.badge.classList.remove('hidden');
    } else {
      this.badge.classList.add('hidden');
    }
  }
  
  resetUnreadCount() {
    this.unreadCount = 0;
    this.updateBadge();
  }
}

export default EventNotificationManager;