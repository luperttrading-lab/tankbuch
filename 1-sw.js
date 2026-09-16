// Tankbuch – Service Worker: eigene Dateien Netz zuerst, fremde (Schriften) Cache zuerst.
const CACHE = 'tankbuch-v4';
const ASSETS = ['./', './index.html', './2-manifest.webmanifest', './3-icon.png', './4-icon-180.png',
  './5-hintergrund.jpg', './6-karte-verbrauch.jpg', './7-karte-graphit.jpg', './8-knopf.jpg',
  './9-zapfsaeule.png', './10-kalender.png', './11-euro.png', './12-strasse.png', './13-tropfen.png', './14-historie.png', './15-zahnrad.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const eigen = new URL(req.url).origin === self.location.origin;
  if (eigen) {
    e.respondWith(
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
  } else {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
