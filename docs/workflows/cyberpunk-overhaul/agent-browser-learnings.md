# Agent Browser Learnings: Cyberpunk Life-Sim

This log tracks technical patterns, selector strategies, and "gotchas" discovered while automating the "Jones in the Fastlane Vibes" codebase using `agent-browser`.

## 1. Interaction Patterns

### Clicking Dynamic Elements
- **The `@ref` Lifecycle**: Refs (like `@e1`) are **invalidated** as soon as the DOM changes significantly or navigation occurs.
- **Wait for Load**: Always use `agent-browser wait 1000` or `agent-browser wait --load networkidle` after a click before re-snapping.
- **Redundant Snapshots**: If a click fails with "Missing arguments" or "Invalid ref", it's usually because the ref was lost. Re-run `snapshot -i -C`.

### Selector Discovery
- **Cursor-Interactive Elements**: Many "buttons" in this project are actually `div` elements with `cursor:pointer` (e.g., `.location-card`). 
- **Command**: Use `agent-browser snapshot -i -C` to catch these. Plain `-i` only catches standard HTML interactive elements (buttons, inputs).

## 2. Game-Specific Logic

### Navigation
- **City Hub**: The main navigation is via `div.location-card`. These contain both a name (e.g., "Labor Sector") and a sub-label ("Productivity shifts").
- **Modal Bypassing**: The EULA and initial onboarding modals must be clicked through using the "ACCEPT" or "CLOSE" buttons before the City Hub is accessible.

### Labor Sector Interaction Quirk
- **Status**: Resolved by GitHub issue `#4` on 2026-03-19.
- **Job Application Buttons**: The visible `Apply` button inside Labor Sector is now a direct reliable action target.
- **Root Cause Pattern**: The old failure path came from shared action cards binding the action through the parent `.action-card` and deriving feedback from `document.activeElement`.
- **Stable Selectors**: Action cards now expose deterministic `data-testid` hooks such as `action-card-jobs-level-1-sanitation-t3` and `action-card-btn-jobs-level-1-sanitation-t3`.
- **Practical Rule**: Prefer the stable button `data-testid` first for `Sanitation-T3` and similar job cards. Treat older notes that require focusing the inner button and then clicking the parent card as pre-fix history only.

### Sustenance Hub Purchase Quirk
- **Status**: Resolved by GitHub issue `#4` on 2026-03-19.
- **Buy Buttons**: The visible `BUY` button in `Sustenance Hub` is now a direct reliable action target.
- **Root Cause Pattern**: The old failure path came from the shopping callback reading `document.activeElement` and assuming it lived inside the clicked card before feedback was spawned.
- **Stable Selectors**: Sustenance Hub cards now expose deterministic `data-testid` hooks such as `action-card-shopping-sustenance-hub-real-meat-burger` and `action-card-btn-shopping-sustenance-hub-real-meat-burger`.
- **Practical Rule**: Prefer the stable button `data-testid` first for food buys. Treat older Phase 11 notes about focus-dependent purchase workarounds as pre-fix history only.

### State Tracking
- **HUD Elements**: Text-based stats (₡, %, etc.) are best extracted via `agent-browser get text @ref` after identifying the correct orb or gauge ref.
- **Evaluation**: Use `agent-browser eval "document.body.innerText"` for a quick, "global" state check when refs are ambiguous or when you need to verify if the game has truly loaded or reset.

## 3. Automation "Ralph" Loops
- **Looping Mechanism**: The `ralph.ps1` script pipes context (`prompt.md`, `plan.md`, `activity.md`) into the `gemini` CLI to create an autonomous "think-act-update" cycle.
- **Completion Signal**: Use the string `RALPH_COMPLETE` to break the loop once a plan is finished.

## 4. Command "Gotchas" & Correction Log

### Incorrect Command Usage (Wasted Effort)
- **Navigation Error**: `agent-browser navigation <url>` is **not** a valid command. 
    - **Correct**: `agent-browser open <url>` (aliases: `goto`, `navigate`).
- **Flag Error**: `agent-browser -u <url>` is **not** valid. Parameters do not use `-u`.
    - **Correct**: `agent-browser open http://localhost:5174/jones-vibes/`.
- **Ref Quotation**: Using `@e1` in some shells (like PowerShell or Bash) without quotes can lead to "Missing arguments" or "Invalid ref" errors because `@` is a special character.
    - **Best Practice**: Always wrap refs in quotes: `agent-browser click "@e1"`.
- **Incorrect Flag Placement (Token Tax)**: Using `--no-sandbox` as a direct flag (instead of via `--args`) or putting it after `eval` will cause errors that bloat history.
    - **Error**: `agent-browser --session-name phase11 eval "..." --no-sandbox` (Result: `SyntaxError: Unexpected identifier 'no'`)
    - **Error**: `agent-browser --no-sandbox eval "..."` (Result: `Unknown command: --no-sandbox`)
    - **Correct Syntax**: `agent-browser <command> [args] --session-name <name> --args "--no-sandbox"`
    - **Correct Example**: `agent-browser eval "window.localStorage.getItem('save')" --session-name phase11 --args "--no-sandbox"`
    - **Linux Rule**: Always use `--args "--no-sandbox"` on Linux to avoid permission errors.

### Efficient Session Recovery
- **Snapshot Scoping**: If the UI is crowded, use `agent-browser snapshot -i -C` but be prepared for many refs. If you know the area, use `agent-browser snapshot -s ".city-grid"`.
- **Verify before Action**: If a session seems "reset" (e.g., showing a "START" button when you expect a dashboard), use `agent-browser screenshot` and `agent-browser eval "document.body.innerText"` immediately to confirm the visual state before clicking anything that might overwrite progress.
- **Modal Blocking**: If `agent-browser` returns a **Connection Error (OS error 10060)** or fails to navigate/click, check for an unclosed modal. In this project, active modals (like Agent Smith or Sustenance Hub) often block the global event loop or prevent interaction with the background City Hub, leading to timeouts that look like network failures.
    - **Fix**: Always click the "close" or "X" button (@e6 usually) before attempting to change locations.
