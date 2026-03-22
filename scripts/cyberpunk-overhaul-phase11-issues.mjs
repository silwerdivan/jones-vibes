#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const DEFAULT_LEDGER_PATH = path.join(
  ROOT_DIR,
  'docs/workflows/cyberpunk-overhaul/slice-issue-ledger.md'
);

const DEFAULT_WORKFLOW_DOC_PATH = path.join(
  ROOT_DIR,
  'docs/workflows/cyberpunk-overhaul/slice-issue-followup-workflow.md'
);
const DEFAULT_PROGRESS_PATH = path.join(
  ROOT_DIR,
  'docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md'
);
const DEFAULT_CURRENT_PHASE_PATH = path.join(
  ROOT_DIR,
  'docs/workflows/cyberpunk-overhaul/current-phase.md'
);
const DEFAULT_AUDIT_LOG_PATH = path.join(
  ROOT_DIR,
  'docs/workflows/cyberpunk-overhaul/audit-log-persona-a.md'
);
const DEFAULT_EXTERNAL_FIXES_PATH = path.join(
  ROOT_DIR,
  'docs/workflows/cyberpunk-overhaul/external-fixes.md'
);
const DEFAULT_RECIPES_PATH = path.join(
  ROOT_DIR,
  'docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json'
);
const DEFAULT_AUTONOMOUS_RUNNER_PATH = path.join(
  ROOT_DIR,
  'docs/workflows/cyberpunk-overhaul/autonomous-runner.md'
);
const DEFAULT_SLICE_ROOT = path.join(
  ROOT_DIR,
  'docs/workflows/cyberpunk-overhaul/phase-11-slices'
);

function usage() {
  console.log(`Usage:
  node scripts/cyberpunk-overhaul-phase11-issues.mjs status [--ledger <path>] [--json]
  node scripts/cyberpunk-overhaul-phase11-issues.mjs next [--ledger <path>] [--id <id>]
  node scripts/cyberpunk-overhaul-phase11-issues.mjs complete --id <id> [--ledger <path>] [--github <value>] [--commit <hash>]
  node scripts/cyberpunk-overhaul-phase11-issues.mjs init [--ledger <path>] [--source-slice <path>] [--force]
  node scripts/cyberpunk-overhaul-phase11-issues.mjs identify [--ledger <path>] [--source-slice <path>] [--force] [--json]
`);
}

function parseArgs(argv) {
  const args = { _: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (next && !next.startsWith('--')) {
      args[key] = next;
      index += 1;
    } else {
      args[key] = true;
    }
  }

  return args;
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value);
}

function resolveLedgerPath(inputPath) {
  return path.resolve(ROOT_DIR, inputPath || DEFAULT_LEDGER_PATH);
}

function resolvePath(inputPath, fallbackPath) {
  return path.resolve(ROOT_DIR, inputPath || fallbackPath);
}

function maybeReadText(filePath) {
  return fs.existsSync(filePath) ? readText(filePath) : '';
}

function ledgerTemplate({ sourceSlice = '' } = {}) {
  const created = new Date().toISOString().slice(0, 10);
  return `# Slice Issue Ledger

## Active Batch

- **Source slice:** \`${sourceSlice}\`
- **Created:** ${created}
- **Status:** in_progress
- **Selection rule:** oldest unchecked issue first unless the user explicitly reprioritizes

| ID | Status | Title | Type | Evidence | GitHub | Commit | Prompt |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Next Issue

- **Default next item:** none
- **Reason:** fill in the first unresolved issue after populating the ledger
`;
}

function findLatestSliceFile() {
  if (!fs.existsSync(DEFAULT_SLICE_ROOT)) {
    return '';
  }

  const candidates = [];
  const stack = [DEFAULT_SLICE_ROOT];
  while (stack.length > 0) {
    const currentDir = stack.pop();
    if (!currentDir) {
      continue;
    }

    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(entryPath);
        continue;
      }

      if (entry.isFile() && /^week-\d+\.md$/i.test(entry.name)) {
        candidates.push({
          filePath: entryPath,
          mtimeMs: fs.statSync(entryPath).mtimeMs,
        });
      }
    }
  }

  candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return candidates[0]?.filePath || '';
}

