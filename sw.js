// travel. Service Worker — Firebase SDK 캐시로 PWA 빠른 로딩
const CACHE = 'travel-v1';
const PRECACHE = [
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&family=Noto+Sans+KR:wght@300;400;500;600&family=Gowun+Batang:wght@400;700&display=swap',
];

// 설치 시 핵심 리소스 미리 캐시
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(PRECACHE).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 요청 시 캐시 우선 (Firebase SDK, 폰트), 네트워크 우선 (나머지)
self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Firebase SDK, 폰트 → 캐시 우선
  if (url.includes('gstatic.com/firebasejs') || url.includes('fonts.g')) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return res;
        });
      })
    );
    return;
  }
  // 나머지 → 네트워크 우선, 실패 시 캐시
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
