import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseFeed, decodeEntities } from '../scripts/rss.mjs';
import { mergeItems } from '../scripts/fetch-news.mjs';

const fixture = (name) => readFile(new URL(`fixtures/${name}`, import.meta.url), 'utf8');

test('RSS öğelerini ayrıştırır, başlıksızları atlar', async () => {
  const items = parseFeed(await fixture('rss.xml'));
  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'İstanbul\'da "yağmur" uyarısı');
  assert.equal(items[0].link, 'https://ornek.com/haber/1');
  assert.equal(items[0].summary, 'Meteoroloji sağanak uyardı.');
  assert.equal(items[0].image, 'https://ornek.com/1.jpg');
  assert.equal(items[0].publishedAt, '2026-10-12T07:00:00.000Z');
  assert.equal(items[1].summary, 'Piyasalar güne yükselişle başladı & dolar düştü.');
  assert.equal(items[1].image, 'https://ornek.com/2.jpg');
});

test('Atom girdilerini ayrıştırır', async () => {
  const [item] = parseFeed(await fixture('atom.xml'));
  assert.equal(item.title, 'Atom haberi');
  assert.equal(item.link, 'https://ornek.com/atom/1');
  assert.equal(item.publishedAt, '2026-10-12T08:00:00.000Z');
});

test('HTML varlıklarını çözer', () => {
  assert.equal(decodeEntities('&#305;&#x15F; &amp; &uuml;'), 'ış & &uuml;');
});

test('aynı bağlantıyı bir kez tutar ve yeniden eskiye sıralar', () => {
  const merged = mergeItems([
    [{ link: 'a', publishedAt: '2026-01-01T00:00:00Z' }],
    [{ link: 'b', publishedAt: '2026-02-01T00:00:00Z' }, { link: 'a', publishedAt: '2026-03-01T00:00:00Z' }],
  ]);
  assert.deepEqual(merged.map((i) => i.link), ['b', 'a']);
});