function quoteList(items) {
  return items.map((item) => `\`${item}\``).join(', ');
}

function buildPromptBody(issue) {
  const readList = quoteList(issue.readPaths);
  return `Read \`${path.relative(ROOT_DIR, DEFAULT_LEDGER_PATH)}\` first, then read ${readList}, and address the next unresolved item in the ledger: ${issue.title}.

Treat this as a GitHub issue workflow following the established false-\`live_continuity\` pattern: investigate ${issue.investigate}, create a GitHub issue, implement the fix or the runner-side hardening, update the Phase 11 handoff files so the next slice knows the fix is baseline behavior, run focused validation, close the GitHub issue, commit the changes, and mark issue \`${issue.id}\` as \`done\` in \`${path.relative(ROOT_DIR, DEFAULT_LEDGER_PATH)}\` with the GitHub issue number and commit hash.`;
}

function renderLedger(issueBatch) {
  const created = new Date().toISOString().slice(0, 10);
  const rows = issueBatch.issues.map((issue) => (
    `| ${issue.id} | ${issue.status} | ${issue.title} | ${issue.type} | ${issue.evidence} | ${issue.github} | ${issue.commit} | ${issue.prompt} |`
  )).join('\n');
  const nextIssue = issueBatch.issues[0] || null;
  const promptSections = issueBatch.issues.map((issue) => `## ${normalizeInlineCode(issue.prompt)}

\`\`\`text
${buildPromptBody(issue)}
\`\`\`
`).join('\n');

  return `# Slice Issue Ledger

## Active Batch

- **Source slice:** \`${issueBatch.sourceSlice}\`
- **Created:** ${created}
- **Status:** ${issueBatch.issues.length > 0 ? 'in_progress' : 'blocked'}
- **Selection rule:** oldest unchecked issue first unless the user explicitly reprioritizes

| ID | Status | Title | Type | Evidence | GitHub | Commit | Prompt |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## Next Issue

- **Default next item:** ${nextIssue ? `\`${nextIssue.id}\`` : 'none'}
- **Reason:** ${nextIssue ? 'It is the first unresolved issue in the current batch and should be handled next.' : 'no unresolved issues were identified from the current slice evidence'}

