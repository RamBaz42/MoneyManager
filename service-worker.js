// service-worker.js
const CACHE_NAME = 'expenseflow-cache-v1';
const urlsToCache = [
  './premium_expense_tracker.html', // Your main app file
  './manifest.json',
  './icons/icon-192x192.png', // Don't forget your icons
  './icons/icon-512x512.png',
  './icons/maskable_icon.png',
  // You can add other assets like specific fonts from Google Fonts if you want full offline capability
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMwMw.woff2', // Example Inter font file, check actual URL in network tab
  'https://cdn.jsdelivr.net/npm/chart.js' // Chart.js library
];

// Installation event: Cache all the necessary files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache:', error);
      })
  );
  self.skipWaiting(); // Forces the waiting service worker to become the active service worker
});

// Activation event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Allows the active service worker to take control of pages
  console.log('Service Worker: Activated');
});

// Fetch event: Serve cached assets first, then fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // No cache hit - fetch from network
        return fetch(event.request).catch(function() {
            // If network also fails, provide a fallback for offline
            if (event.request.mode === 'navigate') {
                // This is a navigation request (e.g., user tried to load a page offline)
                // You could serve a custom offline page here.
                // For this basic app, just let it fail silently or show browser's offline page.
            }
        });
      })
  );
});