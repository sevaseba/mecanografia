// PWA integration: service worker registration, "update available" banner and the
// "Install app" prompt (beforeinstallprompt, Chromium only; iPhone uses Safari's menu).

import { el } from './dom.js';
import { strings } from './strings.js';
import { announce } from './announcer.js';

let deferredInstallPrompt = null;
const installListeners = new Set();

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const isFirstInstall = !navigator.serviceWorker.controller;
  let registration;
  try {
    registration = await navigator.serviceWorker.register('./sw.js');
  } catch (error) {
    console.error('No se pudo registrar el service worker', error);
    return;
  }

  if (isFirstInstall) {
    navigator.serviceWorker.addEventListener('controllerchange', () => announce(strings.offlineReady), { once: true });
    return;
  }

  // A new version waits until the user accepts it, so nothing changes mid-lesson.
  if (registration.waiting) showUpdateBanner(registration.waiting);
  registration.addEventListener('updatefound', () => {
    const worker = registration.installing;
    worker?.addEventListener('statechange', () => {
      if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdateBanner(worker);
    });
  });
}

function showUpdateBanner(worker) {
  if (document.querySelector('.update-banner')) return;
  const button = el('button', { type: 'button', class: 'button button--small' }, strings.pwa.update);
  const banner = el('div', { class: 'update-banner', role: 'status' }, el('p', {}, strings.pwa.updateAvailable), button);
  button.addEventListener('click', () => {
    navigator.serviceWorker.addEventListener('controllerchange', () => location.reload(), { once: true });
    worker.postMessage({ type: 'skip-waiting' });
  });
  document.body.append(banner);
}

// --- Install ---

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault(); // show our own button instead of the browser's mini bar
  deferredInstallPrompt = event;
  installListeners.forEach((listener) => listener());
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  installListeners.forEach((listener) => listener());
});

/** An "Install app" button that only shows while the browser offers installation. */
export function createInstallButton() {
  const button = el('button', { type: 'button', class: 'button button--secondary', hidden: true }, strings.pwa.install);
  button.title = strings.pwa.installHint;
  let wasConnected = false;
  const update = () => {
    // Stop listening once the screen that showed the button is gone.
    if (button.isConnected) wasConnected = true;
    else if (wasConnected) {
      installListeners.delete(update);
      return;
    }
    button.hidden = !deferredInstallPrompt;
  };
  button.addEventListener('click', async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installListeners.forEach((listener) => listener());
  });
  installListeners.add(update);
  update();
  return button;
}
