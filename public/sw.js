const assets = [
    "/",
    "https://code.jquery.com/jquery-3.6.3.min.js",
    "https://kit.fontawesome.com/1e8824e8c2.js",
    "index.html",
    "home.html",
    "js/home.js",
    "css/css/index.css",
    "css/css/style.css",
    "css/animate.min.css",
    "logo.png",
    "Spinner-1s-200px.svg"
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
