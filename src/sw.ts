export {};

interface PrecacheEntry {
  url: string;
  revision?: string | null;
}

interface SWInstallEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface SWFetchEvent extends Event {
  request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface SWGlobalScope {
  __WB_MANIFEST: Array<PrecacheEntry | string>;
  location: Location;
  clients: {
    claim(): Promise<void>;
  };
  skipWaiting(): Promise<void>;
  addEventListener(type: 'install' | 'activate', listener: (event: SWInstallEvent) => void): void;
  addEventListener(type: 'fetch', listener: (event: SWFetchEvent) => void): void;
}

declare const self: SWGlobalScope;

const CACHE_NAME = 'board-hub-offline-v1';
const PRECACHE_ENTRIES = self.__WB_MANIFEST || [];

self.addEventListener('install', (event) => {
  const urlsToCache = Array.from(
    new Set([
      '/',
      '/index.html',
      '/manifest.json',
      '/icon.svg',
      '/pwa-192x192.png',
      '/pwa-512x512.png',
      '/pwa-maskable-512x512.png',
      '/apple-touch-icon.png',
      ...PRECACHE_ENTRIES.map((entry) => (typeof entry === 'string' ? entry : entry.url)),
    ])
  );

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(
          urlsToCache.map((url) =>
            cache.add(new Request(url, { cache: 'reload' })).catch(() => undefined)
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Never intercept or cache requests containing ?t= so the online check is always accurate
  if (event.request.url.includes('?t=')) {
    return;
  }

  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.protocol !== 'http:' && requestUrl.protocol !== 'https:') {
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached =
            (await caches.match(event.request)) ||
            (await caches.match('/index.html')) ||
            (await caches.match('/'));
          return cached || Response.error();
        })
    );
    return;
  }

  const isSameOrigin = requestUrl.origin === self.location.origin;
  const isGoogleFont =
    requestUrl.origin === 'https://fonts.googleapis.com' ||
    requestUrl.origin === 'https://fonts.gstatic.com';

  if (!isSameOrigin && !isGoogleFont) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
          const copy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return networkResponse;
      });
    })
  );
});
