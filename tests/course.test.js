import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildCourse, starsFor, lessonStates, recordAttempt, HISTORY_LIMIT } from '../js/course.js';
import { randomExercise } from '../js/exercise-generator.js';
import { layouts } from '../js/layouts/index.js';
import { createKeyIndex } from '../js/keystrokes.js';

const readJson = (path) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));

function loadCourseFromDisk(layoutId) {
  const index = readJson(`lessons/${layoutId}/index.json`);
  const lessons = index.units.flatMap((unit) => unit.lessons).map((id) => readJson(`lessons/${layoutId}/${id}.json`));
  return buildCourse(index, lessons);
}

const tinyCourse = buildCourse(
  { layout: 'es-latam', units: [{ title: 'U1', lessons: ['a', 'b'] }, { title: 'U2', lessons: ['c'] }] },
  [
    { id: 'a', title: 'A', newKeys: ['f', 'j'], exercises: ['fj'], words: [] },
    { id: 'b', title: 'B', newKeys: ['d', 'k'], exercises: ['dk'], words: [] },
    { id: 'c', title: 'C', newKeys: ['s'], exercises: ['s'], words: [] },
  ],
);

// --- Content: the real lesson files ---

for (const layout of layouts) {
  test(`${layout.id}: every lesson only uses keys taught so far and is typable`, () => {
    const course = loadCourseFromDisk(layout.id);
    const keyIndex = createKeyIndex(layout);
    assert.ok(course.lessons.length > 10);
    const ids = new Set();
    for (const lesson of course.lessons) {
      assert.ok(!ids.has(lesson.id), `duplicate id ${lesson.id}`);
      ids.add(lesson.id);
      assert.ok(lesson.exercises.length >= 3, `${lesson.id} needs at least 3 exercises`);
      const allowed = new Set(lesson.allowedKeys);
      for (const text of [...lesson.exercises, ...lesson.words]) {
        for (const char of text) {
          assert.ok(allowed.has(char), `${lesson.id}: "${char}" in "${text}" is not taught yet`);
          assert.ok(keyIndex.strokesFor(char), `${lesson.id}: "${char}" cannot be typed on ${layout.id}`);
        }
      }
    }
  });
}

test('es-latam starts with the home row including ñ; en-us with ;', () => {
  const homeRow = (layoutId) => loadCourseFromDisk(layoutId).lessons.slice(0, 5).flatMap((lesson) => lesson.newKeys).sort().join('');
  assert.equal(homeRow('es-latam'), 'adfjklsñ');
  assert.equal(homeRow('en-us'), ';adfjkls');
});

// --- Rules ---

test('lessons are numbered in order and know their allowed keys', () => {
  assert.deepEqual(tinyCourse.lessons.map((lesson) => lesson.number), [1, 2, 3]);
  assert.deepEqual(tinyCourse.get('b').allowedKeys.sort(), [' ', 'd', 'f', 'j', 'k']);
  assert.equal(tinyCourse.get('zzz'), null);
});

test('stars: 90 / 95 / 98 % accuracy', () => {
  assert.equal(starsFor(89.9), 0);
  assert.equal(starsFor(90), 1);
  assert.equal(starsFor(95), 2);
  assert.equal(starsFor(97.9), 2);
  assert.equal(starsFor(98), 3);
  assert.equal(starsFor(100), 3);
});

test('kids: lessons open one by one; adult: all open; recommended is the first not passed', () => {
  const progress = { lessons: { a: { stars: 2 } } };
  const kids = lessonStates(tinyCourse, progress, 'kids');
  assert.deepEqual(
    tinyCourse.lessons.map((lesson) => kids.get(lesson.id).status),
    ['completed', 'available', 'locked'],
  );
  assert.equal(kids.get('b').recommended, true);
  assert.equal(kids.get('a').stars, 2);

  const adult = lessonStates(tinyCourse, progress, 'adult');
  assert.deepEqual(
    tinyCourse.lessons.map((lesson) => adult.get(lesson.id).status),
    ['completed', 'available', 'available'],
  );
  assert.equal(adult.get('b').recommended, true);
});

test('a failed attempt does not unlock the next lesson in kids mode', () => {
  const progress = recordAttempt({}, 'a', { accuracy: 80, wpm: 5, durationMs: 1000 }, '2026-10-08T00:00:00Z');
  assert.equal(lessonStates(tinyCourse, progress, 'kids').get('b').status, 'locked');
});

test('recordAttempt keeps the best result, counts attempts and appends history', () => {
  let progress = {};
  progress = recordAttempt(progress, 'a', { accuracy: 96, wpm: 20, durationMs: 5000 }, 'T1');
  progress = recordAttempt(progress, 'a', { accuracy: 91, wpm: 25, durationMs: 4000 }, 'T2');
  assert.deepEqual(progress.lessons.a, { stars: 2, bestAccuracy: 96, bestWpm: 25, attempts: 2, completedAt: 'T1' });
  assert.equal(progress.history.length, 2);
  assert.deepEqual(progress.history[1], { lessonId: 'a', date: 'T2', wpm: 25, accuracy: 91, durationMs: 4000, stars: 1 });
});

test('a lesson is completed only when passed; history is capped', () => {
  let progress = recordAttempt({}, 'a', { accuracy: 50, wpm: null, durationMs: 1 }, 'T1');
  assert.equal(progress.lessons.a.completedAt, null);
  assert.equal(progress.lessons.a.bestWpm, 0);
  for (let i = 0; i < HISTORY_LIMIT + 5; i++) progress = recordAttempt(progress, 'a', { accuracy: 99, wpm: 1, durationMs: 1 }, `T${i}`);
  assert.equal(progress.history.length, HISTORY_LIMIT);
  assert.equal(progress.lessons.a.completedAt, 'T0');
});

// --- Random exercise ---

const seeded = (seed) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

test('random exercise uses lesson words when there are enough', () => {
  const lesson = { newKeys: ['g', 'h'], allowedKeys: [' ', 'g', 'h', 'a'], words: ['gas', 'haga', 'hada', 'gala', 'ah'] };
  const text = randomExercise(lesson, { random: seeded(7) });
  assert.ok(text.length > 20 && text.length <= 48, text);
  for (const word of text.split(' ')) assert.ok(lesson.words.includes(word), word);
  assert.notEqual(text, randomExercise(lesson, { random: seeded(8) }));
});

test('random exercise builds letter groups with the new keys when there are no words', () => {
  const lesson = { newKeys: ['d', 'k'], allowedKeys: [' ', 'f', 'j', 'd', 'k'], words: [] };
  const text = randomExercise(lesson, { random: seeded(3) });
  for (const group of text.split(' ')) {
    assert.ok(/^[fjdk]{2,4}$/.test(group), group);
    assert.ok(/[dk]/.test(group), `"${group}" has no new key`);
  }
});

test('random exercise for a review lesson (no new keys) uses its words', () => {
  const lesson = { newKeys: [], allowedKeys: [' ', 'a', 's', 'l'], words: ['las', 'sal', 'ala', 'sala'] };
  assert.ok(randomExercise(lesson, { random: seeded(1) }).length > 0);
});
