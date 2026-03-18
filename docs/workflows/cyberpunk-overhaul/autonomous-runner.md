# Autonomous Runner

This workflow can keep running with a fresh Codex context on every pass. Continuity lives in:

- `docs/workflows/cyberpunk-overhaul/run-state.json`
- `docs/workflows/cyberpunk-overhaul/current-phase.md`
- `docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md`
- the active persona log
- the Phase 11 per-slice detail logs under `docs/workflows/cyberpunk-overhaul/phase-11-slices/`
- persistent `agent-browser` session state

## Commands

One bounded fresh-context slice:

```bash
npm run workflow:phase11:once
```

Continuous loop with a fresh Codex process each iteration:

```bash
npm run workflow:phase11:loop
```

Ensure the local Vite app is available:

```bash
npm run workflow:phase11:ensure-dev
```

## How It Works

1. `workflow:phase11:ensure-dev` restores `node_modules` if missing and starts Vite at `http://127.0.0.1:5173/jones-vibes/` when needed.
2. `workflow:phase11:once` starts a brand-new `codex exec --ephemeral` run.
3. The runner exports `AGENT_BROWSER_SESSION_NAME` from `run-state.json`, so browser localStorage survives across fresh Codex runs.
4. The Codex prompt is intentionally small and tells the agent to read the workflow files locally.
5. The loop script rereads `run-state.json` after each slice and stops only when the workflow is `blocked`, `complete`, or the process is interrupted.

## Important Files

- `docs/workflows/cyberpunk-overhaul/run-state.json`
  Machine-readable handoff state for autonomous slices.
- `docs/workflows/cyberpunk-overhaul/autonomous-runner-prompt.md`
  The reusable fresh-context prompt for each `codex exec` call.
- `scripts/cyberpunk-overhaul-ensure-dev.sh`
  Keeps the local app reachable.
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
- `DRY_RUN=1`
  Show the resolved prompt and runner configuration without launching Codex.

## Keeping It Running After Terminal Close

Simplest option:

```bash
nohup npm run workflow:phase11:loop > /tmp/jones-vibes-phase11.out 2>&1 &
```

More durable option: run the loop under a `systemd --user` service with this repo as `WorkingDirectory` and `scripts/cyberpunk-overhaul-phase11-loop.sh` as `ExecStart`.

## Stop Conditions

The loop exits when `run-state.json` reports:

- `status = "blocked"`
- `status = "complete"`
- `needs_human = true`

It also exits on shell error or manual interruption.
