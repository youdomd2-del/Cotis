// CotisApp Service Worker v1.0
var CACHE = "cotisapp-v1";
var ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap",
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"
];

// Install — cache les ressources essentielles
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(["/", "/index.html", "/manifest.json"]);
    })
  );
  self.skipWaiting();
});

// Activate — supprime les vieux caches
self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — réseau d'abord, cache en fallback
self.addEventListener("fetch", function(e) {
  // Ne pas intercepter Firebase (temps réel requis)
  if (e.request.url.includes("firebaseio.com") ||
      e.request.url.includes("firebase") ||
      e.request.url.includes("googleapis.com/identitytoolkit")) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // Mettre en cache la réponse fraîche
        if (response && response.status === 200 && response.type === "basic") {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        // Hors ligne — servir depuis le cache
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match("/index.html");
        });
      })
  );
});
