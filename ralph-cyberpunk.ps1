# ralph-cyberpunk.ps1
# Simple Ralph Loop for Cyberpunk Overhaul Audit

param(
    # If set, passes --debug to gemini and captures the noisier output to the log.
    [switch]$Debug,

    # If set (default), forces non-interactive mode (avoids Gemini CLI switching to interactive mode).
    # Some Gemini CLI versions require --prompt/-p for non-interactive execution even when stdin is provided.
    [switch]$NonInteractive = $true,

    # If set, keeps the console output to lightweight "heartbeat" lines only.
    [switch]$Quiet = $true,

    # Where to append the combined gemini output (recommended to "check in" with Get-Content -Tail).
    [string]$RunLogFile = "docs\workflows\cyberpunk-overhaul\audit-log-gemini.txt",

    # Extra delay when Gemini returns capacity / 429 style errors to avoid hammering the service.
    [int]$CapacityBackoffSeconds = 60,

    # Normal loop delay when no capacity backoff is needed.
    [int]$NormalDelaySeconds = 5
)

# Set the standard engineering system prompt
$env:GEMINI_SYSTEM_MD = "my-system-prompt.md"

# Set the agent-browser profile to ensure persistence and stability
$env:AGENT_BROWSER_PROFILE = "C:\Users\silwe\.agent-browser\audit-profile"

# Files to build the input prompt
$PersonaPromptFile = "ralph\cyberpunk-ralph-prompt.md"
$PlanFile = "docs\workflows\cyberpunk-overhaul\phase-11-plan.md"
$ProgressFile = "docs\workflows\cyberpunk-overhaul\phase-11-audit-progress.md"
$PersonaLogFile = "docs\workflows\cyberpunk-overhaul\audit-log-persona-a.md"

Write-Host ">>> Ralph is auditing the Sprawl! (Press Ctrl+C to stop)" -ForegroundColor Yellow
Write-Host ">>> Log: $RunLogFile" -ForegroundColor DarkGray

