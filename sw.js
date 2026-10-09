// Trainingslog: Offline-Cache. Online immer die neueste Version, ohne Netz die gespeicherte.
const C = 'tl-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(c => Promise.all(
    ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'].map(u => c.add(u).catch(() => {}))
  )));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const net = fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); }
    return res;
  });
  const timeout = new Promise((_, rej) => setTimeout(rej, 3000));
  e.respondWith(Promise.race([net, timeout]).catch(() => caches.match(r).then(m => m || caches.match('./'))));
});
