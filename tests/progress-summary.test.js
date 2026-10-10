import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeProgress, RECENT_SESSIONS } from '../js/progress-summary.js';
import { buildCourse } from '../js/course.js';

const course = buildCourse(
  { layout: 'es-latam', units: [{ title: 'U1', lessons: ['a', 'b', 'c'] }] },
  ['a', 'b', 'c'].map((id) => ({ id, title: id, newKeys: [], exercises: ['fj'], words: [] })),
);

const day = (d) => new Date(2026, 9, d, 15, 0, 0);
const session = (d, wpm, accuracy) => ({ date: day(d).toISOString(), wpm, accuracy });
const profile = (progress) => ({ mode: 'kids', progress: { 'es-latam': progress } });

test('a profile without sessions: no averages, nothing passed', () => {
  assert.deepEqual(summarizeProgress(profile({}), 'es-latam', course, day(10)), {
    avgWpm: null,
    avgAccuracy: null,
    passed: 0,
    total: 3,
    stars: 0,
    streak: 0,
  });
});

test('averages the last sessions (sessions without WPM only count for accuracy), stars and streak', () => {
  const old = Array.from({ length: RECENT_SESSIONS }, () => session(1, 100, 50));
  const summary = summarizeProgress(
    profile({
      lessons: { a: { stars: 3 }, b: { stars: 1 } },
      history: [...old, session(9, 10, 90), session(10, null, 100), session(10, 20, 95)].slice(-RECENT_SESSIONS - 3),
    }),
    'es-latam',
    course,
    day(10),
  );
  // The last 10 sessions: 7 old ones (100 PPM, 50 %) and the 3 new ones.
  assert.equal(summary.avgWpm, Math.round((7 * 100 + 10 + 20) / 9));
  assert.equal(summary.avgAccuracy, Math.round((7 * 50 + 90 + 100 + 95) / 10));
  assert.equal(summary.passed, 2);
  assert.equal(summary.stars, 4);
  assert.equal(summary.streak, 2);
});
