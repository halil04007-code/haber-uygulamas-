# Haberler

Telefonda kullanılan, ana ekrana eklenebilen haber uygulaması (PWA). Türkiye'nin önde gelen kaynaklarından haberleri tek listede toplar; kaynağa göre süzme, arama ve haber kaydetme destekler, internet yokken son indirilen haberleri gösterir.

## Telefona yükleme

Uygulamanın adresini telefonda aç:

**https://halil04007-code.github.io/haber-uygulamas-/**

- **iPhone (Safari):** Paylaş düğmesi → *Ana Ekrana Ekle*.
- **Android (Chrome):** Sağ üstteki ⋮ menüsü → *Ana ekrana ekle* veya *Uygulamayı yükle*.

## Nasıl çalışır

- `scripts/fetch-news.mjs` kaynakları (`scripts/feeds.mjs`) indirir ve `public/data/news.json` üretir.
- GitHub Actions (`.github/workflows/deploy.yml`) bunu her 30 dakikada bir ve `main`'e her birleştirmede çalıştırıp `public/` klasörünü GitHub Pages'e yayınlar.
- Arayüz `public/` altında, derleme adımı olmayan düz HTML/CSS/JS'tir.

## Geliştirme

```sh
npm test            # testler
npm run fetch-news  # haberleri indir (internet gerekir)
npm run serve       # http://localhost:8080
```

Bu depo bir ajan ekibi tarafından geliştirilir; çalışma kuralları `CLAUDE.md` dosyasındadır.
