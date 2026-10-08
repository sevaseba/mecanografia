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
    status,
  );

  // The course loads asynchronously: if the user already left this screen, drop the result
  // instead of drawing it into whatever screen is showing now.
  let left = false;
  getCourse(profile.layoutId).then(
    (course) => {
      if (left) return;
      const states = lessonStates(course, profiles.progressFor(profile.id, profile.layoutId), profile.mode);
      const passed = [...states.values()].filter((state) => state.status === 'completed').length;
      status.textContent = text.summary(getLayout(profile.layoutId).name, passed, course.lessons.length);
      container.append(...course.units.map((unit) => renderUnit(unit, states)));
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
  const content = [
    el('span', { class: 'lesson-tile__number' }, text.lessonNumber(lesson.number)),
    el('span', { class: 'lesson-tile__title' }, lesson.title),
    renderKeycaps(lesson.newKeys, text.review),
    el(
      'span',
      { class: 'lesson-tile__footer' },
      state.status === 'locked' ? el('span', { 'aria-hidden': 'true' }, '🔒') : renderStars(state.stars),
      el('span', { class: 'lesson-tile__status' }, statusText),
    ),
  ];
  const className = `lesson-tile lesson-tile--${state.status}${state.recommended ? ' lesson-tile--recommended' : ''}`;
  // Locked lessons are not links: there is nothing to open yet.
  return state.status === 'locked'
    ? el('div', { class: className }, content)
    : el('a', { class: className, href: `#/lecciones/${encodeURIComponent(lesson.id)}` }, content);
}
