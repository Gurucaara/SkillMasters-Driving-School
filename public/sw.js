// Service worker: makes the site work on bad connections and shows an offline page with the
// phone number when there's no connection at all. Registered in BaseLayout (production only).
//
// Strategies:
// - Pages (navigations): network first, so visitors always get fresh prices and content when
//   online. Offline, fall back to the copy saved on their last visit, then to /offline.html.
// - /_astro/* (CSS, JS, optimised images): cache first. Their file names change whenever the
//   content does, so a cached copy is never stale.
// - Other same-origin GETs (icons, manifest, fonts): serve from cache, refresh in the background.
// - Never cached: /api/*, non-GET requests (forms, payments) and other sites (Stripe, WhatsApp…).
//
// To force every visitor onto a fresh cache, bump VERSION.
const VERSION = 'v1';
const PRECACHE = `sm-precache-${VERSION}`;
const PAGES = `sm-pages-${VERSION}`; // HTML pages, trimmed to MAX_PAGES
const RUNTIME = `sm-runtime-${VERSION}`; // CSS, JS, images, icons
const OFFLINE_URL = '/offline'; // Cloudflare serves offline.html here (no .html); caching a redirect would break it
const PRECACHE_URLS = [OFFLINE_URL, '/icons/icon-192.png', '/favicon.ico'];
const MAX_PAGES = 30; // saved pages kept for offline use

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  // Remove caches from older versions.
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => ![PRECACHE, PAGES, RUNTIME].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Keep only the most recently saved MAX_PAGES pages (cache keys are in insertion order).
async function trimPages(cache) {
  const keys = await cache.keys();
  for (const req of keys.slice(0, Math.max(0, keys.length - MAX_PAGES))) await cache.delete(req);
}

async function networkFirstPage(event) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(event.request);
    if (response.ok) {
      // Clone now, before the page starts reading the body; waitUntil keeps the worker alive
      // until the copy is saved. Delete first so the page moves to the end (newest).
      const copy = response.clone();
      event.waitUntil(cache.delete(event.request).then(() => cache.put(event.request, copy)).then(() => trimPages(cache)));
    }
    return response;
  } catch {
    return (await cache.match(event.request, { ignoreSearch: true })) || (await caches.match(OFFLINE_URL));
  }
}

async function cacheFirst(event) {
  const cached = await caches.match(event.request);
  if (cached) return cached;
  const response = await fetch(event.request);
  if (response.ok) {
    const copy = response.clone();
    event.waitUntil(caches.open(RUNTIME).then((c) => c.put(event.request, copy)));
  }
  return response;
}

async function staleWhileRevalidate(event) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(event.request);
  const refresh = fetch(event.request).then((response) => {
    if (response.ok) return cache.put(event.request, response.clone()).then(() => response);
    return response;
  });
  if (cached) {
    event.waitUntil(refresh.catch(() => {}));
    return cached;
  }
  return refresh;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(event));
  } else if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(cacheFirst(event));
  } else {
    event.respondWith(staleWhileRevalidate(event));
  }
});
