import test from 'node:test';
import assert from 'node:assert/strict';
import { generateCuratedUrls } from '../baseline/urls/generate.js';

const firstRun = generateCuratedUrls();
const secondRun = generateCuratedUrls();

test('no synthetic baseline paths are present', () => {
  assert.equal(firstRun.some((u) => u.includes('/baseline-')), false);
});

test('url generation is deterministic', () => {
  assert.deepEqual(firstRun, secondRun);
});

test('list is sorted', () => {
  const sorted = [...firstRun].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  assert.deepEqual(firstRun, sorted);
});
