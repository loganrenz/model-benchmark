/**
 * Deterministic, recursive JSON stringifier that sorts object keys and preserves array order.
 */
export function stableStringify(value) {
  const seen = new WeakSet();

  const serialize = (val) => {
    if (val === null) return 'null';
    const type = typeof val;
    if (type === 'number' || type === 'boolean') {
      return JSON.stringify(val);
    }
    if (type === 'string') {
      return JSON.stringify(val);
    }
    if (type === 'bigint') {
      return JSON.stringify(Number(val));
    }
    if (type === 'undefined' || type === 'function' || type === 'symbol') {
      return 'null';
    }

    if (Array.isArray(val)) {
      const elements = val.map((item) => serialize(item));
      return `[${elements.join(',')}]`;
    }

    if (type === 'object') {
      if (seen.has(val)) {
        throw new Error('Cannot stableStringify circular references');
      }
      seen.add(val);

      const jsonVal = val?.toJSON ? val.toJSON() : val;
      if (jsonVal !== val) {
        return serialize(jsonVal);
      }

      const entries = Object.entries(val)
        .filter(([, v]) => typeof v !== 'undefined' && typeof v !== 'function' && typeof v !== 'symbol')
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, v]) => `${JSON.stringify(key)}:${serialize(v)}`);

      return `{${entries.join(',')}}`;
    }

    return JSON.stringify(null);
  };

  return serialize(value);
}

export function stableParse(value) {
  return JSON.parse(value);
}
