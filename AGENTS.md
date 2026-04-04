# Workspace Instructions

## Overview

This repository uses the Pi agent for iterative game design and implementation, not just one-off code changes. Keep workflow state lightweight and prefer reusable skills over prompt-chain markdown files.

## Available skills

### agent-browser
- Description: Browser automation with the agent-browser CLI for opening sites, inspecting pages, clicking elements, filling forms, taking screenshots, extracting page data, reproducing UI issues, and handling authenticated browser sessions.
- File: `./.pi/skills/agent-browser/SKILL.md`

### cyberpunk-overhaul
- Description: Plan, execute, validate, and roll forward phased cyberpunk design overhauls for Jones in the Fast Lane. Use when the user asks for the next overhaul phase, asks to continue or complete the current phase, wants to convert design direction into explicit implementation tasks, or wants completed phase lessons captured into project history.
- File: `./.pi/skills/cyberpunk-overhaul/SKILL.md`

### game-math-reviewer
- Description: Review balance, economy math, progression pacing, formulas, and feedback loops through an MDA lens. Use when a mechanic feels off, before economy changes land, or when simulation output needs mathematical analysis.
- File: `./.pi/skills/game-math-reviewer/SKILL.md`

### game-tester
- Description: Reproduce bugs, run focused gameplay regressions, verify fixes, and document test findings for Jones in the Fast Lane.
- File: `./.pi/skills/game-tester/SKILL.md`

## Skill usage rules

- Trigger `cyberpunk-overhaul` for requests about the cyberpunk redesign workflow, phase planning, phase execution, phase retros, or overhaul history.
- Trigger `game-math-reviewer` for requests about game economy analysis, balance audits, progression pacing, formula review, simulation result interpretation, or MDA mismatch analysis.
- Use the lightweight state files in `docs/workflows/cyberpunk-overhaul/` as the primary workflow state.
- Treat the older numbered prompt-chain files in the repo root as migration history and fallback context, not as the default control surface.

## Workflow rules

- Prefer updating `docs/workflows/cyberpunk-overhaul/current-phase.md`, `docs/workflows/cyberpunk-overhaul/overhaul-history.md`, and per-phase plan or retro docs over creating new orchestration prompts.
- Keep implementation incremental. By default, complete one clearly scoped task at a time unless the user asks for a broader batch.
- Before code edits, research affected files with fast search and then update related tests in the same pass.
- **Fair Play & Anti-Rewind**: Explicitly FORBID the use of `checkpoint:import` or `localStorage` manipulation to undo gameplay failures (Burnout, Arrest, Debt-Trap). These must be logged as "Audit Events" and the slice should exit.
- **Modal-Awareness**: Mandatory check for `body.modal-active` or `.modal-overlay` before any city-level interaction. The agent MUST NOT attempt background actions while a modal is open.
- **State-Proxy Verification**: Mandatory `state-proxy get` call at the end of every high-impact recipe (Job Apply, Shopping, Travel) to verify internal state mutation before the tool returns "Success."

