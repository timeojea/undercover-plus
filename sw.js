// IMPORTANT : incrémenter cette version à CHAQUE déploiement, sinon les
// utilisateurs gardent l'ancienne version en cache (stratégie cache-first).
const CACHE_NAME = 'undercover-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data.js',
  './manifest.json',
  './app_logo.png', // Pour le favicon et l'icône PWA
  './image_2.png'   // Pour l'interface du jeu
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des fichiers');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});

// Interception des requêtes (Mode Hors-Ligne)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});