const CACHE_NAME = 'punto-ferretero-v1';
const OFFLINE_URL = '/offline';

const ASSETS_TO_CACHE = [
  OFFLINE_URL,
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Solo interceptamos navegaciones de páginas (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse || Response.error(); 
      })
    );
  }
  // Para todo lo demás (APIs de Firebase, imágenes, etc), 
  // no hacemos nada y dejamos que pase a la red normalmente.
});
