const CACHE_NAME = 'punto-ferretero-v1'

const urlsToCache = [
  '/',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.all(
          urlsToCache.map((url) =>
            fetch(url).then((response) => {
              if (!response.ok) throw new Error('Bad response')
              return cache.put(url, response)
            }).catch(() => {
              console.warn('No se pudo cachear:', url)
            })
          )
        )
      })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request)
    })
  )
})