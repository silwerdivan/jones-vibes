# Autonomous Runner

This workflow can keep running with a fresh Codex context on every pass. Continuity lives in:

- `docs/workflows/cyberpunk-overhaul/run-state.json`
- `docs/workflows/cyberpunk-overhaul/current-phase.md`
- `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`
- `docs/workflows/cyberpunk-overhaul/external-fixes.md`
- the active persona log
- the Phase 11 per-slice detail logs under `docs/workflows/cyberpunk-overhaul/phase-11-slices/`
- durable checkpoint exports under `docs/workflows/cyberpunk-overhaul/checkpoints/`
- persistent `agent-browser` session state

The runner now keeps stdout compact by default and moves the higher-detail evidence into per-slice artifacts under `.codex-runtime/cyberpunk-overhaul/`.

## Commands

One bounded fresh-context slice:

```bash
npm run workflow:phase11:once
```

One bounded fresh-context slice with an automatic git commit at the end:

```bash
npm run workflow:phase11:once:commit
```

Continuous loop with a fresh Codex process each iteration:

```bash
npm run workflow:phase11:loop
```

Continuous loop with one auto-commit attempt after each slice:

```bash
npm run workflow:phase11:loop:commit
```

Ensure the local Vite app is available:

```bash
npm run workflow:phase11:ensure-dev
```

Inspect the current browser/session checkpoint state:

```bash
npm run workflow:phase11:checkpoint:status
```

Export the active authoritative save to disk:

```bash
npm run workflow:phase11:checkpoint:export -- --label week-10
```

Restore the latest exported checkpoint into the named browser session:

```bash
npm run workflow:phase11:checkpoint:import
```

## How It Works

1. `workflow:phase11:ensure-dev` restores `node_modules` if missing and starts Vite at `http://127.0.0.1:5173/jones-vibes/` when needed.
2. `workflow:phase11:once` starts a brand-new `codex exec --ephemeral` run.
3. The runner exports `AGENT_BROWSER_SESSION_NAME` from `run-state.json`, so browser localStorage survives across fresh Codex runs when the session profile remains healthy.
4. Durable continuity now also lives in exported checkpoint JSON files under `docs/workflows/cyberpunk-overhaul/checkpoints/`. The browser session is a convenience layer, not the only recovery path.
5. The Codex prompt is intentionally small and points the agent at one generated `startup-context.json` artifact inside the slice directory. That file carries the canonical slice paths, latest checkpoint handoff, compact brief findings, expected next action, compact browser tactics, and the runner's action-verification policy so the repeated prompt stays small while the handoff stays explicit.
6. The live stream is compacted through `scripts/cyberpunk-overhaul-phase11-log-stream.mjs`:
   - meaningful milestones are written to structured JSONL artifacts,
   - repeated `git diff` output is suppressed from the live stream,
   - the terminal/log stream keeps short status, retry, fallback, failure, and usage lines instead of the full raw event firehose,
   - the prompt steers normal slices toward short state probes and path-based summaries, while large diffs, broad DOM dumps, and verbose readbacks are reserved for suspicious or blocked branches.
7. The loop script rereads `run-state.json` after each slice and stops only when the workflow is `blocked`, `complete`, or the process is interrupted.

## Logging Model

### Compact by default

Each slice gets its own artifact directory:

```text
.codex-runtime/cyberpunk-overhaul/slices/<timestamp>-<persona>/
```

Normal successful runs keep the operator-facing stream small:

- `.codex-runtime/cyberpunk-overhaul/autonomous-runner.log`
  Append-only top-level runner log with slice headers plus the compact live stream.
- `events.jsonl`
  Structured milestone/event log for the slice.
- `checkpoints.jsonl`
  Filtered subset of state-oriented events such as browser/session checks, checkpoint reads, and status transitions.
- `summary.json`
  Consolidated per-slice outcome, token usage, wall time, changed files, artifact paths, and debug status.
- `startup-context.json`
  Compact per-slice startup handoff with the canonical paths, checkpoint continuity result, latest authoritative state, and compact browser recipe notes. The generated handoff now preserves multiple verification lines per risky action and states explicitly that click success is not authoritative without matching game-state mutation. Read this before reopening larger workflow docs.
- `changed-files.txt`
  Final changed-file list for the slice. Ephemeral browser profile/cache trees such as root-level `agent-browser-chrome-*` and `org.chromium.Chromium.*` directories are excluded so browser runtime noise does not masquerade as project output.
- `final.diff`
  One consolidated final diff artifact for tracked and untracked changes, instead of repeated live `diff --git` dumps. The same ephemeral browser profile/cache exclusions apply here.
- `prompt.md`
  Exact prompt used for that slice.
- `last-message.txt`
  Final Codex message captured with `codex exec -o`.
- `state/before/` and `state/after/`
  Snapshots of the bounded control-surface files listed in `run-state.json`.

The structured logs live in the slice directory above, not in `docs/workflows/...`. The workflow docs remain the bounded control surface; the runtime directory is the execution evidence.

Normal slices are expected to stay lean. The authoritative audit record still lives in the workflow docs, checkpoints, screenshots, and runtime artifacts, but the live model context should usually receive only concise state probes and short change summaries.

### Debug escalation

The runner automatically keeps raw debug artifacts when a slice looks suspicious or stops in trouble. Debug preservation turns on when any of these happen:

