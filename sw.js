// Service Worker：离线缓存 + 让 PWA 可“添加到主屏幕”
const CACHE = 'plantcare-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './css/styles.css',
  './js/app.js',
  './js/db.js',
  './js/api.js',
  './js/data.js',
  './js/engine.js',
  './js/icons.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
  // 清掉一切旧缓存，确保新版本立即接管
  caches.keys().then((keys) => keys.forEach((k) => { if (k !== CACHE) caches.delete(k); }));
});

// 网络优先，离线时回退缓存——改代码后刷新即可生效，又不失离线能力
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
  );
});
