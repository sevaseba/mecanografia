// Service worker: precaches the whole app so it works offline.
// Bump CACHE_VERSION whenever any precached file changes, and add new files to PRECACHE.

const CACHE_VERSION = 'v5';
const CACHE_NAME = `mecanografia-${CACHE_VERSION}`;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/themes.css',
  './css/keyboard.css',
  './css/typing.css',
  './js/app.js',
  './js/announcer.js',
  './js/dom.js',
  './js/input.js',
  './js/keyboard-view.js',
  './js/keystrokes.js',
  './js/layout-check.js',
  './js/router.js',
  './js/strings.js',
  './js/typing-session.js',
  './js/layouts/index.js',
  './js/layouts/es-latam.js',
  './js/layouts/en-us.js',
  './js/screens/free-typing.js',
  './js/screens/home.js',
  './js/screens/not-found.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      // "reload" bypasses the HTTP cache so a new version never precaches stale files.
      .then((cache) => cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('mecanografia-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Page navigations always get the app shell; routing happens in the hash.
  if (request.mode === 'navigate') {
    event.respondWith(caches.match('./index.html').then((cached) => cached ?? fetch(request)));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
});
