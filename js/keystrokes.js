// Maps characters to the physical key strokes that produce them on a layout, and back.
//
// A stroke is { code, layer, dead }: the physical key, the layer ('base' | 'shift' | 'altGr')
// and whether that key+layer is a dead key. "á" on es-latam is two strokes: ´ (dead) then a.

const LAYERS = ['base', 'shift', 'altGr'];

const SPECIAL_CHARS = {
  ' ': { code: 'Space', layer: 'base', dead: false },
  '\n': { code: 'Enter', layer: 'base', dead: false },
};

export function createKeyIndex(layout) {
  const keysByCode = new Map();
  const directStrokes = new Map();
  const deadStrokes = new Map();

  for (const row of layout.rows) {
    for (const key of row) {
      if (!key.code) continue;
      keysByCode.set(key.code, key);
      for (const layer of LAYERS) {
        const char = key[layer];
        if (!char) continue;
        const dead = key.dead?.includes(layer) ?? false;
        const target = dead ? deadStrokes : directStrokes;
        if (!target.has(char)) target.set(char, { code: key.code, layer, dead });
      }
    }
  }

  const altGraphKey = [...keysByCode.values()].find((key) => key.altGraph);
  const cache = new Map();

  /** Strokes needed to type `char`, or null if the layout cannot produce it. */
  function strokesFor(char) {
    if (!cache.has(char)) cache.set(char, computeStrokes(char));
    return cache.get(char);
  }

  function computeStrokes(char) {
    if (SPECIAL_CHARS[char]) return [SPECIAL_CHARS[char]];
    if (directStrokes.has(char)) return [directStrokes.get(char)];

    for (const [deadChar, compositions] of Object.entries(layout.deadKeys)) {
      const deadStroke = deadStrokes.get(deadChar);
      if (!deadStroke) continue;
      const follower = Object.keys(compositions).find((key) => compositions[key] === char);
      if (follower) {
        const followerStrokes = strokesFor(follower);
        if (followerStrokes) return [deadStroke, ...followerStrokes];
      }
    }

    // A dead character on its own: dead key followed by space.
    if (deadStrokes.has(char)) return [deadStrokes.get(char), SPECIAL_CHARS[' ']];
    return null;
  }

  /** Character a key produces on a layer (undefined if none). */
  function charFor(code, layer) {
    return keysByCode.get(code)?.[layer];
  }

  function isDead(code, layer) {
    return keysByCode.get(code)?.dead?.includes(layer) ?? false;
  }

  /** Modifier keys to hold for a stroke. Shift goes on the hand opposite to the key's finger. */
  function modifiersFor(stroke) {
    if (stroke.layer === 'shift') {
      const finger = keysByCode.get(stroke.code)?.finger ?? '';
      return [finger.startsWith('L') ? 'ShiftRight' : 'ShiftLeft'];
    }
    if (stroke.layer === 'altGr') return altGraphKey ? [altGraphKey.code] : [];
    return [];
  }

  return { layout, keysByCode, strokesFor, charFor, isDead, modifiersFor };
}
