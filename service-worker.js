const CACHE_NAME = 'ajja-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/ajja.png',
    '/manifest.json',
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Great+Vibes&family=Poppins:wght@300;400;500;600&display=swap'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE_NAME && caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        if (res.ok) {
            constclone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
    })));
});