// "Mi progreso" (#/progreso): averages of the last sessions, lessons passed, streak, WPM
// chart, the keys with most errors (also on the keyboard) and, in kids mode, medals.
// A selector shows the progress of another layout.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { redirect } from '../router.js';
import { profiles } from '../profiles.js';
import { layouts, getLayout } from '../layouts/index.js';
import { createKeyIndex } from '../keystrokes.js';
import { getCourse, lessonStates } from '../course.js';
import { currentStreak, attemptDates, troubleKeys } from '../achievements.js';
import { createKeyboardView } from '../keyboard-view.js';
import { createWpmChart } from '../wpm-chart.js';
import { renderMedal } from '../lesson-badges.js';

const text = strings.progress;
const RECENT_SESSIONS = 10;
const CHART_SESSIONS = 30;
const TROUBLE_KEYS = 5;

export const title = text.title;

export function render(container) {
  const profile = profiles.active();
  if (!profile) {
    redirect('/');
    return;
  }

  const layoutSelect = el(
    'select',
    { id: 'progress-layout', onChange: () => show(layoutSelect.value) },
    layouts.map((layout) => el('option', { value: layout.id }, layout.name)),
  );
  layoutSelect.value = profile.layoutId;
  const content = el('div', { class: 'progress-content' });

  container.append(
    el('a', { class: 'back-link', href: '#/inicio' }, `← ${text.back}`),
    el('h1', {}, text.title),
    el('p', { class: 'muted' }, text.description),
    el('div', { class: 'field field--inline' }, el('label', { for: 'progress-layout' }, text.layoutLabel), layoutSelect),
    content,
  );

  // Course data loads asynchronously: ignore results that arrive after leaving the screen
  // or after switching to another layout.
  let left = false;
  let requested = null;

  function show(layoutId) {
    requested = layoutId;
    getCourse(layoutId).then(
      (course) => {
        if (left || requested !== layoutId) return;
        content.replaceChildren(...renderProgress(profiles.get(profile.id), layoutId, course));
      },
      () => {
        if (!left) content.replaceChildren(el('p', { class: 'alert alert--warning' }, strings.lessons.loadError));
      },
    );
  }

  show(profile.layoutId);
  return () => {
    left = true;
  };
}

function renderProgress(profile, layoutId, course) {
  const progress = profile.progress[layoutId] ?? {};
  const history = progress.history ?? [];
  const recent = history.slice(-RECENT_SESSIONS);
  const recentWithWpm = recent.filter((entry) => entry.wpm !== null);
  const average = (list, pick) => (list.length ? Math.round(list.reduce((sum, item) => sum + pick(item), 0) / list.length) : null);
  const states = lessonStates(course, progress, profile.mode);
  const passed = [...states.values()].filter((state) => state.status === 'completed').length;
  const streak = currentStreak(attemptDates(profile));

  const tiles = el(
    'ul',
    { class: 'stat-tiles' },
    statTile(text.avgWpm, average(recentWithWpm, (entry) => entry.wpm) ?? text.none, text.avgWpmHint),
    statTile(text.avgAccuracy, recent.length ? `${average(recent, (entry) => entry.accuracy)} %` : text.none, text.avgWpmHint),
    statTile(text.lessonsPassed, `${passed}/${course.lessons.length}`),
    statTile(text.streak, text.streakDays(streak), text.streakHint),
  );

  const chartSessions = history.filter((entry) => entry.wpm !== null).slice(-CHART_SESSIONS);
  const chart = chartSessions.length
    ? createWpmChart(chartSessions)
    : el('p', { class: 'muted' }, text.noSessions);

  return [
    tiles,
    el('section', { class: 'progress-section', 'aria-labelledby': 'chart-title' }, el('h2', { id: 'chart-title' }, text.chartTitle), chart),
    troubleSection(progress.keyStats ?? {}, layoutId),
    medalsSection(profile, course),
  ];
}

function statTile(label, value, hint) {
  return el(
    'li',
    { class: 'stat-tile' },
    el('span', { class: 'stat-tile__label' }, label),
    el('span', { class: 'stat-tile__value' }, String(value)),
    hint ? el('span', { class: 'stat-tile__hint' }, hint) : null,
  );
}

function troubleSection(keyStats, layoutId) {
  const chars = troubleKeys(keyStats, TROUBLE_KEYS);
  const heading = el(
    'h2',
    { id: 'trouble-title' },
    el('span', { class: 'only-adult' }, text.troubleTitle),
    el('span', { class: 'only-kids' }, text.troubleTitleKids),
  );
  if (!chars.length) {
    return el('section', { class: 'progress-section', 'aria-labelledby': 'trouble-title' }, heading, el('p', { class: 'muted' }, text.troubleNone));
  }

  const keyIndex = createKeyIndex(getLayout(layoutId));
  const keyboard = createKeyboardView(keyIndex.layout);
  // Rank badge on each character's main key; a key shared by two characters (a and á)
  // keeps the badge of the worse one.
  const targets = [];
  const badged = new Set();
  chars.forEach((char, rank) => {
    const strokes = keyIndex.strokesFor(char) ?? [];
    strokes.forEach((stroke, i) => {
      const isMain = i === strokes.length - 1 && !badged.has(stroke.code);
      if (isMain) badged.add(stroke.code);
      targets.push({ code: stroke.code, role: 'trouble', badge: isMain ? rank + 1 : null });
    });
  });
  keyboard.show(targets);

  return el(
    'section',
    { class: 'progress-section', 'aria-labelledby': 'trouble-title' },
    heading,
    el(
      'ol',
      { class: 'trouble-list' },
      chars.map((char) => {
        const [errors, attempts] = keyStats[char];
        const label = char === ' ' ? text.spaceKey : char;
        return el('li', {}, el('kbd', {}, label), ` ${text.troubleRate(Math.round((100 * errors) / attempts))}`);
      }),
    ),
    el('div', { class: 'progress-keyboard' }, keyboard.element),
  );
}

function medalsSection(profile, course) {
  const ids = [
    'first-lesson',
    'five-lessons',
    ...course.units.map((_, unitIndex) => `unit:${course.layoutId}:${unitIndex}`),
    'streak-3',
    'streak-7',
  ];
  return el(
    'section',
    { class: 'progress-section only-kids', 'aria-labelledby': 'medals-title' },
    el('h2', { id: 'medals-title' }, strings.medals.title),
    el('ul', { class: 'medal-list' }, ids.map((id) => el('li', {}, renderMedal(id, course, Boolean(profile.medals[id]))))),
  );
}

