// Entry point: applies the active profile's mode, mounts the router and registers the
// service worker.

import { startRouter } from './router.js';
import { announce } from './announcer.js';
import { strings } from './strings.js';
import { profiles } from './profiles.js';
import * as profilePickerScreen from './screens/profile-picker.js';
import * as profileFormScreen from './screens/profile-form.js';
import * as homeScreen from './screens/home.js';
import * as freeTypingScreen from './screens/free-typing.js';
import * as lessonsMapScreen from './screens/lessons-map.js';
import * as lessonScreen from './screens/lesson.js';
import * as notFoundScreen from './screens/not-found.js';

const routes = {
  '/': profilePickerScreen,
  '/perfiles/nuevo': profileFormScreen,
  '/perfiles/:id/editar': profileFormScreen,
  '/inicio': homeScreen,
  '/lecciones': lessonsMapScreen,
  '/lecciones/:id': lessonScreen,
  '/teclado-libre': freeTypingScreen,
};

// The whole UI (theme, sizes, what is shown) follows the active profile's mode.
const applyActiveMode = () => {
  document.documentElement.dataset.mode = profiles.active()?.mode ?? 'adult';
};
profiles.onChange(applyActiveMode);
applyActiveMode();

startRouter(document.getElementById('app'), routes, notFoundScreen);
registerServiceWorker();

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const isFirstInstall = !navigator.serviceWorker.controller;
  try {
    await navigator.serviceWorker.register('./sw.js');
  } catch (error) {
    console.error('No se pudo registrar el service worker', error);
    return;
  }

  // Let the user know (once) that the app now works offline.
  if (isFirstInstall) {
    navigator.serviceWorker.addEventListener('controllerchange', () => announce(strings.offlineReady), {
      once: true,
    });
  }
}
