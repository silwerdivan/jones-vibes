# ralph.ps1

# Configuration
$MaxIterations = 2
$Iteration = 0

Write-Host "🔥 Ralph Wiggum is helping on Windows! (Press Ctrl+C to stop)" -ForegroundColor Yellow

while ($Iteration -lt $MaxIterations) {
    $Iteration++
    Write-Host "`n--- Iteration $Iteration ---" -ForegroundColor Cyan

    # 1. Prepare the Fresh Context
    # We use Get-Content with -Raw to read the files as a single string
    try {
        $Context = Get-Content prompt.md, plan.md, activity.md -Raw -ErrorAction Stop
    }
    catch {
        Write-Host "Error reading context files. Make sure plan.md, activity.md, and prompt.md exist." -ForegroundColor Red
        break
    }

    # 2. Feed into Gemini CLI
    # We pipe the $Context string into the gemini command.
    # Note: Ensure your CLI accepts stdin. If not, you might need to save $Context to a temporary file first.
    
    # Using specific UTF8 encoding to prevent Windows character garbling
    $Output = $Context | gemini

    # 3. Print Gemini's output (The "Thinking" or "Action")
    Write-Host $Output

    # 4. Check for completion signal
    if ($Output -match "RALPH_COMPLETE") {
        Write-Host "`n✅ Ralph is done helping!" -ForegroundColor Green
        break
    }

    # 5. Safety break / Pace limiter
    Start-Sleep -Seconds 2
}