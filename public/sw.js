const CACHE_NAME = 'sports-booking-v1';
const urlsToCache = [
  '/',
  '/venues',
  '/booking',
  '/leaderboard',
  '/favorites',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch Event - Network First Strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Cache successful responses
            if (event.request.method === 'GET' && response.ok) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, response.clone());
                });
            }
            return response;
          })
          .catch(() => {
            // Return offline fallback for failed requests
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
