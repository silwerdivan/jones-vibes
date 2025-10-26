```markdown
## Relevant Files

- `style.css` - Main stylesheet requiring extensive mobile optimizations and new component styles for event notifications, clock visualization, and mobile player cards.
- `index.html` - HTML structure for new UI elements including event notification strip, clock visualization, and full stats modal.
- `js/ui.js` - Primary UI rendering logic that needs modification to handle new components and mobile-specific behavior.
- `js/ui/EventNotificationManager.js` - New file for implementing the event notification queue system with animation and badge management.
- `js/ui/ClockVisualization.js` - New component for circular pie chart time display that replaces text-based time.
- `js/game/GameState.js` - May need updates for event categorization to support color-coded log entries.
- `js/ui/StatsModal.js` - New component for full stats modal on mobile that displays all player statistics.

## Tasks

- [x] 1.0 Implement Dynamic Title Sizing and Viewport Optimizations
  - [x] 1.1 Modify CSS to scale down game title font size by 30-40% on mobile viewports (< 768px)
  - [x] 1.2 Reduce vertical spacing between UI elements by 20-30% in mobile view
  - [x] 1.3 Consolidate "Current Location" and "Turn" into a single compact bar in mobile view
  - [x] 1.4 Ensure action buttons include both icons and text labels for clarity
  - [x] 1.5 Implement fixed action panel at bottom on mobile for easy thumb access
  - [x] 1.6 Update mobile-specific CSS to maintain 80% viewport utilization

- [x] 2.0 Create Enhanced Mobile Player Cards with Stats Modal
  - [x] 2.1 Increase mobile player stat cards size by 30% from current implementation
  - [x] 2.2 Display at least 2 additional key stats (Happiness and Time) on mobile cards
  - [x] 2.3 Ensure text and icons have appropriate contrast ratios (minimum 4.5:1)
  - [x] 2.4 Update player labels to use "You" and "AI" consistently (not "P1" or "Player 1")
  - [x] 2.5 Implement full-screen modal triggered by tapping player card
  - [x] 2.6 Add all player statistics to modal: Cash, Savings, Loan, Happiness, Education, Career, Car ownership, Time remaining
  - [x] 2.7 Implement clear close mechanism (X button or swipe down) for the modal
  - [x] 2.8 Ensure modal maintains player's color theme (magenta for You, cyan for AI)
  - [x] 2.9 Add visual feedback to active player's card (scale and glow)

- [x] 3.0 Build Event Notification System with Queue Management
  - [x] 3.1 Create new EventNotificationManager component to handle event queue
  - [x] 3.2 Implement event strip/toast that appears above action buttons
  - [x] 3.3 Add queue system for rapid actions: each event displays for minimum 2 seconds
  - [x] 3.4 Implement queue logic: new events queue if one is displaying, display sequentially
  - [x] 3.5 Set maximum queue size of 5 events (older events go directly to log if exceeded)
  - [x] 3.6 Add animation showing event "shrinking" and moving to log icon
  - [x] 3.7 Implement log icon with badge showing unread event count
  - [x] 3.8 Ensure badge count resets to zero when game log is opened
  - [x] 3.9 Add CSS animations for smooth transitions between queued events
  - [x] 3.10 Refactor notification system to use sliding window approach for rapid actions (improved UX)

- [x] 4.0 Implement Clock Visualization Component
  - [x] 4.1 Create new ClockVisualization component to replace text-based time display
  - [x] 4.2 Implement circular pie chart that fills with darker color as time depletes
  - [x] 4.3 Set 24 hours = empty, 0 hours = full for the pie chart visualization
  - [x] 4.4 Display numeric time value in center of pie chart
  - [x] 4.5 Ensure clock visualization works on both mobile and desktop
  - [x] 4.6 Maintain existing game architecture and visual design language

- [ ] 5.0 Add Collapsible Game Log with Turn History
  - [ ] 5.1 Implement collapsible game log accessible via dedicated button/icon
  - [ ] 5.2 Create overlay/modal that expands when log is activated
  - [ ] 5.3 Ensure log maintains only events from last player turn and last AI turn
  - [ ] 5.4 Implement color coding for log entries by category (success, error, warning, etc.)
  - [ ] 5.5 Add functionality to clear notification badge when log is opened
  - [ ] 5.6 Ensure log is accessible on both mobile and desktop

- [ ] 6.0 Add Location Context Hints and Action Improvements
  - [ ] 6.1 Display contextual hint text below current location (e.g., "3 actions available here")
  - [ ] 6.2 Update hints based on player's current location
  - [ ] 6.3 Add visual indicators (glow or badge) to context-specific action buttons
  - [ ] 6.4 Ensure action button icons are simple and universally recognizable
  - [ ] 6.5 Maintain existing neon/cyberpunk color palette and retro VHS/arcade aesthetic
  - [ ] 6.6 Ensure all animations are smooth but not distracting (use CSS transitions where possible)
```