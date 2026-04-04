# Implementation Plan: Pi Agent Cleanup

This document breaks down the cleanup and migration described in `PRD-PI-CLEANUP.md` into small, committable tasks suitable for a junior developer.

## Phase 1: Preparation & Branching
- [x] Create a new branch for the cleanup work: `git checkout -b chore/pi-cleanup`

## Phase 2: Artifact Deletion
Delete unused files and old toolchain artifacts. After deleting these files, create a single commit.

- [x] Delete ignore files: `rm -f .geminiignore`
- [x] Delete backup and duplicate agent files: `rm -f "AGENTS (codex).md" "AGENTS (codex).md.bak" AGENTS-2.md.bak AGENTS.md.bak`
- [x] Delete old prompt/config files: `rm -f gemini-system-prompt-cmds.md gemini-prompt-for-ux-designer.md my-system-prompt.md`
- [x] Delete `ralph` agent files: `rm -rf ralph/ tmp-ralph-log.txt ralph-cyberpunk.ps1`
- [x] Delete obsolete scripts: `rm -f scripts/cyberpunk-overhaul-phase11-log-stream.mjs scripts/task-runner.sh` (verify they are not used by anything else before deleting).
- [x] **Commit:** `git add . && git commit -m "chore: remove old agent artifacts and backup files"`

## Phase 3: Gitignore Audit
Clean up ignored paths that belong to the old agents.

- [x] Open `.gitignore`.
- [x] Remove any lines referencing `.serena`, `.gemini`, and `.codex`.
- [x] **Commit:** `git add .gitignore && git commit -m "chore: update .gitignore to remove old agent directories"`

## Phase 4: Skills Directory Migration
Move the skills directory to an agent-agnostic or pi-specific location.

- [x] Rename the `.codex/skills` directory to `.pi/skills` (or use `git mv .codex .pi` if `.codex` only contains skills).
- [x] **Commit:** `git add . && git commit -m "chore: move skills directory to .pi/skills/"`

## Phase 5: Scrub Legacy References in Skills
Update the skill descriptions to remove specific mentions of Codex/Gemini or context-mode MCP.

- [x] Open `.pi/skills/agent-browser/SKILL.md` and replace "Use when Codex needs to..." with "Use when the agent needs to...".
- [x] Open `.pi/skills/cyberpunk-overhaul/SKILL.md` and replace "Use when Codex needs to..." with "Use when the agent needs to...".
- [x] Open `.pi/skills/game-tester/SKILL.md` (if it exists) and replace "Use when Codex needs to..." with "Use when the agent needs to...".
- [ ] Scan all files in `.pi/skills/` for mentions of `context-mode` or `mcp__context-mode__` and remove/rewrite those sections.
- [ ] **Commit:** `git add .pi/skills/ && git commit -m "refactor: scrub legacy agent references from skills"`

## Phase 6: Refactor `AGENTS.md`
Update the primary instruction file for the Pi agent.

- [ ] Open `AGENTS.md`.
- [ ] Locate and **delete** the entire section titled `# context-mode — MANDATORY routing rules` and all its subsections.
- [ ] Locate the "Overview" section and replace "This repository uses Codex for iterative game design" with "This repository uses the Pi agent for iterative game design".
- [ ] Update the file paths in the "Available skills" section to point to `./.pi/skills/...` instead of `./.codex/skills/...`.
- [ ] Remove any other remaining rules or instructions specifically tailored to Codex, Gemini, or `context-mode`.
- [ ] **Commit:** `git add AGENTS.md && git commit -m "docs: update AGENTS.md for pi agent and remove context-mode rules"`

## Phase 7: Verification & Final Polish
Ensure no legacy references were missed.

- [ ] Run `git grep -iE "codex|gemini|context-mode"` in the terminal.
- [ ] Review the output. If there are any unintended matches in active code, configuration, or documentation files, fix them.
- [ ] **Commit** (if any fixes were made): `git add . && git commit -m "chore: fix final straggling legacy agent references"`