import { test } from 'node:test';
import assert from 'node:assert/strict';
import { introCopy } from '../js/hands-intro-copy.js';
import { buildIntroSteps, keyAbove, zoneOf, introTargets, isIntroDone, markIntroDone } from '../js/hands-intro.js';
import { layouts, getLayout } from '../js/layouts/index.js';
import { createKeyIndex } from '../js/keystrokes.js';

const esLatam = createKeyIndex(getLayout('es-latam'));
const enUs = createKeyIndex(getLayout('en-us'));

for (const layout of layouts) {
  test(`${layout.id}: the home row has one key per finger, pinky to pinky`, () => {
    const keyIndex = createKeyIndex(layout);
    const fingers = layout.homeRow.map((code) => keyIndex.keysByCode.get(code)?.finger);
    assert.deepEqual(fingers, ['L5', 'L4', 'L3', 'L2', 'R2', 'R3', 'R4', 'R5']);
  });

  test(`${layout.id}: every key the intro asks for exists and stays in its finger's zone`, () => {
    const keyIndex = createKeyIndex(layout);
    for (const step of buildIntroSteps(keyIndex)) {
      for (const { code, zone } of step.sequence ?? []) {
        assert.ok(keyIndex.keysByCode.get(code)?.finger, `${step.id}: ${code}`);
        if (zone.length) assert.ok(zone.includes(code), `${step.id}: ${code} outside its zone`);
      }
    }
  });
}

test('es-latam: the home keys are a s d f j k l ñ and then the space bar', () => {
  const steps = buildIntroSteps(esLatam);
  const homeKeys = steps.find((step) => step.id === 'homeKeys').sequence.map(({ code }) => esLatam.charFor(code, 'base') ?? code);
  assert.deepEqual(homeKeys, ['a', 's', 'd', 'f', 'j', 'k', 'l', 'ñ', 'Space']);
});

test('the index fingers rest on the keys with bumps (F and J)', () => {
  const home = buildIntroSteps(enUs).find((step) => step.id === 'home');
  assert.deepEqual(home.highlight.primary, ['KeyF', 'KeyJ']);
});

test('each finger reaches up and comes back home', () => {
  const zones = buildIntroSteps(esLatam).find((step) => step.id === 'zones').sequence;
  const chars = zones.map(({ code }) => esLatam.charFor(code, 'base')).join('');
  assert.equal(chars, 'qawsedrfujikolpñ');
  assert.deepEqual(zones.map(({ back }) => back).slice(0, 2), [false, true]);
});

test('keyAbove picks the closest key of the same finger', () => {
  assert.equal(keyAbove(esLatam, 'KeyF'), 'KeyR');
  assert.equal(keyAbove(esLatam, 'KeyJ'), 'KeyU');
  assert.equal(keyAbove(enUs, 'Semicolon'), 'KeyP');
});

test('zoneOf lists every key of a finger', () => {
  assert.deepEqual(zoneOf(esLatam, 'L3').sort(), ['Digit3', 'KeyC', 'KeyD', 'KeyE']);
});

test('introTargets: primary keys win over zone keys', () => {
  const targets = introTargets(esLatam, { primary: ['KeyF'], zone: ['KeyF', 'KeyD'] });
  assert.deepEqual(
    targets.map(({ code, role, finger }) => [code, role, finger]),
    [
      ['KeyD', 'zone', 'L3'],
      ['KeyF', 'primary', 'L2'],
    ],
  );
});

test('marking the intro as done keeps the rest of the progress and the first date', () => {
  assert.equal(isIntroDone({}), false);
  assert.equal(isIntroDone(undefined), false);
  const progress = markIntroDone({ lessons: { a: {} } }, '2026-10-09T10:00:00.000Z');
  assert.deepEqual(progress, { lessons: { a: {} }, introCompletedAt: '2026-10-09T10:00:00.000Z' });
  assert.equal(markIntroDone(progress, '2027-01-01T00:00:00.000Z').introCompletedAt, '2026-10-09T10:00:00.000Z');
  assert.equal(isIntroDone(progress), true);
});

test('kids instructions name fingers by color, adults by name', () => {
  const steps = buildIntroSteps(esLatam);
  const instructions = (audience) => introCopy(esLatam, steps, audience).steps.flatMap(({ instructions: list }) => list);
  for (const sentence of instructions('kids')) {
    assert.doesNotMatch(sentence, /meñique|anular|mayor|índice|izquierd|derech/, sentence);
  }
  assert.equal(instructions('kids')[0], 'Apretá la A con el dedo rosa.');
  assert.equal(instructions('adult')[0], 'Presioná la A con el meñique izquierdo.');
});