${promptSections}`.replace(/\n{3,}/g, '\n\n').replace(/\n*$/, '\n');
}

function detectIssues({ sourceSlice, sourceText, progressText, currentPhaseText, auditLogText, externalFixesText, recipesText, autonomousRunnerText }) {
  const fixedContext = `${externalFixesText}\n${currentPhaseText}`;
  const issues = [];

  const issueCatalog = [
    {
      key: 'apply-click-state-mutation',
      title: 'Labor Sector `Apply` click can report success without mutating `CURRENT SHIFT`',
      type: 'automation',
      readPaths: [
        'docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md',
        'docs/workflows/cyberpunk-overhaul/audit-log-persona-a.md',
        'docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json',
      ],
      evidencePaths: [
        'docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md',
        'docs/workflows/cyberpunk-overhaul/audit-log-persona-a.md',
        'docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json',
      ],
      investigate: 'why direct `agent-browser click` on the visible Labor Sector `Apply` button can report success without mutating the underlying game state',
      matches: () =>
        /CURRENT SHIFT/.test(progressText) &&
        /Apply/.test(progressText) &&
        (/reported success without mutating/i.test(progressText) ||
          /reported success without changing/i.test(auditLogText)),
      fixed: () =>
        (
          /direct reliable action targets/i.test(externalFixesText) &&
          !/partially verified/i.test(externalFixesText)
        ) ||
        (
          /GitHub issue `#10`/i.test(externalFixesText) &&
          /scroll-and-verify baseline for Labor job application/i.test(fixedContext)
        ),
    },
    {
      key: 'city-travel-dom-only',
      title: 'City travel still depends on brittle DOM-only interaction with custom location cards',
      type: 'automation',
      readPaths: [
        'docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md',
        'docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json',
      ],
      evidencePaths: [
        'docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md',
        'docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json',
      ],
      investigate: 'why city travel still requires targeted DOM interaction because location cards are custom divs instead of reliable automation controls',
      matches: () =>
        /City travel cards still need targeted DOM interaction/i.test(progressText) ||
        /city location cards are custom divs/i.test(progressText) ||
        /Move between city locations/i.test(recipesText),
      fixed: () =>
        /GitHub issue `#11`/i.test(fixedContext) &&
        (
          /city travel automation now uses semantic button controls/i.test(fixedContext) ||
          /travel to the named city button/i.test(fixedContext) ||
          /city-travel-card-/i.test(fixedContext)
        ),
    },
    {
      key: 'post-click-state-verification',
      title: 'Runner actions still need stronger post-click state verification guardrails',
      type: 'workflow',
      readPaths: [
        'docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json',
        'docs/workflows/cyberpunk-overhaul/autonomous-runner.md',
        'docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md',
      ],
      evidencePaths: [
        'docs/workflows/cyberpunk-overhaul/agent-browser-recipes.json',
        'docs/workflows/cyberpunk-overhaul/autonomous-runner.md',
        'docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md',
      ],
      investigate: 'where the Phase 11 runner still trusts UI click success without verifying resulting game state after actions like job application or travel',
      matches: () =>
        /Do not trust a successful click response by itself/i.test(recipesText) ||
        /still needs state verification/i.test(progressText),
      fixed: () =>
        /GitHub issue `#12`/i.test(fixedContext) ||
        /action-verification policy/i.test(fixedContext) ||
        /post-click verification guidance/i.test(fixedContext) ||
        /post-click state verification.*fixed/i.test(fixedContext),
    },
    {
      key: 'false-live-continuity',
      title: 'False `live_continuity` report on onboarding reset',
      type: 'workflow',
      readPaths: [
        path.relative(ROOT_DIR, sourceSlice),
        'docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md',
        'docs/workflows/cyberpunk-overhaul/current-phase.md',
      ],
      evidencePaths: [
        path.relative(ROOT_DIR, sourceSlice),
        'docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md',
        'docs/workflows/cyberpunk-overhaul/current-phase.md',
      ],
      investigate: 'why the runner continuity artifact can claim `live_continuity` while the named browser session is visibly back on onboarding',
      matches: () =>
        /live_continuity/.test(sourceText) &&
        /onboarding/i.test(sourceText),
      fixed: () => /GitHub issue `?#9`?/i.test(fixedContext) || /onboarding_visible/i.test(fixedContext),
    },
  ];

  for (const entry of issueCatalog) {
    if (entry.matches() && !entry.fixed()) {
      issues.push({
        key: entry.key,
        title: entry.title,
        type: entry.type,
        evidence: quoteList(entry.evidencePaths),
        readPaths: entry.readPaths,
        investigate: entry.investigate,
      });
    }
  }

  return issues.map((issue, index) => ({
    id: String(index + 1),
    status: 'todo',
    title: issue.title,
    type: issue.type,
    evidence: issue.evidence,
    github: '',
    commit: '',
    prompt: `\`Prompt ${index + 1}\``,
    readPaths: issue.readPaths,
    investigate: issue.investigate,
  }));
}

