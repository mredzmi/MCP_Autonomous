// Validates required env vars and repo files WITHOUT printing secret values.
import fs from 'node:fs';
import 'dotenv/config';

const required = ['TEST_BASE_URL', 'TEST_USERNAME', 'TEST_PASSWORD'];
let ok = true;

if (!fs.existsSync('.env')) {
  console.error('[FAIL] .env not found. Run: Copy-Item .env.example .env');
  ok = false;
}
for (const k of required) {
  const set = !!process.env[k];
  console.log(`[${set ? 'OK' : 'FAIL'}] ${k} ${set ? 'is set' : 'is missing'}`);
  if (!set) ok = false;
}
try { new URL(process.env.TEST_BASE_URL ?? ''); } catch { console.error('[FAIL] TEST_BASE_URL is not a valid URL'); ok = false; }

for (const f of ['CLAUDE.md', '.mcp.json', 'skills/saucedemo-smoke-test/SKILL.md', 'tests/saucedemo-smoke-test.spec.ts']) {
  const e = fs.existsSync(f);
  console.log(`[${e ? 'OK' : 'FAIL'}] ${f}`);
  if (!e) ok = false;
}
try { JSON.parse(fs.readFileSync('.mcp.json', 'utf8')); console.log('[OK] .mcp.json is valid JSON'); }
catch { console.error('[FAIL] .mcp.json is not valid JSON'); ok = false; }

process.exit(ok ? 0 : 1);
