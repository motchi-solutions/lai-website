const CACHE = "lai-shell-v4";
const SHELL = [
    "/",
    "/manifest.webmanifest",
    "/favicon.ico",
    "/web-app-manifest-192x192.png",
    "/web-app-manifest-512x512.png",
];
self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
    self.skipWaiting();
});
self.addEventListener("activate", (event) =>
    event.waitUntil(
        Promise.all([
            caches
                .keys()
                .then((keys) =>
                    Promise.all(
                        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
                    ),
                ),
            self.clients.claim(),
        ]),
    ),
);
self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    if (
        event.request.method !== "GET" ||
        url.origin !== self.location.origin ||
        url.pathname.startsWith("/api/")
    )
        return;

    if (event.request.mode === "navigate") {
        event.respondWith(fetch(event.request).catch(() => caches.match("/")));
        return;
    }

    if (["font", "image", "script", "style"].includes(event.request.destination)) {
        event.respondWith(
            caches.match(event.request).then(
                (cached) =>
                    cached ||
                    fetch(event.request).then((response) => {
                        if (response.ok && response.type === "basic") {
                            event.waitUntil(
                                caches
                                    .open(CACHE)
                                    .then((cache) => cache.put(event.request, response.clone())),
                            );
                        }
                        return response;
                    }),
            ),
        );
    }
});
