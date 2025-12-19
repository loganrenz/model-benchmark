import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithPolicy } from '../baseline/fetch/fetcher.js';

const originalFetch = globalThis.fetch;

function setMockFetch(fn) {
  globalThis.fetch = fn;
}

test.after(() => {
  globalThis.fetch = originalFetch;
});

test('skips non-allowed content types', async () => {
  setMockFetch(async () => new Response('binary', { status: 200, headers: { 'content-type': 'image/png' } }));
  const result = await fetchWithPolicy('https://example.com');
  assert.equal(result.outcome, 'skipped_content_type');
});

test('aborts when exceeding max bytes', async () => {
  const largeBody = 'x'.repeat(10_000);
  setMockFetch(async () => new Response(largeBody, { status: 200, headers: { 'content-type': 'text/plain' } }));
  const result = await fetchWithPolicy('https://example.com', { maxBytes: 1000 });
  assert.equal(result.outcome, 'max_bytes_exceeded');
});

test('restores fetch after tests', () => {
  globalThis.fetch = originalFetch;
  assert.equal(globalThis.fetch, originalFetch);
});
