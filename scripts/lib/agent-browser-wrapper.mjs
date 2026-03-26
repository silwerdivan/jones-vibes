import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const RUN_TRUNCATED = path.join(ROOT_DIR, 'scripts/lib/run-truncated.mjs');

/**
 * Centralized agent-browser command construction to prevent "hallucinated" syntax.
 * Correctly handles Linux --no-sandbox flags and session naming.
 */
export function getAgentBrowserArgs(options = {}) {
  const {
    sessionName,
    extraArgs = process.env.AGENT_BROWSER_ARGS || '',
    json = false,
  } = options;

  const args = [];

  if (sessionName) {
    args.push('--session-name', sessionName);
  }

  if (json) {
    args.push('--json');
  }

  // Linux requires --no-sandbox via --args
  if (process.platform === 'linux' || extraArgs.includes('--no-sandbox')) {
    const combinedArgs = extraArgs.includes('--no-sandbox') 
      ? extraArgs 
      : (extraArgs ? `${extraArgs} --no-sandbox` : '--no-sandbox');
    
    // We must pass it as ['--args', 'value'] so execFileSync sends it correctly
    args.push('--args', combinedArgs);
  } else if (extraArgs) {
    args.push('--args', extraArgs);
  }

  return args;
}

/**
 * Runs agent-browser with the given subcommand and options.
 * This is now wrapped in run-truncated.mjs to ensure:
 * 1. Output truncation to prevent context bloat.
 * 2. Fail-Fast on syntax/environment errors.
 * 3. Consistent execution environment.
 */
export function runAgentBrowser(subcommand, subcommandArgs = [], options = {}) {
  const browserArgs = getAgentBrowserArgs(options);
  const fullArgs = [subcommand, ...subcommandArgs, ...browserArgs];

  const execOptions = {
    encoding: 'utf8',
    stdio: options.input ? ['pipe', 'pipe', 'pipe'] : ['ignore', 'pipe', 'pipe'],
    maxBuffer: options.maxBuffer || 20 * 1024 * 1024,
    ...options.execOptions,
  };

  if (options.input) {
    execOptions.input = options.input;
  }

  // Always use the truncation wrapper to fulfill the project mandate
  const wrapperArgs = [RUN_TRUNCATED, '--full-dump', 'agent-browser', ...fullArgs];

  try {
    return execFileSync('node', wrapperArgs, execOptions);
  } catch (error) {
    // Fail-Fast logic is now also handled in run-truncated.mjs,
    // but we keep it here for redundancy and to handle non-spawn errors.
    const stderr = error.stderr || '';
    const stdout = error.stdout || '';
    const message = error.message || '';
    const combined = `${message}\n${stdout}\n${stderr}`;

    if (
      combined.includes('SyntaxError: Unexpected identifier') ||
      combined.includes('Unknown command:') ||
      combined.includes('Connection Error (OS error 10060)') ||
      combined.includes('failed to launch browser')
    ) {
      const failFastMsg = `\n[FATAL] agent-browser encountered a syntax or environment error: ${message}\n${stderr}\n[FAIL-FAST] ABORTING TO PREVENT HISTORY BLOAT. Emit AUTONOMOUS_BLOCKED immediately.\n`;
      process.stderr.write(failFastMsg);
      process.exit(101); // Use a special exit code for fatal environment/syntax errors
    }

    throw error;
  }
}


/**
 * Runs a batch of commands and parses the JSON result.
 */
export function runAgentBrowserBatch(commands, options = {}) {
  const output = runAgentBrowser('batch', [], {
    ...options,
    json: true,
    input: JSON.stringify(commands),
  });

  try {
    const results = JSON.parse(output);
    return results;
  } catch (error) {
    throw new Error(`Failed to parse agent-browser batch output: ${error.message}\nOutput: ${output.slice(0, 1000)}`);
  }
}
