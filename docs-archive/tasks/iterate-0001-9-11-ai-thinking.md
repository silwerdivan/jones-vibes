<think>
**Adding a loading overlay**

I need to define a loading overlay in the HTML to show when the AI is working. The current setup lacks this feature, so I'll add a div for it inside the `.game-container` in the HTML, which includes a spinner. The CSS will need to style it as a full-screen overlay with a semi-transparent background, centered content, and perhaps an animation for the spinner. 

Next, I'll update the `GameView` to listen for events indicating the AI is thinking, and manage the button states accordingly by disabling them while loading and re-enabling afterward.**Updating button actions and state events**

It seems I should also disable action buttons in the choice modal, allowing the loading overlay to block clicks during the AI's turn. I'll modify the `GameState` to publish events for when the AI is thinking. This means I'll publish `aiThinkingStart` just before the AI makes its move and `aiThinkingEnd` once the AI has finished its turn.

I plan to publish the start event right after scheduling the AI action in the `endTurn` method, ensuring the UI signals immediately. This way, I can track when the AI's turn begins and ends smoothly.**Refining AI turn management**

I think I need to adjust how the game manages AI turns and loading indicators. When the player turns end, I should toggle the current player index and trigger the process for the AI's turn while also publishing state changes. The AI will act based on its success and whether it has time, recursively processing actions or ending its turn.

To control loading visibility, I'll introduce a `isAIThinking` flag to signal when the AI is in process. I plan to publish `aiThinkingStart` at the AI's turn start and `aiThinkingEnd` at the end of its actions, specifically when it passes or finishes. This should help smooth out the state transitions and loading behavior effectively.**Modifying AI actions and loading states**

I need to revise the `endTurn` and `handleAIAction` methods in the GameState to ensure proper handling of AI turns and loading indicators. When the next player is an AI, I'll modify the logic to handle different scenarios, including when the AI passes or if there’s no action defined. 

For every exit point in `handleAIAction`, I'll ensure to publish `aiThinkingEnd` to hide the loading overlay accordingly. In the `GameView`, I'll set up event listeners for starting and ending the AI's thinking state and manage the loading overlay effectively.
</think>Below is a step-by-step guide, with all the necessary code snippets, to add an “AI thinking” loading state to your game. We’ll:

1. Add a loading overlay in your HTML.  
2. Style it in your CSS.  
3. Publish “AI thinking” events from your game logic.  
4. Listen for those events in your view and show/hide the overlay, disabling the buttons in the meantime.  

---  
### 1. Add the loading overlay markup  
Open **index.html**, find the end of the `<div class="game-container">…</div>`, and just before the closing `</div>` add:

```html
    <!-- START: Loading Overlay -->
    <div id="loading-overlay" class="hidden">
      <div class="spinner"></div>
      <p class="loading-text">AI is thinking...</p>
    </div>
    <!-- END: Loading Overlay -->
```

Your structure should now look like:

```html
    <!-- existing choice‐modal markup… -->

    <!-- START: Loading Overlay -->
    <div id="loading-overlay" class="hidden">
      <div class="spinner"></div>
      <p class="loading-text">AI is thinking...</p>
    </div>
    <!-- END: Loading Overlay -->

  </div> <!-- .game-container -->
```

---  
### 2. Style the loading overlay  
Open **style.css**, and at the very bottom add:

```css
/* --- LOADING OVERLAY --- */
#loading-overlay {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1001;
}
#loading-overlay.hidden {
  display: none !important;
}
.spinner {
  border: 8px solid rgba(255,255,255,0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  width: 60px; height: 60px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loading-text {
  color: var(--off-white);
  font-size: 1.2rem;
  text-shadow: 0 0 5px var(--off-white);
}
```

This gives you a semi-transparent full-screen overlay with a CSS spinner and a “AI is thinking…” message.

---  
### 3. Emit AI‐thinking events from your game logic  
Open **js/game/GameState.js**. We’ll:

a) As soon as we schedule the AI turn, fire `aiThinkingStart`.  
b) When the AI is completely done (it either `pass`es or runs out of time), fire `aiThinkingEnd`.  

1) In the `endTurn()` method, locate:

```javascript
    if (nextPlayer.isAI && this.aiController) {
        // Use a timeout to give the player a moment to see the state change
        setTimeout(() => {
            this.processAITurn();
        }, 1500);
    }
```

And replace it with:

```javascript
    if (nextPlayer.isAI && this.aiController) {
        // Notify view to show loading
        EventBus.publish('aiThinkingStart');
        // Delay AI processing so player can see the state change
        setTimeout(() => {
            this.processAITurn();
        }, 1500);
    }
```

2) In the same file, find the entire `handleAIAction(aiAction)` method and replace it with the updated version below (or patch in the highlighted lines). The key is publishing `aiThinkingEnd()` in all of the branches where the AI turn actually finishes:

