# Session Summary: Phase 11 Opencode Integration
**Date:** 2026-03-23

## Problem
`AGENT_EXEC=opencode npm run p11:oncec` was failing.

## Root Causes Found

1. `opencode exec` — invalid subcommand (opencode has no `exec`)
2. `--project` — invalid flag (should be `--dir`)
3. Codex API credits exhausted (opencode uses same backend)
4. `--file` + `--command` combination didn't work
5. Codex-specific flags (`--full-auto`, `-m`) were being applied to opencode

## Fix Applied (in `scripts/cyberpunk-overhaul-phase11-once.sh`)

- Changed opencode invocation to use `bash -c` with `cat` to pass prompt as message
- `--dir` instead of `--project`
- Split execution block: codex uses stdin pipe, opencode doesn't
- Wrapped exec_strategy flags in `[[ "${AGENT_EXEC}" == "codex" ]]` guard

## Current State

- Opencode integration works (codex_exit=0, ran ~200s)
- Run didn't complete Week 9 — game still at turn 9 (Week 8 summary)
- Likely ran out of context/tokens before finishing
- No `week-09.md` was written
- **You switched models** to avoid the credit limit issue

## Remaining Work

- Make workflow more deterministic (week file creation on partial runs)
- Re-run to complete Week 9 or handle partial runs gracefully

## GEMINI_UPDATE (Success)

- Successfully restored Week 8 checkpoint in the `phase11-safe-grinder` session.
- Manually dismissed the summary modal (avoiding the `ADVANCE_TURN` skip bug).
- Completed Week 9 (Persona A - Safe Grinder).
- **Result:** Persona A burned out at the end of Week 9 due to Sanity collapse (hit 0).
- **MDA Insight:** Confirmed that the 20% Max Energy penalty from Trauma Reboot creates a lethal Sanity cliff when combined with Ambient Stress and no food (Exhaustion Protocol @ 80% hunger).
- **Next Step:** Persona A Week 10 (Survival/Sustenance) is ready.
