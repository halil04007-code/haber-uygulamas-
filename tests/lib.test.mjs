import { test } from 'node:test';
import assert from 'node:assert/strict';
import { relativeTime, filterItems } from '../public/lib.js';

test('göreli zamanı Türkçe yazar', () => {
  const now = Date.parse('2026-10-12T12:00:00Z');
  assert.equal(relativeTime('2026-10-12T11:59:30Z', now), 'az önce');
  assert.equal(relativeTime('2026-10-12T11:45:00Z', now), '15 dk önce');
  assert.equal(relativeTime('2026-10-12T09:00:00Z', now), '3 sa önce');
  assert.equal(relativeTime('2026-10-10T12:00:00Z', now), '2 gün önce');
  assert.equal(relativeTime(null, now), '');
});

test('kaynağa ve Türkçe büyük/küçük harfe duyarsız aramaya göre süzer', () => {
  const items = [
    { source: 'trt', title: 'İSTANBUL trafiği', summary: '' },
    { source: 'bbc', title: 'Ankara', summary: 'ılık hava' },
  ];
  assert.equal(filterItems(items, { query: 'istanbul' }).length, 1);
  assert.equal(filterItems(items, { query: 'ILIK' }).length, 1);
  assert.equal(filterItems(items, { source: 'bbc' })[0].title, 'Ankara');
  assert.equal(filterItems(items).length, 2);
});
