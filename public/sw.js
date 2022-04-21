//clean up 
//whenever content is changed, change the cache name variables below
var CACHE_STATIC_NAME = 'static-v3'
var CACHE_DYNAMIC_NAME = 'dynamic-v3'

self.addEventListener('install', function(event) {
    console.log('[SW]: Service worker installing...', event);
    //new:
    event.waitUntil( //wont finish unitl caching is complete
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
                    '/imprint.html',
                    '/js/app.js',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css',
                    'https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-ka7Sk0Gln4gmtz2MlQnikT1wXgYsOg+OMhuP+IlRH9sENBO0LRn5q+8nbTov4+1p'
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

self.addEventListener('fetch', function(event) {
    console.log('[SW]: Service worker fetching...', event);
    //new:
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
});