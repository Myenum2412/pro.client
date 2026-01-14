// Service Worker for Proultima PWA
// Version: 1.0.0

const CACHE_NAME = 'proultima-v1';
const RUNTIME_CACHE = 'proultima-runtime-v1';
const OFFLINE_PAGE = '/offline';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/dashboard',
  '/projects',
  '/submissions',
  '/billing',
  '/chat',
  '/manifest.webmanifest',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Failed to cache some assets:', err);
        // Continue even if some assets fail to cache
        return Promise.resolve();
      });
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Handle static assets with cache-first strategy
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/image/') ||
    url.pathname.match(/\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }

  // Handle HTML pages with network-first, fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Default: network-first strategy
  event.respondWith(networkFirstStrategy(request));
});

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Cache-first error:', error);
    // Return a fallback if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful API responses
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Return error response for API calls
    return new Response(
      JSON.stringify({ error: 'Network error and no cached data available' }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Network-first with offline fallback for HTML pages
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback to offline page
    const offlinePage = await caches.match(OFFLINE_PAGE);
    if (offlinePage) {
      return offlinePage;
    }
    // Last resort: return a basic offline message
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Offline - Proultima</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            h1 { color: #333; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

// Background sync for offline actions (optional enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implement background sync logic here
  console.log('[Service Worker] Background sync triggered');
}

// Push notifications (optional enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'Proultima';
    const options = {
      body: data.body || 'You have a new notification',
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      tag: data.tag || 'default',
      data: data.url || '/',
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
