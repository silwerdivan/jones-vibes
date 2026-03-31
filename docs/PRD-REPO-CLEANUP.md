# PRD: Repository Cleanup & Legacy Decommissioning

## 1. Executive Summary
**Objective:** Streamline the project structure by archiving legacy documentation, redundant backups, and completed development artifacts.
**Goal:** Reduce cognitive load for AI agents and maintainers, preventing "hallucinations" or confusion caused by outdated context or redundant files.

## 2. Problem Statement
The current repository contains a high volume of "noise" files:
*   **Context Pollution:** AI agents (like Gemini CLI) process the file tree and often "read" outdated phase documents or backups, leading to conflicting instructions.
*   **Onboarding Friction:** New developers or agents must navigate through ~30+ files that are no longer relevant to the current state of the game.
*   **Terminology Drift:** Older documents use deprecated terms (e.g., "Happiness" vs. "Sanity") which can lead to implementation errors if an agent relies on them.

## 3. Product Requirements (PRs)

### PR-1: Centralized Archive Strategy
The system must move non-active artifacts to a dedicated `archive/` directory:
- **Phase Completion Logs:** All `*-completed.md` and `*-activity.md` files from previous sprints.
- **Legacy Backups:** All `.bak` files and redundant system prompts.
- **Outdated Design Inputs:** Initial designer inputs that have been fully superseded by implementation.

### PR-2: Documentation Freshness
The root directory and `docs/` should only contain:
- **Active Plans:** PRDs and Tech Plans currently in progress or serving as active references.
- **System Architecture:** High-level diagrams and current project-standing documents.
- **Onboarding:** README and current AGENTS.md.

### PR-3: CI/CD & Build Integrity
The cleanup must NOT:
- Break any imports in `src/` or `tests/`.
- Remove necessary configuration files (`.babelrc`, `tsconfig.json`, etc.).
- Delete files that are actively used by the deployment workflow (`.github/workflows/`).

### PR-4: Searchability
Archived files should still be accessible for historical reference but clearly marked as `ARCHIVED` to prevent agents from using them as "ground truth."

## 4. Success Metrics
| Metric | Baseline | Target |
| :--- | :--- | :--- |
| **Root File Count** | ~60+ files | < 25 files |
| **AI Context Relevance** | High Noise | High Signal (0 legacy hits) |
| **Onboarding Time** | High (filtering) | Low (direct) |

## 5. Implementation Strategy (High Level)
1.  **Identify Artifacts:** Categorize files into "Active," "Legacy," and "Redundant."
2.  **Move to Archive:** Execute a surgical move of identified files to `archive/` or `docs-archive/`.
3.  **Update References:** Ensure the `README.md` or `AGENTS.md` points to the new archive location for historical context.
4.  **Verify Build:** Run `npm run build` and `npm test` to ensure no accidental deletions occurred.
