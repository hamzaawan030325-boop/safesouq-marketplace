const CACHE_NAME = "safesouq-static-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./seller.html",
  "./admin.html",
  "./auth.html",
  "./styles.css",
  "./app.js",
  "./manifest.json",
  "./README.md",
  "./architecture.md",
  "./api-spec.md"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
