# Workspace Instructions

## Overview

This repository uses Codex for iterative game design and implementation, not just one-off code changes. Keep workflow state lightweight and prefer reusable skills over prompt-chain markdown files.

## Available skills

### cyberpunk-overhaul
- Description: Plan, execute, validate, and roll forward phased cyberpunk design overhauls for Jones in the Fast Lane. Use when the user asks for the next overhaul phase, asks to continue or complete the current phase, wants to convert design direction into explicit implementation tasks, or wants completed phase lessons captured into project history.
- File: `./.codex/skills/cyberpunk-overhaul/SKILL.md`

### game-math-reviewer
- Description: Review balance, economy math, progression pacing, formulas, and feedback loops through an MDA lens. Use when a mechanic feels off, before economy changes land, or when simulation output needs mathematical analysis.
- File: `./.codex/skills/game-math-reviewer/SKILL.md`

## Skill usage rules

- Trigger `cyberpunk-overhaul` for requests about the cyberpunk redesign workflow, phase planning, phase execution, phase retros, or overhaul history.
- Trigger `game-math-reviewer` for requests about game economy analysis, balance audits, progression pacing, formula review, simulation result interpretation, or MDA mismatch analysis.
- Use the lightweight state files in `docs/workflows/cyberpunk-overhaul/` as the primary workflow state.
- Treat the older numbered prompt-chain files in the repo root as migration history and fallback context, not as the default control surface.

## Workflow rules

- Prefer updating `docs/workflows/cyberpunk-overhaul/current-phase.md`, `docs/workflows/cyberpunk-overhaul/overhaul-history.md`, and per-phase plan or retro docs over creating new orchestration prompts.
- Keep implementation incremental. By default, complete one clearly scoped task at a time unless the user asks for a broader batch.
- Before code edits, research affected files with fast search and then update related tests in the same pass.
