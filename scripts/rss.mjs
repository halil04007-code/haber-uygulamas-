// Bağımlılıksız, basit RSS 2.0 / Atom ayrıştırıcı.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

function unwrapCdata(text) {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

export function stripHtml(html) {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function tag(block, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i');
  const m = block.match(re);
  return m ? unwrapCdata(m[1]).trim() : '';
}

function attr(block, tagName, attrName) {
  const re = new RegExp(`<${tagName}\\b[^>]*\\b${attrName}=["']([^"']+)["']`, 'i');
  const m = block.match(re);
  return m ? decodeEntities(m[1]) : '';
}

function findImage(block, descriptionHtml) {
  return (
    attr(block, 'media:content', 'url') ||
    attr(block, 'media:thumbnail', 'url') ||
    attr(block, 'enclosure', 'url') ||
    attr(descriptionHtml, 'img', 'src') ||
    ''
  );
}

function toIso(dateText) {
  const d = new Date(dateText);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function parseFeed(xml) {
  const isAtom = /<feed[\s>]/i.test(xml) && !/<rss[\s>]/i.test(xml);
  const itemTag = isAtom ? 'entry' : 'item';
  const blocks = xml.match(new RegExp(`<${itemTag}[\\s>][\\s\\S]*?</${itemTag}>`, 'gi')) || [];

  return blocks
    .map((block) => {
      const descriptionHtml = tag(block, 'description') || tag(block, 'summary') || tag(block, 'content');
      const link = isAtom ? attr(block, 'link', 'href') : stripHtml(tag(block, 'link'));
      return {
        title: stripHtml(tag(block, 'title')),
        link: link.trim(),
        summary: stripHtml(decodeEntities(descriptionHtml)).slice(0, 300),
        image: findImage(block, decodeEntities(descriptionHtml)),
        publishedAt: toIso(tag(block, 'pubDate') || tag(block, 'published') || tag(block, 'updated') || tag(block, 'dc:date')),
      };
    })
    .filter((item) => item.title && item.link);
}
