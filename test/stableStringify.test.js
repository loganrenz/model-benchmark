import test from 'node:test';
import assert from 'node:assert/strict';
import { stableStringify } from '../baseline/core/stableStringify.js';

const sampleA = { b: 1, a: { d: 2, c: 3 } };
const sampleB = { a: { c: 3, d: 2 }, b: 1 };

test('stableStringify produces deterministic order for nested objects', () => {
  const a = stableStringify(sampleA);
  const b = stableStringify(sampleB);
  assert.equal(a, b);
});

test('stableStringify preserves array order', () => {
  const value = { items: [3, 2, 1] };
  const str = stableStringify(value);
  assert.equal(str, '{"items":[3,2,1]}');
});
