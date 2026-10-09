// Texts of the hands intro for one layout and audience ('kids' | 'adult'), step by step.
// The intro view shows them and tools/generate-voice.mjs records the kids ones, so both
// always use the very same sentences.

import { strings } from './strings.js';

const text = strings.handsIntro;

/**
 * @returns {{ steps: { title: string, body: string, instructions: string[] }[], miss: string }}
 *   instructions: one per key of a practice step, in order (empty for explanation steps).
 */
export function introCopy(keyIndex, steps, audience) {
  const label = (code) => keyLabel(keyIndex, code);
  const [left, right] = steps.find(({ id }) => id === 'home').highlight.primary.map(label);
  const homeRow = keyIndex.layout.homeRow.map(label).join(' ');

  return {
    steps: steps.map((step) => {
      const copy = text.steps[step.id];
      return {
        title: copy.title,
        body: copy[audience](left, right, homeRow),
        instructions: (step.sequence ?? []).map(({ code, back }) => {
          const { finger: fingerId } = keyIndex.keysByCode.get(code);
          const finger = audience === 'kids' ? text.kidsFingers[fingerId] : strings.fingers[fingerId];
          return (back ? text.backHome : text.pressKey)[audience](keyName(keyIndex, code), finger);
        }),
      };
    }),
    miss: text.miss[audience],
  };
}

// "la A", "la tecla ;", "la barra espaciadora".
function keyName(keyIndex, code) {
  if (code === 'Space') return text.spaceBar;
  const key = keyIndex.keysByCode.get(code);
  const isLetter = key.base !== key.shift && key.base.toUpperCase() === key.shift;
  return isLetter ? text.letter(key.shift) : text.otherKey(key.base);
}

// What is printed on the key: the capital for letters, the base character otherwise.
function keyLabel(keyIndex, code) {
  const key = keyIndex.keysByCode.get(code);
  return key.base.toUpperCase() === key.shift ? key.shift : key.base;
}

/** Every sentence the kids intro can say aloud on a layout (for recording the clips). */
export function spokenSentences(keyIndex, steps) {
  const { steps: copy, miss } = introCopy(keyIndex, steps, 'kids');
  return [...new Set([...copy.flatMap(({ body, instructions }) => [body, ...instructions]), miss])];
}
