import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ quiet: true });

// One shared run id so screenshots and report share a timestamp (workers inherit env).
const pad = (n: number) => String(n).padStart(2, '0');
const d = new Date();
process.env.RUN_ID ??= `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  outputDir: 'test-results',
  use: {
    baseURL: process.env.TEST_BASE_URL,
    // Visible browser by default; set HEADLESS=true (e.g. CI) to hide it.
    headless: process.env.HEADLESS === 'true',
    launchOptions: { slowMo: Number(process.env.SLOWMO_MS ?? 400) },
    screenshot: 'only-on-failure',
    trace: 'off',
  },
});
