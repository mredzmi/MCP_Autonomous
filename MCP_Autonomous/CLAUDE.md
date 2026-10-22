# QA Agent Rules

This repository turns Claude Code into a live QA agent. Tests are written as Markdown skills in `skills/<name>/SKILL.md` and executed through the Playwright MCP browser tools (`mcp__playwright__*`).

## How to handle a request
1. When asked to run or perform a test, find the matching skill under `skills/` (match on the name or purpose) and **read it fully before acting**.
2. Follow the skill's steps in order, using the Playwright MCP tools in a **visible (headed) browser**. Do not write or run a Playwright script as a substitute; that is scripted testing, not agent-driven testing.
3. After each significant action, take a page snapshot (`browser_snapshot`) and verify the **actual** page against the **expected** result. Do not assume.
4. Capture screenshots as evidence (`browser_take_screenshot`), saved under `screenshots/<RUN_ID>/` with names like `01-login-page.png`.
5. Write the report to `reports/<skill-name>-<RUN_ID>.md`. `RUN_ID` format is `YYYYMMDD-HHmmss` (local time); never overwrite an earlier report.

## Configuration
- Read `TEST_BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD` from the environment / `.env` (use `.env.example` as the template). Never hardcode them in skills or code.
- If a required value is missing, stop and report BLOCKED. Do not guess values.
- When typing a password, use the browser tool with the value from `.env`, and never echo it in chat, reports or logs. Do not take screenshots while a secret is visible in a field.

## Honesty rules
- Report every step as **PASS**, **FAIL** or **BLOCKED**. Never invent results or claim an unexecuted step passed.
- Only list screenshots and files that actually exist (verify before listing).
- If a step cannot be verified, record the limitation instead of guessing.

## Safety rules
- Never modify application source code during testing.
- Never perform destructive or irreversible actions (checkout, purchases, deletions, account changes) without explicit approval.
- Never bypass MFA, CAPTCHA, SSO or other security controls.
- Never print passwords, cookies, tokens or sensitive query parameters.
- Only test environments the user is authorised to test.
- If safe continuation is impossible, stop and report the blocker.

## Report format
Test name · environment (hostname only) · date/time · per-step table (Step, Expected, Actual, Status, Screenshot) · errors/blockers · overall status (PASS only if all steps PASS; FAIL if any FAIL; BLOCKED if any step is BLOCKED and none failed).
