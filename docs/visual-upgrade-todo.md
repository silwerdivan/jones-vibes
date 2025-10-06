# TODO: Visual Upgrade

This checklist is derived from the `visual-upgrade-blueprint.md` and outlines the atomic tasks for the UI refactoring.

### Phase 1: CSS Foundation
- [ ] **TODO-1:** Create new directory: `css`.
- [ ] **TODO-2:** Create new file: `css/style.css`.
- [ ] **TODO-3:** Add CSS color, typography, and layout variables to `css/style.css`.
- [ ] **TODO-4:** Add base styles for `body`, headings, and paragraphs in `css/style.css`.
- [ ] **TODO-5:** Link `css/style.css` in `index.html`.

### Phase 2: Main Layout & HTML Structure
- [ ] **TODO-6:** Assign ID `game-container` to the main wrapper in `index.html`.
- [ ] **TODO-7:** Add styles for `#game-container` to `css/style.css`.
- [ ] **TODO-8:** Create placeholder `div` shells for UI components inside `#game-container`.

### Phase 3: Component Implementation
- [ ] **TODO-9:** Move existing elements into and apply styles for `#player-status-panel`.
- [ ] **TODO-10:** Move existing elements into and apply styles for `#opponent-status-panel`.
- [ ] **TODO-11:** Move existing elements into and apply styles for `#time-movement-tracker`.
- [ ] **TODO-12:** Style the `#end-turn-btn` button.
- [ ] **TODO-13:** Move existing elements into and apply styles for `#event-log`.

### Phase 4: Iconography & Polish
- [ ] **TODO-14:** Add placeholder `<span>` elements for icons in the HTML.
- [ ] **TODO-15:** Final review of UI against `spec.md` and refine styles.
