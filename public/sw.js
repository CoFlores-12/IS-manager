const assets = [
    "/",
    "https://code.jquery.com/jquery-3.6.3.min.js",
    "https://kit.fontawesome.com/1e8824e8c2.js"
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
