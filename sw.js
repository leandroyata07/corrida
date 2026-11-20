const CACHE_NAME = 'lh44-cache-v48';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/style.css',
  './js/constants.js',
  './js/audio.js',
  './js/particles.js',
  './js/input.js',
  './js/cars.js',
  './js/monuments.js',
  './js/tracks_data.js',
  './js/tracks.js',
  './js/car.js',
  './js/save.js',
  './js/netplay.js',
  './js/game.js',
  './js/sky_renderer.js',
  './js/road_renderer.js',
  './js/hud_renderer.js',
  './js/menu_renderer.js',
  './js/main.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return res;
    }).catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
