---
name: saucedemo-smoke-test
description: Manual-style smoke test of SauceDemo - login, inventory, sorting, cart. Use when asked to smoke test SauceDemo.
---

# SauceDemo Smoke Test

## Purpose and scope
Verify the core happy path of SauceDemo: open the app, log in, view inventory, sort products, add an item to the cart. **Out of scope:** checkout, purchases, any state-changing action beyond adding to the cart.

## Target environment
`TEST_BASE_URL` (default `https://www.saucedemo.com/`). Public demo site; non-production.

## Prerequisites
- `.env` exists with `TEST_BASE_URL`, `TEST_USERNAME`, `TEST_PASSWORD`. If any is missing, stop and report BLOCKED.
- Playwright MCP is connected (`/mcp`) and the browser is visible.
- Set `RUN_ID` = current local time as `YYYYMMDD-HHmmss`. Create `screenshots/<RUN_ID>/`.

## Authentication requirements
Read credentials from `.env` only. Never display the password in chat, reports or screenshots. Capture screenshots only before typing credentials or after login, not while the password field holds a value.

## Steps and expected results

**Step 1 - Open the application**
- Navigate to `TEST_BASE_URL`.
- Expected: login page visible with Username, Password fields and a Login button.
- Evidence: `01-login-page.png`.

**Step 2 - Authenticate**
- Enter username and password, click Login.
- Expected: URL path becomes `/inventory.html` and the inventory page is displayed.
- Evidence: `02-after-login.png` (after login only).

**Step 3 - Verify inventory**
- Expected: page heading "Products"; at least one product; every product shows a non-empty name and a price starting with `$`.
- Record the actual product count and first product name/price.
- Evidence: `03-inventory.png`.

**Step 4 - Verify sorting**
- Choose "Name (A to Z)" in the sort dropdown.
- Expected: product names, read from the page, are in ascending alphabetical order. Record the actual order seen.
- Evidence: `04-sorted-az.png`.

**Step 5 - Verify shopping cart**
- Click "Add to cart" on the first listed product (note its name).
- Expected: cart badge shows `1`; after opening the cart, the cart page lists exactly that product.
- Evidence: `05-cart.png`.
- Do **not** click Checkout.

**Step 6 - Generate results**
- Write `reports/saucedemo-smoke-test-<RUN_ID>.md` per the format in `CLAUDE.md`.

## Verification rules
- Verify using a fresh `browser_snapshot` after each step; use accessible roles/labels or `data-test` attributes seen in the snapshot. Do not invent selectors.
- Compare actual vs expected explicitly; quote the observed values.

## Error handling
- Element not found or unexpected page: retry once after a fresh snapshot; if still wrong, mark the step FAIL (behaviour differs) or BLOCKED (cannot continue safely), attach a screenshot, and mark dependent steps BLOCKED.
- Login error banner shown: mark Step 2 FAIL, include the banner text (not credentials), stop.

## Reporting requirements
Per-step table (Step, Expected, Actual, Status, Screenshot), errors/blockers, overall status. List only screenshot files that exist.

## Safety restrictions
No checkout, no purchases, no secret output, no source-code changes, no MFA/CAPTCHA bypass.
