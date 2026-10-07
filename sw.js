// Stratégie NETWORK-FIRST : en ligne on sert toujours la dernière version,
// le cache ne sert que de repli hors-ligne. Plus besoin de bump manuel pour
// propager une MAJ (le bump reste utile pour purger les vieux caches).
const CACHE_NAME = 'undercover-v3';
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

// Installation : pré-cache + activation immédiate (sans attendre la fermeture
// de tous les onglets, sinon un onglet mobile resté ouvert bloque la MAJ)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activation : purge des anciens caches + prise de contrôle des pages ouvertes
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Requêtes : réseau d'abord (même origine, GET), cache en repli hors-ligne.
// Les appels externes (Worker IA) ne passent pas par le SW.
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
