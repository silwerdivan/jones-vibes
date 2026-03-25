#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';

function parseArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      args[key] = 'true';
      continue;
    }

    args[key] = value;
    index += 1;
  }

  return args;
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function truncate(text, maxChars = 400) {
  if (!text) {
    return '';
  }

  if (text.length <= maxChars) {
    return text;
  }

  return `${text.slice(0, maxChars - 3)}...`;
}

function compactWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function excerptOutput(output, maxLines = 12, maxChars = 1200) {
  if (!output) {
    return '';
  }

  const lines = output
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .slice(0, maxLines);
  const compact = lines.join('\n');
  return truncate(compact, maxChars);
}

function summarizeCommand(command, maxChars = 220) {
  return truncate(compactWhitespace(command), maxChars);
}

function normalizeCommand(command) {
  return compactWhitespace(
    command
      .replace(/@e\d+/g, '@ref')
      .replace(/"@ref"/g, '@ref')
      .replace(/'@ref'/g, '@ref')
  );
}

function readTargetFromCommand(command) {
  const sedMatch = command.match(/sed -n '[^']*' ([^\s]+)$/);
  if (sedMatch) {
    return sedMatch[1];
  }

  const catMatch = command.match(/cat ([^\s]+)$/);
  if (catMatch) {
    return catMatch[1];
  }

  return '';
}

function isAgentBrowserCommand(command) {
  return /\bagent-browser\b/.test(command);
}

function isGitDiffCommand(command) {
  return /\bgit\b.*\bdiff\b/.test(command);
}

function isStartupReadCommand(command) {
  return /\bsed -n\b|\bcat\b/.test(command);
}

function isCheckpointCommand(command) {
  return (
    /\bagent-browser\b/.test(command) &&
    (/document\.body\.innerText/.test(command) ||
      /localStorage/.test(command) ||
      /\bstate list\b/.test(command) ||
      /\bget url\b/.test(command) ||
      /\bget title\b/.test(command) ||
      /\blastTurnSummary\b/.test(command) ||
      /\bturnSummary\b/.test(command))
  );
}

function isBrowserSessionVerificationCommand(command) {
  return /\bagent-browser\b/.test(command) && (/\bsession\b/.test(command) || /\bstate list\b/.test(command) || /\bopen\b/.test(command));
}

function outputLooksSuspicious(output) {
  return /(^|\n)\s*(✗|Error:|Unknown command|Connection Error|OS error|Invalid ref|Missing arguments|Timed out|failed\b|blocked\b)/im.test(
    output || ''
  );
}

function isExplicitFallbackMessage(text) {
  const normalized = compactWhitespace(text);

  if (
    /\bhistorical\b|\bnotes?\b|\bhandoff\b|\bguidance\b|\bexpectations\b/i.test(normalized) &&
    !/\bfell back\b|\bfalling back\b|\bfallback to\b|\bswitched to\b|\bswitching to\b/i.test(normalized)
  ) {
    return false;
  }

  return /(?:\bfell back\b|\bfalling back\b|\bfallback to\b|\bswitched to\b|\bswitching to\b|\busing an alternative\b|\busing an alternate\b|\busing a backup\b)/i.test(
    normalized
  );
}

function messageCategory(text) {
  if (isExplicitFallbackMessage(text)) {
    return 'fallback';
  }

  if (/\bretry\b|\bretrying\b|\bre-run\b|\brerun\b|\btry again\b/i.test(text)) {
    return 'retry';
  }

  if (/\bblocked\b|\bneeds_human\b|\bAUTONOMOUS_BLOCKED\b|\bAUTONOMOUS_COMPLETE\b|\bAUTONOMOUS_SLICE_COMPLETE\b/i.test(text)) {
    return 'status';
  }

  if (/\bweek\b|\bcycle\b|\bcheckpoint\b|\bsummary\b|\bcredits?\b|\bdebt\b|\bhunger\b|\bsanity\b|\bHab-Pod\b/i.test(text)) {
    return 'checkpoint';
  }

  return '';
}

const args = parseArgs(process.argv.slice(2));
const eventLogPath = args['event-log'];
const checkpointLogPath = args['checkpoint-log'];
const summaryPath = args.summary;
const rawJsonlPath = args['raw-jsonl'];
const debugCandidatesPath = args['debug-candidates'];
const retryThreshold = Number.parseInt(args['retry-threshold'] || '2', 10);
const sliceId = args['slice-id'] || 'slice';
const persona = args.persona || '';

