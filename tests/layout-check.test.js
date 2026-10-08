import { test } from 'node:test';
import assert from 'node:assert/strict';
import { layouts } from '../js/layouts/index.js';
import { createKeyIndex } from '../js/keystrokes.js';
import { createLayoutInference, layoutsMatchingKey } from '../js/layout-check.js';

const keyIndexes = layouts.map(createKeyIndex);

test('calibration: key right of L tells ñ layouts from ; layouts', () => {
  assert.deepEqual(layoutsMatchingKey(keyIndexes, 'Semicolon', 'ñ'), ['es-latam']);
  assert.deepEqual(layoutsMatchingKey(keyIndexes, 'Semicolon', 'Ñ'), ['es-latam']); // CapsLock on
  assert.deepEqual(layoutsMatchingKey(keyIndexes, 'Semicolon', ';'), ['en-us']);
});

test('calibration: key left of Backspace separates Latin American, Spain and US', () => {
  assert.deepEqual(layoutsMatchingKey(keyIndexes, 'Equal', '¿'), ['es-latam']);
  assert.deepEqual(layoutsMatchingKey(keyIndexes, 'Equal', '¡'), []); // Spain: not supported
  assert.deepEqual(layoutsMatchingKey(keyIndexes, 'Equal', '='), ['en-us']);
});

test('calibration: a dead key matches layouts where that key is dead', () => {
  assert.deepEqual(layoutsMatchingKey(keyIndexes, 'BracketLeft', 'Dead'), ['es-latam']);
});

test('inference: typing on a Latin American OS with the US layout chosen suggests es-latam', () => {
  let last;
  const inference = createLayoutInference(keyIndexes, 'en-us', (result) => (last = result));
  const key = (code, k) => inference.observe({ code, key: k, shift: false, altGr: false, ctrl: false, meta: false });
  key('KeyA', 'a');
  assert.equal(last, undefined); // letters are the same in both layouts: no evidence
  key('Semicolon', 'ñ');
  key('Semicolon', 'ñ');
  assert.deepEqual(last, { status: 'mismatch', suggestedId: 'es-latam' });
});

test('inference: US-International dead quote is a mismatch with no suggestion', () => {
  let last;
  const inference = createLayoutInference(keyIndexes, 'en-us', (result) => (last = result));
  for (let i = 0; i < 2; i++) {
    inference.observe({ code: 'Quote', key: 'Dead', shift: false, altGr: false, ctrl: false, meta: false });
  }
  assert.deepEqual(last, { status: 'mismatch', suggestedId: null });
});

test('inference: a virtual keyboard is reported', () => {
  let last;
  const inference = createLayoutInference(keyIndexes, 'es-latam', (result) => (last = result));
  inference.observe({ code: '', key: 'Unidentified' });
  assert.equal(last.status, 'no-physical-keyboard');
});
