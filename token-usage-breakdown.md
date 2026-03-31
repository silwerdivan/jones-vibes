# Why Your Tokens Are Inflating: The "Full Picture"

The Phase 11 workflow is currently showing **2.5 million input tokens** for a single run. This breakdown explains why that happens, step-by-step.

## 1. The "Base Prompt" (Turn 1)
Every time a "slice" starts, the model is sent a baseline package. This is roughly **15,000 to 25,000 tokens**.

- **System Role & Rules**: `docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md` (~4,000 tokens).
- **Core Strategy**: Instructions for Phase 11, browser tactics, and "operating rules."
- **Runner Context**: A small pointer block (Turn, Persona, App URL).

## 2. The "Startup Tax" (Turns 2-5)
The model is instructed to verify its environment before acting.
- **Turn 2**: Re-sends Turn 1 + Reads `run-state.json`.
- **Turn 3**: Re-sends Turn 2 + Reads `startup-context.json` (This file is a "fat" summary of everything—recipes, checkpoints, and state).
- **Turn 4**: Re-sends Turn 3 + Verifies the browser session.

By Turn 5, the model is already processing **~30,000 tokens** of input.

## 3. The "Quadratic Bloat" (The Multiplier)
This is the main culprit. The LLM has **no "short-term memory"** that it clears. It is a single, growing conversation.

If the model takes **80 turns** to complete a week:
- **Turn 10**: It re-reads the prompt + the output of the first 9 commands.
- **Turn 40**: It re-reads the prompt + the output of the first 39 commands.
- **Turn 80**: It re-reads the prompt + the output of the first 79 commands.

### The Math:
- Average Turn Context: ~20,000 tokens (Prompt) + ~15,000 tokens (Command History) = **35,000 tokens**.
- Total Input = $35,000 \text{ tokens/turn} \times 80 \text{ turns} = \mathbf{2,800,000 \text{ tokens}}$.

**Every single `agent-browser` click, `state-proxy` check, or file read is re-billed to you on every subsequent turn.**

## 4. What Exactly is in the "History"?
The model sees the literal text returned by the terminal for every command:
1.  **State Probes**: `node scripts/lib/state-proxy.mjs get` returns a 10-20 line summary of credits, hunger, sanity, and location.
2.  **Browser Commands**: `agent-browser click ...` returns success/failure messages.
3.  **Truncated Dumps**: Even though we use `run-truncated.mjs`, it still allows **2,000 characters** per command. If the model runs 80 commands, it is storing **160,000 characters** (approx. 40,000 tokens) in its history by the end of the run.

## 5. Summary: How to Fix It
To get the 1,000,000+ token jumps down, we must:
- **Reduce Turn Count**: Instead of `Wait -> Click -> Check -> Wait -> Click -> Check`, we need to batch commands: `Click & Click & Check`.
- **Context Slicing**: The "Milestone" system is designed to stop a run early. If a run reaches Turn 30, it should save a checkpoint and **STOP**, then start a fresh session to finish the week. This "forgets" the history of the first 30 turns.
- **Recipe Efficiency**: Every time the model "probes" the DOM, it adds a chunk of text to the history. Better recipes mean fewer probes.

---

### Key Files for your Review:
- **`docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md`**: Look at the "Token discipline" section.
- **`scripts/lib/run-truncated.mjs`**: This is the "shield" that prevents a single command from sending 100,000 tokens, but it doesn't stop the *accumulation* of many small commands.
