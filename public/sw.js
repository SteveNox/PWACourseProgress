importScripts('/js/idb.js');
importScripts('/js/helper.js');

const dbUrl = "https://pwademo-66c7b-default-rtdb.europe-west1.firebasedatabase.app/damagelog";

//clean up 


//whenever content is changed, change the cache name variables below
var CACHE_STATIC_NAME = 'static-v32'
var CACHE_DYNAMIC_NAME = 'dynamic-v32'

self.addEventListener('install', function(event) {
    // console.log('[SW]: Service worker installing...', event);
    //new:
    event.waitUntil( //won't finish until caching is complete
        //caches.open('static')
        caches.open(CACHE_STATIC_NAME)
            .then(function(cache) {
                // console.log('[SW]: Precaching app shell...', event);
                // cache.add('/js/app.js');
                // cache.add('/index.html');
                // cache.add('/')
                // or even simpler:
                cache.addAll([
                    '/',
                    'index.html',
                    'offline.html',
                    'manifest.json',
                    '/js/idb.js',
                    '/js/helper.js',
                    '/js/app.js',
                    "/js/damagelog.js",
                    'sw.js',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js'
                ]);
            })
    )
});

self.addEventListener('activate', function(event) {
    //console.log('[SW]: Service worker activating, aber sowas von, jetzt aber echt...', event);
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
    // console.log('[SW]: Service worker fetching...', event);
    var url = 'https://pwademo-66c7b-default-rtdb.europe-west1.firebasedatabase.app/damagelog.json';

    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            fetch(event.request)
            .then(function(res) {
                //cache.put(event.request, res.clone()); <--store db response in cache
                var clonedResponse = res.clone();
                clearAllData('damages')
                    	.then(function() 
                        {
                            return clonedResponse.json()
                        })
                        .then(function(data) {
                            console.log("DATA->", data);
                            for (var key in data)
                            {
                                writeData('damages', data[key]);
                                // console.log(data[key]);
                            }                       
                        });
                return res;
            })
            .catch(function(err) {
                //prevent red line in console
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

self.addEventListener('sync', function(event) {
    //console.log('[SW]: Service worker syncing...', event);
    if (event.tag == 'sync-new-damagelog') {
        event.waitUntil
        (
            readAllData('sync-damages')
                .then(function(data) 
                {
                    for (var dt of data) {
                        var newItem = {
                            reportedAt: dt.reportedAt,
                            licensePlate: dt.licensePlate,
                            description: dt.description,
                            picture: dt.picture,
                            id: dt.id,
                        }
                        fetch(dbUrl + ".json", 
                            {
                                method: "POST", 
                                body: JSON.stringify(newItem), 
                                headers: {"Content-type": "application/json; charset=UTF-8", 'Accept': 'application/json'}
                            })
                        .then(function(res) {
                                //console.log('SENT DATA:', res);
                                if(res.ok) {
                                  deleteItemFromData('sync-damages', dt.id);
                                }
                            });
                    }
                })
        );
    }
});