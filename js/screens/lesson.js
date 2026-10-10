// A lesson (#/lecciones/:id): its fixed exercises plus a random one, typed in a row on the
// practice view, then the results saved to the profile's progress. Kids get cheers, medals
// and confetti; adults get gross/net WPM and corrected/uncorrected errors.
// The first time in a course, the hands intro ("Posición de las manos") comes before.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { redirect } from '../router.js';
import { announce } from '../announcer.js';
import { profiles } from '../profiles.js';
import { layouts, getLayout } from '../layouts/index.js';
import { createKeyIndex } from '../keystrokes.js';
import { combineStats } from '../stats.js';
import {
  getCourse,
  lessonStates,
  recordAttempt,
  starsFor,
  nextStar,
  starGoals,
  speedTargets,
  exercisesFor,
  randomExerciseLength,
  PASS_ACCURACY,
} from '../course.js';
import { randomExercise } from '../exercise-generator.js';
import { createPracticeView } from '../practice-view.js';
import { renderStars, renderKeycaps, renderMedal } from '../lesson-badges.js';
import { newMedals } from '../achievements.js';
import { createSoundToggle } from '../sound-toggle.js';
import { launchConfetti } from '../confetti.js';
import { pickOne } from '../random.js';
import { isIntroDone } from '../hands-intro.js';
import { createHandsIntroView } from '../hands-intro-view.js';
import { saveIntroDone, introOptions } from './hands-intro.js';
import { handsOf } from '../hand-skins.js';
import { createVoice } from '../voice.js';

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
  let intro = null;
  const voice = createVoice();
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
      if (isIntroDone(profiles.progressFor(profile.id, profile.layoutId))) start(course, lesson);
      else showIntro(course, lesson);
    },
    () => {
      container.replaceChildren(el('p', { class: 'alert alert--warning' }, text.loadError));
    },
  );

  function showIntro(course, lesson) {
    intro = createHandsIntroView({
      keyIndex: keyIndexes.find((index) => index.layout.id === profile.layoutId),
      backHref: '#/lecciones',
      finishLabel: strings.handsIntro.startLesson,
      ...introOptions(profile),
      onDone: () => {
        saveIntroDone(profile);
        intro.destroy();
        intro = null;
        start(course, lesson);
      },
    });
    container.replaceChildren(intro.element);
    intro.start();
  }

  function start(course, lesson) {
    const mode = profiles.get(profile.id).mode;
    const exercises = [
      ...exercisesFor(lesson, mode),
      randomExercise(lesson, { length: randomExerciseLength(lesson, mode) }),
    ];
    const sessions = [];
    const counter = el('span', { class: 'tool tool--info' });
    const soundToggle = createSoundToggle(profile.id);
    soundToggle.classList.add('only-kids');
    const restartButton = el(
      'button',
      { type: 'button', class: 'button button--secondary button--small', onClick: () => start(course, lesson) },
      text.restartLesson,
    );

    view?.destroy();
    clearTimeout(pauseTimer);
    voice.stop();
    view = createPracticeView({
      title: text.lessonTitle(lesson.number, lesson.title),
      keyIndex: keyIndexes.find((index) => index.layout.id === profile.layoutId),
      keyIndexes,
      tools: [counter, soundToggle, restartButton],
      soundEnabled: () => profiles.get(profile.id)?.settings.sound ?? false,
      hands: handsOf(profiles.get(profile.id)),
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
    const now = new Date();
    const kids = profiles.get(profile.id).mode === 'kids';
    const targets = speedTargets(course, lesson, kids ? 'kids' : 'adult');
    const result = { accuracy: stats.accuracy ?? 0, wpm: stats.wpm };
    const progress = recordAttempt(
      profiles.progressFor(profile.id, profile.layoutId),
      lesson.id,
      { ...result, durationMs: stats.durationMs, keyStats: stats.keyStats },
      now.toISOString(),
      targets,
    );
    profiles.saveProgress(profile.id, profile.layoutId, progress);
    const medals = newMedals(profiles.get(profile.id), course, now);
    if (medals.length) profiles.awardMedals(profile.id, medals, now.toISOString());

    view.destroy();
    view = null;
    const stars = starsFor(result, targets);
    const goal = nextStar(result, targets);
    const goals = starGoals(result, targets);
    const isRecord = before && stats.accuracy > before.bestAccuracy;
    const sentence = text.resultVoice[stars === 0 ? 'failed' : (goal?.missing ?? 'perfect')];
    const say = () => voice.say([sentence]);
    const screen = results({ course, lesson, stats, stars, goal, goals, isRecord, kids, medals, sentence, say, retry: () => start(course, lesson) });
    container.replaceChildren(screen);
    container.querySelector('.results .button')?.focus();
    announce(screen.querySelector('h1').textContent);
    if (kids && stars > 0) launchConfetti();
    if (kids && profiles.get(profile.id).settings.voice) say();
  }

  return () => {
    left = true;
    clearTimeout(pauseTimer);
    intro?.destroy();
    view?.destroy();
    voice.stop();
  };
}

// "¿Cómo se ganan las estrellas?": each star, what it asks for in this lesson and whether
// it was earned or what was missing (for kids, in simple and positive words).
function starGoalsList(goals, kids) {
  const audience = kids ? 'kids' : 'adult';
  const goalText = text.starGoals;
  return el(
    'section',
    { class: 'star-goals', 'aria-labelledby': 'star-goals-title' },
    el('h2', { id: 'star-goals-title', class: 'star-goals__title' }, goalText.title),
    el(
      'ul',
      { class: 'star-goals__list' },
      goals.map(({ stars, accuracy, wpm, missing }) =>
        el(
          'li',
          { class: `star-goals__item${missing ? '' : ' star-goals__item--done'}` },
          renderStars(stars),
          el('span', { class: 'star-goals__needs' }, goalText.needs[audience](accuracy, wpm)),
          el('span', { class: 'star-goals__status' }, missing ? goalText.missing[audience][missing] : goalText.done),
        ),
      ),
    ),
  );
}

function medalsEarned(course, medals) {
  return el(
    'div',
    { class: 'results__medals' },
    el('p', { class: 'results__record' }, medals.length === 1 ? strings.medals.earnedNow : strings.medals.earnedNowMany),
    el('ul', { class: 'medal-list' }, medals.map((medalId) => el('li', {}, renderMedal(medalId, course, true)))),
  );
}

function results({ course, lesson, stats, stars, goal, goals, isRecord, kids, medals, sentence, say, retry }) {
  const passed = stars > 0;
  // Kids: varied, always positive words, and one sentence (the one the voice says). Adults: plain facts.
  const heading = kids ? pickOne(passed ? strings.encouragement.passed : strings.encouragement.retry) : passed ? text.passedTitle : text.failedTitle;
  const message = kids
    ? null
    : passed
      ? goal
        ? null // the star goals say what is missing
        : text.perfect
      : text.failedMessage(PASS_ACCURACY);
  const next = course.next(lesson.id);
  const actions = [];
  if (passed && next) {
    actions.push(el('a', { class: 'button', href: `#/lecciones/${encodeURIComponent(next.id)}` }, text.nextLesson));
  }
  actions.push(el('button', { type: 'button', class: passed && next ? 'button button--secondary' : 'button', onClick: retry }, text.retry));

  // Summary and buttons on the left, the star goals on the right: the next step is always in view.
  return el(
    'section',
    { class: `results ${passed ? 'results--passed' : 'results--failed'}` },
    el(
      'div',
      { class: 'results__summary' },
      el(
        'div',
        { class: 'results__lesson' },
        el('span', { class: 'muted' }, text.lessonTitle(lesson.number, lesson.title)),
        renderKeycaps(lesson.newKeys, text.review),
      ),
      el('h1', {}, heading),
      renderStars(stars, { large: true }),
      el(
        'p',
        { class: 'results__stats' },
        el('span', {}, text.accuracy(stats.accuracy ?? 0)),
        el('span', { class: 'only-adult' }, text.netWpm(stats.wpm)),
        el('span', { class: 'only-adult' }, text.grossWpm(stats.grossWpm)),
      ),
      el(
        'p',
        { class: 'results__details only-adult' },
        el('span', {}, text.correctedErrors(stats.correctedErrors)),
        el('span', {}, text.uncorrectedErrors(stats.uncorrectedErrors)),
      ),
      isRecord ? el('p', { class: 'results__record' }, text.newRecord) : null,
      message ? el('p', {}, message) : null,
      kids
        ? el(
            'p',
            { class: 'results__voice' },
            el('span', {}, sentence),
            el(
              'button',
              { type: 'button', class: 'button button--secondary button--small', onClick: say },
              el('span', { 'aria-hidden': 'true' }, '🔊 '),
              strings.handsIntro.listen,
            ),
          )
        : null,
      kids && medals.length ? medalsEarned(course, medals) : null,
      passed && !next ? el('p', { class: 'results__record' }, text.courseFinished) : null,
      el('div', { class: 'results__actions' }, actions),
      el('a', { href: '#/lecciones' }, text.backToMap),
    ),
    starGoalsList(goals, kids),
  );
}

