# Phase 11 Slice Logs

This directory is the canonical home for detailed Phase 11 week-by-week audit records.

## Purpose
- Preserve raw per-slice telemetry, decision rationale, and MDA observations without bloating `phase-11-audit-progress.md`.
- Keep `phase-11-audit-progress.md` focused on the current executive summary, emerging patterns, and next action.
- Let persona logs such as `audit-log-persona-a.md` act as compact indexes plus milestone synthesis layers.

## Rules
- Write one slice file per completed in-game week or other bounded autonomous slice.
- Prefer `persona-x/week-NN.md` naming so slices sort naturally.
- Treat these slice files as the canonical detailed history for Phase 11.
- If a later authoritative replay supersedes a provisional slice, do not delete the old file; mark it as superseded and point to the authoritative replacement.

## Suggested Layout
- `phase-11-slices/persona-a/week-01.md`
- `phase-11-slices/persona-a/week-02.md`
- `phase-11-slices/persona-b/week-01.md`
- `phase-11-slices/persona-c/week-01.md`

Use `docs/workflows/cyberpunk-overhaul/phase-11-slice-template.md` when creating new slice records.
