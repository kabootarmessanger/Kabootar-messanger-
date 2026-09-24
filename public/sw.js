// Kabootar service worker: offline app-shell caching + push notifications.
//
// Bump CACHE_NAME whenever CORE_ASSETS changes so old caches get cleared
// out by the "activate" handler below.
const CACHE_NAME = "kabootar-v1";

// self.registration.scope is the sw's own URL up to and including the
// basePath (e.g. "https://host/" or "https://host/Kabootar-messanger-/"),
// so these stay correct whether or not the app is deployed under a
// sub-path — no hardcoded prefix needed.
const CORE_ASSETS = [
  "./",
  "./manifest.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Cache best-effort: a single missing/blocked asset shouldn't stop
      // the rest of the app shell from being cached.
      Promise.allSettled(CORE_ASSETS.map((url) => cache.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first with cache fallback: always try to get the freshest copy,
// but keep the app usable offline (or on a flaky connection) by serving
// the last cached response, updating the cache as we go.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Don't try to cache/intercept cross-origin requests (Firebase, Google
  // fonts, etc) — let the browser handle those normally.
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./")))
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Kabootar", body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Kabootar";
  const iconUrl = new URL("./icon.svg", self.registration.scope).href;
  const options = {
    body: data.body || "",
    icon: iconUrl,
    badge: iconUrl,
    tag: "kabootar-message"
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(self.registration.scope);
    })
  );
});
