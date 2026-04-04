# PRD: Repository Cleanup and Pi Agent Migration

## Overview
The repository is currently in a dirty state, containing leftover configuration, instructions, and artifacts from experiments with various AI agents (Codex, Gemini CLI, Serena, Ralph) and tools like `context-mode` MCP. The goal is to clean up these historical artifacts to provide a clean slate for the new `pi` agent, avoiding any conflicting instructions or context flooding. 

Crucially, existing useful agent skills should be retained but scrubbed of references to the old agents so that `pi` can utilize them effectively.

## Objectives
1. **Remove Old Agent Artifacts**: Delete unused and deprecated files related to Codex, Gemini, Serena, Ralph, and Context-Mode MCP.
2. **Purge Context-Mode MCP**: Uninstall and remove instructions, scripts, and configurations that enforce `context-mode` workflows.
3. **Migrate Agent Instructions**: Update `AGENTS.md` to be the primary instruction file for `pi`, removing Codex/Gemini/Context-Mode specific noise.
4. **Adapt Existing Skills**: Retain valuable skills (like `cyberpunk-overhaul`, `game-math-reviewer`, `agent-browser`, `game-tester`), but re-write their descriptions and system prompts to be agent-agnostic or tailored for `pi`.

## Scope of Work

### 1. Artifact Deletion
Identify and safely delete files that are purely historical noise or belong to old toolchains.
*   **Ignore Files**: `.geminiignore`, any references to `.serena` or `.gemini` in `.gitignore`.
*   **Backups & Duplicates**: `AGENTS (codex).md`, `AGENTS (codex).md.bak`, `AGENTS-2.md.bak`, `AGENTS.md.bak`.
*   **Old Prompts/Configs**: `gemini-system-prompt-cmds.md`, `gemini-prompt-for-ux-designer.md`, `my-system-prompt.md`.
*   **Alternative Agents**: Files and scripts in the `ralph/` directory, `tmp-ralph-log.txt`, `ralph-cyberpunk.ps1`.
*   **Obsolete Scripts**: Scripts related to old runners if no longer needed (e.g., `scripts/cyberpunk-overhaul-phase11-log-stream.mjs`, `scripts/task-runner.sh`).
*   **Context-Mode Reverts**: Revert or remove instructions introduced by the `context-mode` setup (e.g., checking git history around commit `2b70a03` and `974ad3f`).

### 2. File Updates and Refactoring

#### `AGENTS.md`
*   **Remove**: The entire section on `# context-mode — MANDATORY routing rules`.
*   **Remove**: Mention of "This repository uses Codex for iterative game design".
*   **Add**: Clean instructions for `pi` to use the retained skills.

#### Skills (`.codex/skills/`)
The skills folder should be renamed (e.g., to `.pi/skills/`, `agent/skills/`, or a similarly agnostic directory) and references inside `.md` files should be scrubbed:
*   **`agent-browser/SKILL.md`**: Remove "Use when Codex needs to automate..." -> "Use when the agent needs to automate...".
*   **`cyberpunk-overhaul/SKILL.md`**: Remove "Use when Codex needs to turn..." -> "Use when the agent needs to turn...".
*   **`game-tester/SKILL.md`**: Remove "Use when Codex needs to investigate..." -> "Use when the agent needs to investigate...".
*   **General**: Verify no specific `context-mode` or `mcp__context-mode__` commands are enforced in these skills unless supported natively by Pi.

### 3. Verification
*   Ensure that running `git grep -iE "codex|gemini|context-mode"` returns zero unintended matches in the active codebase.
*   Verify that Pi agent recognizes and can read the updated skills directory/files.

## Implementation Steps (Proposed)
1.  **Branching**: Create a new git branch for this cleanup.
2.  **Deletion**: Execute file deletions for backup files and old agent artifacts.
3.  **Refactoring AGENTS.md**: Edit `AGENTS.md` to remove old tooling rules.
4.  **Skills Migration**: Move the `.codex/skills` directory to a new standard location and edit the markdown files to replace Codex/Gemini references.
5.  **Gitignore Audit**: Clean up `.gitignore` of old agent directories.
6.  **Commit**: Commit changes with a clear summary of the removed tools.