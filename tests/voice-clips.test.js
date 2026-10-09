import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clipName, spokenText } from '../js/voice-clips.js';
import { spokenSentences } from '../js/hands-intro-copy.js';
import { buildIntroSteps } from '../js/hands-intro.js';
import { layouts } from '../js/layouts/index.js';
import { createKeyIndex } from '../js/keystrokes.js';

test('clip names are plain file names derived from the sentence', () => {
  assert.equal(clipName('Apretá la Ñ con el meñique derecho.'), 'apreta-la-enye-con-el-menyique-derecho.mp3');
  assert.equal(clipName('¡Volvé a la tecla ;!'), 'volve-a-la-tecla-punto-y-coma.mp3');
});

test('symbols and lone letters are read aloud by their Spanish name', () => {
  assert.equal(spokenText('Apretá la tecla ; con el meñique derecho.'), 'Apretá la tecla punto y coma con el meñique derecho.');
  assert.equal(spokenText('Poné los índices en la F y la J: tienen una rayita.'), 'Poné los índices en la efe y la jota: tienen una rayita.');
  assert.equal(spokenText('¡Volvé a la W!'), '¡Volvé a la doble ve!');
  assert.equal(spokenText('Apretá la tecla que brilla.'), 'Apretá la tecla que brilla.');
});

test('different sentences never share a clip', () => {
  const byClip = new Map();
  for (const layout of layouts) {
    const keyIndex = createKeyIndex(layout);
    for (const sentence of spokenSentences(keyIndex, buildIntroSteps(keyIndex))) {
      const name = clipName(sentence);
      assert.ok(!byClip.has(name) || byClip.get(name) === sentence, `${name}: «${byClip.get(name)}» / «${sentence}»`);
      byClip.set(name, sentence);
    }
  }
  assert.ok(byClip.size > 20);
});
