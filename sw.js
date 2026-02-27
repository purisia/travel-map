const CACHE_NAME = 'fukuoka-map-v1';

const PRECACHE_URLS = [
  './',
  './index.html',
  './css/style.css',
  './js/data.js',
  './js/subway.js',
  './js/app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// 설치: 핵심 파일 캐시
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

// 활성화: 이전 버전 캐시 삭제
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) { return key !== CACHE_NAME; })
            .map(function (key) { return caches.delete(key); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

// 페치: 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  // 지도 타일: 네트워크 우선, 실패 시 캐시
  if (url.hostname.includes('basemaps.cartocdn.com')) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function () {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Google Fonts: 네트워크 우선
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function () {
        return caches.match(event.request);
      })
    );
    return;
  }

  // 나머지: 네트워크 우선, 실패 시 캐시 (수정 즉시 반영)
  event.respondWith(
    fetch(event.request).then(function (response) {
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function (cache) {
        cache.put(event.request, clone);
      });
      return response;
    }).catch(function () {
      return caches.match(event.request);
    })
  );
});
