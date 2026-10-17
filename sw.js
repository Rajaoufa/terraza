// Esencia: guarda la app para que abra rápido. Siempre intenta la versión nueva primero.
const CACHE = "esencia-v3";
const BASE = ["./", "./camareros/", "./manifest.webmanifest", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(()=>{})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
// las páginas se guardan sin la parte ?mesa=..., así abren aunque no haya conexión
const clave = req => { if (req.mode !== "navigate") return req; const u = new URL(req.url); return u.origin + u.pathname; };
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;   // Supabase y CDN van directos
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(clave(e.request), copia)); }
    return r;
  }).catch(() => caches.match(clave(e.request))));
});

// Avisos con el móvil bloqueado: llegan aunque la app esté cerrada
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch { d = { titulo: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.titulo || "Esencia", {
    body: d.cuerpo || "", tag: d.tag || "esencia", renotify: true, requireInteraction: true,
    icon: "icons/icon-192.png", badge: "icons/icon-192.png", vibrate: [200, 100, 200, 100, 200], data: { url: "./camareros/" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    const panel = cs.find(c => c.url.includes("camareros") || c.url.includes("panel"));
    return panel ? panel.focus() : self.clients.openWindow(e.notification.data?.url || "./camareros/");
  }));
});
