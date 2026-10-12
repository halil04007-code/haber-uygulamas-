// Haber kaynaklarını indirir ve public/data/news.json dosyasını üretir.
// GitHub Actions bunu düzenli olarak çalıştırır; tarayıcı CORS sorunu yaşamaz.
import { mkdir, writeFile } from 'node:fs/promises';
import { FEEDS } from './feeds.mjs';
import { parseFeed } from './rss.mjs';

const OUT_DIR = new URL('../public/data/', import.meta.url);
const MAX_PER_FEED = 30;

async function fetchFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { 'user-agent': 'Mozilla/5.0 (haber-uygulamasi)' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const items = parseFeed(await res.text()).slice(0, MAX_PER_FEED);
  return items.map((item) => ({ ...item, source: feed.id, sourceName: feed.name }));
}

export function mergeItems(lists) {
  const seen = new Set();
  return lists
    .flat()
    .filter((item) => (seen.has(item.link) ? false : seen.add(item.link)))
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
}

async function main() {
  const results = await Promise.allSettled(FEEDS.map(fetchFeed));
  const sources = FEEDS.map((feed, i) => ({
    id: feed.id,
    name: feed.name,
    ok: results[i].status === 'fulfilled',
    error: results[i].status === 'rejected' ? String(results[i].reason?.message || results[i].reason) : undefined,
  }));
  for (const s of sources) console.log(`${s.ok ? '✓' : '✗'} ${s.name}${s.error ? ` (${s.error})` : ''}`);

  const items = mergeItems(results.filter((r) => r.status === 'fulfilled').map((r) => r.value));
  if (items.length === 0) {
    console.error('Hiçbir kaynaktan haber alınamadı.');
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const data = { updatedAt: new Date().toISOString(), sources, items };
  await writeFile(new URL('news.json', OUT_DIR), JSON.stringify(data));
  console.log(`${items.length} haber yazıldı.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
