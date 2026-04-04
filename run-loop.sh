#!/usr/bin/env node

const { spawn } = require("child_process");
const { StringDecoder } = require("string_decoder");

const PROMPT = `read \`PRD-PI-CLEANUP.md\` and \`PLAN-PI-CLEANUP.md\`

Instructions:
1. Pick the SINGLE highest priority unchecked task in \`PLAN-PI-CLEANUP.md\`.
2. Implement it.
3. Mark [x] in \`PLAN-PI-CLEANUP.md\` and append a summary to \`PI-CLEANUP-ACTIVITY.md\`.
4. Commit your changes.
5. **CRITICAL:** Complete ONLY ONE task at a time. After committing, exit.`;

console.log("(chuckles) I'm in danger.\n");

function attachJsonlReader(stream, onLine) {
    const decoder = new StringDecoder("utf8");
    let buffer = "";

    stream.on("data", (chunk) => {
        buffer += typeof chunk === "string" ? chunk : decoder.write(chunk);

        while (true) {
            const newlineIndex = buffer.indexOf("\n");
            if (newlineIndex === -1) break;

            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            onLine(line);
        }
    });

    stream.on("end", () => {
        buffer += decoder.end();
        if (buffer.length > 0) {
            onLine(buffer.endsWith("\r") ? buffer.slice(0, -1) : buffer);
        }
    });
}

function runAgent() {
    return new Promise((resolve) => {
        console.log("========================================================");
        console.log("Starting pi task...");
        console.log("========================================================");

        const agent = spawn("pi", ["--mode", "rpc", "--model", "google-gemini-cli/gemini-3-flash-preview"]);

        let isDone = false;
        
        const finish = () => {
            if (isDone) return;
            isDone = true;
            agent.kill();
            resolve();
        };

        attachJsonlReader(agent.stdout, (line) => {
            try {
                const event = JSON.parse(line);

                if (event.type === "message_update") {
                    const { assistantMessageEvent } = event;
                    if (assistantMessageEvent.type === "text_delta") {
                        process.stdout.write(assistantMessageEvent.delta);
                    }
                } else if (event.type === "tool_execution_start") {
                    console.log(`\n[Tool running: ${event.toolName}]`);
                } else if (event.type === "tool_execution_end") {
                    if (event.isError) {
                        console.log(`\n[Tool error: ${event.toolName}]`);
                    } else {
                        console.log(`\n[Tool completed: ${event.toolName}]`);
                    }
                } else if (event.type === "agent_end") {
                    console.log("\n[Agent completed task]");
                    finish();
                } else if (event.type === "response" && event.success === false) {
                    console.log(`\n[Command error: ${event.error}]`);
                }
            } catch (err) {
                // Ignore raw or non-JSON output, print it if it looks like an error
                if (line.toLowerCase().includes("error")) {
                    console.error(line);
                }
            }
        });

        // Log agent errors
        agent.stderr.on("data", (data) => {
            console.error(`\nAgent stderr: ${data.toString()}`);
        });

        agent.on("close", (code) => {
            if (!isDone) {
                if (code !== 0 && code !== null) {
                    console.log(`\nAgent exited with code ${code}`);
                }
                finish();
            }
        });

        // Send prompt
        agent.stdin.write(JSON.stringify({ type: "prompt", message: PROMPT }) + "\n");
    });
}

async function loop() {
    while (true) {
        await runAgent();
        console.log("\nTask complete. Starting next task in 5 seconds (Press Ctrl+C to abort)...\n");
        await new Promise((r) => setTimeout(r, 5000));
    }
}

loop().catch(console.error);

// Abort gracefully on Ctrl+C
process.on("SIGINT", () => {
    console.log("\nAborted by user.");
    process.exit(0);
});
