// Course map (#/lecciones): units with their lessons, locked / available / passed, stars
// and the recommended lesson.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { redirect } from '../router.js';
import { profiles } from '../profiles.js';
import { getLayout } from '../layouts/index.js';
import { getCourse, lessonStates } from '../course.js';
import { renderStars, renderKeycaps } from '../lesson-badges.js';

const text = strings.lessons;
// A tile shows the new keys when they are few (f y j → [f] [j]); otherwise its title
// ("Mayúsculas", "Números del 1 al 5"), which says it better than a row of keys.
const MAX_TILE_KEYS = 3;

export const title = text.title;

export function render(container) {
  const profile = profiles.active();
  if (!profile) {
    redirect('/');
    return;
  }

  const status = el('p', { class: 'muted', role: 'status' }, text.loading);
  container.append(
    el('a', { class: 'back-link', href: '#/inicio' }, `← ${text.back}`),
    el('h1', {}, text.title),
    el(
      'div',
      { class: 'map-header' },
      status,
      el(
        'a',
        { class: 'hands-intro-link', href: '#/posicion-de-las-manos' },
        el('span', { class: 'hands-intro-link__title' }, strings.handsIntro.mapLink),
        el('span', { class: 'muted' }, strings.handsIntro.mapLinkDescription),
      ),
    ),
  );

  // The course loads asynchronously: if the user already left this screen, drop the result
  // instead of drawing it into whatever screen is showing now.
  let left = false;
  getCourse(profile.layoutId).then(
    (course) => {
      if (left) return;
      const states = lessonStates(course, profiles.progressFor(profile.id, profile.layoutId), profile.mode);
      const passed = [...states.values()].filter((state) => state.status === 'completed').length;
      const anyLocked = [...states.values()].some((state) => state.status === 'locked');
      status.textContent = text.summary(getLayout(profile.layoutId).name, passed, course.lessons.length) + (anyLocked ? ` ${text.lockedHint}` : '');
      container.append(...course.units.map((unit) => renderUnit(unit, states)));
      // Open where the profile goes on, if that is further down.
      const current = container.querySelector('.lesson-tile--recommended');
      if (current && current.getBoundingClientRect().bottom > window.innerHeight) current.scrollIntoView({ block: 'center' });
    },
    () => {
      if (!left) status.textContent = text.loadError;
    },
  );

  return () => {
    left = true;
  };
}

function renderUnit(unit, states) {
  return el(
    'section',
    { class: 'lesson-unit' },
    el('h2', {}, unit.title),
    el('ol', { class: 'lesson-grid' }, unit.lessons.map((lesson) => el('li', {}, lessonTile(lesson, states.get(lesson.id))))),
  );
}

function lessonTile(lesson, state) {
  const statusText = state.recommended ? text.recommended : text.status[state.status];
  const keys = lesson.newKeys;
  const locked = state.status === 'locked';
  const content = [
    el('span', { class: 'lesson-tile__number' }, text.lessonNumber(lesson.number)),
    keys.length && keys.length <= MAX_TILE_KEYS
      ? renderKeycaps(keys, text.review)
      : el('span', { class: 'lesson-tile__title' }, lesson.title),
    el(
      'span',
      { class: 'lesson-tile__footer' },
      locked ? el('span', { 'aria-hidden': 'true' }, '🔒') : renderStars(state.stars),
      // A padlock is enough on screen; the map's summary says how to open lessons.
      el('span', { class: locked ? 'visually-hidden' : 'lesson-tile__status' }, statusText),
    ),
  ];
  const className = `lesson-tile lesson-tile--${state.status}${state.recommended ? ' lesson-tile--recommended' : ''}`;
  // Locked lessons are not links: there is nothing to open yet.
  return state.status === 'locked'
    ? el('div', { class: className }, content)
    : el('a', { class: className, href: `#/lecciones/${encodeURIComponent(lesson.id)}` }, content);
}
