import { relativeTime, filterItems } from './lib.js';

const SAVED_KEY = 'haber:kaydedilenler';

const state = {
  items: [],
  sources: [],
  source: 'all',
  query: '',
  tab: 'all',
  saved: loadSaved(),
};

const $ = (sel) => document.querySelector(sel);

function loadSaved() {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY)) || {};
  } catch {
    return {};
  }
}

function persistSaved() {
  try {
    localStorage.setItem(SAVED_KEY, JSON.stringify(state.saved));
  } catch {
    // Depolama kapalıysa kaydetme yalnızca bu oturumda geçerli olur.
  }
}

async function loadNews() {
  const btn = $('#refresh');
  btn.classList.add('spinning');
  try {
    const res = await fetch(`data/news.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    state.items = data.items;
    state.sources = data.sources.filter((s) => s.ok);
    state.updatedAt = data.updatedAt;
    renderSources();
    render();
  } catch {
    $('#status').textContent = 'Haberler yüklenemedi. İnternet bağlantını kontrol edip yenile.';
  } finally {
    btn.classList.remove('spinning');
  }
}

function renderSources() {
  const nav = $('#sources');
  nav.replaceChildren(
    ...[{ id: 'all', name: 'Tümü' }, ...state.sources].map((s) => {
      const b = document.createElement('button');
      b.className = `chip${state.source === s.id ? ' active' : ''}`;
      b.textContent = s.name;
      b.onclick = () => {
        state.source = s.id;
        renderSources();
        render();
      };
      return b;
    }),
  );
}

function card(item) {
  const li = document.createElement('li');
  li.className = 'card';

  const a = document.createElement('a');
  a.href = item.link;
  a.target = '_blank';
  a.rel = 'noopener';

  const h2 = document.createElement('h2');
  h2.textContent = item.title;
  const p = document.createElement('p');
  p.textContent = item.summary;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = [item.sourceName, relativeTime(item.publishedAt)].filter(Boolean).join(' · ');
  a.append(h2, p, meta);

  if (item.image) {
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => img.remove();
    li.append(img);
  }

  const save = document.createElement('button');
  save.className = 'save';
  const isSaved = Boolean(state.saved[item.link]);
  save.setAttribute('aria-pressed', String(isSaved));
  save.setAttribute('aria-label', isSaved ? 'Kaydı kaldır' : 'Kaydet');
  save.textContent = isSaved ? '★' : '☆';
  save.onclick = () => {
    if (state.saved[item.link]) delete state.saved[item.link];
    else state.saved[item.link] = item;
    persistSaved();
    render();
  };

  li.append(a, save);
  return li;
}

function render() {
  const pool = state.tab === 'saved' ? Object.values(state.saved) : state.items;
  const items = filterItems(pool, { source: state.source, query: state.query });
  $('#list').replaceChildren(...items.map(card));

  const status = $('#status');
  if (items.length === 0) {
    status.textContent = state.tab === 'saved' ? 'Henüz kaydettiğin haber yok.' : 'Gösterilecek haber yok.';
  } else {
    status.textContent = state.updatedAt && state.tab === 'all' ? `Son güncelleme: ${relativeTime(state.updatedAt)}` : '';
  }
}

$('#refresh').onclick = loadNews;
$('#search').oninput = (e) => {
  state.query = e.target.value;
  render();
};
document.querySelectorAll('.tab').forEach((tab) => {
  tab.onclick = () => {
    state.tab = tab.dataset.tab;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t === tab));
    render();
  };
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

loadNews();
