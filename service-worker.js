const CACHE = 'compta-plus-v6';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './firebase-config.js',
  './manifest.json',
  './icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Firebase — laisser passer
  if (url.hostname.includes('firebaseio.com') ||
      url.hostname.includes('firebaseapp.com') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebaseinstallations.googleapis.com')) {
    return;
  }

  // SDK Firebase gstatic : cache d'abord
  if (url.hostname === 'www.gstatic.com' && url.pathname.includes('/firebasejs/')) {
    e.respondWith(caches.match(e.request).then(c => c || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, clone));
      return res;
    })));
    return;
  }

  // Fichiers locaux : réseau d'abord
  if (url.origin === self.location.origin) {
    e.respondWith(fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request)));
    return;
  }

  // CDN tiers : cache d'abord
  e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));
});