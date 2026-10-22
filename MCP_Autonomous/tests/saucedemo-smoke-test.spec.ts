import { test, expect, Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

// SCRIPTED test: deterministic steps. This is NOT agent-driven testing.
const baseUrl = process.env.TEST_BASE_URL;
const username = process.env.TEST_USERNAME;
const password = process.env.TEST_PASSWORD;
const runId = process.env.RUN_ID!;

type Status = 'PASS' | 'FAIL' | 'BLOCKED';
interface StepResult { step: string; expected: string; actual: string; status: Status; screenshot?: string }
const results: StepResult[] = [];
const shotDir = path.join('screenshots', runId);

async function shot(page: Page, name: string): Promise<string> {
  fs.mkdirSync(shotDir, { recursive: true });
  const file = path.join(shotDir, `${name}.png`);
  await page.screenshot({ path: file });
  return file;
}

async function runStep(name: string, expected: string, fn: () => Promise<{ actual: string; screenshot?: string }>) {
  const failedBefore = results.some(r => r.status !== 'PASS');
  if (failedBefore) { results.push({ step: name, expected, actual: 'Skipped: an earlier step did not pass', status: 'BLOCKED' }); return; }
  try {
    const r = await fn();
    results.push({ step: name, expected, actual: r.actual, status: 'PASS', screenshot: r.screenshot });
  } catch (e) {
    results.push({ step: name, expected, actual: String((e as Error).message).split('\n')[0], status: 'FAIL' });
  }
}

function writeReport() {
  fs.mkdirSync('reports', { recursive: true });
  const overall = results.some(r => r.status === 'FAIL') ? 'FAIL' : results.some(r => r.status === 'BLOCKED') ? 'BLOCKED' : 'PASS';
  const host = baseUrl ? new URL(baseUrl).hostname : 'unknown';
  const rows = results.map(r => `| ${r.step} | ${r.expected} | ${r.actual.replace(/\|/g, '/')} | ${r.status} | ${r.screenshot && fs.existsSync(r.screenshot) ? r.screenshot : '-'} |`);
  const md = [
    `# SauceDemo Smoke Test (scripted Playwright)`,
    ``,
    `- Mode: scripted (deterministic), not agent-driven`,
    `- Environment: ${host}`,
    `- Run: ${runId}`,
    `- Overall: **${overall}**`,
    ``,
    `| Step | Expected | Actual | Status | Screenshot |`,
    `|---|---|---|---|---|`,
    ...rows,
    ``,
  ].join('\n');
  const file = path.join('reports', `saucedemo-smoke-test-scripted-${runId}.md`);
  fs.writeFileSync(file, md);
  console.log(`Report: ${file}`);
}

test('SauceDemo smoke test', async ({ page }) => {
  expect(baseUrl, 'TEST_BASE_URL is missing - see .env.example').toBeTruthy();
  expect(username, 'TEST_USERNAME is missing').toBeTruthy();
  expect(password, 'TEST_PASSWORD is missing').toBeTruthy();

  let firstProduct = '';
  try {
    await runStep('1 Open application', 'Login page visible', async () => {
      await page.goto(baseUrl!);
      await expect(page.getByTestId('login-button')).toBeVisible();
      return { actual: 'Login form visible', screenshot: await shot(page, '01-login-page') };
    });

    await runStep('2 Authenticate', 'Inventory page displayed', async () => {
      await page.getByTestId('username').fill(username!);
      await page.getByTestId('password').fill(password!);
      await page.getByTestId('login-button').click();
      await expect(page).toHaveURL(/inventory\.html/);
      return { actual: 'Landed on /inventory.html', screenshot: await shot(page, '02-after-login') };
    });

    await runStep('3 Verify inventory', 'Heading "Products"; >=1 product with name and $ price', async () => {
      await expect(page.getByTestId('title')).toHaveText('Products');
      const items = page.getByTestId('inventory-item');
      const count = await items.count();
      expect(count).toBeGreaterThan(0);
      const names = await page.getByTestId('inventory-item-name').allInnerTexts();
      const prices = await page.getByTestId('inventory-item-price').allInnerTexts();
      expect(names.every(n => n.trim().length > 0)).toBe(true);
      expect(prices.every(p => p.startsWith('$'))).toBe(true);
      return { actual: `${count} products; first: ${names[0]} ${prices[0]}`, screenshot: await shot(page, '03-inventory') };
    });

    await runStep('4 Verify sorting', 'Names in A-Z order', async () => {
      await page.getByTestId('product-sort-container').selectOption('az');
      const names = await page.getByTestId('inventory-item-name').allInnerTexts();
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sorted);
      firstProduct = names[0];
      return { actual: `Sorted A-Z: ${names.join(', ')}`, screenshot: await shot(page, '04-sorted-az') };
    });

    await runStep('5 Verify cart', 'Badge shows 1; product listed in cart', async () => {
      await page.getByTestId('inventory-item').first().getByRole('button', { name: /add to cart/i }).click();
      await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
      await page.getByTestId('shopping-cart-link').click();
      await expect(page.getByTestId('inventory-item-name')).toHaveText([firstProduct]);
      return { actual: `Badge 1; cart contains "${firstProduct}"`, screenshot: await shot(page, '05-cart') };
    });
  } finally {
    writeReport();
  }
  expect(results.every(r => r.status === 'PASS'), 'One or more steps did not pass - see report').toBe(true);
});