if (!eventLogPath || !checkpointLogPath || !summaryPath || !rawJsonlPath || !debugCandidatesPath) {
  console.error('missing required file arguments');
  process.exit(2);
}

for (const filePath of [eventLogPath, checkpointLogPath, summaryPath, rawJsonlPath, debugCandidatesPath]) {
  ensureParent(filePath);
}

const eventStream = fs.createWriteStream(eventLogPath, { encoding: 'utf8' });
const checkpointStream = fs.createWriteStream(checkpointLogPath, { encoding: 'utf8' });
const rawStream = fs.createWriteStream(rawJsonlPath, { encoding: 'utf8' });
const debugCandidateStream = fs.createWriteStream(debugCandidatesPath, { encoding: 'utf8' });

const summary = {
  slice_id: sliceId,
  persona,
  started_at: '',
  ended_at: '',
  wall_time_ms: 0,
  usage: {
    input_tokens: 0,
    cached_input_tokens: 0,
    output_tokens: 0,
  },
  counts: {
    commands_total: 0,
    commands_failed: 0,
    agent_browser_commands: 0,
    startup_reads: 0,
    git_diff_commands: 0,
    checkpoints: 0,
    retries: 0,
    fallbacks: 0,
  },
  debug: {
    escalated: false,
    reasons: [],
    retry_threshold: retryThreshold,
  },
  timings: {
    slowest_commands: [],
  },
  failure_candidates: [],
  fallback_messages: [],
  retry_messages: [],
};

const openCommands = new Map();
const failedCommandCounts = new Map();
let lastFailedAgentBrowserCommand = null;
let lastEventMs = 0;
let assistantMessageAccumulator = '';

function rememberSlowCommand(entry) {
  summary.timings.slowest_commands.push(entry);
  summary.timings.slowest_commands.sort((left, right) => right.duration_ms - left.duration_ms);
  summary.timings.slowest_commands = summary.timings.slowest_commands.slice(0, 5);
}

function addDebugReason(reason) {
  if (!summary.debug.reasons.includes(reason)) {
    summary.debug.reasons.push(reason);
  }
  summary.debug.escalated = true;
}

function writeJsonLine(stream, payload) {
  stream.write(`${JSON.stringify(payload)}\n`);
}

function emitEvent(event, isCheckpoint = false) {
  writeJsonLine(eventStream, event);
  if (isCheckpoint) {
    writeJsonLine(checkpointStream, event);
    summary.counts.checkpoints += 1;
  }
}

function emitCompactLine(text) {
  process.stdout.write(`${text}\n`);
}

function classifyCommand(command) {
  if (isStartupReadCommand(command)) {
    return 'startup_read';
  }
  if (isGitDiffCommand(command)) {
    return 'git_diff';
  }
  if (/\bmilestone-summary\.mjs\b/.test(command)) {
    return 'milestone';
  }
  if (isBrowserSessionVerificationCommand(command)) {
    return 'browser_session_check';
  }
  if (isCheckpointCommand(command)) {
    return 'checkpoint';
  }
  if (isAgentBrowserCommand(command)) {
    return 'agent_browser';
  }
  return 'command';
}

function handleAgentMessage(ts, text) {
  const category = messageCategory(text);
  if (!category) {
    return;
  }

  const payload = {
    ts,
    type: category,
    text: truncate(text, 1000),
  };
  const checkpoint = category === 'checkpoint' || category === 'status';
  emitEvent(payload, checkpoint);

  if (category === 'fallback') {
    summary.counts.fallbacks += 1;
    summary.fallback_messages.push(payload.text);
    addDebugReason('fallback_invoked');
    emitCompactLine(`[phase11-log] fallback: ${truncate(compactWhitespace(text), 180)}`);
  } else if (category === 'retry') {
    summary.counts.retries += 1;
    summary.retry_messages.push(payload.text);
    emitCompactLine(`[phase11-log] retry: ${truncate(compactWhitespace(text), 180)}`);
  } else if (category === 'status') {
    emitCompactLine(`[phase11-log] status: ${truncate(compactWhitespace(text), 180)}`);
  }
}

function flushAssistantMessage(ts) {
  if (!assistantMessageAccumulator) {
    return;
  }
  handleAgentMessage(ts, assistantMessageAccumulator);
  assistantMessageAccumulator = '';
}

