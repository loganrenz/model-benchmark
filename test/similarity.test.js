import test from 'node:test';
import assert from 'node:assert/strict';
import { boundedSimilarity } from '../baseline/core/similarity.js';

test('identical content yields similarity 1', () => {
  const { similarity } = boundedSimilarity('hello\nworld', 'hello\nworld');
  assert.equal(similarity, 1);
});

test('small edit reduces similarity', () => {
  const { similarity } = boundedSimilarity('hello\nworld', 'hello\nplanet');
  assert(similarity < 1);
});

test('different content yields low similarity', () => {
  const { similarity } = boundedSimilarity('a\nb\nc', 'x\ny\nz');
  assert(similarity < 0.4);
});

test('large payload skips expensive path', () => {
  const a = 'a'.repeat(60_000);
  const b = 'b'.repeat(60_000);
  const result = boundedSimilarity(a, b);
  assert.equal(result.method, 'skipped-large');
});
