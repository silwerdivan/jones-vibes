#!/usr/bin/env node

import { execFileSync } from 'node:child_process';

const MAX_CHARS_DEFAULT = 2000;

function usage() {
  console.log('Usage: node scripts/lib/run-truncated.mjs [--full-dump] [--max-chars N] <executable> [args...]');
  console.log('');
  console.log('Automatically truncates stdout and stderr to a safe limit to prevent history bloat.');
  console.log('Inherits stdin to support interactive commands or piped input (like agent-browser batch).');
  console.log('');
  console.log('Options:');
  console.log('  --full-dump     Disable truncation and return everything.');
  console.log('  --max-chars N   Set custom truncation limit (default: 2000).');
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  usage();
}

let fullDump = false;
let maxChars = MAX_CHARS_DEFAULT;
let commandArgs = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--full-dump') {
    fullDump = true;
  } else if (args[i] === '--max-chars' && i + 1 < args.length) {
    maxChars = parseInt(args[i + 1], 10);
    i++;
  } else if (!args[i].startsWith('--')) {
    commandArgs = args.slice(i);
    break;
  }
}

if (commandArgs.length === 0) {
  usage();
}

const executable = commandArgs[0];
const remainingArgs = commandArgs.slice(1);

try {
  // Use execFileSync to correctly handle arguments and inherit stdin
  const stdout = execFileSync(executable, remainingArgs, {
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
    maxBuffer: 100 * 1024 * 1024, // High limit, we truncate manually
  });
  
  if (fullDump) {
    process.stdout.write(stdout);
  } else {
    if (stdout.length > maxChars) {
      process.stdout.write(stdout.slice(0, maxChars));
      process.stdout.write(`\n... [TRUNCATED stdout at ${maxChars} chars. Use --full-dump if you need the full output.]\n`);
    } else {
      process.stdout.write(stdout);
    }
  }
} catch (error) {
  const stderr = error.stderr || '';
  const stdout = error.stdout || '';
  const message = error.message || '';
  const combined = `${message}\n${stdout}\n${stderr}`;

  // Check for "History Leaks" / syntax errors that should trigger Fail-Fast
  if (
    combined.includes('SyntaxError: Unexpected identifier') ||
    combined.includes('Unknown command:') ||
    combined.includes('Connection Error (OS error 10060)') ||
    combined.includes('failed to launch browser')
  ) {
    const failFastMsg = `\n[FATAL] agent-browser encountered a syntax or environment error: ${message}\n${stderr}\n[FAIL-FAST] ABORTING TO PREVENT HISTORY BLOAT. Emit AUTONOMOUS_BLOCKED immediately.\n`;
    process.stderr.write(failFastMsg);
    process.exit(101); // Special exit code for fatal environment/syntax errors
  }

  // If command failed, still truncate the output but exit with same code
  if (error.stdout) {
    if (fullDump || error.stdout.length <= maxChars) {
      process.stdout.write(error.stdout);
    } else {
      process.stdout.write(error.stdout.slice(0, maxChars));
      process.stdout.write(`\n... [TRUNCATED stdout at ${maxChars} chars. Use --full-dump if you need the full output.]\n`);
    }
  }
  
  if (error.stderr) {
    if (fullDump || error.stderr.length <= maxChars) {
      process.stderr.write(error.stderr);
    } else {
      process.stderr.write(error.stderr.slice(0, maxChars));
      process.stderr.write(`\n... [TRUNCATED stderr at ${maxChars} chars. Use --full-dump if you need the full output.]\n`);
    }
  }
  
  if (!error.stdout && !error.stderr && error.message) {
    process.stderr.write(`Execution failed: ${error.message}\n`);
  }
  
  process.exit(error.status || 1);
}

