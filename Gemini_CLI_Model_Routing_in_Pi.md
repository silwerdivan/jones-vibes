# Replicating Gemini CLI's Dynamic Model Routing in Pi

This document explores how to replicate Gemini CLI's intelligent model selection and routing features within Pi, focusing on dynamic model switching based on prompt complexity and task type.

---

## 1. Pi's Approach: Dynamic Model Selection using an Extension

Pi, being highly extensible, allows developers to implement custom model routing logic using extensions. The `before_agent_start` event in an extension provides a hook to analyze the user's prompt and dynamically switch models before the LLM call is made.

### Example: `smart-router.ts` Extension

The following extension demonstrates a basic complexity-based router that switches between a "Pro" model (e.g., `gemini-1.5-pro`) for complex prompts and a "Flash" model (e.g., `gemini-1.5-flash`) for simpler ones.

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event, ctx) => {
    // 1. Analyze the prompt for complexity
    const text = event.prompt.toLowerCase();
    
    // Simple heuristic: long prompts or specific keywords trigger the Pro model
    const isComplex = 
      text.length > 300 || 
      text.includes("plan") || 
      text.includes("architect") || 
      text.includes("refactor") ||
      text.includes("complex");

    // 2. Determine the target model ID based on the heuristic
    const provider = "google"; // Or "anthropic", "openai", etc.
    const targetModelId = isComplex ? "gemini-1.5-pro" : "gemini-1.5-flash";

    // 3. Find the model in the registry and switch to it
    const model = ctx.modelRegistry.find(provider, targetModelId);
    
    if (model) {
      const success = await pi.setModel(model);
      if (success) {
         // Optionally notify the user via the TUI footer
         ctx.ui.notify(`Routed to ${targetModelId} based on prompt complexity`, "info");
      }
    }
    
    // Returning nothing lets the agent continue normally with the new model
  });
}
```

### How the Pi Extension Works:
- **Intercepting the Prompt:** The `before_agent_start` event provides access to `event.prompt` and `ctx` (ExtensionContext).
- **Heuristic Engine:** Custom logic (e.g., `text.length`, `text.includes()`) is used to classify the prompt's complexity. This can be expanded to include more sophisticated checks.
- **Dynamic Switch:** `ctx.modelRegistry.find()` locates the appropriate model, and `pi.setModel()` programmatically switches the active model for the current agent turn.
- **User Feedback:** `ctx.ui.notify()` can provide feedback to the user about which model was selected.

---

## 2. Gemini CLI's Model Selection Heuristics: A Detailed Look

The Gemini CLI employs a sophisticated multi-layered decision process for model selection, balancing user intent, task complexity, and system resilience.

### 2.1. Selection Precedence

Gemini CLI follows a strict hierarchy for model selection:
1.  **Command-line flag:** `--model <name>` (highest priority).
2.  **Environment variable:** `GEMINI_MODEL`.
3.  **Settings:** `model.name` in `settings.json`.
4.  **Default:** Defaults to `auto` if nothing is specified.

### 2.2. Dynamic "Auto" Selection (Intelligent Model Router)

When `auto` is specified, the CLI uses an **Intelligent Model Router** to analyze each incoming request and determine the most suitable model. It doesn't pick one model for the entire session but dynamically selects a "worker" model for each turn.

#### 2.2.1. The Multi-Model Architecture
The "auto" mode manages three tiers of models:
-   **The Router (Classifier):** Typically a highly optimized, low-latency model (e.g., Gemini Flash-Lite). Its sole purpose is to analyze the prompt and conversation history to select the appropriate "executor."
-   **The Executor (Pro):** Utilized for tasks requiring deep reasoning, multi-step planning, or complex code architecture (e.g., `gemini-3-pro-preview`, `gemini-1.5-pro`).
-   **The Executor (Flash):** Used for implementation tasks, repetitive terminal commands, or simple questions (e.g., `gemini-3-flash-preview`, `gemini-1.5-flash`).

#### 2.2.2. The Classification Heuristic (Complexity Rubric)
The core logic of the router resides in a specialized system prompt (the `classifierStrategy`). It evaluates the user's prompt against a **Complexity Rubric**:

| Category | Routing Decision | Typical Criteria |
| :------- | :--------------- | :--------------- |
| **Simple** | Flash | Fact retrieval, one-step code fixes, single terminal commands, simple "Chat" (e.g., "Hi", "List my files"). |
| **Complex** | Pro | **High Operational Complexity:** Tasks estimated to need 4+ tool calls or steps. |
| **Complex** | Pro | **Conceptual Design:** Questions starting with "How" or "Why" that require architectural advice. |
| **Complex** | Pro | **Deep Debugging:** Diagnosing unknown errors from symptoms rather than a clear fix. |
| **Complex** | Pro | **Large Scope:** Broad requests like "Refactor this entire module for better performance." |

### 2.3. Phase-Based Routing

The Gemini CLI often treats a single user request as a two-phase process, especially in its "Plan Mode":
-   **Planning Phase (Pro):** A Pro model analyzes the codebase, identifies necessary changes, and crafts a structured "Plan."
-   **Implementation Phase (Flash):** Once the plan is approved, a Flash model takes over to execute the code writing, `grep` commands, and terminal operations for speed.

This explains why the model indicator might flicker between "Pro" and "Flash" during a single long-running task.

### 2.4. Technical Resolution & Overrides

The `ModelConfigService` manages specific aliases (e.g., `chat-base`) and allows for overrides. Certain sub-agents (like `codebase_investigator`) can be configured to always use a specific model or temperature, regardless of global settings.

### 2.5. Resilience and Fallback Mechanism

The `ModelAvailabilityService` within the CLI's core provides a safety net, wrapping the routing heuristic. If the router's "ideal" choice is blocked (e.g., due to quota limits), a fallback chain is triggered.

#### 2.5.1. The Fallback Hierarchy
When the "Auto" heuristic picks a model, it validates it against a pre-defined **"Model Policy Chain"**:

| If the Heuristic picks... | 1st Fallback (Silent) | 2nd Fallback (Prompted) | 3rd Fallback (Hard Stop) |
| :------------------------ | :-------------------- | :---------------------- | :----------------------- |
| Gemini 3 Pro | Gemini 3 Flash | Gemini 2.5 Pro | Error & "Usage Limit" |
| Gemini 3 Flash | Gemini 2.5 Flash | Gemini 2.5 Flash-Lite | Error & "Usage Limit" |
| Flash-Lite | Gemini 2.5 Flash | N/A | Error & "Usage Limit" |

#### 2.5.2. Silent vs. Explicit Fallbacks
-   **Silent Fallbacks:** Used for internal tasks (autocomplete, prompt classification, context summarization). If a model hits a rate limit (e.g., 429), the CLI retries with a fallback model without user notification.
-   **Explicit Fallbacks:** For main tasks, if the primary model's quota is exhausted, the CLI typically prompts the user (e.g., "Gemini 3 Pro quota exhausted. Switch to Gemini 3 Flash to continue?").

#### 2.5.3. Impact on the Heuristic ("Degraded Reasoning")
When a fallback occurs, the heuristic effectively "downgrades":
-   **Context Window Shrinking:** Falling back to an older model (e.g., Gemini 2.5 from Gemini 3) might lead to proactive trimming of conversation history or file context due to smaller context windows.
-   **Complexity Re-evaluation:** If forced into a "Flash-only" mode, the router might stop planning complex architectures and instead focus on solving problems in smaller, more "executable" chunks.

#### 2.5.4. Known "Sticky" Fallback Issues
A current quirk (as of early 2026) is the "Alias Loss" bug. If the CLI falls back from `auto` to a specific model (e.g., `gemini-2.5-flash`), it might overwrite the session setting, causing the heuristic to stop working for the rest of the session. The user would need to manually reset to `/model auto`.

#### 2.5.5. Checking Resilience Status
Users can diagnose their resilience status using:
-   `/stats`: Shows quota for available models.
-   Terminal Indicator: The model displayed in the bottom-right of the CLI can indicate if a fallback has occurred.

---
