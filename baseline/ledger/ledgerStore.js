import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';
import { stableStringify } from '../core/stableStringify.js';

export class LedgerStore {
  constructor(ledgerPath) {
    this.ledgerPath = ledgerPath;
  }

  async ensureDir() {
    await fs.mkdir(dirname(this.ledgerPath), { recursive: true });
  }

  computeEntryHash(entry) {
    return createHash('sha256').update(stableStringify(entry)).digest('hex');
  }

  async readEntries() {
    try {
      const content = await fs.readFile(this.ledgerPath, 'utf8');
      const lines = content.split('\n').filter(Boolean);
      return lines.map((line) => JSON.parse(line));
    } catch (err) {
      if (err.code === 'ENOENT') return [];
      throw err;
    }
  }

  async append(entry) {
    await this.ensureDir();
    const entries = await this.readEntries();
    const prev = entries.at(-1);
    const entryWithPrev = {
      ...entry,
      prev_entry_hash: prev ? prev.entry_hash : null,
    };
    const entry_hash = this.computeEntryHash(entryWithPrev);
    const finalEntry = { ...entryWithPrev, entry_hash };

    await fs.appendFile(this.ledgerPath, `${JSON.stringify(finalEntry)}\n`, 'utf8');
    return finalEntry;
  }
}

export async function verifyLedger(ledgerPath) {
  const store = new LedgerStore(ledgerPath);
  const entries = await store.readEntries();
  let prevHash = null;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.prev_entry_hash !== prevHash) {
      return {
        ok: false,
        error: { index: i, message: 'prev_entry_hash mismatch' },
      };
    }

    const { entry_hash: _ignored, ...rest } = entry;
    const computedHash = createHash('sha256').update(stableStringify(rest)).digest('hex');
    if (computedHash !== entry.entry_hash) {
      return {
        ok: false,
        error: { index: i, message: 'entry_hash mismatch' },
      };
    }
    prevHash = entry.entry_hash;
  }

  return { ok: true };
}
