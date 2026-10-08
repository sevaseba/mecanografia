// Entry point: mounts the router and registers the service worker.

import { startRouter } from './router.js';
import { announce } from './announcer.js';
import { strings } from './strings.js';
import * as homeScreen from './screens/home.js';
import * as freeTypingScreen from './screens/free-typing.js';
import * as notFoundScreen from './screens/not-found.js';

const routes = {
  '/': homeScreen,
  '/teclado-libre': freeTypingScreen,
};

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
