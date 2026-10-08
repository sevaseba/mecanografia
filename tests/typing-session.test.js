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
  const first = createTypingSession('ab', { now });
  first.type('a');
  clock = 6000;
  first.type('x'); // wrong, 6 s
  clock = 100000; // a long pause before the next exercise
  const second = createTypingSession('cd', { now });
  second.type('c');
  clock = 106000;
  second.type('d'); // 6 s
  const stats = combineStats([first, second]);
  assert.equal(stats.accuracy, 75); // 3 of 4 keystrokes right
  assert.equal(stats.durationMs, 12000);
  assert.equal(stats.wpm, 3); // 3 correct chars / 5 / 0.2 min
});
