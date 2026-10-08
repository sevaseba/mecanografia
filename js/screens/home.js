// Home of the active profile (#/inicio). Without an active profile, back to the picker.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { redirect } from '../router.js';
import { profiles } from '../profiles.js';
import { getLayout } from '../layouts/index.js';
import { getCourse, lessonStates } from '../course.js';

const text = strings.home;

export const title = () => profiles.active()?.name ?? strings.appName;

export function render(container) {
  const profile = profiles.active();
  if (!profile) {
    redirect('/');
    return;
  }

  const continueLine = el('span', { class: 'home-action__description' }, text.lessonsDescription);

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
        { class: 'home-action', href: '#/lecciones' },
        el('span', { class: 'home-action__title' }, text.lessons),
        continueLine,
      ),
      el(
        'a',
        { class: 'home-action home-action--secondary', href: '#/teclado-libre' },
        el('span', { class: 'home-action__title' }, text.freeTyping),
        el('span', { class: 'home-action__description' }, text.freeTypingDescription),
      ),
    ),
    el(
      'nav',
      { class: 'home-links', 'aria-label': strings.appName },
      el('a', { href: '#/' }, text.switchProfile),
      el('a', { href: `#/perfiles/${encodeURIComponent(profile.id)}/editar` }, text.editProfile),
    ),
  );

  // Where to continue: the recommended lesson of this profile's course (ignored if the
  // user left this screen before the course loaded).
  let left = false;
  getCourse(profile.layoutId).then(
    (course) => {
      if (left) return;
      const states = lessonStates(course, profiles.progressFor(profile.id, profile.layoutId), profile.mode);
      const next = course.lessons.find((lesson) => states.get(lesson.id).recommended);
      continueLine.textContent = next ? text.continueWith(next.number, next.title) : text.courseDone;
    },
    () => {}, // keep the generic description; the lessons screen explains load errors
  );

  return () => {
    left = true;
  };
}
