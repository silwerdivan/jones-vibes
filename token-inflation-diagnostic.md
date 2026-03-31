# Token Inflation Analysis: Step-by-Step Diagnostic Prompt

To understand why your Phase 11 runs are consuming millions of tokens, we need to look at the **cumulative history** of a single "slice" execution. 

Even if each individual command is small, the LLM (Codex or Gemini) is a **stateful agent**. This means that for Turn #80, the model is re-sent the *entire history* of Turns #1 through #79.

## The Diagnostic Prompt
Copy and paste the following prompt into a **new, fresh Gemini CLI session** to perform a deep-audit of the token inflation.

---

### PROMPT START

**Objective:** Analyze the "Token Inflation" in the Phase 11 workflow of the `jones-vibes` project. A single run is showing 2.5 million input tokens despite small input files.

**Step 1: The "Baseline" Context**
First, read these files to see what the model receives *before* it takes its first turn:
1. `docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md` (The system instructions)
2. `docs/workflows/cyberpunk-overhaul/run-state.json` (The workflow state)
3. Look at a sample `startup-context.json` (e.g., in `.codex-runtime/cyberpunk-overhaul/slices/.../startup-context.json`) to see the bundled "Runner Context".

**Step 2: The "History Bloat" Hypothesis**
The latest slice (Week 03) reported **79 commands** and **2.5M tokens**.
- If Turn 1 sends 10,000 tokens of context...
- And Turn 2 sends (Turn 1 + Turn 2 output + Turn 2 result)...
- By Turn 79, the model is re-processing the same tool outputs dozens of times.

**Step 3: Audit Task**
Please investigate and report on:
1. **Tool Output Volume**: Which tools are the "loudest"? Even with `run-truncated.mjs` (2,000 char limit), 79 commands * 2,000 chars = 158,000 chars (~40k tokens) per turn. If every turn includes this, the total input across 79 turns is roughly `79 * 40k / 2` (integrating the growth), which is ~1.5M tokens just from tool output history.
2. **Redundant Reads**: Is the model re-reading the same large files (like the full game save or DOM dumps) in multiple turns?
3. **State Proxy Efficiency**: `node scripts/lib/state-proxy.mjs get` is called after almost every action. Does its output (diffs and summaries) grow over time or stay compact?
4. **Log Stream Overhead**: Check `scripts/cyberpunk-overhaul-phase11-log-stream.mjs`. Is it feeding back large metadata chunks into the model context that aren't visible in the final logs?

**Final Goal**: Propose a "Context Slicing" strategy. How can we force the model to "forget" the history of successful turns 1-40 once it reaches Turn 41, without losing its persona or objectives?

### PROMPT END

---

## Key Files for your Investigation
If you want to look yourself, these are the high-impact areas:

1.  **`scripts/cyberpunk-overhaul-phase11-once.sh`**: Look at the "pipeline" at the bottom where `node "${LOG_STREAM_HELPER}"` is piped. This is where the model's live output is parsed.
2.  **`docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md`**: The "Operating rules" section has several instructions like `No JSON Dumps` and `Use Truncated Shell` designed to fight this bloat.
3.  **`scripts/lib/run-truncated.mjs`**: This script caps tool output at 2,000 characters. If the model runs 80 commands, it is still potentially seeing $80 \times 2000$ characters of history by the end of the slice.
4.  **`docs/workflows/cyberpunk-overhaul/phase-11-slices/persona_a/week-03.md`**: This is the *result* of the run. Note that "Turn 3" in the game world actually took **79 turns** of LLM interaction to complete.

## Summary of the "1 Million Token" Jump
The jump happens because:
1.  **Quadratic Growth**: Every new turn adds the *previous* turn's content to the total input.
2.  **Turn Volume**: 79 turns for one in-game week is very high. 
3.  **Large Prompt**: The initial system prompt and context are already ~20k-40k tokens. Multiplying that by 80 turns alone gets you to 1.6M - 3.2M input tokens.
