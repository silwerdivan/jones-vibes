## Step 3: Update the JavaScript View

### 3.1 Open `js/ui.js`

### 3.2 Add Mobile Stats DOM References

In the `GameView` constructor, locate the comment `// --- NEW: Modal Element Caching ---` (around line 44).

**Add the following code AFTER the modal element caching section:**

```javascript
// --- MOBILE STATS BAR ELEMENTS ---
this.mobileStatP1 = document.getElementById('mobile-stat-p1');
this.mobileStatP2 = document.getElementById('mobile-stat-p2');
this.mobileP1Cash = document.getElementById('mobile-p1-cash');
this.mobileP1Happiness = document.getElementById('mobile-p1-happiness');
this.mobileP1Time = document.getElementById('mobile-p1-time');
this.mobileP2Cash = document.getElementById('mobile-p2-cash');
this.mobileP2Happiness = document.getElementById('mobile-p2-happiness');
this.mobileP2Time = document.getElementById('mobile-p2-time');
```

### 3.3 Update the render() Method

In the `render(gameState)` method, locate the comment `// --- END: ACTIVE PLAYER HIGHLIGHT ---` (around line 126).

**Add the following code immediately AFTER that comment:**

```javascript
// --- MOBILE STATS UPDATE ---
// Update mobile stats bar (only visible on mobile)
if (this.mobileP1Cash) {
    // Update Player 1 mobile stats
    this.mobileP1Cash.textContent = `$${player1.cash}`;
    this.mobileP1Happiness.textContent = player1.happiness;
    this.mobileP1Time.textContent = `${player1.time}h`;
    
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
if (this.mobileP2Cash && gameState.players.length > 1) {
    const player2 = gameState.players[1];
    this.mobileP2Cash.textContent = `$${player2.cash}`;
    this.mobileP2Happiness.textContent = player2.happiness;
    this.mobileP2Time.textContent = `${player2.time}h`;
    
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
```