# Runs the SCRIPTED Playwright smoke test (not the agent-driven Claude workflow).
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)

foreach ($cmd in 'node', 'npm') {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) { Write-Error "$cmd not found. Install Node.js 18+ from https://nodejs.org"; exit 2 }
}
if (-not (Test-Path '.env')) {
  Write-Host ".env not found. Create it with:  Copy-Item .env.example .env" -ForegroundColor Yellow
  exit 2
}
if (-not (Test-Path 'node_modules')) { Write-Host "Dependencies missing. Run: npm install ; npx playwright install chromium" -ForegroundColor Yellow; exit 2 }

npm run validate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm test
$code = $LASTEXITCODE
Write-Host "`nScripted run finished (exit $code). Reports: $(Resolve-Path reports)  Screenshots: $(Resolve-Path screenshots)"
Write-Host "For the agent-driven run, start 'claude' and use the prompt in README section 'Quick Start'." -ForegroundColor Cyan
exit $code
