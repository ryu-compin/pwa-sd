const cacheName = 'PWA-sample';
const filesToCache = [
    '/',
    '/index.html',
    '/offlinepage.html'
];

self.addEventListener('install', function(e) {
    // インストール時のアクション
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            console.log('[ServiceWorker] Caching app shell');
            // "fileToCache"に指定したコンテンツをキャッシュする
            return cache.addAll(filesToCache.map(url => new Request(url, {credentials: 'same-origin'})));
        })
    );
});
self.addEventListener('activate', function(e) {
    // アクティベート時のアクション
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                console.log('[ServiceWorker] Removing old cache', key);
                if (key !== cacheName) {
                    // キャッシュを削除する
                    return caches.delete(key);
                }
            }));
        })
    );
});
self.addEventListener('fetch', function(e) {
    // URLリクエスト時のアクション
    console.log('[ServiceWorker] Fetch', e.request.url);
    e.respondWith(
        // キャッシュがあればキャッシュを返す、なければfetchしてキャッシュする
        caches.match(e.request).then(function(response) {
            return response ||   fetch(e.request)
                .then(function(response) {
                    return caches.open(cacheName).then(function(cache) {
                        cache.put(e.request.url, response.clone());
                        console.log('[ServiceWorker] Fetched&Cached Data');
                        return response;
                    });
                });
        })
    );
});