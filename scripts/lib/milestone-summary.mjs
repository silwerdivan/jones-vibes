#!/usr/bin/env node

/**
 * milestone-summary.mjs
 * 
 * A simple tool for the autonomous agent to report high-signal progress
 * and signal that a logical "milestone" has been reached.
 * 
 * Usage: node scripts/lib/milestone-summary.mjs "Finished my shift at the factory"
 */

import fs from 'node:fs';
import path from 'node:path';

const message = process.argv.slice(2).join(' ');

if (!message) {
  console.error('Usage: node scripts/lib/milestone-summary.mjs "<summary of achievement>"');
  process.exit(1);
}

const ts = new Date().toISOString();
const payload = {
  ts,
  type: 'milestone',
  message: message.trim(),
};

// We print it to stdout so the log-stream can catch it.
// We use a prefix that the log-stream will recognize.
console.log(`[MILESTONE_SUMMARY] ${payload.message}`);

// Optionally, we could also append to a local file in the current slice directory
// if we knew where it was. But since we are likely running under pi exec,
// we might not have the SLICE_DIR environment variable unless we pass it.

process.exit(0);
