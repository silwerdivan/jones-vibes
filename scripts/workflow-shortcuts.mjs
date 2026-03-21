#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const phase11Aliases = {
  dev: "workflow:phase11:ensure-dev",
  once: "workflow:phase11:once",
  oncec: "workflow:phase11:once:commit",
  status: "workflow:phase11:checkpoint:status",
  export: "workflow:phase11:checkpoint:export",
  import: "workflow:phase11:checkpoint:import",
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
    "  npm run p11:loop    Run the loop runner",
    "  npm run p11:loopc   Run the loop runner and commit",
    "",
    "Generic launcher",
    "  npm run wf -- once",
    "  npm run wf -- oncec",
    "  npm run wf -- status",
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

if (!targetScript) {
  console.error(`Unknown workflow shortcut: ${arg}`);
  console.error("");
  printHelp();
  process.exit(1);
}

const result = spawnSync("npm", ["run", targetScript], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
