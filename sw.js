const CACHE_NAME = 'ajja-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://via.placeholder.com/512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  // For navigation requests (HTML pages) — network first, fallback to cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // For assets — cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached);
    })
  );
});

self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  const title = data.title || 'AJJA ❤️';
  const options = {
    body: data.body || 'Você tem uma nova mensagem!',
    icon: 'https://via.placeholder.com/512.png',
    badge: 'https://via.placeholder.com/512.png',
    data: { url: data.url || './index.html' }
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});
