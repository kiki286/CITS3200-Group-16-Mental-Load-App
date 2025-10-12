// A minimal root-scoped service worker so the site is "controlled" for PWA installability.
// Keep it independent of firebase messaging SW which should remain at /firebase-messaging-sw.js
self.addEventListener('install', (event) => {
  // activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Optional: simple fetch handler to make the SW useful; remove if you don't want caching here.
self.addEventListener('fetch', (event) => {
  // simple network-first passthrough; you can extend caching later
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});