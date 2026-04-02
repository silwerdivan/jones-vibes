# Repository Cleanup Implementation Plan

This plan follows the requirements set out in `docs/PRD-REPO-CLEANUP.md`.

## Phase 1: Archive Root Level Noise
Move legacy documentation and temporary logs to `docs-archive/`.

- [x] **Designer Inputs**
    - [x] Move `0. designer-1-input.md`
    - [x] Move `0. designer-2-input.md`
- [ ] **Phase Activity Logs**
    - [x] Move `2. cyberpunk-designer-overhaul-phase-1-activity.md`
    - [x] Move `2. cyberpunk-designer-overhaul-phase-2-activity.md`
    - [x] Move `2. cyberpunk-designer-overhaul-phase-5-activity.md`
    - [x] Move `2. cyberpunk-designer-overhaul-phase-6-activity.md`
    - [x] Move `3. cyberpunk-designer-overhaul-phase-3-activity.md`
    - [ ] Move `3. cyberpunk-designer-overhaul-phase-4-activity.md`
- [ ] **Phase Completion Logs**
    - [ ] Move `2. cyberpunk-designer-overhaul-phase-1-completed.md`
    - [ ] Move `2. cyberpunk-designer-overhaul-phase-1.5-completed.md`
    - [ ] Move `2. cyberpunk-designer-overhaul-phase-2-completed.md`
    - [ ] Move `2. cyberpunk-designer-overhaul-phase-5-completed.md`
    - [ ] Move `3. cyberpunk-designer-overhaul-phase-3-completed.md`
    - [ ] Move `3. cyberpunk-designer-overhaul-phase-4-completed.md`
- [ ] **Prompts & Instructions**
    - [ ] Move `1. cyberpunk-designer-overhaul-prompt.md`
    - [ ] Move `2.5. cyberpunk-task-planner-prompt.md`
    - [ ] Move `3. cyberpunk-overhaul-prompt.md`
    - [ ] Move `cyberpunk-overhaul-phase-7-continue-prompt.txt`
- [ ] **Backups (.bak)**
    - [ ] Move `AGENTS (codex).md.bak`
    - [ ] Move `AGENTS-2.md.bak`
    - [ ] Move `AGENTS-codex.md.bak`
    - [ ] Move `AGENTS.md.bak`
- [ ] **Diagnostics & Temporary Logs**
    - [ ] Move `session-summary-2026-03-23.md`
    - [ ] Move `tmp-ralph-log.txt`
    - [ ] Move `token-inflation-audit-findings.md`
    - [ ] Move `token-inflation-diagnostic.md`
    - [ ] Move `token-usage-breakdown.md`
    - [ ] Move `plan-mode-stages-analysis.md`

## Phase 2: Reference Updates
Update key documentation to reflect the new structure.

- [ ] **README.md**
    - [ ] Add a note about `docs-archive/` for historical context.
    - [ ] Update any broken links to archived files.
- [ ] **AGENTS.md**
    - [ ] Verify that current agent instructions do not rely on archived "ground truth."

## Phase 3: Verification
Ensure repository integrity and measure success.

- [ ] **Build Integrity**
    - [ ] Run `npm run build` to ensure no critical assets were moved.
- [ ] **Test Integrity**
    - [ ] Run `npm test` to confirm the test suite still passes.
- [ ] **Metrics Validation**
    - [ ] Confirm Root File Count is < 25.
