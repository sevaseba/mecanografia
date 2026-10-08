// Small visual pieces shared by the lesson map and the results: stars and keycaps.

import { el } from './dom.js';
import { strings } from './strings.js';

const MAX_STARS = 3;
const MAX_KEYCAPS = 6;

export function renderStars(count, { large = false } = {}) {
  return el(
    'span',
    { class: large ? 'stars stars--large' : 'stars', role: 'img', 'aria-label': strings.lessons.stars(count) },
    Array.from({ length: MAX_STARS }, (_, i) =>
      el('span', { class: i < count ? 'star star--on' : 'star' }, i < count ? '★' : '☆'),
    ),
  );
}

/** The lesson's new keys as little keycaps; a review lesson (no new keys) shows a label. */
export function renderKeycaps(keys, reviewLabel) {
  if (!keys.length) return el('span', { class: 'keycaps keycaps--review' }, reviewLabel);
  const shown = keys.slice(0, MAX_KEYCAPS);
  return el(
    'span',
    { class: 'keycaps' },
    el('span', { class: 'visually-hidden' }, `${strings.lessons.newKeysLabel}: ${keys.join(' ')}`),
    shown.map((key) => el('kbd', { 'aria-hidden': 'true' }, key)),
    keys.length > MAX_KEYCAPS ? el('span', { 'aria-hidden': 'true' }, '…') : null,
  );
}
