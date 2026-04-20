const CACHE_NAME = 'punto-ferretero-v1';

self.addEventListener('install', (event) => {
  console.log('SW instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('SW activo');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // solo cachea respuestas válidas
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        // fallback a cache
        return caches.match(event.request);
      })
  );
});