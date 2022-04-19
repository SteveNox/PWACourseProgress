self.addEventListener('install', function(event) {
    console.log('[SW]: Service worker installing...', event);
});

self.addEventListener('activate', function(event) {
    console.log('[SW]: Service worker activating, aber sowas von, jetzt aber echt...', event);
});

self.addEventListener('fetch', function(event) {
    console.log('[SW]: Service worker fetching...', event);
});