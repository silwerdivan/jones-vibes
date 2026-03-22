#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const phase11Aliases = {
  dev: "workflow:phase11:ensure-dev",
  once: "workflow:phase11:once",
  oncec: "workflow:phase11:once:commit",
  status: "workflow:phase11:checkpoint:status",
  export: "workflow:phase11:checkpoint:export",
  import: "workflow:phase11:checkpoint:import",
  issues: "workflow:phase11:issues",
  "issues-identify": "workflow:phase11:issues:identify",
  "issues-next": "workflow:phase11:issues:next",
  "issues-complete": "workflow:phase11:issues:complete",
  "issues-init": "workflow:phase11:issues:init",
  loop: "workflow:phase11:loop",
  loopc: "workflow:phase11:loop:commit",
};

function printHelp() {
  const lines = [
    "Workflow shortcuts",
    "",
    "Phase 11",
    "  npm run p11         Show this menu",
    "  npm run p11:dev     Ensure dev environment is ready",
    "  npm run p11:once    Run one phase-11 slice",
    "  npm run p11:oncec   Run one phase-11 slice and commit",
    "  npm run p11:status  Show checkpoint status",
    "  npm run p11:export  Export the current checkpoint",
    "  npm run p11:import  Import a checkpoint",
    "  npm run p11:issues  Show slice issue ledger status",
    "  npm run p11:issues:identify [-- --source-slice <path>]  Build the ledger from slice evidence",
    "  npm run p11:issues:next  Print the next unresolved issue prompt",
    "  npm run p11:issues:complete -- --id <id> [--github #N] [--commit HASH]",
    "  npm run p11:issues:init -- --source-slice <path>",
    "  npm run p11:loop    Run the loop runner",
    "  npm run p11:loopc   Run the loop runner and commit",
    "",
    "Generic launcher",
    "  npm run wf -- once",
    "  npm run wf -- oncec",
    "  npm run wf -- status",
    "  npm run wf -- issues",
    "  npm run wf -- issues-identify",
    "  npm run wf -- issues-next",
    "  npm run wf -- loopc",
    "",
    "Canonical script for once+commit",
    "  npm run workflow:phase11:once:commit",
  ];

  console.log(lines.join("\n"));
}

const arg = process.argv[2];

if (!arg || arg === "--help" || arg === "help" || arg === "--phase11-help") {
  printHelp();
  process.exit(0);
}

const targetScript = phase11Aliases[arg];
const forwardArgs = process.argv.slice(3);

if (!targetScript) {
  console.error(`Unknown workflow shortcut: ${arg}`);
  console.error("");
  printHelp();
  process.exit(1);
}

const npmArgs = ["run", targetScript];
if (forwardArgs.length > 0) {
  npmArgs.push("--", ...forwardArgs);
}

const result = spawnSync("npm", npmArgs, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
