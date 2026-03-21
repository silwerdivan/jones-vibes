#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const rootDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const runStatePath = path.join(rootDir, "docs/workflows/cyberpunk-overhaul/run-state.json");
const outputPath = path.join(rootDir, "docs/workflows/cyberpunk-overhaul/phase-11-brief.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function normalizeLines(value) {
  return value.replace(/\r\n/g, "\n").split("\n");
}

function extractSection(text, heading) {
  const lines = normalizeLines(text);
  const start = lines.findIndex((line) => line.trim() === heading);
  if (start === -1) {
    return [];
  }

  const section = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^##\s+/.test(line) && line.trim() !== heading) {
      break;
    }
    section.push(line);
  }
  return section;
}

function extractBulletTexts(lines) {
  return lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2).trim());
}

function latestSliceFile(detailRoot, personaLogPath) {
  const personaDir = path.basename(personaLogPath, ".md").replace(/^audit-log-/, "");
  const absoluteDir = path.join(rootDir, detailRoot, personaDir);
  if (!fs.existsSync(absoluteDir)) {
    return "";
  }

  const files = fs
    .readdirSync(absoluteDir)
    .filter((entry) => /^week-\d+\.md$/.test(entry))
    .sort();

  if (files.length === 0) {
    return "";
  }

  return path.posix.join(detailRoot, personaDir, files.at(-1));
}

function parseWeekCovered(text) {
  const match = text.match(/- \*\*Week Covered:\*\* Week (\d+)/);
  return match ? Number(match[1]) : null;
}

function parseBulletValue(lines, label) {
  const prefix = `- **${label}:**`;
  const line = lines.find((entry) => entry.startsWith(prefix));
  return line ? line.slice(prefix.length).trim().replace(/^`|`$/g, "") : "";
}

function parseLatestSlice(latestSlicePath) {
  if (!latestSlicePath) {
    return null;
  }

  const absolutePath = path.join(rootDir, latestSlicePath);
  if (!fs.existsSync(absolutePath)) {
    return null;
  }

  const text = fs.readFileSync(absolutePath, "utf8");
  const highSignal = extractBulletTexts(extractSection(text, "## High-Signal Findings"));
  const blockers = extractBulletTexts(extractSection(text, "## Blockers / Follow-Ups"));
  const telemetryLines = extractSection(text, "## Telemetry");

  return {
    path: latestSlicePath,
    week: parseWeekCovered(text),
    start_state: {
      checkpoint: parseBulletValue(extractSection(text, "## Start State"), "Checkpoint"),
      cash: parseBulletValue(extractSection(text, "## Start State"), "Cash"),
      debt: parseBulletValue(extractSection(text, "## Start State"), "Debt"),
      hunger: parseBulletValue(extractSection(text, "## Start State"), "Hunger"),
      sanity: parseBulletValue(extractSection(text, "## Start State"), "Sanity"),
      education: parseBulletValue(extractSection(text, "## Start State"), "Education"),
      conditions: parseBulletValue(extractSection(text, "## Start State"), "Conditions"),
    },
    telemetry: {
      end_cash: parseBulletValue(telemetryLines, "End Cash"),
      end_debt: parseBulletValue(telemetryLines, "End Debt"),
      end_hunger: parseBulletValue(telemetryLines, "End Hunger"),
      end_sanity: parseBulletValue(telemetryLines, "End Sanity"),
      education: parseBulletValue(telemetryLines, "Education"),
      time_efficiency: parseBulletValue(telemetryLines, "Time Efficiency"),
      net_credits: parseBulletValue(telemetryLines, "Net Credits"),
      net_sanity: parseBulletValue(telemetryLines, "Net Sanity"),
    },
    high_signal_findings: highSignal.slice(0, 5),
    blockers_and_followups: blockers.slice(0, 5),
  };
}

const runState = readJson(runStatePath);
const detailRoot = runState.slice_policy?.detail_log_root || "docs/workflows/cyberpunk-overhaul/phase-11-slices";
const personaLogPath = runState.current_persona?.log_path || "";
const latestSlicePath = latestSliceFile(detailRoot, personaLogPath);
const latestSlice = parseLatestSlice(latestSlicePath);

const brief = {
  workflow: runState.workflow,
  phase: runState.phase,
  generated_at: new Date().toISOString(),
  status: runState.status,
  needs_human: runState.needs_human,
  current_task: runState.current_task,
  current_persona: {
    id: runState.current_persona?.id || "",
    name: runState.current_persona?.name || "",
    log_path: personaLogPath,
    agent_browser_session_name: runState.current_persona?.agent_browser_session_name || "",
  },
  app: {
    url: runState.runtime?.app_url || "",
    browser_args: runState.runtime?.browser_args || [],
  },
  checkpointing: {
    root: runState.checkpointing?.root || "",
    latest_save_path: runState.checkpointing?.latest_save_path || "",
    latest_metadata_path: runState.checkpointing?.latest_metadata_path || "",
    strategy: runState.checkpointing?.strategy || "",
    last_exported_at: runState.checkpointing?.last_exported_at || "",
    last_restored_at: runState.checkpointing?.last_restored_at || "",
    last_restored_save_path: runState.checkpointing?.last_restored_save_path || "",
  },
  control_surface: {
    run_state_path: "docs/workflows/cyberpunk-overhaul/run-state.json",
    progress_path: "docs/workflows/cyberpunk-overhaul/phase-11-audit-progress.md",
    current_phase_path: "docs/workflows/cyberpunk-overhaul/current-phase.md",
    latest_slice_path: latestSlicePath,
  },
  latest_authoritative_state: {
    week: latestSlice?.week ?? null,
    checkpoint_summary: runState.last_run?.summary || "",
    next_slice: runState.next_slice || "",
    latest_slice: latestSlice,
  },
  active_findings: latestSlice?.high_signal_findings || [],
  action_constraints: [
    "Advance exactly one completed in-game week unless a blocker or unusually high-signal audit event stops the slice earlier.",
    "Update run-state.json plus the relevant workflow markdown files in the same run.",
    "Export a fresh checkpoint after every authoritative completed week.",
    "Prefer compact state probes and selector recipes over broad DOM or file dumps.",
  ],
};

fs.writeFileSync(outputPath, `${JSON.stringify(brief, null, 2)}\n`);
