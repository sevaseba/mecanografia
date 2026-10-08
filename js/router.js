// Hash-based router (#/path). Works on static hosting without server rewrites.
//
// A screen is a module object: { title: string, render(container): void }.

import { strings } from './strings.js';

let isFirstRender = true;

export function startRouter(container, routes, notFoundScreen) {
  const show = () => {
    const path = location.hash.replace(/^#/, '') || '/';
    const screen = routes[path] ?? notFoundScreen;

    container.replaceChildren();
    screen.render(container);
    document.title =
      screen.title === strings.appName ? strings.appName : `${screen.title} · ${strings.appName}`;

    // On navigation (not on first load) move focus to the new screen's heading,
    // so keyboard and screen-reader users land at the start of the new content.
    if (!isFirstRender) {
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
