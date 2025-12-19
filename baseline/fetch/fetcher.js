import { TextDecoder } from 'node:util';

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_TIMEOUT_MS = 15_000;

const DEFAULT_ALLOWED = [
  /^text\//i,
  /^application\/(json|xml|javascript)/i,
];

function isAllowedContentType(contentType, allowList) {
  if (!contentType) return false;
  return allowList.some((re) => re.test(contentType));
}

async function readBodyWithLimit(response, maxBytes, signal) {
  const reader = response.body?.getReader();
  if (!reader) return { bodyText: undefined, bytes: 0, truncated: false };

  const chunks = [];
  let bytes = 0;
  let truncated = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    bytes += value.length;
    if (bytes > maxBytes) {
      truncated = true;
      break;
    }
    chunks.push(value);
  }

  if (truncated) {
    signal.throwIfAborted();
    return { bodyText: undefined, bytes, truncated: true };
  }

  const buffer = Buffer.concat(chunks);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  return { bodyText: decoder.decode(buffer), bytes: buffer.length, truncated: false };
}

function normalizeHeaders(headers) {
  const result = {};
  const interesting = ['etag', 'last-modified', 'cache-control', 'content-type', 'content-length'];
  for (const key of interesting) {
    const value = headers.get(key);
    if (value !== null) result[key] = value;
  }
  return result;
}

export async function fetchWithPolicy(url, policy = {}) {
  const maxRedirects = policy.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const maxBytes = policy.maxBytes ?? DEFAULT_MAX_BYTES;
  const allowList = policy.allowedContentTypes ?? DEFAULT_ALLOWED;
  const timeoutMs = policy.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const redirectChain = [];
  let currentUrl = url;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
  const start = Date.now();

  try {
    for (let i = 0; i <= maxRedirects; i++) {
      let response;
      try {
        response = await fetch(currentUrl, { redirect: 'manual', signal: controller.signal });
      } catch (err) {
        if (err?.name === 'AbortError') {
          return {
            outcome: 'timeout',
            redirectChain: [...redirectChain],
            headers: {},
            durationMs: Date.now() - start,
            errorMessage: 'Request timed out',
          };
        }
        const code = err?.cause?.code;
        const outcome =
          code === 'ENOTFOUND'
            ? 'dns'
            : code === 'CERT_HAS_EXPIRED' || code === 'DEPTH_ZERO_SELF_SIGNED_CERT'
            ? 'tls'
            : 'network_error';
        return {
          outcome,
          redirectChain: [...redirectChain],
          headers: {},
          durationMs: Date.now() - start,
          errorMessage: err?.message,
        };
      }

      const status = response.status;
      const location = response.headers.get('location');
      if (status >= 300 && status < 400 && location && i < maxRedirects) {
        const nextUrl = new URL(location, currentUrl).toString();
        redirectChain.push(nextUrl);
        currentUrl = nextUrl;
        continue;
      }

      const headers = normalizeHeaders(response.headers);
      const contentType = headers['content-type'];
      const allowed = isAllowedContentType(contentType, allowList);

      if (!allowed) {
        return {
          outcome: 'skipped_content_type',
          statusCode: status,
          finalUrl: currentUrl,
          redirectChain,
          headers,
          durationMs: Date.now() - start,
          errorMessage: 'Content type not allowed',
        };
      }

      const bodyResult = await readBodyWithLimit(response, maxBytes, controller.signal);
      if (bodyResult.truncated) {
        return {
          outcome: 'max_bytes_exceeded',
          statusCode: status,
          finalUrl: currentUrl,
          redirectChain,
          headers,
          durationMs: Date.now() - start,
        };
      }

      if (status < 200 || status >= 300) {
        return {
          outcome: 'http_error',
          statusCode: status,
          finalUrl: currentUrl,
          redirectChain,
          headers,
          bodyText: bodyResult.bodyText,
          bytes: bodyResult.bytes,
          contentType,
          durationMs: Date.now() - start,
        };
      }

      return {
        outcome: 'success',
        statusCode: status,
        finalUrl: currentUrl,
        redirectChain,
        headers,
        bodyText: bodyResult.bodyText,
        bytes: bodyResult.bytes,
        contentType,
        durationMs: Date.now() - start,
      };
    }

    return {
      outcome: 'blocked',
      redirectChain,
      headers: {},
      durationMs: Date.now() - start,
      errorMessage: 'Too many redirects',
    };
  } finally {
    clearTimeout(timer);
  }
}