- `codex exec` exits nonzero.
- `run-state.json` ends the slice with `status = "blocked"`.
- `run-state.json` ends the slice with `needs_human = true`.
- A tool command exits nonzero.
- The same failing `agent-browser` command crosses `AUTONOMOUS_RETRY_THRESHOLD` retries. Default: `2`.
- The stream parser detects an actual fallback strategy change and marks `fallback_invoked`.

When debug escalation is off, the runner deletes the temporary raw event files after the slice and keeps only the compact artifacts above.

When debug escalation is on, raw failure traces live here:

- `debug/raw-codex-events.jsonl`
  Full raw JSONL event stream emitted by `codex exec --json` for that slice.
- `debug/suspicious-commands.jsonl`
  Full command payloads for failed commands or commands whose output looked suspicious enough to preserve.

Check `summary.json` first. It records `debug.escalated`, `debug.reasons`, the artifact paths, usage totals, timings, and changed files in one place.

### Forcing verbose preservation

If you want the raw debug artifacts even for a slice that may succeed cleanly, run the slice or loop with:

```bash
AUTONOMOUS_FORCE_VERBOSE=1 npm run workflow:phase11:once
```

or:

```bash
AUTONOMOUS_FORCE_VERBOSE=1 npm run workflow:phase11:loop
```

This does not disable the compact live stream. It forces the slice to retain the raw `debug/` artifacts and marks `summary.json` with the `forced_verbose` debug reason.

## Important Files

- `docs/workflows/cyberpunk-overhaul/run-state.json`
  Machine-readable handoff state for autonomous slices.
- `docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md`
  The reusable fresh-context prompt for each `codex exec` call.
- `.codex-runtime/cyberpunk-overhaul/slices/<timestamp>-<persona>/startup-context.json`
  Slice-local compact handoff artifact generated before Codex starts.
- `docs/workflows/cyberpunk-overhaul/external-fixes.md`
  Out-of-band baseline changes from ad hoc fixes that the next audit slice must know about.
- `docs/workflows/cyberpunk-overhaul/checkpoints/`
  Durable exported `jones_fastlane_save` checkpoints for replay recovery.
- `scripts/cyberpunk-overhaul-ensure-dev.sh`
  Keeps the local app reachable.
- `scripts/cyberpunk-overhaul-phase11-checkpoint.mjs`
  Exports, restores, and inspects Phase 11 checkpoint files.
- `scripts/cyberpunk-overhaul-phase11-once.sh`
  Runs one fresh-context autonomous slice.
- `scripts/cyberpunk-overhaul-phase11-loop.sh`
  Repeats `phase11-once` until the workflow stops itself.

## Environment Overrides

- `CODEX_MODEL`
  Optional model override for `codex exec`.
- `CODEX_EXEC_STRATEGY`
  `dangerous` by default for unattended local automation.
  Set to `full-auto` if you want the Codex CLI's sandboxed mode instead.
- `AUTONOMOUS_SLEEP_SECONDS`
  Override the delay between loop iterations.
- `AUTONOMOUS_MAX_ITERATIONS`
  Stop the loop after a fixed number of slices.
- `AUTONOMOUS_RETRY_THRESHOLD`
  Retry count that triggers debug escalation for repeated failing `agent-browser`
  commands. Defaults to `2`.
- `AUTONOMOUS_FORCE_VERBOSE=1`
  Always retain the raw slice debug artifacts under `debug/` even if the slice
  would normally stay in compact mode.
- `AUTONOMOUS_GIT_COMMIT=1`
  Auto-commit after a slice. Phase 11 runners now refuse to start any slice or
  loop iteration when the git worktree is already dirty, so automation commits
  only ever happen from a clean-start run.
- `DRY_RUN=1`
  Show the resolved prompt and runner configuration without launching Codex.
- `AGENT_BROWSER_SESSION_NAME`
  Optional manual override for the browser session name. By default the runner
  exports the value from `run-state.json`.
- `AGENT_BROWSER_ARGS`
  Browser launch args passed through to `agent-browser`. Defaults to
  `--no-sandbox`.

## Keeping It Running After Terminal Close

Simplest option:

```bash
nohup npm run workflow:phase11:loop > /tmp/jones-vibes-phase11.out 2>&1 &
```

More durable option: run the loop under a `systemd --user` service with this repo as `WorkingDirectory` and `scripts/cyberpunk-overhaul-phase11-loop.sh` as `ExecStart`.

## Reading A Blocked Slice

After a blocked slice, read the artifacts in this order:

1. Open the newest slice `summary.json` under `.codex-runtime/cyberpunk-overhaul/slices/` to see status, debug reasons, timings, changed files, and the exact artifact paths.
2. Open `startup-context.json` if you need the compact runner handoff that the slice started from.
3. Open `checkpoints.jsonl` to reconstruct the last known state transition and where the run stopped.
4. If `summary.json` shows `debug.escalated = true`, open `debug/suspicious-commands.jsonl` first for the failing command chain, then `debug/raw-codex-events.jsonl` only if you need the full raw transcript.
5. Compare `state/before/` and `state/after/` if you need to confirm what the slice changed in the bounded control surface.
6. Use `final.diff` and `changed-files.txt` only after you understand the blocker; they are for code/doc output review, not for reconstructing the runtime failure.

## Stop Conditions

The loop exits when `run-state.json` reports:

- `status = "blocked"`
- `status = "complete"`
- `needs_human = true`

It also exits on shell error or manual interruption.

The runners also exit immediately if `git status --short` is non-empty before a
new slice or loop iteration begins.
