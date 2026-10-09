// Entry point: applies the active profile's look, mounts the router and registers the
// service worker.

import { startRouter } from './router.js';
import { registerServiceWorker } from './pwa.js';
import { profiles } from './profiles.js';
import * as profilePickerScreen from './screens/profile-picker.js';
import * as profileFormScreen from './screens/profile-form.js';
import * as homeScreen from './screens/home.js';
import * as freeTypingScreen from './screens/free-typing.js';
import * as lessonsMapScreen from './screens/lessons-map.js';
import * as lessonScreen from './screens/lesson.js';
import * as handsIntroScreen from './screens/hands-intro.js';
import * as progressScreen from './screens/progress.js';
import * as notFoundScreen from './screens/not-found.js';

const routes = {
  '/': profilePickerScreen,
  '/perfiles/nuevo': profileFormScreen,
  '/perfiles/:id/editar': profileFormScreen,
  '/inicio': homeScreen,
  '/lecciones': lessonsMapScreen,
  '/lecciones/:id': lessonScreen,
  '/posicion-de-las-manos': handsIntroScreen,
  '/teclado-libre': freeTypingScreen,
  '/progreso': progressScreen,
};

// The whole UI (theme, sizes, what is shown) follows the active profile: mode, and for
// adults the light/dark theme ('auto' follows the operating system).
const darkScheme = window.matchMedia('(prefers-color-scheme: dark)');
const applyActiveProfile = () => {
  const profile = profiles.active();
  const theme = profile?.settings.theme ?? 'auto';
  document.documentElement.dataset.mode = profile?.mode ?? 'adult';
  document.documentElement.dataset.theme = theme === 'auto' ? (darkScheme.matches ? 'dark' : 'light') : theme;
};
profiles.onChange(applyActiveProfile);
darkScheme.addEventListener('change', applyActiveProfile);
applyActiveProfile();

startRouter(document.getElementById('app'), routes, notFoundScreen);
registerServiceWorker();
