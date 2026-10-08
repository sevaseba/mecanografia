// Service worker: precaches the whole app so it works offline.
// Bump CACHE_VERSION whenever any precached file changes (lessons included), and add new
// files to PRECACHE. Lesson files are not listed: they are read from each course index.json.

const CACHE_VERSION = 'v18';
const CACHE_NAME = `mecanografia-${CACHE_VERSION}`;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/themes.css',
  './css/keyboard.css',
  './css/practice.css',
  './css/profiles.css',
  './css/lessons.css',
  './js/app.js',
  './js/announcer.js',
  './js/calibration-view.js',
  './js/course.js',
  './js/dialog.js',
  './js/dom.js',
  './js/exercise-generator.js',
  './js/guidance.js',
  './js/hands-view.js',
  './js/input.js',
  './js/keyboard-view.js',
  './js/keystrokes.js',
  './js/layout-check.js',
  './js/lesson-badges.js',
  './js/practice-view.js',
  './js/profiles.js',
  './js/router.js',
  './js/stats.js',
  './js/storage.js',
  './js/strings.js',
  './js/text-line-view.js',
  './js/typing-session.js',
  './js/layouts/index.js',
  './js/layouts/es-latam.js',
  './js/layouts/en-us.js',
  './js/screens/free-typing.js',
  './js/screens/home.js',
  './js/screens/lesson.js',
  './js/screens/lessons-map.js',
  './js/screens/not-found.js',
  './js/screens/profile-form.js',
  './js/screens/profile-picker.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './lessons/es-latam/index.json',
  './lessons/en-us/index.json',
];

const COURSE_INDEX = /lessons\/[^/]+\/index\.json$/;

// "reload" bypasses the HTTP cache so a new version never precaches stale files.
const fresh = (url) => new Request(url, { cache: 'reload' });

async function precache() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(PRECACHE.map(fresh));
  // Every lesson listed in each course index.
  for (const indexUrl of PRECACHE.filter((url) => COURSE_INDEX.test(url))) {
    const index = await (await cache.match(indexUrl)).json();
    const base = indexUrl.replace(/index\.json$/, '');
    await cache.addAll(index.units.flatMap((unit) => unit.lessons).map((id) => fresh(`${base}${id}.json`)));
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
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
