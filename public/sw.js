// Grace AI Service Worker
// Provides offline support and caching for better PWA experience

const CACHE_NAME = 'grace-ai-v3-' + Date.now(); // Dynamic versioning to force cache refresh
const urlsToCache = [
  '/',
  '/chat/',
  '/static/icon-192x192.png',
  '/static/icon-512x512.png',
  '/static/apple-touch-icon.png',
  '/static/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Grace AI cache opened:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Grace AI resources cached');
        // Force immediate activation
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches aggressively
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      console.log('[SW] Found caches:', cacheNames);
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Grace AI Service Worker activated - all old caches cleared');
      // Force immediate control of all clients
      return self.clients.claim();
    }).then(() => {
      // Notify all clients about cache refresh
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_REFRESHED',
            message: 'Service worker updated - cache refreshed'
          });
        });
      });
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only cache GET requests for static assets
  if (event.request.method !== 'GET') {
    console.log('[SW] Skipping non-GET request:', event.request.url);
    return;
  }

  // NEVER cache API calls - always go to network
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/webhook/') ||
      event.request.url.includes('/admin/') ||
      event.request.url.includes('/grace/') ||
      event.request.url.includes('/chat/') ||
      event.request.url.includes('/shopify/')) {
    console.log('[SW] Bypassing cache for API call:', event.request.url);
    // Force fresh network request with no-cache
    const freshRequest = new Request(event.request.url, {
      method: event.request.method,
      headers: new Headers({
        ...Object.fromEntries(event.request.headers.entries()),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }),
      body: event.request.body,
      mode: event.request.mode,
      credentials: event.request.credentials
    });
    
    event.respondWith(fetch(freshRequest));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // For static assets, use cache first but add timestamp for debugging
        if (response) {
          console.log('[SW] Serving from cache:', event.request.url);
          return response;
        }
        
        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request).catch(() => {
          // If both cache and network fail, return offline page
          if (event.request.destination === 'document') {
            return new Response(
              `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Grace AI - Offline</title>
                <style>
                  body {
                    font-family: system-ui, sans-serif;
                    text-align: center;
                    padding: 50px 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    min-height: 80vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                  }
                  .offline-icon { font-size: 64px; margin-bottom: 20px; }
                  h1 { margin: 0 0 10px 0; }
                  p { opacity: 0.9; margin: 10px 0; }
                  .retry-btn {
                    background: white;
                    color: #667eea;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-top: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="offline-icon">📱</div>
                <h1>Grace AI</h1>
                <p>You're currently offline</p>
                <p>Please check your internet connection and try again</p>
                <button class="retry-btn" onclick="window.location.reload()">Retry</button>
              </body>
              </html>
              `,
              {
                headers: { 'Content-Type': 'text/html' }
              }
            );
          }
        });
      })
  );
});