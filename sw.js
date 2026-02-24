const CACHE = 'timecapsule-v2';
const ASSETS = ['./', './index.html', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

// 通知をタップしたらアプリを開く
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const id = e.notification.data?.id;
  const url = self.registration.scope + (id ? `?open=${id}` : '');
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          client.postMessage({ type: 'open-capsule', id });
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
