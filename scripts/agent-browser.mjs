#!/usr/bin/env node

import { runAgentBrowser } from './lib/agent-browser-wrapper.mjs';

/**
 * CLI wrapper for agent-browser that uses the centralized wrapper logic.
 * This ensures:
 * 1. Correct Linux --no-sandbox syntax.
 * 2. Automatic session name from environment or run-state.
 * 3. Fail-Fast on syntax/environment errors (exits with 101).
 */

const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/agent-browser.mjs <subcommand> [subcommand_args...] [--session-name NAME]');
  console.log('\nThis wrapper ensures Linux syntax compliance and Fail-Fast behavior.');
  process.exit(0);
}

// Extract session-name if provided, otherwise it will be picked up by the wrapper
let sessionName = process.env.AGENT_BROWSER_SESSION_NAME;
const sessionIndex = args.indexOf('--session-name');
let subcommandArgs = [...args];

if (sessionIndex !== -1 && sessionIndex + 1 < args.length) {
  sessionName = args[sessionIndex + 1];
  subcommandArgs.splice(sessionIndex, 2);
}

const subcommand = subcommandArgs[0];
const remainingArgs = subcommandArgs.slice(1);

try {
  const output = runAgentBrowser(subcommand, remainingArgs, {
    sessionName,
  });
  process.stdout.write(output);
} catch (error) {
  // runAgentBrowser handles fatal Fail-Fast errors by exiting with 101.
  // For other errors, we just pass through the output and exit code.
  if (error.stdout) process.stdout.write(error.stdout);
  if (error.stderr) process.stderr.write(error.stderr);
  process.exit(error.status || 1);
}
