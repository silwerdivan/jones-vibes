#!/usr/bin/env node

import { execSync } from 'node:child_process';

const MAX_CHARS_DEFAULT = 2000;

function usage() {
  console.log('Usage: node scripts/lib/run-truncated.mjs [--full-dump] [--max-chars N] <command...>');
  console.log('');
  console.log('Automatically truncates stdout and stderr to a safe limit to prevent history bloat.');
  console.log('');
  console.log('Options:');
  console.log('  --full-dump     Disable truncation and return everything.');
  console.log('  --max-chars N   Set custom truncation limit (default: 2000).');
  process.exit(0);
}

const args = process.argv.slice(2);
if (args.length === 0 || args[0] === '--help') {
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
  } else {
    commandArgs = args.slice(i);
    break;
  }
}

if (commandArgs.length === 0) {
  usage();
}

const command = commandArgs.join(' ');

try {
  const stdout = execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  
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
