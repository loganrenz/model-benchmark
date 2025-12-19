const MAX_COMPARE_CHARS = 50_000;
const MAX_LINES = 10_000;

export function boundedSimilarity(a, b) {
  if (a.length > MAX_COMPARE_CHARS || b.length > MAX_COMPARE_CHARS) {
    return { similarity: 0, method: 'skipped-large' };
  }

  const normalizeLines = (content) =>
    content
      .toLowerCase()
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .slice(0, MAX_LINES);

  const setA = new Set(normalizeLines(a));
  const setB = new Set(normalizeLines(b));

  if (setA.size === 0 && setB.size === 0) {
    return { similarity: 1, method: 'jaccard-lines' };
  }

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  const similarity = union === 0 ? 0 : intersection / union;
  return { similarity, method: 'jaccard-lines' };
}
