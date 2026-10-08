const CACHE_NAME = "rupiq-v1";
const OFFLINE_FALLBACK = "/offline.html";

// Local development: dev asset URLs aren't content-hashed, so caching them pins stale
// CSS/JS. On localhost this worker wipes every cache, unregisters itself and reloads
// open tabs so they fetch fresh code from the dev server.
const IS_LOCAL_DEV = ["localhost", "127.0.0.1", "[::1]"].includes(self.location.hostname);

if (IS_LOCAL_DEV) {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      (async () => {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
        await self.registration.unregister();
        const clients = await self.clients.matchAll({ type: "window" });
        clients.forEach((client) => client.navigate(client.url));
      })()
    );
  });
}

const PRECACHE_ASSETS = [
  "/",
  "/dashboard",
  "/manifest.webmanifest",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon.svg",
  "/favicon.ico",
];

// 1. Install: Precache shell assets and offline page
self.addEventListener("install", (event) => {
  if (IS_LOCAL_DEV) return;
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 2. Activate: Clean up older cache versions
self.addEventListener("activate", (event) => {
  if (IS_LOCAL_DEV) return;
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// 3. Fetch: Smart strategy based on request type
self.addEventListener("fetch", (event) => {
  if (IS_LOCAL_DEV) return;
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin external API calls / auth routes
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/auth") ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Next.js Static Assets & Icons: Cache-first with background revalidation
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Navigation (HTML Pages): Network-first with cache fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const fallback = await caches.match("/dashboard");
          return fallback || caches.match("/");
        })
    );
    return;
  }

  // Default: Network with Cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Listen for message to skip waiting
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
