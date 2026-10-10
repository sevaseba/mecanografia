// Service worker: precaches the whole app so it works offline.
// Bump CACHE_VERSION whenever any precached file changes (lessons included), and add new
// files to PRECACHE. Lesson files and voice clips are not listed: they are read from each
// course index.json and from the voice index.

const CACHE_VERSION = 'v29';
const CACHE_NAME = `mecanografia-${CACHE_VERSION}`;

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/base.css',
  './css/themes.css',
  './css/keyboard.css',
  './css/practice.css',
  './css/hands-intro.css',
  './css/profiles.css',
  './css/lessons.css',
  './css/progress.css',
  './js/app.js',
  './js/achievements.js',
  './js/announcer.js',
  './js/calibration-view.js',
  './js/confetti.js',
  './js/course.js',
  './js/dialog.js',
  './js/dom.js',
  './js/exercise-generator.js',
  './js/guidance.js',
  './js/hands-intro.js',
  './js/hands-intro-copy.js',
  './js/hands-intro-view.js',
  './js/hands-view.js',
  './js/input.js',
  './js/keyboard-view.js',
  './js/keystrokes.js',
  './js/layout-check.js',
  './js/lesson-badges.js',
  './js/practice-view.js',
  './js/profiles.js',
  './js/pwa.js',
  './js/random.js',
  './js/router.js',
  './js/sound-toggle.js',
  './js/voice.js',
  './js/voice-clips.js',
  './js/sound.js',
  './js/stats.js',
  './js/storage.js',
  './js/strings.js',
  './js/text-line-view.js',
  './js/typing-session.js',
  './js/wpm-chart.js',
  './js/layouts/index.js',
  './js/layouts/es-latam.js',
  './js/layouts/en-us.js',
  './js/screens/free-typing.js',
  './js/screens/hands-intro.js',
  './js/screens/home.js',
  './js/screens/lesson.js',
  './js/screens/lessons-map.js',
  './js/screens/not-found.js',
  './js/screens/profile-form.js',
  './js/screens/profile-picker.js',
  './js/screens/progress.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './assets/fonts/nunito-latin.woff2',
  './lessons/es-latam/index.json',
  './lessons/en-us/index.json',
  './assets/audio/kids/index.json',
];

const COURSE_INDEX = /lessons\/[^/]+\/index\.json$/;
const VOICE_DIR = './assets/audio/kids/';
const VOICE_INDEX = `${VOICE_DIR}index.json`;

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
  // Every recorded voice clip.
  const voice = await (await cache.match(VOICE_INDEX)).json();
  await cache.addAll(voice.clips.map((name) => fresh(`${VOICE_DIR}${name}`)));
}

// A new version waits ("installed") until the page asks it to take over, after the user
// accepts the "update available" banner (see js/pwa.js).
self.addEventListener('install', (event) => {
  event.waitUntil(precache());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'skip-waiting') self.skipWaiting();
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

  // Navigations to the app get the app shell (routing happens in the hash). Other pages
  // of the site (such as the tools/ prototypes) are left to the network.
  if (request.mode === 'navigate') {
    const { pathname } = new URL(request.url);
    const appRoot = new URL('./', self.registration.scope).pathname;
    if (pathname !== appRoot && pathname !== `${appRoot}index.html`) return;
    event.respondWith(caches.match('./index.html').then((cached) => cached ?? fetch(request)));
    return;
  }

  event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
});
