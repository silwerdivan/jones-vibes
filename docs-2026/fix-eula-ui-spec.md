# Design Spec: EULA UI Refinement (Mobile-First)

## 1. Problem Statement
The current EULA screen suffers from poor readability and layout issues on mobile devices:
- The main header overflows the screen width.
- The status indicator is too small to read.
- The EULA text container has a fixed height that doesn't adapt to smaller viewports, making it hard to read and scroll.
- Double-scrolling issues between the content container and the text wrapper.

## 2. Visual Overhaul

### 2.1 Typography & Header
- **Main Header (`.neon-text-cyan` in `.eula-header`):** 
  - Use `clamp(1.1rem, 4.5vw, 1.8rem)` for fluid scaling.
  - Add `word-break: break-all` or `hyphens: auto` if necessary, but preferred is to just scale down.
- **Status Indicator (`.eula-status`):**
  - Increase `font-size` to `12px`.
  - Add `letter-spacing: 1px` and a slight text-shadow for better visibility.
  - Change color to `var(--neon-yellow)` with a subtle glow.

### 2.2 Layout & Responsiveness
- **EULA Content (`.eula-content`):**
  - Remove `overflow-y: auto` from the main content to avoid double scrollbars.
  - Set `display: flex; flex-direction: column; flex: 1; overflow: hidden;`.
- **Text Wrapper (`.eula-text-wrapper`):**
  - Change `height: 250px` to `flex: 1.5;`.
  - Set `min-height: 150px;`.
  - This ensures it occupies more vertical space than the clauses section on small screens.
- **Clauses Section (`.eula-clauses-section`):**
  - Set `flex: 1;`.
  - Add `overflow-y: auto;` to the `.clauses-grid` if needed, or let the `eula-container` handle it if we want a single scroll.
  - **Decision:** The EULA text *must* be scrolled to the bottom to enable the button. Therefore, it should be the primary scrollable element or prominently featured.

### 2.3 Refined EULA Flow
1. Header (Fixed)
2. EULA Text (Scrollable, Takes priority space)
3. Clauses (Scrollable or fixed depending on space)
4. Footer (Fixed)

## 3. CSS Implementation Plan

```css
.eula-header h1 {
    font-size: clamp(1.1rem, 4.5vw, 1.8rem);
    line-height: 1.2;
    margin: 0;
}

.eula-status {
    font-size: 12px;
    letter-spacing: 1px;
    text-shadow: 0 0 5px rgba(255, 214, 0, 0.4);
    text-transform: uppercase;
}

.eula-content {
    overflow: hidden; /* Prevent double scroll */
}

.eula-text-wrapper {
    height: auto; /* Remove fixed height */
    flex: 1.5;
    min-height: 180px;
    margin-bottom: var(--space-md);
}

.eula-clauses-section {
    flex: 1;
    overflow-y: auto;
    padding-right: 4px; /* Space for scrollbar */
}
```

## 4. Acceptance Criteria
- [ ] Header fits on iPhone SE (320px width).
- [ ] Status text is legible.
- [ ] EULA text box is the dominant element and scrolls independently.
- [ ] Clauses are accessible and don't push the "Accept" button off-screen (if possible, otherwise the whole container scrolls).
