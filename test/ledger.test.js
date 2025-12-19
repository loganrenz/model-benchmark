import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LedgerStore, verifyLedger } from '../baseline/ledger/ledgerStore.js';

const makeEntry = (id, action) => ({
  id,
  timestamp: new Date().toISOString(),
  action,
  payload: { count: id },
});

test('ledger chaining verifies across entries', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ledger-'));
  const ledgerPath = join(dir, 'ledger.jsonl');
  const store = new LedgerStore(ledgerPath);

  await store.append(makeEntry('1', 'create'));
  await store.append(makeEntry('2', 'update'));
  await store.append(makeEntry('3', 'delete'));

  const result = await verifyLedger(ledgerPath);
  assert.equal(result.ok, true);
  await rm(dir, { recursive: true, force: true });
});

test('ledger verification fails on tampering', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ledger-'));
  const ledgerPath = join(dir, 'ledger.jsonl');
  const store = new LedgerStore(ledgerPath);
  await store.append(makeEntry('1', 'create'));
  await store.append(makeEntry('2', 'update'));

  // Tamper with the second entry
  const content = await readFile(ledgerPath, 'utf8');
  const lines = content.split('\n');
  const tampered = lines[1] ? JSON.stringify({ ...JSON.parse(lines[1]), action: 'tampered' }) : '';
  lines[1] = tampered;
  await writeFile(ledgerPath, lines.filter(Boolean).join('\n') + '\n');

  const result = await verifyLedger(ledgerPath);
  assert.equal(result.ok, false);
  assert(result.error);
  await rm(dir, { recursive: true, force: true });
});
