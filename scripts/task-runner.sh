#!/bin/bash

# A generic loop for Gemini CLI to process a PLAN based on a PRD.
# Usage: ./task-runner.sh <prd_file> <plan_file> [--loop]

if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <prd_file_path> <plan_file_path> [--loop]"
    echo "Example: $0 docs/PRD-REPO-CLEANUP.md docs/REPO-CLEANUP-PLAN.md --loop"
    exit 1
fi

PRD_FILE="$1"
PLAN_FILE="$2"
MODE="${3:---once}"

if [ ! -f "$PRD_FILE" ]; then
    echo "Error: PRD file not found: $PRD_FILE"
    exit 1
fi

if [ ! -f "$PLAN_FILE" ]; then
    echo "Error: PLAN file not found: $PLAN_FILE"
    exit 1
fi

run_gemini_turn() {
    echo "=================================================================="
    echo "Checking for remaining tasks in $PLAN_FILE..."
    
    # Check if there are any incomplete tasks left
    if ! grep -q "\[ \]" "$PLAN_FILE"; then
        echo "✅ No incomplete tasks found in $PLAN_FILE. All done!"
        return 1 # Stop signal
    fi

    echo "Starting Gemini turn..."

    # Construct the instruction for the Gemini CLI
    # We use a single, comprehensive string to instruct the agent
    PROMPT="You are an autonomous task execution agent. 
Follow these steps strictly:
1. Review the requirements in the PRD at: $PRD_FILE
2. Review the current implementation plan at: $PLAN_FILE
3. Find the VERY FIRST incomplete task marked with '[ ]' in the PLAN file.
4. Execute that single task fully (e.g., move files, update code).
5. After successfully completing the task, update $PLAN_FILE to mark that exact task as '[x]'.
6. Commit your changes using 'git add' and 'git commit' with a concise message.
7. Stop. Do not proceed to the next task in the plan. Do not ask for user confirmation, just execute and commit."

    # Execute the Gemini CLI
    # Add flags (like --headless) if you are running this without a UI
    gemini --yolo "$PROMPT"
    
    # Check exit status of Gemini to prevent infinite loops on failure
    if [ $? -ne 0 ]; then
        echo "❌ Gemini encountered an error. Stopping loop."
        return 1
    fi
    
    return 0 # Success, continue loop
}

if [ "$MODE" = "--loop" ]; then
    echo "🔄 Running in LOOP mode. Will process tasks until $PLAN_FILE is complete."
    while run_gemini_turn; do
        echo "⏳ Turn completed. Pausing for 3 seconds before the next task..."
        sleep 3
    done
else
    echo "▶️ Running ONCE. Will process only the next task in $PLAN_FILE."
    run_gemini_turn
fi

echo "Task runner finished."