function handleCommandCompletion(ts, nowMs, id, commandOverride, exitCode, output) {
  const started = openCommands.get(id);
  openCommands.delete(id);

  const durationMs = started ? Math.max(0, nowMs - started.startedAtMs) : 0;
  const command = commandOverride || started?.command || '';
  const outputExcerpt = excerptOutput(output);
  const commandType = classifyCommand(command);
  const commandSummary = summarizeCommand(command);
  const suspicious = outputLooksSuspicious(output);

  summary.counts.commands_total += 1;
  if (commandType === 'startup_read') {
    summary.counts.startup_reads += 1;
  }
  if (commandType === 'git_diff') {
    summary.counts.git_diff_commands += 1;
  }
  if (isAgentBrowserCommand(command)) {
    summary.counts.agent_browser_commands += 1;
  }
  if (exitCode !== 0) {
    summary.counts.commands_failed += 1;
    addDebugReason('nonzero_tool_exit');
  }

  rememberSlowCommand({
    command: commandSummary,
    duration_ms: durationMs,
    exit_code: exitCode,
  });

  const baseEvent = {
    ts,
    type: commandType,
    command_type: commandType,
    command: commandSummary,
    exit_code: exitCode,
    duration_ms: durationMs,
    output_excerpt:
      exitCode !== 0 || commandType === 'checkpoint' || commandType === 'milestone' || commandType === 'browser_session_check' || suspicious
        ? outputExcerpt
        : '',
  };

  if (commandType === 'startup_read') {
    baseEvent.target = readTargetFromCommand(command);
    emitEvent(baseEvent);
    return;
  }

  if (commandType === 'git_diff') {
    baseEvent.output_bytes = output.length;
    baseEvent.output_suppressed = true;
    emitEvent(baseEvent);
    return;
  }

  if (exitCode !== 0 || suspicious) {
    if (isAgentBrowserCommand(command)) {
      const normalized = normalizeCommand(command);
      const failureCount = (failedCommandCounts.get(normalized) || 0) + 1;
      failedCommandCounts.set(normalized, failureCount);
      lastFailedAgentBrowserCommand = {
        normalized_command: normalized,
        command_summary: commandSummary,
      };
      if (failureCount >= retryThreshold) {
        addDebugReason('repeated_retry_threshold_exceeded');
      }
    }

    const failurePayload = {
      ts,
      type: exitCode !== 0 ? 'command_failure' : 'command_warning',
      command,
      command_summary: commandSummary,
      exit_code: exitCode,
      duration_ms: durationMs,
      aggregated_output: output,
    };
    writeJsonLine(debugCandidateStream, failurePayload);
    summary.failure_candidates.push({
      command: commandSummary,
      exit_code: exitCode,
      duration_ms: durationMs,
      output_excerpt: outputExcerpt,
    });
    emitEvent(
      {
        ...baseEvent,
        type: exitCode !== 0 ? 'command_failure' : 'command_warning',
      },
      commandType === 'checkpoint' || commandType === 'milestone' || commandType === 'browser_session_check'
    );
    emitCompactLine(
      `[phase11-log] ${exitCode !== 0 ? 'failure' : 'warning'} exit=${exitCode} duration=${durationMs}ms ${commandSummary}`
    );
    return;
  }

  if (isAgentBrowserCommand(command) && lastFailedAgentBrowserCommand) {
    const normalized = normalizeCommand(command);
    if (normalized !== lastFailedAgentBrowserCommand.normalized_command) {
      summary.counts.fallbacks += 1;
      addDebugReason('fallback_invoked');
      emitEvent({
        ts,
        type: 'fallback',
        from_command: lastFailedAgentBrowserCommand.command_summary,
        to_command: commandSummary,
      });
      emitCompactLine(
        `[phase11-log] fallback: ${lastFailedAgentBrowserCommand.command_summary} -> ${commandSummary}`
      );
    }
    lastFailedAgentBrowserCommand = null;
  }

  if (commandType === 'checkpoint' || commandType === 'milestone') {
    emitEvent(baseEvent, true);
    if (commandType === 'milestone') {
      emitCompactLine(`[phase11-log] milestone: ${commandSummary}`);
    }
    return;
  }

  if (commandType === 'browser_session_check') {
    emitEvent(baseEvent, true);
    return;
  }

  if (commandType === 'agent_browser' || durationMs >= 2000) {
    emitEvent(baseEvent);
  }
}

