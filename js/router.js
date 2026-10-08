// Hash-based router (#/path). Works on static hosting without server rewrites.
//
// A screen is a module object: { title, render(container, params) }. Routes may have
// parameters ('/perfiles/:id/editar'); they arrive in `params`. title may be a function of
// params. render may return a cleanup function, called before the next screen is shown.

import { strings } from './strings.js';

let isFirstRender = true;
let cleanupCurrent = null;

export function startRouter(container, routes, notFoundScreen) {
  const show = () => {
    const path = location.hash.replace(/^#/, '') || '/';
    const { screen, params } = matchRoute(routes, path) ?? { screen: notFoundScreen, params: {} };

    cleanupCurrent?.();
    container.replaceChildren();
    cleanupCurrent = screen.render(container, params) ?? null;
    // A screen may redirect while rendering; the next hashchange renders the new one.
    if (path !== currentPath()) return;

    const title = typeof screen.title === 'function' ? screen.title(params) : screen.title;
    document.title = title === strings.appName ? strings.appName : `${title} · ${strings.appName}`;

    // On navigation (not on first load) move focus to the new screen's heading,
    // so keyboard and screen-reader users land at the start of the new content.
    // Screens that put focus somewhere themselves (e.g. a practice area) keep it.
    if (!isFirstRender && !container.contains(document.activeElement)) {
      const heading = container.querySelector('h1');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus();
      } else {
        container.focus();
      }
    }
    isFirstRender = false;
  };

  window.addEventListener('hashchange', show);
  show();
}

export function navigate(path) {
  location.hash = `#${path}`;
}

/** Navigates without leaving the current screen in the history (for guards). */
export function redirect(path) {
  location.replace(`#${path}`);
}

function currentPath() {
  return location.hash.replace(/^#/, '') || '/';
}

function matchRoute(routes, path) {
  const segments = path.split('/');
  for (const [pattern, screen] of Object.entries(routes)) {
    const patternSegments = pattern.split('/');
    if (patternSegments.length !== segments.length) continue;
    const params = {};
    const matches = patternSegments.every((part, i) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = decodeURIComponent(segments[i]);
        return true;
      }
      return part === segments[i];
    });
    if (matches) return { screen, params };
  }
  return null;
}
