const version = 'v1.1::';

const assets = [
    "/",
    "/index.html",
    "/css/style.css",
    "/js/app.js"
]

self.addEventListener('install', function(event) {

    console.log('WORKER: install event in progress.');

    event.waitUntil(
        caches.open(version + 'coffee-dev').then(function (cache) {
            return cache.addAll(assets)
        }).then(function () {
            console.log('WORKER: install event completed')
        })
    )
})

self.addEventListener('fetch', fetchEvent => {
    console.log('WORKER: fetch event in progress.');

    if (fetchEvent.request.method !== 'GET') {
        console.log('WORKER: fetch event ignored.', fetchEvent.request.method, fetchEvent.request.url);
        return;
    }

    fetchEvent.respondWith(

        caches.match(fetchEvent.request).then(function (cached) {

            return cached || fetch(fetchEvent.request).then((response) => {
                const cacheCopy = response.clone();
                return caches.open(version + 'coffee-dev').then((cache) => {
                    cache.put(fetchEvent.request, cacheCopy)
                    return response
                })
            })

            function handleFailureResponse () {

                console.log('WORKER: fetch request failed in both cache and network.');

                return new Response('<h1>Service Unavailable</h1>', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/html'
                    })
                });
            }

        })
    )
})

// const staticDevCoffee = "dev-coffee-site-v1";
// const assets = [
//     "/",
//     "/index.html",
//     "/css/style.css",
//     "/js/app.js"
// ];
//
// self.addEventListener("install", installEvent => {
//     installEvent.waitUntil(
//         caches.open(staticDevCoffee).then(cache => {
//             cache.addAll(assets);
//         })
//     );
// });
//
// self.addEventListener("fetch", fetchEvent => {
//     fetchEvent.respondWith(
//         caches.match(fetchEvent.request).then(res => {
//             return res || fetch(fetchEvent.request).then((response) => {
//                 return caches.open(staticDevCoffee).then((cache) => {
//                     cache.put(fetchEvent.request, response.clone());
//                     return response;
//                 })
//             });
//
//         })
//     )
// })