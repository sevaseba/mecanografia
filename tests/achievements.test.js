import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentStreak, newMedals, troubleKeys } from '../js/achievements.js';
import { buildCourse, exercisesFor } from '../js/course.js';

const course = buildCourse(
  {
    layout: 'es-latam',
    units: [
      { title: 'U1', lessons: ['a', 'b'] },
      { title: 'U2', lessons: ['c'] },
      { title: 'U3', lessons: ['d'] },
      { title: 'U4', lessons: ['e'] },
    ],
  },
  ['a', 'b', 'c', 'd', 'e'].map((id) => ({
    id,
    title: id,
    newKeys: [],
    exercises: ['fff jjj fff jjj fj jf ffj jjf fjf jfj fjf jfj fjf', 'corto'],
    words: [],
  })),
);

const day = (d) => new Date(2026, 9, d, 15, 0, 0);
const iso = (...days) => days.map((d) => day(d).toISOString());

test('streak counts consecutive local days ending today or yesterday', () => {
  const dates = iso(5, 6, 6, 7, 8);
  assert.equal(currentStreak(dates, day(8)), 4);
  assert.equal(currentStreak(dates, day(9)), 4); // yesterday still counts
  assert.equal(currentStreak(dates, day(10)), 0); // broken
  assert.equal(currentStreak([], day(8)), 0);
  assert.equal(currentStreak(iso(1, 3), day(3)), 1);
});

const profileWith = (passedByLayout, historyDates = [], medals = {}) => ({
  medals,
  progress: Object.fromEntries(
    Object.entries(passedByLayout).map(([layoutId, ids]) => [
      layoutId,
      {
        lessons: Object.fromEntries(ids.map((id) => [id, { stars: 1 }])),
        history: historyDates.map((date) => ({ date })),
      },
    ]),
  ),
});

test('medals: first lesson, five lessons, complete units, streaks', () => {
  assert.deepEqual(newMedals(profileWith({}), course, day(8)), []);
  assert.deepEqual(newMedals(profileWith({ 'es-latam': ['a'] }), course, day(8)), ['first-lesson']);
  assert.deepEqual(newMedals(profileWith({ 'es-latam': ['a', 'b'] }), course, day(8)).sort(), [
    'first-lesson',
    'unit:es-latam:0',
  ]);
  const five = profileWith({ 'es-latam': ['a', 'c'], 'en-us': ['x', 'y', 'z'] });
  assert.ok(newMedals(five, course, day(8)).includes('five-lessons'));
  const streak = profileWith({ 'es-latam': ['a'] }, iso(1, 2, 3));
  assert.deepEqual(newMedals(streak, course, day(3)).sort(), ['first-lesson', 'streak-3']);
});

test('medals already earned are not awarded again', () => {
  const profile = profileWith({ 'es-latam': ['a'] }, [], { 'first-lesson': 'T1' });
  assert.deepEqual(newMedals(profile, course, day(8)), []);
});

test('trouble keys: worst error rate with enough attempts, then most errors', () => {
  const keyStats = { a: [1, 50], s: [8, 20], d: [3, 30], f: [9, 9], ' ': [5, 100], j: [0, 40], k: [2, 12] };
  assert.deepEqual(troubleKeys(keyStats, 3), ['s', 'k', 'd']); // f has too few attempts to rank by rate
  assert.deepEqual(troubleKeys({ f: [3, 4], g: [1, 2] }, 5), ['f', 'g']); // not enough data: by errors
  assert.deepEqual(troubleKeys({}, 5), []);
});

test('kids mode trims exercises of the first three units to 40 characters at a word boundary', () => {
  const kids = exercisesFor(course.get('a'), 'kids');
  assert.ok(kids.every((text) => text.length <= 40), kids.join('|'));
  assert.equal(kids[0], 'fff jjj fff jjj fj jf ffj jjf fjf jfj');
  assert.equal(kids[1], 'corto');
  assert.equal(exercisesFor(course.get('e'), 'kids')[0].length, 49); // unit 4: full text
  assert.equal(exercisesFor(course.get('a'), 'adult')[0].length, 49);
});
