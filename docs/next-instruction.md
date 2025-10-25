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