function parseLedger(markdown) {
  const lines = markdown.split('\n');
  const tableHeaderIndex = lines.findIndex((line) => line.startsWith('| ID | Status |'));
  if (tableHeaderIndex === -1) {
    throw new Error('Could not find the issue ledger table.');
  }

  const rows = [];
  let index = tableHeaderIndex + 2;
  while (index < lines.length && lines[index].trim().startsWith('|')) {
    const line = lines[index];
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (cells.length >= 8) {
      rows.push({
        id: cells[0],
        status: cells[1],
        title: cells[2],
        type: cells[3],
        evidence: cells[4],
        github: cells[5],
        commit: cells[6],
        prompt: cells[7],
        lineIndex: index,
      });
    }
    index += 1;
  }

  const promptMatches = [...markdown.matchAll(/^## Prompt (\S+)\n\n```text\n([\s\S]*?)\n```/gm)];
  const prompts = new Map(
    promptMatches.map((match) => [String(match[1]), match[2]])
  );

  const nextIssueMatch = markdown.match(/- \*\*Default next item:\*\* (.+)/);
  const nextIssue = nextIssueMatch ? nextIssueMatch[1].trim() : 'none';

  return {
    lines,
    rows,
    prompts,
    nextIssue,
  };
}

function normalizeInlineCode(value) {
  return String(value || '').replace(/^`|`$/g, '');
}

function findNextOpenRow(rows) {
  return rows.find((row) => row.status === 'todo' || row.status === 'in_progress') || null;
}

function renderRow(row) {
  return `| ${row.id} | ${row.status} | ${row.title} | ${row.type} | ${row.evidence} | ${row.github} | ${row.commit} | ${row.prompt} |`;
}

function replaceNextIssueSection(lines, nextRow) {
  const headerIndex = lines.findIndex((line) => line.trim() === '## Next Issue');
  if (headerIndex === -1) {
    return lines;
  }

  const defaultIndex = lines.findIndex((line, index) => index > headerIndex && line.startsWith('- **Default next item:**'));
  const reasonIndex = lines.findIndex((line, index) => index > headerIndex && line.startsWith('- **Reason:**'));

  if (defaultIndex !== -1) {
    lines[defaultIndex] = `- **Default next item:** ${nextRow ? `\`${nextRow.id}\`` : 'none'}`;
  }

  if (reasonIndex !== -1) {
    lines[reasonIndex] = nextRow
      ? `- **Reason:** It is the first unresolved issue in the current batch and should be handled next.`
      : '- **Reason:** no unresolved issues remain in the current batch';
  }

  return lines;
}

function writeUpdatedLedger(ledgerPath, parsed) {
  const nextRow = findNextOpenRow(parsed.rows);
  replaceNextIssueSection(parsed.lines, nextRow);
  writeText(ledgerPath, `${parsed.lines.join('\n').replace(/\n*$/, '\n')}`);
}

function commandStatus(ledgerPath, asJson = false) {
  const markdown = readText(ledgerPath);
  const parsed = parseLedger(markdown);
  const nextRow = findNextOpenRow(parsed.rows);
  const counts = parsed.rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});

  const payload = {
    ledger: path.relative(ROOT_DIR, ledgerPath),
    total: parsed.rows.length,
    counts,
    next: nextRow
      ? { id: nextRow.id, title: nextRow.title, prompt: normalizeInlineCode(nextRow.prompt) }
      : null,
    unresolved: parsed.rows
      .filter((row) => row.status !== 'done' && row.status !== 'wontfix')
      .map((row) => ({
        id: row.id,
        status: row.status,
        title: row.title,
        prompt: normalizeInlineCode(row.prompt),
      })),
  };

  if (asJson) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Ledger: ${payload.ledger}`);
  console.log(`Total issues: ${payload.total}`);
  console.log(`Counts: ${Object.entries(counts).map(([key, value]) => `${key}=${value}`).join(', ')}`);
  if (payload.next) {
    console.log(`Next issue: ${payload.next.id} - ${payload.next.title} (${payload.next.prompt})`);
  } else {
    console.log('Next issue: none');
  }
}

function commandNext(ledgerPath, explicitId = '') {
  const markdown = readText(ledgerPath);
  const parsed = parseLedger(markdown);
  const row = explicitId
    ? parsed.rows.find((candidate) => candidate.id === String(explicitId))
    : findNextOpenRow(parsed.rows);

  if (!row) {
    throw new Error(explicitId
      ? `Could not find issue '${explicitId}' in the ledger.`
      : 'No unresolved issues remain in the ledger.');
  }

  const promptNumber = normalizeInlineCode(row.prompt).replace(/^Prompt\s+/, '');
  const prompt = parsed.prompts.get(promptNumber);
  if (!prompt) {
    throw new Error(`Could not find prompt body for '${row.prompt}'.`);
  }

  console.log(prompt);
}

function commandComplete(ledgerPath, { id, github = '', commit = '' }) {
  if (!id) {
    throw new Error('complete requires --id <id>.');
  }

  const markdown = readText(ledgerPath);
  const parsed = parseLedger(markdown);
  const row = parsed.rows.find((candidate) => candidate.id === String(id));
  if (!row) {
    throw new Error(`Could not find issue '${id}' in the ledger.`);
  }

  row.status = 'done';
  if (github) {
    row.github = `\`${github}\``;
  }
  if (commit) {
    row.commit = `\`${commit}\``;
  }

  parsed.lines[row.lineIndex] = renderRow(row);
  writeUpdatedLedger(ledgerPath, parsed);
  console.log(`Marked issue ${row.id} as done in ${path.relative(ROOT_DIR, ledgerPath)}.`);
}

function commandInit(ledgerPath, { sourceSlice = '', force = false }) {
  if (fs.existsSync(ledgerPath) && !force) {
    throw new Error(`Ledger already exists at ${path.relative(ROOT_DIR, ledgerPath)}. Pass --force to overwrite it.`);
  }

  writeText(ledgerPath, ledgerTemplate({ sourceSlice }));
  console.log(`Created ${path.relative(ROOT_DIR, ledgerPath)}.`);
  console.log(`Workflow reference: ${path.relative(ROOT_DIR, DEFAULT_WORKFLOW_DOC_PATH)}`);
}

function commandIdentify(ledgerPath, { sourceSlice = '', force = false, asJson = false }) {
  const resolvedSourceSlice = resolvePath(sourceSlice, findLatestSliceFile());
  if (!resolvedSourceSlice || !fs.existsSync(resolvedSourceSlice)) {
    throw new Error('Could not resolve a source slice. Pass --source-slice <path> or ensure a latest slice exists.');
  }

  if (fs.existsSync(ledgerPath) && !force) {
    throw new Error(`Ledger already exists at ${path.relative(ROOT_DIR, ledgerPath)}. Pass --force to overwrite it.`);
  }

  const sourceText = readText(resolvedSourceSlice);
  const progressText = maybeReadText(DEFAULT_PROGRESS_PATH);
  const currentPhaseText = maybeReadText(DEFAULT_CURRENT_PHASE_PATH);
  const auditLogText = maybeReadText(DEFAULT_AUDIT_LOG_PATH);
  const externalFixesText = maybeReadText(DEFAULT_EXTERNAL_FIXES_PATH);
  const recipesText = maybeReadText(DEFAULT_RECIPES_PATH);
  const autonomousRunnerText = maybeReadText(DEFAULT_AUTONOMOUS_RUNNER_PATH);

  const issues = detectIssues({
    sourceSlice: resolvedSourceSlice,
    sourceText,
    progressText,
    currentPhaseText,
    auditLogText,
    externalFixesText,
    recipesText,
    autonomousRunnerText,
  });

  const relativeSourceSlice = path.relative(ROOT_DIR, resolvedSourceSlice);
  const markdown = renderLedger({
    sourceSlice: relativeSourceSlice,
    issues,
  });

  writeText(ledgerPath, markdown);

  const payload = {
    ledger: path.relative(ROOT_DIR, ledgerPath),
    sourceSlice: relativeSourceSlice,
    issueCount: issues.length,
    issues: issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      type: issue.type,
      prompt: normalizeInlineCode(issue.prompt),
    })),
  };

  if (asJson) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Identified ${issues.length} issue(s) from ${relativeSourceSlice}.`);
  console.log(`Wrote ${path.relative(ROOT_DIR, ledgerPath)}.`);
  if (issues[0]) {
    console.log(`Next issue: ${issues[0].id} - ${issues[0].title}`);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];
  const ledgerPath = resolveLedgerPath(args.ledger);

  if (!command || args.help || args.h) {
    usage();
    process.exit(command ? 0 : 1);
  }

  switch (command) {
    case 'status':
      commandStatus(ledgerPath, !!args.json);
      break;
    case 'next':
      commandNext(ledgerPath, args.id ? String(args.id) : '');
      break;
    case 'complete':
      commandComplete(ledgerPath, {
        id: args.id ? String(args.id) : '',
        github: args.github ? String(args.github) : '',
        commit: args.commit ? String(args.commit) : '',
      });
      break;
    case 'init':
      commandInit(ledgerPath, {
        sourceSlice: args['source-slice'] ? String(args['source-slice']) : '',
        force: !!args.force,
      });
      break;
    case 'identify':
      commandIdentify(ledgerPath, {
        sourceSlice: args['source-slice'] ? String(args['source-slice']) : '',
        force: !!args.force,
        asJson: !!args.json,
      });
      break;
    default:
      throw new Error(`Unknown command '${command}'.`);
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
