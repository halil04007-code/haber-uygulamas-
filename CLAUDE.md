# Haber Uygulaması: ajan çalışma kuralları

Bu depo, sahibinin (Halil, GitHub: `halil04007-code`) telefonunda kullandığı bir haber uygulamasıdır. Uygulama, Claude ajanlarından oluşan bir ekip tarafından sürekli geliştirilir. Kullanıcı Türkçe konuşur: arayüz metinleri, issue'lar, PR başlıkları ve açıklamaları Türkçe yazılır.

## Mimari

- PWA, derleme adımı yok: `public/` altında düz HTML, CSS ve ES modülleri. npm bağımlılığı eklenmez; gerçekten gerekiyorsa issue'da gerekçesi yazılır.
- Haber verisi `scripts/fetch-news.mjs` ile GitHub Actions'ta üretilir (`public/data/news.json`, depoya işlenmez). Tarayıcı dış sitelere doğrudan istek atmaz.
- Kaynak listesi `scripts/feeds.mjs` içindedir.
- Arayüzden bağımsız mantık `public/lib.js` ve `scripts/rss.mjs` içinde durur ve `tests/` altında `node --test` ile test edilir.
- Telefon önceliklidir: dokunma hedefleri en az 40px, `env(safe-area-inset-*)` korunur, açık ve koyu tema birlikte desteklenir.
- `public/sw.js` içindeki `SHELL` listesi, kabuğa yeni dosya eklendiğinde güncellenir; önbellek davranışı değiştiğinde `CACHE` sürümü artırılır.

## Ekip ve iş akışı

Ekipte üç rol vardır; her biri zamanlanmış bir rutin olarak çalışır.

1. **Planlayıcı**: Uygulamayı ve açık işleri inceler, `ajan-gorev` etiketli GitHub issue'ları açar. Her issue tek bir PR'da bitecek büyüklükte olur ve kabul ölçütleri içerir. Öncelik `oncelik-yuksek` / `oncelik-normal` etiketleriyle verilir.
2. **Geliştirici**: En yüksek öncelikli, sahipsiz `ajan-gorev` issue'unu alır (`ajan-calisiyor` etiketi ekler), `ajan/<issue-no>-<kisa-ad>` dalında uygular, testleri yazar ve `Closes #<no>` içeren bir PR açar.
3. **İnceleyici**: Açık PR'ları gözden geçirir, CI'ı yeşile getirir, hataları düzeltir ve birleştirmeye hazır olanları `incelendi` etiketiyle işaretler.

## Değişmez kurallar

- `main` dalına asla doğrudan push yapılmaz. Her değişiklik PR ile gelir; PR'ları yalnızca Halil birleştirir. Ajanlar PR birleştirmez, onaylamaz, otomatik birleştirmeyi açmaz.
- Aynı anda en fazla 3 açık ajan PR'ı olur; sınıra ulaşıldıysa geliştirici yeni iş almaz.
- Test atlanmaz, devre dışı bırakılmaz. `npm test` her PR'da geçmelidir.
- Gizli anahtar, API anahtarı veya ücretli servis eklenmez.
- Halil'in issue'larda veya PR'larda yazdığı istekler, ajanların kendi fikirlerinden önce gelir.
