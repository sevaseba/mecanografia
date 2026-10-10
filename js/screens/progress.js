// "Mi progreso" (#/progreso): averages of the last sessions, lessons passed, streak, WPM
// chart, the keys with most errors (also on the keyboard) and, in kids mode, medals.
// A selector shows the progress of another layout.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { redirect } from '../router.js';
import { profiles } from '../profiles.js';
import { layouts, getLayout } from '../layouts/index.js';
import { createKeyIndex } from '../keystrokes.js';
import { getCourse } from '../course.js';
import { troubleKeys } from '../achievements.js';
import { summarizeProgress } from '../progress-summary.js';
import { createKeyboardView } from '../keyboard-view.js';
import { createWpmChart } from '../wpm-chart.js';
import { renderMedal } from '../lesson-badges.js';

const text = strings.progress;
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
    el(
      'nav',
      { class: 'screen-links', 'aria-label': strings.appName },
      el('a', { href: '#/inicio' }, `← ${text.back}`),
      el('a', { href: '#/lecciones' }, strings.lessons.backToMap),
    ),
    // The layout selector is rarely used: beside the title, not before the numbers.
    el(
      'div',
      { class: 'progress-header' },
      el('h1', {}, text.title),
      el('div', { class: 'field field--inline' }, el('label', { for: 'progress-layout' }, text.layoutLabel), layoutSelect),
    ),
    el('p', { class: 'muted' }, text.description),
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
  const summary = summarizeProgress(profile, layoutId, course);
  const kids = profile.mode === 'kids';

  const tiles = el(
    'ul',
    { class: 'stat-tiles' },
    statTile(kids ? text.avgWpmKids : text.avgWpm, summary.avgWpm ?? text.none, text.avgWpmHint),
    statTile(text.avgAccuracy, summary.avgAccuracy === null ? text.none : `${summary.avgAccuracy} %`, text.avgWpmHint),
    statTile(text.lessonsPassed, `${summary.passed}/${summary.total}`),
    statTile(text.streak, text.streakDays(summary.streak), text.streakHint),
  );

  const chartSessions = history.filter((entry) => entry.wpm !== null).slice(-CHART_SESSIONS);
  const chart = chartSessions.length
    ? createWpmChart(chartSessions)
    : el('p', { class: 'muted' }, text.noSessions);

  const chartSection = el(
    'section',
    { class: 'progress-section', 'aria-labelledby': 'chart-title' },
    el('h2', { id: 'chart-title' }, kids ? text.chartTitleKids : text.chartTitle),
    chart,
  );
  const trouble = troubleSection(progress.keyStats ?? {}, layoutId);
  // Kids: the medals first, they are what they come to see.
  return kids ? [medalsSection(profile, course), tiles, trouble, chartSection] : [tiles, chartSection, trouble];
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
    { class: 'progress-section', 'aria-labelledby': 'medals-title' },
    el('h2', { id: 'medals-title' }, strings.medals.title),
    el('ul', { class: 'medal-list' }, ids.map((id) => el('li', {}, renderMedal(id, course, Boolean(profile.medals[id]))))),
  );
}

