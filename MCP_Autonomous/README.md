# Claude QA Agent (Playwright MCP + Markdown skills)

## Quick Start - Run Locally (Windows PowerShell)

```powershell
git clone https://github.com/mredzmi/MCP_Autonomous.git
cd MCP_Autonomous
npm install
npx playwright install chromium
Copy-Item .env.example .env
claude
```

In Claude Code, run `/mcp` and confirm `playwright` is **connected** (approve the project MCP server if prompted). Then paste:

> Read `skills/saucedemo-smoke-test/SKILL.md` and execute the complete smoke test in a visible browser. Verify every step, capture screenshots and generate the final execution report.

Claude must drive the browser through the `mcp__playwright__*` tools. A Chromium window opens on your desktop; watch it, and press `Esc` in Claude Code (or close the browser window / `Ctrl+C`) to stop a run.

## A. Overview
- **Skills**: QA scenarios are Markdown files in `skills/<name>/SKILL.md`. `CLAUDE.md` holds the rules every run follows (honest PASS/FAIL/BLOCKED, no secrets, no destructive actions).
- **Agent-driven mode**: Claude reads the skill, snapshots the page, decides the next action and verifies results via Playwright MCP (`.mcp.json`).
- **Scripted mode**: `tests/saucedemo-smoke-test.spec.ts` runs fixed steps with Playwright Test. It is deterministic and is **not** agent-driven.

## B. Prerequisites
Node.js 18+, npm, Git, Claude Code.
```powershell
node --version; npm --version; git --version; claude --version
```

## C. Installation
See Quick Start. `npm run install:browsers` is an alias for `npx playwright install chromium`.

## D. Environment Configuration
| Variable | Meaning | Default |
|---|---|---|
| `TEST_BASE_URL` | App under test | `https://www.saucedemo.com/` |
| `TEST_USERNAME` | Login user | `standard_user` |
| `TEST_PASSWORD` | Login password | `secret_sauce` (public demo credential) |
| `HEADLESS` (optional) | `true` hides the browser in scripted mode | unset = visible |
| `SLOWMO_MS` (optional) | Delay per action in scripted mode | `400` |

Override for another **authorised** environment by editing `.env` only. Check the config without printing secrets: `npm run validate`. Verify `.env` is git-ignored:
```powershell
git check-ignore -v .env
```

## E. MCP Setup
Config file: `.mcp.json` (project scope). Server: `@playwright/mcp` launched via `cmd /c npx` (required on native Windows), with `--browser chromium` (uses the Chromium installed above), `--output-dir reports/mcp`.
`@playwright/mcp` runs **headed by default**; headless only happens if `--headless` is passed, which this config does not do.
1. Start `claude` from the repo root.
2. `/mcp` shows server status. Or run `npm run mcp:list`.
3. If it is not connected: confirm `npx` works, run `npx playwright install chromium`, restart `claude`, approve the project server.
4. If no window appears, confirm you are not on a remote/headless session (SSH, WSL without GUI). Fallback: use scripted mode (`npm test`), which is headed via Playwright's API, and note it is not agent-driven.

## F. Scripted Execution
```powershell
npm test                      # headed Chromium
.\scripts\run-smoke-test.ps1  # validates, then runs npm test, returns its exit code
npm run typecheck
```
Scripted runs execute fixed steps; the Claude/MCP run decides each step from the live page.

## G. Test Scenarios
1. Open the app: login page visible. 2. Login: lands on `/inventory.html`. 3. Inventory: heading "Products", at least one product with name and `$` price. 4. Sort Name (A to Z): names ascending. 5. Cart: add first product, badge `1`, product appears in cart. 6. Report. Checkout is never performed.

## H. Reports and Screenshots
- Screenshots: `screenshots/<RUN_ID>/NN-name.png`
- Reports: `reports/saucedemo-smoke-test-<RUN_ID>.md` (agent) and `reports/saucedemo-smoke-test-scripted-<RUN_ID>.md` (scripted)
- `RUN_ID` = `YYYYMMDD-HHmmss`, so nothing is overwritten. Statuses: **PASS** verified as expected; **FAIL** actual differs from expected; **BLOCKED** could not be verified/continue safely. Overall: any FAIL = FAIL; else any BLOCKED = BLOCKED; else PASS.
- These folders are git-ignored (except `.gitkeep`).

## I. Troubleshooting
| Problem | Fix |
|---|---|
| `claude` / `npm` not recognised | Install Claude Code / Node.js, reopen PowerShell |
| Dependencies missing | `npm install` |
| Chromium not installed | `npx playwright install chromium` |
| MCP not connected | See section E |
| Browser invisible | Remove any `--headless` flag; unset `HEADLESS`; run on a desktop session |
| Login fails | Check `.env` values; open the site manually |
| Missing env vars | `npm run validate` names the missing ones |
| No screenshots/reports | Check write permission; the report only lists files that exist |
| Network/permissions | Allow Node/Chromium through proxy/firewall; test the base URL in a normal browser |

## J. Security
Credentials only in `.env` (git-ignored with auth state, reports, screenshots). Test non-production, authorised targets only. Never print or screenshot secrets. No checkout or destructive actions without explicit approval. MFA/CAPTCHA/SSO are never bypassed.

## K. Extending
Add `skills/<new-skill>/SKILL.md` using the same sections as the SauceDemo skill, then ask Claude to run it. Add environments by changing `.env` values; add scripted coverage under `tests/`. Example:
```markdown
---
name: saucedemo-logout-test
description: Verify logout returns to the login page.
---
## Steps
1. Log in (see CLAUDE.md for credential handling). 2. Open the menu, click Logout.
## Expected
Login page visible; `/inventory.html` no longer reachable without login.
```

## L. Limitations
- The first `claude` run requires approving the project MCP server.
- `npx -y @playwright/mcp@latest` downloads on first use and needs network access; pin a version in `.mcp.json` for reproducibility.
- Agent-driven results depend on the model following the skill; review the report and screenshots.
- On macOS/Linux, change `.mcp.json` to `"command": "npx"` with the same args minus `/c` and `npx`.
