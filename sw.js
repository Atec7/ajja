const CACHE_NAME = 'ajja-v4';

// Import Firebase scripts for push messaging
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js');

// Initialize Firebase in SW
const FB_CFG = {
  apiKey: "AIzaSyDFQCMsX04fwh7MVyEpvXnXD0U4TD5Or5w",
  authDomain: "ja-barbearia.firebaseapp.com",
  databaseURL: "https://ja-barbearia-default-rtdb.firebaseio.com",
  projectId: "ja-barbearia",
  storageBucket: "ja-barbearia.firebasestorage.app",
  messagingSenderId: "213237027963",
  appId: "1:213237027963:web:7d585b158ee06d3ab7fede"
};

try {
  firebase.initializeApp(FB_CFG);
  const messaging = firebase.messaging();

  // Handle background push messages (app closed / not focused)
  messaging.onBackgroundMessage(payload => {
    const { title, body, icon, tag } = payload.notification || {};
    const data = payload.data || {};

    self.registration.showNotification(title || '💌 AJJA', {
      body: body || 'Nova mensagem de amor ❤️',
      icon: icon || './ajja.png',
      badge: './ajja.png',
      tag: tag || 'ajja-msg',
      renotify: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || './' }
    });
  });
} catch(e) {
  console.warn('FCM SW init failed:', e.message);
}

self.addEventListener('install', e => {
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
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Open app when notification is clicked
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('index.html') || c.url.endsWith('/'));
      if (existing) {
        existing.focus();
        existing.postMessage({ type: 'NOTIF_CLICK' });
      } else {
        clients.openWindow(url);
      }
    })
  );
});

// Handle badge count messages from the page
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SET_BADGE') {
    const count = e.data.count || 0;
    if ('setAppBadge' in self.registration) {
      if (count > 0) {
        self.registration.setAppBadge(count).catch(() => {});
      } else {
        self.registration.clearAppBadge().catch(() => {});
      }
    }
  }
});
