import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';

const SCRIPT_PATH = path.resolve('scripts/cyberpunk-overhaul-phase11-issues.mjs');

function runCli(args: string[]) {
  return execFileSync('node', [SCRIPT_PATH, ...args], {
    cwd: path.resolve('.'),
    encoding: 'utf8',
  });
}

function createTempLedger(contents: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase11-issues-test-'));
  const ledgerPath = path.join(dir, 'slice-issue-ledger.md');
  fs.writeFileSync(ledgerPath, contents);
  return { dir, ledgerPath };
}

const cleanupDirs: string[] = [];

afterEach(() => {
  while (cleanupDirs.length > 0) {
    const dir = cleanupDirs.pop();
    if (dir) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('phase11 issues script', () => {
  it('prints ledger status with the next unresolved issue', () => {
    const { dir, ledgerPath } = createTempLedger(`# Slice Issue Ledger

## Active Batch

| ID | Status | Title | Type | Evidence | GitHub | Commit | Prompt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | done | Completed issue | workflow | \`a.md\` | \`#1\` | \`abc123\` | \`Prompt 1\` |
| 2 | todo | Remaining issue | automation | \`b.md\` |  |  | \`Prompt 2\` |

## Next Issue

- **Default next item:** \`2\`
- **Reason:** It is the first unresolved issue in the current batch.

## Prompt 2

\`\`\`text
Prompt body 2
\`\`\`
`);
    cleanupDirs.push(dir);

    const output = runCli(['status', '--ledger', ledgerPath]);
    expect(output).toContain('Next issue: 2 - Remaining issue');
    expect(output).toContain('done=1');
    expect(output).toContain('todo=1');
  });

  it('prints the next unresolved issue prompt', () => {
    const { dir, ledgerPath } = createTempLedger(`# Slice Issue Ledger

## Active Batch

| ID | Status | Title | Type | Evidence | GitHub | Commit | Prompt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | todo | Remaining issue | automation | \`b.md\` |  |  | \`Prompt 1\` |

## Next Issue

- **Default next item:** \`1\`
- **Reason:** It is the first unresolved issue in the current batch.

## Prompt 1

\`\`\`text
Prompt body 1
\`\`\`
`);
    cleanupDirs.push(dir);

    const output = runCli(['next', '--ledger', ledgerPath]);
    expect(output.trim()).toBe('Prompt body 1');
  });

  it('marks an issue done and updates the default next item', () => {
    const { dir, ledgerPath } = createTempLedger(`# Slice Issue Ledger

## Active Batch

| ID | Status | Title | Type | Evidence | GitHub | Commit | Prompt |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | todo | First issue | workflow | \`a.md\` |  |  | \`Prompt 1\` |
| 2 | todo | Second issue | automation | \`b.md\` |  |  | \`Prompt 2\` |

## Next Issue

- **Default next item:** \`1\`
- **Reason:** It is the first unresolved issue in the current batch.

## Prompt 1

\`\`\`text
Prompt body 1
\`\`\`

## Prompt 2

\`\`\`text
Prompt body 2
\`\`\`
`);
    cleanupDirs.push(dir);

    runCli(['complete', '--ledger', ledgerPath, '--id', '1', '--github', '#10', '--commit', 'deadbee']);
    const updated = fs.readFileSync(ledgerPath, 'utf8');

    expect(updated).toContain('| 1 | done | First issue | workflow | `a.md` | `#10` | `deadbee` | `Prompt 1` |');
    expect(updated).toContain('- **Default next item:** `2`');
  });

  it('initializes a new ledger file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase11-issues-init-'));
    cleanupDirs.push(dir);
    const ledgerPath = path.join(dir, 'slice-issue-ledger.md');

    runCli(['init', '--ledger', ledgerPath, '--source-slice', 'docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-08.md']);
    const created = fs.readFileSync(ledgerPath, 'utf8');

    expect(created).toContain('# Slice Issue Ledger');
    expect(created).toContain('week-08.md');
    expect(created).toContain('- **Default next item:** none');
  });

  it('identifies unresolved issues from the current week-08 control surface and filters fixed baseline issues', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'phase11-issues-identify-'));
    cleanupDirs.push(dir);
    const ledgerPath = path.join(dir, 'slice-issue-ledger.md');

    const output = runCli([
      'identify',
      '--ledger',
      ledgerPath,
      '--source-slice',
      'docs/workflows/cyberpunk-overhaul/phase-11-slices/persona-a/week-08.md',
    ]);

    const created = fs.readFileSync(ledgerPath, 'utf8');
    expect(output).toContain('Identified');
    expect(created).not.toContain('City travel still depends on brittle DOM-only interaction with custom location cards');
    expect(created).not.toContain('Labor Sector `Apply` click can report success without mutating `CURRENT SHIFT`');
    expect(created).not.toContain('Runner actions still need stronger post-click state verification guardrails');
    expect(created).not.toContain('False `live_continuity` report on onboarding reset');
    expect(created).toContain('- **Default next item:** none');
    expect(created).toContain('- **Reason:** no unresolved issues were identified from the current slice evidence');
  });
});
