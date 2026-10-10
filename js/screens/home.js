// Home of the active profile (#/inicio). Without an active profile, back to the picker.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { redirect } from '../router.js';
import { profiles } from '../profiles.js';
import { getLayout } from '../layouts/index.js';
import { getCourse, lessonStates } from '../course.js';
import { summarizeProgress } from '../progress-summary.js';
import { createInstallButton } from '../pwa.js';

const text = strings.home;

export const title = () => profiles.active()?.name ?? strings.appName;

export function render(container) {
  const profile = profiles.active();
  if (!profile) {
    redirect('/');
    return;
  }

  // The main action opens the lesson to do next (once the course loads; the map until then).
  const lessonsTitle = el('span', { class: 'home-action__title' }, text.lessons);
  const lessonsLine = el('span', { class: 'home-action__description' }, text.lessonsDescription);
  const lessonsAction = el('a', { class: 'home-action', href: '#/lecciones' }, lessonsTitle, lessonsLine);
  // How it is going, in a line (filled when the course loads; empty before the first lesson).
  const stats = el('ul', { class: 'home-stats', 'aria-label': text.progress });

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
        stats,
      ),
      // Always in view, next to the greeting.
      el(
        'nav',
        { class: 'home-links', 'aria-label': strings.appName },
        el('a', { href: '#/progreso' }, text.progress),
        el('a', { href: '#/' }, text.switchProfile),
        el('a', { href: `#/perfiles/${encodeURIComponent(profile.id)}/editar` }, text.editProfile),
      ),
    ),
    el(
      'div',
      { class: 'home-actions' },
      lessonsAction,
      el(
        'a',
        { class: 'home-action home-action--secondary', href: '#/teclado-libre' },
        el('span', { class: 'home-action__title' }, text.freeTyping),
        el('span', { class: 'home-action__description' }, text.freeTypingDescription),
      ),
    ),
    // Under the cards, not inside the lessons one's cell: both cards keep the same height.
    el('p', { class: 'home-all-lessons' }, el('a', { href: '#/lecciones' }, text.allLessons)),
    el('div', { class: 'install-slot' }, createInstallButton()),
  );

  // Where to start or go on: the recommended lesson of this profile's course (ignored if
  // the user left this screen before the course loaded). The lesson shows the hands intro
  // first when it was never done.
  let left = false;
  getCourse(profile.layoutId).then(
    (course) => {
      if (left) return;
      const states = lessonStates(course, profiles.progressFor(profile.id, profile.layoutId), profile.mode);
      const next = course.lessons.find((lesson) => states.get(lesson.id).recommended);
      if (next) {
        const started = [...states.values()].some((state) => state.status === 'completed');
        lessonsTitle.textContent = started ? text.continue : text.start;
        lessonsLine.textContent = text.nextLesson(next.number, next.title);
        lessonsAction.href = `#/lecciones/${encodeURIComponent(next.id)}`;
      } else {
        lessonsLine.textContent = text.courseDone;
      }
      stats.replaceChildren(...statItems(profile, summarizeProgress(profile, profile.layoutId, course)));
    },
    () => {}, // keep the generic description; the lessons screen explains load errors
  );

  return () => {
    left = true;
  };
}

// Kids: stars, medals and streak. Adults: speed, accuracy and streak. Nothing before the first session.
function statItems(profile, summary) {
  if (summary.avgAccuracy === null) return [];
  const items = profile.mode === 'kids'
    ? [text.stats.stars(summary.stars), text.stats.medals(Object.keys(profile.medals).length)]
    : [summary.avgWpm === null ? null : text.stats.wpm(summary.avgWpm), text.stats.accuracy(summary.avgAccuracy)];
  if (summary.streak > 0) items.push(text.stats.streak(summary.streak));
  return items.filter(Boolean).map((item) => el('li', {}, item));
}
