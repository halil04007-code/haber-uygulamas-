// Arayüzden bağımsız yardımcılar; tests/ altında test edilir.

export function relativeTime(iso, now = Date.now()) {
  if (!iso) return '';
  const diff = Math.round((now - new Date(iso).getTime()) / 1000);
  if (Number.isNaN(diff)) return '';
  if (diff < 60) return 'az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  return `${Math.floor(diff / 86400)} gün önce`;
}

export function normalize(text) {
  return text.toLocaleLowerCase('tr-TR');
}

export function filterItems(items, { source = 'all', query = '' } = {}) {
  const q = normalize(query.trim());
  return items.filter(
    (item) =>
      (source === 'all' || item.source === source) &&
      (!q || normalize(`${item.title} ${item.summary}`).includes(q)),
  );
}
