// Home of the active profile (#/inicio). Without an active profile, back to the picker.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { redirect } from '../router.js';
import { profiles } from '../profiles.js';
import { getLayout } from '../layouts/index.js';

const text = strings.home;

export const title = () => profiles.active()?.name ?? strings.appName;

export function render(container) {
  const profile = profiles.active();
  if (!profile) {
    redirect('/');
    return;
  }

  container.append(
    el(
      'header',
      { class: 'home-header' },
      el('span', { class: 'home-header__avatar', 'aria-hidden': 'true' }, profile.avatar),
      el(
        'div',
        {},
        el('h1', {}, text.greeting(profile.name)),
        el(
          'p',
          { class: 'muted' },
          strings.picker.profileSummary(strings.modes[profile.mode], getLayout(profile.layoutId).name),
        ),
      ),
    ),
    el(
      'div',
      { class: 'home-actions' },
      el(
        'a',
        { class: 'home-action', href: '#/teclado-libre' },
        el('span', { class: 'home-action__title' }, text.freeTyping),
        el('span', { class: 'home-action__description' }, text.freeTypingDescription),
      ),
      el('p', { class: 'home-soon muted' }, text.lessonsSoon),
    ),
    el(
      'nav',
      { class: 'home-links', 'aria-label': strings.appName },
      el('a', { href: '#/' }, text.switchProfile),
      el('a', { href: `#/perfiles/${encodeURIComponent(profile.id)}/editar` }, text.editProfile),
    ),
  );
}
