import { promises as fs } from 'node:fs';
import { join } from 'node:path';

const curatedEndpoints = {
  'https://supabase.com': ['/', '/pricing', '/docs', '/status', '/terms', '/privacy', '/blog', '/security', '/careers', '/changelog'],
  'https://vercel.com': ['/', '/pricing', '/docs', '/status', '/security', '/changelog', '/terms', '/privacy', '/careers', '/blog'],
  'https://netlify.com': ['/', '/pricing', '/docs', '/blog', '/careers', '/security', '/privacy', '/legal/terms-of-use'],
  'https://stripe.com': ['/', '/pricing', '/docs', '/blog', '/status', '/privacy', '/legal/terms'],
  'https://render.com': ['/', '/pricing', '/docs', '/blog', '/status', '/privacy', '/terms'],
  'https://railway.app': ['/', '/pricing', '/docs', '/blog', '/status', '/security', '/privacy'],
  'https://fly.io': ['/', '/pricing', '/docs', '/blog', '/legal/terms', '/legal/privacy'],
  'https://github.com': ['/', '/pricing', '/site/terms', '/site/privacy', '/security', '/blog', '/about/careers'],
  'https://gitlab.com': ['/', '/pricing', '/terms', '/privacy', '/blog', '/explore'],
  'https://digitalocean.com': ['/', '/pricing', '/docs', '/legal/terms-of-service-agreement', '/legal/privacy-policy', '/blog', '/status'],
  'https://openai.com': ['/', '/pricing', '/policies/terms-of-use', '/policies/privacy-policy', '/blog'],
  'https://huggingface.co': ['/', '/pricing', '/docs', '/blog', '/join', '/support'],
};

function normalizeUrl(base, path) {
  const normalizedBase = base.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(normalizedPath, `${normalizedBase}/`).toString();
  return url.replace(/\/$/, '');
}

function isSuspicious(url) {
  if (/\/baseline-/i.test(url)) return true;
  if (/\d{3,}$/.test(url.split('/').pop() || '')) return true;
  return false;
}

export function generateCuratedUrls() {
  const urls = [];
  for (const base of Object.keys(curatedEndpoints)) {
    for (const path of curatedEndpoints[base]) {
      const full = normalizeUrl(base, path);
      urls.push(full);
    }
  }

  const unique = Array.from(new Set(urls)).filter((u) => !isSuspicious(u));
  unique.sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return unique;
}

export async function writeStarterList(outputDir = 'urls') {
  const list = generateCuratedUrls();
  await fs.mkdir(outputDir, { recursive: true });
  const jsonPath = join(outputDir, 'starter-1000.json');
  await fs.writeFile(jsonPath, JSON.stringify(list, null, 2));
  return { jsonPath, count: list.length };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  writeStarterList()
    .then((res) => {
      console.log(`Wrote ${res.count} curated URLs to ${res.jsonPath}`);
    })
    .catch((err) => {
      console.error('Failed to generate URLs', err);
      process.exitCode = 1;
    });
}
