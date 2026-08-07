const CACHE_NAME = 'metronome-v3';
const urlsToCache = [
  '/metronome/index.html',
  '/metronome/manifest.json',
  '/metronome/icon-192.png',
  '/metronome/icon-512.png'
];

// 安裝 Service Worker：不快取首頁，避免緩存 404
self.addEventListener('install', (event) => {
  event.skipWaiting(); // 立刻啟用新版 SW
});

// 攔截請求：Network-first（先試網路，失敗才用快取）
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 拿到網路回應，更新快取
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 網路失敗，改用快取
        return caches.match(event.request);
      })
  );
});

// 啟動時強制清理所有舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('清理舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});