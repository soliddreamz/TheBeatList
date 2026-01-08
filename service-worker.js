/* THEBEATLIST — Base Pilot 5 */
const CACHE_VERSION = "thebeatlist-v1";
const CACHE_NAME = `base-${CACHE_VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./content.json",
  "./manifest.json",
  "./sw.js",
  "./apple-touch-icon.png",
  "./icon-72.png",
  "./icon-96.png",
  "./icon-128.png",
  "./icon-144.png",
  "./icon-152.png",
  "./icon-167.png",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-256.png",
  "./icon-384.png",
  "./icon-512.png",
  "./logo.png",
  "./logo-wide.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Network-first for content.json so edits publish cleanly
  if (req.url.includes("content.json")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for everything else
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).catch(() => cached))
  );
});
