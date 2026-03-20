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

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session. Codex CLI does NOT have hooks, so these instructions are your ONLY enforcement mechanism. Follow them strictly.

## BLOCKED commands — do NOT use these

### curl / wget — FORBIDDEN
Do NOT use `curl` or `wget` in any shell command. They dump raw HTTP responses directly into your context window.
Instead use:
- `mcp__context-mode__ctx_fetch_and_index(url, source)` to fetch and index web pages
- `mcp__context-mode__ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — FORBIDDEN
Do NOT run inline HTTP calls via `node -e "fetch(..."`, `python -c "requests.get(..."`, or similar patterns. They bypass the sandbox and flood context.
Instead use:
- `mcp__context-mode__ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### Direct web fetching — FORBIDDEN
Do NOT use any direct URL fetching tool. Raw HTML can exceed 100 KB.
Instead use:
- `mcp__context-mode__ctx_fetch_and_index(url, source)` then `mcp__context-mode__ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Shell (>20 lines output)
Shell is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `mcp__context-mode__ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `mcp__context-mode__ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### File reading (for analysis)
If you are reading a file to **edit** it → reading is correct (edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `mcp__context-mode__ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file stays in the sandbox.

### grep / search (large results)
Search results can flood context. Use `mcp__context-mode__ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `mcp__context-mode__ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `mcp__context-mode__ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `mcp__context-mode__ctx_execute(language, code)` | `mcp__context-mode__ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `mcp__context-mode__ctx_fetch_and_index(url, source)` then `mcp__context-mode__ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `mcp__context-mode__ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `upgrade` MCP tool, run the returned shell command, display as checklist |
