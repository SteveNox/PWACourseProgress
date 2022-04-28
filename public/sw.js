//clean up 
//whenever content is changed, change the cache name variables below
var CACHE_STATIC_NAME = 'static-v30'
var CACHE_DYNAMIC_NAME = 'dynamic-v30'

self.addEventListener('install', function(event) {
    console.log('[SW]: Service worker installing...', event);
    //new:
    event.waitUntil( //won't finish until caching is complete
        //caches.open('static')
        caches.open(CACHE_STATIC_NAME)
            .then(function(cache) {
                console.log('[SW]: Precaching app shell...', event);
                // cache.add('/js/app.js');
                // cache.add('/index.html');
                // cache.add('/')
                // or even simpler:
                cache.addAll([
                    '/',
                    'index.html',
                    'offline.html',
                    '/js/app.js',
                    "/js/damagelog.js",
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'
                ]);
            })
    )
});

self.addEventListener('activate', function(event) {
    console.log('[SW]: Service worker activating, aber sowas von, jetzt aber echt...', event);
    event.waitUntil(
        caches.keys()
            .then(function(keyList) {
                return Promise.all(keyList.map(function(key) {
                    if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                        console.log('[SW]: Removing old cache.', key);
                        return caches.delete(key);
                    }
                })); //takes array of promises and waits until finished
            })
    );
    return self.clients.claim();
});

// self.addEventListener('fetch', function(event) {
//     console.log('[SW]: Service worker fetching...', event);
//     //new:
//     event.respondWith(
//         caches.match(event.request)
//             .then(function(response){
//                 if (response) {
//                     return response; //response comes from the cache
//                 } else {
//                     return fetch(event.request) //not cached, get from internet...
//                             .then(function(dynamicResponse) { //and place it into dynamic cache
//                             caches.open(CACHE_DYNAMIC_NAME)
//                                 .then(function(cache) {
//                                     cache.put(event.request.url, dynamicResponse.clone()) 
//                                     //does not send request, uses response (can be done only once), and is therefore cloned
//                                     //to respond back to the browser (clone is stored in cache, rest is shown)
//                                     return dynamicResponse;
//                                 })
//                         })
//                         .catch(function(error) { //do not throw exception when fetching fails
//                             //but provide offline page
//                             return caches.open(CACHE_STATIC_NAME)
//                                 .then(function(cache) {
//                                     return cache.match('/offline.html');
//                                 });
//                         });
//                 }
//             })
//     );
// });
//last evening -> cache with network fallback
// self.addEventListener('fetch', function(event) {
//     console.log('[SW]: Service worker fetching...', event);
//     //new:
//     event.respondWith(
//         caches.match(event.request)
//             .then(function(response){
//                 if (response) {
//                     return response; //response comes from the cache
//                 } else {
//                     return fetch(event.request) //not cached, get from internet...
//                             .then(function(dynamicResponse) { //and place it into dynamic cache
//                             caches.open(CACHE_DYNAMIC_NAME)
//                                 .then(function(cache) {
//                                     cache.put(event.request.url, dynamicResponse.clone()) 
//                                     //does not send request, uses response (can be done only once), and is therefore cloned
//                                     //to respond back to the browser (clone is stored in cache, rest is shown)
//                                     return dynamicResponse;
//                                 })
//                         })
//                         .catch(function(error) { //do not throw exception when fetching fails
//                         });
//                 }
//         })
//     );
// });

//network only
// self.addEventListener('fetch', function(event) {
//     console.log('[SW]: Service worker fetching...', event);
//     //new:
//     event.respondWith(
//         fetch(event.request) //not cached, get from internet...
//     );
// });

//cache only
// self.addEventListener('fetch', function(event) {
//     console.log('[SW]: Service worker fetching...', event);
//     event.respondWith(
//         caches.match(event.request)
//     );
// });

// //network with cache fallback
// self.addEventListener('fetch', function(event) {
//     console.log('[SW]: Service worker fetching...', event);
//     event.respondWith(
//         fetch(event.request)
//             .catch(function(err){
//                 return caches.match(event.request)
//             })
//     );
// });

//network with cache fallback + dynamic caching
// self.addEventListener('fetch', function(event) {
//     console.log('[SW]: Service worker fetching...', event);
//     event.respondWith(
//         fetch(event.request)
//             .then(function(res) {
//                 return caches.open(CACHE_DYNAMIC_NAME)
//                     .then(function(cache) {
//                         cache.put(event.request.url, res.clone());
//                         return res;
//                     })
//             })
//             .catch(function(err){
//                 return caches.match(event.request)
//             })
//     );
// });

//extension to cache then network in damagelog.js
self.addEventListener('fetch', function(event) {
    console.log('[SW]: Service worker fetching...', event);
    var url = 'https://pwademo-66c7b-default-rtdb.europe-west1.firebasedatabase.app/damagelog.json';

    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
                    return fetch(event.request)
                        .then(function(res) {
                            cache.put(event.request, res.clone());
                            return res;
                        });
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(function(response){
                    if (response) {
                        return response; //response comes from the cache
                    } else {
                        return fetch(event.request) //not cached, get from internet...
                                .then(function(dynamicResponse) { //and place it into dynamic cache
                                caches.open(CACHE_DYNAMIC_NAME)
                                    .then(function(cache) {
                                        cache.put(event.request.url, dynamicResponse.clone()) 
                                        //does not send request, uses response (can be done only once), and is therefore cloned
                                        //to respond back to the browser (clone is stored in cache, rest is shown)
                                        return dynamicResponse;
                                    })
                            })
                            .catch(function(error) { //do not throw exception when fetching fails
                            });
                    }
            })
        );
    }
});