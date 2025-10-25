Below is a step-by-step guide to fix the mobile-friendliness issue with the "AI is thinking..." loading overlay. Based on your description, the problem seems to stem from the overlay being positioned `absolute` relative to the `.game-container`, which can cause centering issues on mobile (e.g., if the container is taller than the viewport or if scrolling is involved). The content (spinner and text) ends up off-screen or requiring a scroll to view fully.

We'll address this by:
- Adjusting the CSS to make the overlay `position: fixed` on mobile, ensuring it's always centered in the full viewport.
- Tweaking the flexbox and z-index for better visibility.
- Adding minor improvements for touch devices (e.g., preventing scroll-through).

This should make the overlay truly full-screen and centered on mobile without needing to scroll. I've tested this mentally against common mobile scenarios (e.g., iOS Safari, Android Chrome) and it should resolve the issue.

---

### 1. Update the Loading Overlay CSS
Open **style.css** and replace the existing `#loading-overlay` styles with the following. This keeps the desktop behavior but switches to `fixed` positioning on mobile via the media query.

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
  pointer-events: none; /* Allow clicks to pass through if needed, but we disable buttons anyway */
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

/* Mobile-specific fixes */
@media (max-width: 768px) {
  #loading-overlay {
    position: fixed; /* Full viewport coverage */
    top: 0; left: 0;
    width: 100vw; height: 100vh; /* Use viewport units for full screen */
    z-index: 2000; /* Higher z-index to ensure it's above fixed elements like actions panel */
  }
  /* Prevent body scroll while overlay is visible */
  body.loading-active {
    overflow: hidden;
  }
}
```

---

### 2. Update JavaScript to Handle Mobile Scroll Prevention
We need to add a class to the body when the overlay is shown to prevent scrolling underneath it on mobile. This ensures the text stays centered without accidental scrolls hiding it.

Open **js/ui.js** and modify the `showLoading` and `hideLoading` methods in the `GameView` class as follows:

```javascript
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
```

---

### 3. Ensure HTML Structure is Correct
Your **index.html** already has the loading overlay inside `.game-container`, which is fine. No changes needed here, but double-check it's placed at the end of `.game-container` (just before the closing `</div>`), as in your source code:

```html
<!-- START: Loading Overlay -->
<div id="loading-overlay" class="hidden">
  <div class="spinner"></div>
  <p class="loading-text">AI is thinking...</p>
</div>
<!-- END: Loading Overlay -->
```

---

### 4. Test It
1. Run your app on a mobile device or emulator (e.g., Chrome DevTools with device mode).  
2. Trigger an AI turn (e.g., end Player 1's turn).  
3. The overlay should now appear full-screen and centered, with the spinner and "AI is thinking..." text visible immediately—no scrolling required.  
4. Try scrolling the page while the overlay is active; it should be locked (thanks to `overflow: hidden`).  
5. After the AI finishes, the overlay hides, and scrolling resumes normally.  

If you still see issues (e.g., on very tall screens), you can add `transform: translate(-50%, -50%); top: 50%; left: 50%;` to `#loading-overlay` inside the media query for absolute centering, but the flexbox should handle it fine.

This fix builds directly on your existing code and should resolve the mobile overlay problem without breaking desktop views! If you encounter any edge cases (e.g., specific device quirks), provide more details like the browser/device, and I can refine it further.