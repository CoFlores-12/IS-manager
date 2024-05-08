const assets = [
    "/",
    "https://code.jquery.com/jquery-3.6.3.min.js",
    "https://kit.fontawesome.com/1e8824e8c2.js",
    "https://is-manager.vercel.app/index.html",
    "https://is-manager.vercel.app/home.html",
    "https://is-manager.vercel.app/js/home.js",
    "https://is-manager.vercel.app/css/index.css",
    "https://is-manager.vercel.app/css/style.css",
    "https://is-manager.vercel.app/css/animate.min.css",
    "https://is-manager.vercel.app/logo.png",
    "https://is-manager.vercel.app/Spinner-1s-200px.svg",
    "https://is-manager.vercel.app/organigrama/INGENIERIA EN SISTEMAS.svg"
];

self.addEventListener("install", installEvent => {
    installEvent.waitUntil(
        caches.open("ISmanager-caches").then(cache => {
            cache.addAll(assets);
        })
    )
});

self.addEventListener("fetch", fetchEvent => {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(cacheResponse => {
        if (cacheResponse) {
            fetch(fetchEvent.request).then((networkResponse) => {
              return caches.open("ISmanager-caches").then((cache) => {
                cache.put(fetchEvent.request, networkResponse.clone());
                return networkResponse;
              })
            });
            return cacheResponse;
          } else {
            return fetch(fetchEvent.request).then((networkResponse) => {
              return networkResponse
            });
          }
      })
    );
});
