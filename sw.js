// Esencia: guarda la app para que abra rápido. Siempre intenta la versión nueva primero.
const CACHE = "esencia-v1";
const BASE = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // Supabase y CDN van directos
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request.mode === "navigate" ? "./index.html" : e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request.mode === "navigate" ? "./index.html" : e.request)));
});
