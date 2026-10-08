// A lesson (#/lecciones/:id): its fixed exercises plus a random one, typed in a row on the
// practice view, then the results (accuracy, stars) saved to the profile's progress.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { redirect } from '../router.js';
import { announce } from '../announcer.js';
import { profiles } from '../profiles.js';
import { layouts, getLayout } from '../layouts/index.js';
import { createKeyIndex } from '../keystrokes.js';
import { combineStats } from '../stats.js';
import { getCourse, lessonStates, recordAttempt, starsFor, PASS_ACCURACY } from '../course.js';
import { randomExercise } from '../exercise-generator.js';
import { createPracticeView } from '../practice-view.js';
import { renderStars, renderKeycaps } from '../lesson-badges.js';

const text = strings.lessons;
const keyIndexes = layouts.map(createKeyIndex);
const PAUSE_BETWEEN_EXERCISES_MS = 700;

export const title = text.title;

export function render(container, params) {
  const profile = profiles.active();
  if (!profile) {
    redirect('/');
    return;
  }

  let view = null;
  let pauseTimer = null;
  let left = false;

  container.append(el('p', { class: 'muted', role: 'status' }, text.loading));

  getCourse(profile.layoutId).then(
    (course) => {
      if (left) return;
      const lesson = course.get(params.id);
      const states = lesson && lessonStates(course, profiles.progressFor(profile.id, profile.layoutId), profile.mode);
      if (!lesson || states.get(lesson.id).status === 'locked') {
        redirect('/lecciones');
        return;
      }
      document.title = `${text.lessonTitle(lesson.number, lesson.title)} · ${strings.appName}`;
      start(course, lesson);
    },
    () => {
      container.replaceChildren(el('p', { class: 'alert alert--warning' }, text.loadError));
    },
  );

  function start(course, lesson) {
    const exercises = [...lesson.exercises, randomExercise(lesson)];
    const sessions = [];
    const counter = el('span', { class: 'tool tool--info' });
    const restartButton = el(
      'button',
      { type: 'button', class: 'button button--secondary button--small', onClick: () => start(course, lesson) },
      text.restartLesson,
    );

    view?.destroy();
    clearTimeout(pauseTimer);
    view = createPracticeView({
      title: text.lessonTitle(lesson.number, lesson.title),
      keyIndex: keyIndexes.find((index) => index.layout.id === profile.layoutId),
      keyIndexes,
      tools: [counter, restartButton],
      onFinish: (session) => {
        sessions.push(session);
        pauseTimer = setTimeout(() => {
          if (sessions.length < exercises.length) showExercise(sessions.length);
          else finish(course, lesson, sessions);
        }, PAUSE_BETWEEN_EXERCISES_MS);
      },
    });

    function showExercise(i) {
      counter.textContent = text.exerciseCounter(i + 1, exercises.length);
      view.setText(exercises[i], getLayout(course.layoutId).language);
    }

    container.replaceChildren(view.element);
    showExercise(0);
    view.focus();
  }

  function finish(course, lesson, sessions) {
    const stats = combineStats(sessions);
    const before = profiles.progressFor(profile.id, profile.layoutId).lessons?.[lesson.id];
    const progress = recordAttempt(
      profiles.progressFor(profile.id, profile.layoutId),
      lesson.id,
      { accuracy: stats.accuracy ?? 0, wpm: stats.wpm, durationMs: stats.durationMs },
      new Date().toISOString(),
    );
    profiles.saveProgress(profile.id, profile.layoutId, progress);

    view.destroy();
    view = null;
    const stars = starsFor(stats.accuracy ?? 0);
    const isRecord = before && stats.accuracy > before.bestAccuracy;
    container.replaceChildren(results({ course, lesson, stats, stars, isRecord, retry: () => start(course, lesson) }));
    container.querySelector('.results .button')?.focus();
    announce(`${stars > 0 ? text.passedTitle : text.failedTitle} ${text.stars(stars)}. ${text.accuracy(stats.accuracy ?? 0)}`);
  }

  return () => {
    left = true;
    clearTimeout(pauseTimer);
    view?.destroy();
  };
}

function results({ course, lesson, stats, stars, isRecord, retry }) {
  const passed = stars > 0;
  const next = course.next(lesson.id);
  const actions = [];
  if (passed && next) {
    actions.push(el('a', { class: 'button', href: `#/lecciones/${encodeURIComponent(next.id)}` }, text.nextLesson));
  }
  actions.push(
    el('button', { type: 'button', class: passed && next ? 'button button--secondary' : 'button', onClick: retry }, text.retry),
    el('a', { class: 'button button--secondary', href: '#/lecciones' }, text.backToMap),
  );

  return el(
    'section',
    { class: `results ${passed ? 'results--passed' : 'results--failed'}` },
    el(
      'div',
      { class: 'results__lesson' },
      el('span', { class: 'muted' }, text.lessonTitle(lesson.number, lesson.title)),
      renderKeycaps(lesson.newKeys, text.review),
    ),
    el('h1', {}, passed ? text.passedTitle : text.failedTitle),
    renderStars(stars, { large: true }),
    el(
      'p',
      { class: 'results__stats' },
      el('span', {}, text.accuracy(stats.accuracy ?? 0)),
      el('span', { class: 'only-adult' }, text.wpm(stats.wpm)),
    ),
    isRecord ? el('p', { class: 'results__record' }, text.newRecord) : null,
    el('p', {}, passed ? text.passedMessage(stars) : text.failedMessage(PASS_ACCURACY)),
    passed && !next ? el('p', { class: 'results__record' }, text.courseFinished) : null,
    el('div', { class: 'results__actions' }, actions),
  );
}

