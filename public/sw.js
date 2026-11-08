// Beto Studio — Service Worker
// Bump CACHE_VERSION whenever you change index.html, CSS, JS, or swap out .glb files
// so returning visitors pick up the new version instead of a stale cached copy.
const CACHE_VERSION = "beto-studio-v1";
const RUNTIME_CACHE = "beto-studio-runtime-v1";

// Core files that are safe to cache immediately on install.
// Keep this list small — big binary assets (.glb) are cached on first use instead,
// so the install step stays fast.
const PRECACHE_URLS = [
  "./",
  "./index.html",
];

// Third-party static assets (fonts, three.js, GLTFLoader) — these rarely change
// per version, so cache-first is safe and saves a network round trip every visit.
const STATIC_ASSET_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdnjs.cloudflare.com",
  "cdn.jsdelivr.net",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {
      // Precaching is best-effort; don't block install if e.g. offline during install.
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isGlbRequest(url) {
  return url.pathname.toLowerCase().endsWith(".glb");
}

function isStaticAssetRequest(url) {
  return STATIC_ASSET_HOSTS.includes(url.hostname);
}

// Cache-first: use the cached copy if we have it, otherwise fetch, cache, and return it.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    // Opaque (cross-origin, no-cors) responses have status 0 but are still cacheable/usable.
    if (response && (response.ok || response.type === "opaque")) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

// Network-first: try the network so edits to the page are picked up right away,
// falling back to the cache when offline.
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // The HTML document itself: prefer fresh, fall back to cache offline.
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // 3D models and pinned third-party libraries/fonts: cache-first, they don't change often.
  if (isGlbRequest(url) || isStaticAssetRequest(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else (e.g. YouTube embeds, other cross-origin traffic): just let it through.
});
