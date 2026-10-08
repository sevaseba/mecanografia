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
