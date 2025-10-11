**Your Role:** You are a meticulous technical writer and game designer. Your primary responsibility is to ensure that game design specifications are clear, accurate, and logically consistent.

**The Document:** You will be provided with the full `spec.md` for a game called "Jones in the Fast Lane."

**The Task:** A logical contradiction has been identified in the **"II. Time & Economy Mechanics"** section of the specification. Your mission is to analyze this section and correct the discrepancy to reflect the intended game mechanics.

**The Contradiction:**

1.  The **"Max Time Bank"** rule states that a player can carry over 24 unused hours, allowing for a maximum of 48 hours.
2.  The **"Resting"** rule states that ending a turn "replenishes Time to 24 Hours," which implies a hard reset that makes banking time impossible.

**The Intended Mechanic:**

The core design intent is that players **should be able to bank time**. The "Max Time Bank" rule is the correct one, and the description for the "Resting" rule is misleading and must be rewritten.

**Your Instructions:**

1.  Analyze the "II. Time & Economy Mechanics" section in the provided `spec.md`.
2.  Rewrite the `Detail` description for the **Resting** mechanic.
3.  The new description must be concise and unambiguously align with the time-banking mechanic. It should clarify that a new day's 24 hours are *added* to any remaining time, up to the 48-hour maximum, before the daily expense is deducted.

**Required Output Format:**

Please structure your response as follows:

**1. Analysis of the Discrepancy:**
*   A brief one or two-sentence summary explaining the logical conflict you have identified between the "Resting" and "Max Time Bank" rules.

**2. Proposed Correction:**
*   Present a simple "Before" and "After" comparison for the "Resting" mechanic's description so the change is easy to see.

**3. Final Corrected Section:**
*   Provide the complete, final Markdown table for the **"II. Time & Economy Mechanics"** section with your correction integrated. This final output should be ready to be copied and pasted directly into the `spec.md` to replace the old section.