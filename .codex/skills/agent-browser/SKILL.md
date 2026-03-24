---
name: agent-browser
description: Browser automation with the agent-browser CLI for opening sites, inspecting pages, clicking elements, filling forms, taking screenshots, extracting page data, reproducing UI issues, and handling authenticated browser sessions. Use when Codex needs to automate web interaction in Chrome or Chromium, test a web app through the browser, scrape structured page content, capture screenshots, or drive a login flow with saved session state.
---

# Agent Browser

Use this skill to drive websites with the `agent-browser` CLI.

**IMPORTANT: Linux Syntax Rule**
On Linux, `agent-browser` requires `--no-sandbox` to be passed via the `--args` option **AFTER** the command.
- **Correct**: `agent-browser <command> --args "--no-sandbox"`
- **Incorrect**: `agent-browser --no-sandbox <command>`

Read [references/authentication.md](references/authentication.md) when the task involves login state, persistent sessions, cookies, or saved credentials.

## Check Availability

1. Confirm the CLI exists before planning around it:
   - `agent-browser help --args "--no-sandbox"`
2. If the CLI is missing, say so and stop before inventing browser results.
3. If Chrome or Chromium is not installed for the tool, suggest `agent-browser install`.

## Core Workflow (Phase 5 Hygiene)

Follow this loop to prevent "Tool Limping":

1. **Wait then Act**: ALWAYS use `wait <selector>` or `sleep 1` before interaction commands.
2. **Recipe Priority**: Check `docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json` for stable selectors.
3. **No Blind Probing**: If an action fails, do NOT dump the full DOM. Fall back to a known stable state check.
4. Open the target page.
5. Wait for the page or route transition to settle.
6. Snapshot interactive elements (`snapshot -i`).
7. Use the returned `@e...` references for clicks, fills, selects, and checks.
8. Re-run `snapshot -i` after any page transition or meaningful DOM change.

Example:

```bash
agent-browser open https://example.com/login --args "--no-sandbox"
agent-browser wait --load networkidle --args "--no-sandbox"
agent-browser snapshot -i --args "--no-sandbox"
agent-browser fill @e1 "user@example.com" --args "--no-sandbox"
agent-browser fill @e2 "password123" --args "--no-sandbox"
agent-browser click @e3 --args "--no-sandbox"
agent-browser wait --load networkidle --args "--no-sandbox"
agent-browser snapshot -i --args "--no-sandbox"
```

## Preferred Command Patterns

Use separate commands when you need to inspect output before continuing. Use chained commands only when no intermediate parsing is required.

```bash
agent-browser open https://example.com --args "--no-sandbox" && agent-browser wait --load networkidle --args "--no-sandbox" && agent-browser screenshot page.png --args "--no-sandbox"
```

Prefer these commands:

- `agent-browser open <url> --args "--no-sandbox"` to navigate.
- `agent-browser snapshot -i --args "--no-sandbox"` to discover actionable elements.
- `agent-browser click @e1 --args "--no-sandbox"` to activate an element from a snapshot.
- `agent-browser fill @e2 "text" --args "--no-sandbox"` to replace field contents.
- `agent-browser type @e2 "text" --args "--no-sandbox"` to append or type without clearing.
- `agent-browser wait --load networkidle --args "--no-sandbox"` after navigation-heavy actions.
- `agent-browser wait <selector> --args "--no-sandbox"` for content-specific waits.
- `agent-browser screenshot path.png --args "--no-sandbox"` for visual evidence.

## Operating Rules

1. Treat snapshot references as ephemeral. Do not reuse them after navigation, rerender, or modal transitions.
2. Prefer explicit waits over blind sleeps. Use timed waits only as a fallback.
3. On Linux, include `--args "--no-sandbox"` on every `agent-browser` invocation unless the environment is explicitly known not to need it.
4. Keep screenshots and downloaded artifacts inside the workspace unless the user asks otherwise.
5. If the task is a test or bug reproduction, record:
   - exact URL,
   - commands used,
   - expected result,
   - actual result,
   - any saved screenshot path.
6. Never claim a browser action succeeded unless the follow-up snapshot, text check, URL check, or screenshot supports it.
7. Be careful with destructive actions such as submitting forms, deleting data, or clicking checkout flows. Pause and confirm when the action has real-world side effects.

## Common Task Shapes

### Fill A Form

1. Open the form page.
2. Wait for load completion.
3. Snapshot with `-i`.
4. Fill fields using refs.
5. Re-snapshot if validation messages or dynamic sections appear.
6. Click submit only if the user asked for submission or if the task clearly requires it.

### Capture A Screenshot

1. Open the page.
2. Wait until loading or animation settles.
3. Take the screenshot.
4. If accuracy matters, also collect `get url` or `get title`.

### Reproduce A UI Bug

1. Identify the shortest repro path.
2. Drive the page step by step with snapshots between transitions.
3. Save a screenshot at the failure state.
4. Summarize the failing step and the last confirmed-good state.

### Extract Page Data

1. Open the page and wait for the target content.
2. Snapshot or scope to a selector when possible.
3. Use `get text` for stable, narrow extraction.
4. If the page is dynamic, confirm the final URL and visible content before reporting.

## Failure Handling

- If elements are missing, refresh the snapshot before assuming the selector or reference is wrong.
- If the page keeps loading, wait on a specific element, URL, or text condition instead of only `networkidle`.
- If interaction depends on auth, switch to a session, profile, or saved state flow from [references/authentication.md](references/authentication.md).
- If automation is blocked by CAPTCHA, 2FA, or anti-bot defenses, state the blocker plainly and ask for the smallest human assist needed.
