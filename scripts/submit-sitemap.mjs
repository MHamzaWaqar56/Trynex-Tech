const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://trynex.com';
const SITEMAP_URL = new URL('/sitemap.xml', SITE_URL).toString();
const INDEXNOW_KEY = process.env.INDEXNOW_KEY;
const INDEXNOW_KEY_LOCATION = process.env.INDEXNOW_KEY_LOCATION || new URL('/indexnow-key', SITE_URL).toString();

const FALLBACK_URLS = [
  new URL('/', SITE_URL).toString(),
  new URL('/services', SITE_URL).toString(),
  new URL('/portfolio', SITE_URL).toString(),
  new URL('/blog', SITE_URL).toString(),
  new URL('/pricing', SITE_URL).toString(),
  new URL('/about', SITE_URL).toString(),
  new URL('/contact', SITE_URL).toString(),
  new URL('/careers', SITE_URL).toString(),
];

function log(message) {
  console.log(`[sitemap-submit] ${message}`);
}

async function pingGoogle() {
  const pingUrl = `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`;
  const response = await fetch(pingUrl, { method: 'GET' });

  if (!response.ok) {
    throw new Error(`Google ping failed with status ${response.status}`);
  }
}

async function collectUrls() {
  try {
    const response = await fetch(SITEMAP_URL, { method: 'GET' });
    if (!response.ok) {
      return FALLBACK_URLS;
    }

    const xml = await response.text();
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]).filter(Boolean);
    return urls.length > 0 ? urls : FALLBACK_URLS;
  } catch {
    return FALLBACK_URLS;
  }
}

async function submitIndexNow(urls) {
  if (!INDEXNOW_KEY) {
    log('Skipping IndexNow because INDEXNOW_KEY is not set.');
    return;
  }

  const body = {
    host: new URL(SITE_URL).host,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList: urls,
  };

  const response = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`IndexNow request failed with status ${response.status}`);
  }
}

async function main() {
  try {
    log(`Pinging Google with sitemap: ${SITEMAP_URL}`);
    await pingGoogle();

    const urls = await collectUrls();
    log(`Submitting ${urls.length} URLs to IndexNow.`);
    await submitIndexNow(urls);

    log('Sitemap notifications completed.');
  } catch (error) {
    console.warn('[sitemap-submit] Notification step failed, but build will continue.');
    console.warn(error instanceof Error ? error.message : error);
  }
}

main();