function finalize() {
  const nowMs = Date.now();
  const ts = new Date(nowMs).toISOString();
  flushAssistantMessage(ts);

  if (summary.started_at && summary.ended_at) {
    summary.wall_time_ms = Math.max(0, lastEventMs - Date.parse(summary.started_at));
  }

  fs.writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
}

// Set input encoding to UTF-8
process.stdin.setEncoding('utf8');

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

rl.on('line', (line) => {
  rawStream.write(`${line}\n`);

  let event;
  try {
    event = JSON.parse(line);
  } catch (error) {
    emitCompactLine(`[phase11-log] skipped invalid JSONL event: ${truncate(line, 120)}`);
    return;
  }

  const nowMs = Date.now();
  const ts = new Date(nowMs).toISOString();
  lastEventMs = nowMs;

  if (!summary.started_at) {
    summary.started_at = ts;
    emitEvent({
      ts,
      type: 'slice_started',
      slice_id: sliceId,
      persona,
    });
  }
  summary.ended_at = ts;

  // Handle Gemini init
  if (event.type === 'init') {
    emitEvent({
      ts,
      type: 'thread_started',
      thread_id: event.session_id,
    });
    return;
  }

  // Handle Gemini message (assistant chunks)
  if (event.type === 'message' && event.role === 'assistant') {
    assistantMessageAccumulator += (event.content || '');
    return;
  }

  // Gemini tool_use or result flushes the accumulated assistant message
  if (event.type === 'tool_use' || event.type === 'result') {
    flushAssistantMessage(ts);
  }

  if (event.type === 'tool_use') {
    let command = event.tool_name;
    if (event.tool_name === 'run_shell_command' && event.parameters?.command) {
      command = event.parameters.command;
    } else if (event.parameters) {
      command = `${event.tool_name}(${JSON.stringify(event.parameters)})`;
    }

    openCommands.set(event.tool_id, {
      startedAtMs: nowMs,
      command: command,
    });
    return;
  }

  if (event.type === 'tool_result') {
    handleCommandCompletion(ts, nowMs, event.tool_id, null, event.status === 'success' ? 0 : 1, event.output || '');
    return;
  }

  if (event.type === 'result') {
    const usage = event.stats || {};
    summary.usage = {
      input_tokens: usage.input_tokens || 0,
      cached_input_tokens: usage.cached || 0,
      output_tokens: usage.output_tokens || 0,
    };
    emitEvent({
      ts,
      type: 'turn_completed',
      usage: summary.usage,
    });
    emitCompactLine(
      `[phase11-log] usage input=${summary.usage.input_tokens} cached=${summary.usage.cached_input_tokens} output=${summary.usage.output_tokens}`
    );
    return;
  }

  // Original Codex event handling
  if (event.type === 'thread.started') {
    emitEvent({
      ts,
      type: 'thread_started',
      thread_id: event.thread_id,
    });
    return;
  }

  if (event.type === 'turn.started') {
    emitEvent({
      ts,
      type: 'turn_started',
    });
    return;
  }

  if (event.type === 'turn.completed') {
    const usage = event.usage || {};
    summary.usage = {
      input_tokens: usage.input_tokens || 0,
      cached_input_tokens: usage.cached_input_tokens || 0,
      output_tokens: usage.output_tokens || 0,
    };
    emitEvent({
      ts,
      type: 'turn_completed',
      usage: summary.usage,
    });
    emitCompactLine(
      `[phase11-log] usage input=${summary.usage.input_tokens} cached=${summary.usage.cached_input_tokens} output=${summary.usage.output_tokens}`
    );
    return;
  }

  if (!event.item) {
    return;
  }

  const item = event.item;

  if (event.type === 'item.started' && item.type === 'command_execution') {
    openCommands.set(item.id, {
      startedAtMs: nowMs,
      command: item.command,
    });
    return;
  }

  if (event.type === 'item.completed' && item.type === 'agent_message') {
    handleAgentMessage(ts, item.text || '');
    return;
  }

  if (event.type === 'item.completed' && item.type === 'command_execution') {
    handleCommandCompletion(ts, nowMs, item.id, item.command, item.exit_code ?? 0, item.aggregated_output || '');
  }
});

rl.on('close', () => {
  finalize();
  eventStream.end();
  checkpointStream.end();
  rawStream.end();
  debugCandidateStream.end();
});
