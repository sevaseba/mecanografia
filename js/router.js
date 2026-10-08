// Hash-based router (#/path). Works on static hosting without server rewrites.
//
// A screen is a module object: { title: string, render(container) }. render may return a
// cleanup function, called before the next screen is shown.

import { strings } from './strings.js';

let isFirstRender = true;
let cleanupCurrent = null;

export function startRouter(container, routes, notFoundScreen) {
  const show = () => {
    const path = location.hash.replace(/^#/, '') || '/';
    const screen = routes[path] ?? notFoundScreen;

    cleanupCurrent?.();
    container.replaceChildren();
    cleanupCurrent = screen.render(container) ?? null;
    document.title =
      screen.title === strings.appName ? strings.appName : `${screen.title} · ${strings.appName}`;

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
