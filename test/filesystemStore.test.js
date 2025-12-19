import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FilesystemStore } from '../baseline/store/filesystemStore.js';

const sample = {
  id: 'snap-1',
  capturedAt: new Date().toISOString(),
  url: 'https://example.com',
  bodyText: 'hello world',
  metadata: { status: 200 },
};

test('artifact path is captured in snapshot metadata', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fs-store-'));
  const store = new FilesystemStore(dir);
  const snapshot = await store.writeSnapshot(sample);
  const snapshotPath = join(dir, 'snapshots', `${sample.id}.json`);
  const latestPath = join(dir, 'snapshots', 'latest.json');
  const parsed = JSON.parse(await readFile(snapshotPath, 'utf8'));
  const latest = JSON.parse(await readFile(latestPath, 'utf8'));
  assert.ok(snapshot.artifactPath);
  assert.equal(parsed.artifactPath, snapshot.artifactPath);
  assert.equal(latest.artifactPath, snapshot.artifactPath);
  await rm(dir, { recursive: true, force: true });
});
