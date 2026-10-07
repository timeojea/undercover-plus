// NETWORK-FIRST strategy: online, always serve the latest version;
// the cache is only an offline fallback. No manual bump needed to ship
// an update (bumping is still useful to purge old caches).
const CACHE_NAME = 'undercover-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.js',
  './manifest.json',
  './app_logo.png', // Favicon and PWA icon
  './image_2.png'   // In-game UI
];

// Install: pre-cache + activate immediately (without waiting for every tab
// to close, otherwise a mobile tab left open blocks the update)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activate: purge old caches + take control of open pages
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: network first (same origin, GET), cache as offline fallback.
// External calls (AI Worker) bypass the SW.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return response;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