while ($true) {
    $RunStartedAt = Get-Date
    if ($Quiet) {
        Write-Host (">>> Ralph heartbeat: " + $RunStartedAt.ToString("s") + " (check the log for details)") -ForegroundColor DarkGray
    } else {
        Write-Host (">>> Run started: " + $RunStartedAt.ToString("s")) -ForegroundColor DarkGray
    }

    # 1. Build context: Persona Role + Project State
    $Context = (Get-Content $PersonaPromptFile -Raw) + "`n`n"
    $Context += "### CURRENT PROJECT STATE:`n"
    $Context += "--- PLAN ---`n" + (Get-Content $PlanFile -Raw) + "`n"
    $Context += "--- PROGRESS ---`n" + (Get-Content $ProgressFile -Raw) + "`n"
    $Context += "--- LOG ---`n" + (Get-Content $PersonaLogFile -Raw) + "`n"
    $Context += "Perform the next logical step in the audit using agent-browser."

    # 2. Run Gemini (optionally with --debug). Always append combined output to a log file.
    $GeminiArgs = @("--yolo")
    if ($Debug) { $GeminiArgs += "--debug" }
    if ($NonInteractive) {
        # Prefer "--prompt -" so the prompt is read from stdin and Gemini stays non-interactive.
        $GeminiArgs += @("--prompt", "-")
    }

    # Ensure the log file exists immediately so you can tail it while gemini runs.
    $LogParent = Split-Path -Parent $RunLogFile
    if ($LogParent) { New-Item -ItemType Directory -Force -Path $LogParent | Out-Null }
    if (-not (Test-Path -LiteralPath $RunLogFile)) {
        # Create as UTF-8 (no BOM) to avoid "NUL" artifacts when tailing/viewing.
        [System.IO.File]::WriteAllText($RunLogFile, "", [System.Text.UTF8Encoding]::new($false))
    }

    $Utf8NoBom = [System.Text.UTF8Encoding]::new($false)

    function Ensure-Utf8LogFile {
        if (-not (Test-Path -LiteralPath $RunLogFile)) { return }

        # If the file looks like UTF-16 (contains NUL bytes early), rotate it so future appends are clean UTF-8.
        try {
            $bytes = [System.IO.File]::ReadAllBytes($RunLogFile)
            $max = [Math]::Min($bytes.Length, 4096)
            for ($i = 0; $i -lt $max; $i++) {
                if ($bytes[$i] -eq 0) {
                    $bak = $RunLogFile + ".utf16.bak"
                    try { Move-Item -LiteralPath $RunLogFile -Destination $bak -Force } catch { }
                    [System.IO.File]::WriteAllText($RunLogFile, "", $Utf8NoBom)
                    return
                }
            }
        } catch {
            # If we can't read/rotate, just continue; appends will still work.
        }
    }

    $writeLock = New-Object object
    $fsLog = $null
    function Append-RunLog([string]$Text) {
        if (-not $script:fsLog) {
            # Shouldn't happen, but keep a safe fallback.
            [System.IO.File]::AppendAllText($RunLogFile, $Text + "`r`n", $Utf8NoBom)
            return
        }

        $bytes = $Utf8NoBom.GetBytes($Text + "`r`n")
        [System.Threading.Monitor]::Enter($script:writeLock)
        try { $script:fsLog.Write($bytes, 0, $bytes.Length); $script:fsLog.Flush() } finally { [System.Threading.Monitor]::Exit($script:writeLock) }
    }

    # Add a run delimiter so tailing the log is readable.
    $Delimiter = @(
        ""
        ("===== RALPH RUN " + $RunStartedAt.ToString("s") + " (Debug=" + [bool]$Debug + ") =====")
        ("PWD: " + (Get-Location).Path)
        ""
    ) -join "`n"
    Ensure-Utf8LogFile

    $fsLog = [System.IO.File]::Open($RunLogFile, [System.IO.FileMode]::Append, [System.IO.FileAccess]::Write, [System.IO.FileShare]::ReadWrite)
    try {
        Append-RunLog $Delimiter
        $RunLogStartLen = (Get-Item -LiteralPath $RunLogFile).Length

    # Run via cmd.exe so this works whether "gemini" is an exe or a cmd shim.
    # We stream stdout/stderr bytes as they arrive (no newline buffering) and normalize the log as UTF-8.
    $psi = New-Object System.Diagnostics.ProcessStartInfo
    $psi.FileName = "cmd.exe"
    # Ensure Gemini runs from repo root so it picks up project-local .gemini/settings.json.
    $psi.WorkingDirectory = (Get-Location).Path
    $psi.Arguments = ("/c gemini " + ($GeminiArgs -join " "))
    $psi.UseShellExecute = $false
    $psi.RedirectStandardInput = $true
    $psi.RedirectStandardOutput = $true
    $psi.RedirectStandardError = $true
    # IMPORTANT: CreateNoWindow=$true starts the child without a console (CREATE_NO_WINDOW),
    # which breaks some Gemini CLI tool flows on Windows (node-pty ConPTY uses AttachConsole).
    # Keeping a console attached avoids "Error: AttachConsole failed" spam during tool execution.
    $psi.CreateNoWindow = $false

    $proc = New-Object System.Diagnostics.Process
    $proc.StartInfo = $psi
    $null = $proc.Start()
    Append-RunLog ("[host] cmd.exe started pid=" + $proc.Id + " at " + (Get-Date).ToString("s"))

    $proc.StandardInput.Write($Context)
    $proc.StandardInput.Close()

        try {
        $oemEnc = [System.Text.Encoding]::GetEncoding([System.Globalization.CultureInfo]::CurrentCulture.TextInfo.OEMCodePage)

        $outStream = $proc.StandardOutput.BaseStream
        $errStream = $proc.StandardError.BaseStream
        $outBuf = New-Object byte[] 4096
        $errBuf = New-Object byte[] 4096

        $outTask = $outStream.ReadAsync($outBuf, 0, $outBuf.Length)
        $errTask = $errStream.ReadAsync($errBuf, 0, $errBuf.Length)

        $nextHeartbeat = (Get-Date).AddSeconds(10)

        while ($true) {
            if ((Get-Date) -ge $nextHeartbeat -and (-not $proc.HasExited)) {
                Append-RunLog ("[host] gemini still running pid=" + $proc.Id + " at " + (Get-Date).ToString("s"))
                $nextHeartbeat = (Get-Date).AddSeconds(10)
            }

            $idx = [System.Threading.Tasks.Task]::WaitAny(@($outTask, $errTask), 500)
            if ($idx -eq -1) {
                if ($proc.HasExited -and $outTask.IsCompleted -and $errTask.IsCompleted) { break }
                continue
            }

            if ($idx -eq 0) {
                $n = $outTask.Result
                if ($n -gt 0) {
                    $text = $oemEnc.GetString($outBuf, 0, $n)
                    $outBytes = $Utf8NoBom.GetBytes($text)
                    [System.Threading.Monitor]::Enter($writeLock)
                    try { $fsLog.Write($outBytes, 0, $outBytes.Length); $fsLog.Flush() } finally { [System.Threading.Monitor]::Exit($writeLock) }
                    $outTask = $outStream.ReadAsync($outBuf, 0, $outBuf.Length)
                } else {
                    # EOF: keep the task completed
                }
            } else {
                $n = $errTask.Result
                if ($n -gt 0) {
                    $text = $oemEnc.GetString($errBuf, 0, $n)
                    $text = "[stderr] " + $text
                    $outBytes = $Utf8NoBom.GetBytes($text)
                    [System.Threading.Monitor]::Enter($writeLock)
                    try { $fsLog.Write($outBytes, 0, $outBytes.Length); $fsLog.Flush() } finally { [System.Threading.Monitor]::Exit($writeLock) }
                    $errTask = $errStream.ReadAsync($errBuf, 0, $errBuf.Length)
                } else {
                    # EOF: keep the task completed
                }
            }

            if ($proc.HasExited -and $outTask.IsCompleted -and $errTask.IsCompleted) { break }
        }
        } finally {
            # nothing
        }

    Append-RunLog ("[host] gemini exited pid=" + $proc.Id + " code=" + $proc.ExitCode + " at " + (Get-Date).ToString("s"))

    # Read just this run's freshly-written log portion for completion detection.
    $fs = [System.IO.File]::Open($RunLogFile, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
    try {
        $null = $fs.Seek($RunLogStartLen, [System.IO.SeekOrigin]::Begin)
        $reader = New-Object System.IO.StreamReader($fs, $Utf8NoBom, $true, 4096, $true)
        try { $Output = $reader.ReadToEnd() } finally { $reader.Dispose() }
    } finally {
        $fs.Dispose()
    }
    } finally {
        if ($fsLog) { $fsLog.Dispose() }
        $fsLog = $null
    }

    # 3. Print output (optional). Default is quiet to avoid debug noise.
    if (-not $Quiet) {
        Write-Host $Output
    }

    # 4. Check for completion
    if ($Output -match "RALPH_COMPLETE") {
        Write-Host "✅ Audit Phase Complete!" -ForegroundColor Green
        break
    }

    # 5. Breath
    $sleepSeconds = $NormalDelaySeconds
    if ($Output -match "MODEL_CAPACITY_EXHAUSTED" -or
        $Output -match "No capacity available for model" -or
        $Output -match '"code"\s*:\s*429' -or
        $Output -match "RESOURCE_EXHAUSTED") {
        $sleepSeconds = $CapacityBackoffSeconds
        Append-RunLog ("[host] capacity backoff sleepSeconds=" + $sleepSeconds + " at " + (Get-Date).ToString("s"))
    }
    Start-Sleep -Seconds $sleepSeconds
}
