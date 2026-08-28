/**
 * LILEVY GAMES - SERVICE WORKER (PWA)
 * Mendukung caching lokal, performa instan, dan operasi offline.
 */

const CACHE_NAME = 'lilevy-games-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/data/puzzles.js',
  './js/data/monopoly-data.js',
  './js/engine/audio.js',
  './js/engine/auth.js',
  './js/engine/ranking.js',
  './js/engine/tts-engine.js',
  './js/engine/custom-builder.js',
  './js/engine/i18n.js',
  './js/engine/achievements.js',
  './js/engine/narrator.js',
  './js/monopoly/monopoly-engine.js',
  './js/monopoly/monopoly-ui.js',
  './js/monopoly/monopoly-auction.js',
  './js/monopoly/monopoly-bank.js',
  './js/monopoly/monopoly-blackmarket.js',
  './js/monopoly/monopoly-bounty.js',
  './js/monopoly/monopoly-casino.js',
  './js/monopoly/monopoly-chat.js',
  './js/monopoly/monopoly-disaster.js',
  './js/monopoly/monopoly-economy.js',
  './js/monopoly/monopoly-heatmap.js',
  './js/monopoly/monopoly-skills.js',
  './js/monopoly/monopoly-stocks.js',
  './js/monopoly/monopoly-trade.js',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('PWA Cache pre-fetch partial warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Hanya tangani request GET http/https
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Network-first strategy: Ambil update terbaru dari server terlebih dahulu
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return caches.match('./index.html');
        });
      })
  );
});