```javascript
handleAIAction(aiAction) {
    // 1) no action → end AI turn immediately
    if (!aiAction || !aiAction.action) {
        this.endTurn();
        EventBus.publish('aiThinkingEnd');
        return;
    }

    // 2) explicit 'pass' → end AI turn
    if (aiAction.action === 'pass') {
        this.addLogMessage(
            `${this._getPlayerName(this.getCurrentPlayer())} passes their turn.`,
            'info'
        );
        this.endTurn();
        EventBus.publish('aiThinkingEnd');
        return;
    }

    // 3) otherwise, carry out the action
    let success = false;
    let actionDescription = `AI decides to: ${aiAction.action}`;
    if (aiAction.params) {
        actionDescription += ` with params: ${JSON.stringify(aiAction.params)}`;
    }
    this.addLogMessage(actionDescription);

    switch(aiAction.action) {
        case 'travel':
            success = this.travel(aiAction.params.destination);
            break;
        case 'workShift':
            success = this.workShift();
            break;
        case 'takeCourse':
            success = this.takeCourse(aiAction.params.courseId);
            break;
        case 'buyItem':
            success = this.buyItem(aiAction.params.itemName);
            break;
        case 'buyCar':
            success = this.buyCar();
            break;
        case 'deposit':
            success = this.deposit(aiAction.params.amount);
            break;
        case 'withdraw':
            success = this.withdraw(aiAction.params.amount);
            break;
        case 'takeLoan':
            success = this.takeLoan(aiAction.params.amount);
            break;
        case 'repayLoan':
            success = this.repayLoan(aiAction.params.amount);
            break;
        default:
            console.warn(`AI tried an unknown action: ${aiAction.action}`);
            success = false;
            break;
    }

    const playerHasTime = this.getCurrentPlayer().time > 0;

    if (success && playerHasTime) {
        // AI still has time → decide next move
        this.checkWinCondition(this.getCurrentPlayer());
        this.addLogMessage(
            `${this._getPlayerName(this.getCurrentPlayer())} is deciding next move...`,
            'info'
        );
        setTimeout(() => this.processAITurn(), 1000);
    } else {
        // AI turn ends (either success but no time left, or action failed)
        if (!success) {
            this.addLogMessage(
                `${this._getPlayerName(this.getCurrentPlayer())}'s action failed.`,
                'warning'
            );
        }
        this.endTurn();
        EventBus.publish('aiThinkingEnd');
    }
}
```

> Note: We fire `aiThinkingEnd` in all three “exit” cases:  
> • no action  
> • explicit pass  
> • final else (failed or out of time)  

---  
### 4. Listen for those events in your view  
Open **js/ui.js**. In your `GameView` constructor, add:

```javascript
// right after you cache modalCancel, e.g. below:
// this.modalCancel.addEventListener('click', () => this.hideModal());

// 1) Cache the loading overlay:
this.loadingOverlay = document.getElementById('loading-overlay');

// 2) Subscribe to the AI‐thinking events:
EventBus.subscribe('aiThinkingStart',  () => this.showLoading());
EventBus.subscribe('aiThinkingEnd',    () => this.hideLoading());
```

Then, still in **js/ui.js**, add the two helper methods **inside** the `GameView` class (for example, right after `hideModal()`):

```javascript
// Show the loading overlay and disable action buttons
showLoading() {
  this.loadingOverlay.classList.remove('hidden');
  this.actionButtons.forEach(btn => btn.disabled = true);
}

// Hide the loading overlay and re-enable action buttons
hideLoading() {
  this.loadingOverlay.classList.add('hidden');
  this.actionButtons.forEach(btn => btn.disabled = false);
}
```

Your final **js/ui.js** should look roughly like this (only the additions are highlighted):

```javascript
class GameView {
  constructor() {
    // … existing element caches …

    // Choice modal cancel
    this.modalCancel.addEventListener('click', () => this.hideModal());

    // --- LOADING OVERLAY ---
    this.loadingOverlay = document.getElementById('loading-overlay');
    EventBus.subscribe('aiThinkingStart', () => this.showLoading());
    EventBus.subscribe('aiThinkingEnd',   () => this.hideLoading());

    // … existing stateChanged subscription …
  }

  showChoiceModal(...) { /* … */ }
  hideModal() { /* … */ }

  // --- NEW: Loading handlers ---
  showLoading() {
    this.loadingOverlay.classList.remove('hidden');
    this.actionButtons.forEach(btn => btn.disabled = true);
  }

  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
    this.actionButtons.forEach(btn => btn.disabled = false);
  }

  render(gameState) { /* … */ }
}
```

---  
### 5. Test it  
1. Run your app.  
2. Take a turn as Player 1, then click **Rest / End Turn**.  
3. You should immediately see the “AI is thinking…” overlay and all buttons greyed out.  
4. After the AI finishes (usually a few seconds of spinner + log updates), the overlay disappears and your buttons become active again.  

You now have clear visual feedback whenever the AI is doing its multi-step thinking!