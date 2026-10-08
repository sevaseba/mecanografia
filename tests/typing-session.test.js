import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTypingSession } from '../js/typing-session.js';

test('advances on error by default (adult)', () => {
  const session = createTypingSession('Vi');
  assert.equal(session.type('v'), false);
  assert.equal(session.position, 1);
  assert.deepEqual(session.typed[0], { char: 'v', correct: false });
  assert.equal(session.mistakes, 1);
});

test('stays on the same character when advanceOnError is false (kids)', () => {
  const session = createTypingSession('Vi');
  assert.equal(session.type('v', { advanceOnError: false }), false);
  assert.equal(session.position, 0);
  assert.equal(session.typed.length, 0);
  assert.equal(session.mistakes, 1);
  assert.equal(session.keystrokes, 1);
  assert.equal(session.startedAt !== null, true);
  assert.equal(session.type('V', { advanceOnError: false }), true);
  assert.equal(session.position, 1);
  assert.equal(session.keystrokes, 2);
});

test('finishes only when the last character is right in kids mode', () => {
  const session = createTypingSession('a');
  session.type('s', { advanceOnError: false });
  assert.equal(session.done, false);
  assert.equal(session.finishedAt, null);
  session.type('a', { advanceOnError: false });
  assert.equal(session.done, true);
});

test('combined stats add up several exercises, ignoring the pauses between them', async () => {
  const { combineStats } = await import('../js/stats.js');
  let clock = 0;
  const now = () => clock;
  // Exercise 1: 5 keystrokes, one wrong left uncorrected; 6 s from first to last keystroke.
  const first = createTypingSession('abcde', { now });
  for (const char of 'abcdx') {
    first.type(char);
    clock += 1500;
  }
  clock = 100000; // a long pause before the next exercise does not count
  // Exercise 2: one error corrected with Backspace, then all right; 5 s.
  const second = createTypingSession('fghij', { now });
  for (const char of 'fz') {
    second.type(char);
    clock += 1000;
  }
  second.backspace();
  for (const char of 'ghij') {
    second.type(char);
    if (char !== 'j') clock += 1000;
  }
  const stats = combineStats([first, second]);
  assert.equal(stats.durationMs, 6000 + 5000);
  assert.equal(stats.uncorrectedErrors, 1);
  assert.equal(stats.correctedErrors, 1);
  assert.equal(stats.accuracy, 82); // 9 of 11 keystrokes right
  // gross: 11 keystrokes / 5 / (11 s) = 12 WPM; net: (11 / 5 - 1 uncorrected) / (11 s) = 6.5
  assert.equal(stats.grossWpm, 12);
  assert.equal(stats.wpm, 7);
  assert.deepEqual(stats.keyStats.e, [1, 1]);
  assert.deepEqual(stats.keyStats.g, [1, 2]);
  assert.deepEqual(stats.keyStats.a, [0, 1]);
});

test('net WPM never goes below zero', async () => {
  const { combineStats } = await import('../js/stats.js');
  let clock = 0;
  const session = createTypingSession('ab', { now: () => clock });
  session.type('x');
  clock = 3000;
  session.type('y');
  assert.equal(combineStats([session]).wpm, 0);
});

test('key tally counts attempts and errors per expected character', () => {
  const session = createTypingSession('ab', { now: () => 0 });
  session.type('x', { advanceOnError: false });
  session.type('a', { advanceOnError: false });
  session.type('b', { advanceOnError: false });
  assert.deepEqual(session.keyTally(), { a: [1, 2], b: [0, 1] });
});
