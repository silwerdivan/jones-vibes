
# Product Requirements Document: Mobile UX Improvements for Jones in the Fast Lane

## Introduction/Overview

This feature enhances the mobile user experience for "Jones in the Fast Lane" by optimizing viewport usage, improving information accessibility, and providing better visual feedback for game events. The current mobile view underutilizes screen space, hides critical player statistics, and requires scrolling to see game events. These improvements will create a more intuitive and engaging mobile experience while maintaining the game's neon/cyberpunk aesthetic.

## Goals

1. Maximize effective viewport usage to at least 80% on mobile devices
2. Enable single-tap access to all player statistics without leaving the main game view
3. Provide immediate, visible feedback for game events without requiring manual scrolling
4. Implement a visual time remaining indicator that shows depletion intuitively
5. Create a unified experience across mobile and desktop where feasible
6. Maintain the existing game architecture and visual design language

## User Stories

1. **As a mobile player**, I want to see my full stats with a single tap so that I can make informed decisions without navigating away from the game.

2. **As a mobile player**, I want to see game events as they happen so that I don't miss important information while playing.

3. **As a player**, I want to quickly understand how much time I have left visually so that I can plan my actions effectively.

4. **As a mobile player**, I want the game to use my full screen effectively so that I can see all relevant information without unnecessary scrolling.

5. **As a player**, I want contextual hints about available actions at my current location so that I understand my options.

6. **As a player**, I want consistent labeling and clear visual hierarchy so that I can quickly find the information I need.

## Functional Requirements

1. **Dynamic Title Sizing**
   - The game title must scale down on mobile viewports (< 768px width)
   - Title font size must be approximately 30-40% smaller on mobile
   - Title margin/padding must be reduced proportionally

2. **Improved Mobile Player Cards**
   - Mobile player stat cards must be 30% larger than current implementation
   - Cards must display at least 2 additional key stats beyond cash (Happiness and Time by default)
   - Text and icons must be legible with appropriate contrast ratios (minimum 4.5:1)
   - **Player labels must be consistent: "You" and "AI" (not "P1" or "Player 1")**

3. **Full Stats Modal**
   - Tapping a player card must trigger a full-screen modal with all player statistics
   - Modal must include: Cash, Savings, Loan, Happiness, Education, Career, Car ownership, Time remaining
   - Modal must have a clear close mechanism (X button or swipe down)
   - Modal must maintain the player's color theme (magenta for You, cyan for AI)

4. **Event Notification System with Queue Management**
   - New events must appear as a strip/toast above the action buttons
   - **Queue system for rapid actions**: When multiple events occur in quick succession:
     - Each event displays for a minimum of 2 seconds
     - If a new event arrives while one is displaying, it queues
     - Queued events display sequentially with smooth transitions
     - Maximum queue size of 5 events (older events go directly to log if exceeded)
   - Animation must show the event "shrinking" and moving to a log icon
   - Log icon must display a badge with unread event count
   - **Badge count resets to zero when the game log is opened**

5. **Collapsible Game Log**
   - Full game log must be accessible via a dedicated button/icon
   - Log must expand as an overlay or modal when activated
   - **Log must maintain only events from the last player turn and last AI turn**
   - Log entries must use color coding by category (success, error, warning, etc.)
   - Opening the log clears the notification badge

6. **Clock Visualization**
   - **Time remaining must replace the text display with a circular pie chart**
   - Chart must fill with darker color as time depletes (24 hours = empty, 0 hours = full)
   - Numeric time value must be displayed in the center of the pie chart

7. **Viewport Optimization**
   - Reduce vertical spacing between UI elements by 20-30%
   - Consolidate "Current Location" and "Turn" into a single compact bar
   - Action buttons must include both icons and text labels
   - Fixed action panel at bottom on mobile for easy thumb access

8. **Location Context Hints**
   - Display contextual hint text below current location (e.g., "3 actions available here")
   - Hints must update based on player's current location
   - Context-specific action buttons must have visual indicators (glow or badge)

9. **Desktop Compatibility**
   - Event notifications must also appear on desktop
   - Clock visualization must be implemented on desktop
   - Dynamic title sizing must not affect desktop view
   - **Desktop retains always-visible stat panels (no modal needed)**
   - Other mobile-specific changes must not break desktop layout

10. **Active Player Indication**
    - Active player's card must have enhanced visual feedback (scale and glow)
    - Mobile stat cards must show clear active player indicator

## Non-Goals (Out of Scope)

1. Changes to game mechanics, rules, or win conditions
2. Modifications to the EventBus architecture or communication patterns
3. Addition of new third-party libraries or dependencies
4. Complete redesign of the visual aesthetic
5. Changes to game logic in GameState.js or Player.js
6. Implementation of new game features or locations
7. Multiplayer networking capabilities
8. Save/load game functionality
9. Performance optimization for older mobile devices

## Design Considerations

- Maintain the existing neon/cyberpunk color palette (hot magenta, electric cyan, vibrant yellow)
- Preserve the retro VHS/arcade aesthetic with glow effects and borders
- Ensure all animations are smooth but not distracting (use CSS transitions where possible)
- Keep the existing font choices (Press Start 2P for headers, VT323 for body)
- Modal overlays should use semi-transparent dark backgrounds to maintain context
- **Action button icons should be simple and universally recognizable** (e.g., 💼 for work, 🎓 for education, 🏠 for rent, etc.)

## Technical Considerations

- Use CSS animations for the event notification system
- Implement a queue data structure for managing rapid event notifications
- Leverage existing modal infrastructure from choice-modal for consistency
- Implement responsive breakpoints at 768px for mobile/desktop distinction
- Use CSS Grid adjustments for viewport optimization
- Store notification badge count in component state
- Event log should maintain a rolling window of the last two turns only
- Ensure loading overlay continues to work with new layout changes

## Success Metrics

1. Mobile viewport utilization reaches at least 80% (measured by content-to-whitespace ratio)
2. All player statistics are accessible within a single tap from the main game view
3. Game events are visible without any scrolling action required
4. Time remaining is immediately understandable at a glance
5. User testing shows reduced confusion about available actions at each location
6. No degradation in desktop user experience
7. All existing game functionality remains intact
8. Event notifications remain readable even during rapid gameplay sequences

## Resolved Questions

1. ~~Should the event notification animation complexity be reduced if it impacts performance on older mobile devices?~~ **No concern for older devices**
2. ~~Should the notification badge count reset when the log is opened, or only when events are explicitly "read"?~~ **Reset when log is opened**
3. ~~Should desktop also get the expandable stats modal, or keep the always-visible panels?~~ **Keep always-visible panels on desktop**
4. ~~What specific icons should be used for action buttons to maintain clarity and consistency?~~ **Use simple, universally recognizable icons**
5. ~~Should the clock visualization replace the text-based time display entirely, or complement it?~~ **Replace entirely, with number shown in center**
6. ~~How many events should be kept in the log history before older ones are removed?~~ **Keep only the last player turn and last AI turn**