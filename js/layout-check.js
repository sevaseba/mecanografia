// Detects whether the operating system keyboard layout matches the one chosen in the app.
//
// 1. detectSystemLayout(): Keyboard Map API (Chromium only). getLayoutMap() returns the
//    base-layer character of each physical key; dead keys come back as their spacing
//    character (es-latam BracketLeft → "´"), never as "Dead".
// 2. createLayoutInference(): works everywhere. While the user types, compares the
//    character each physical key produced with what the chosen layout would produce.
//    Only keys that tell layouts apart count as evidence (letters are the same in all).

const MATCH_THRESHOLD = 0.95;
const MIN_MISMATCHES = 2;
const WINDOW_SIZE = 8;
const DEAD = 'Dead';

/**
 * @returns {Promise<{ supported: boolean, layoutId?: string|null }>}
 *   layoutId is null when the system layout is none of the registered ones.
 */
export async function detectSystemLayout(keyIndexes) {
  if (!navigator.keyboard?.getLayoutMap) return { supported: false };
  let systemMap;
  try {
    systemMap = await navigator.keyboard.getLayoutMap();
  } catch {
    return { supported: false };
  }

  let best = { layoutId: null, score: 0 };
  for (const index of keyIndexes) {
    let compared = 0;
    let matched = 0;
    for (const [code, key] of index.keysByCode) {
      if (!key.base || !systemMap.has(code)) continue;
      compared += 1;
      if (sameChar(systemMap.get(code), key.base)) matched += 1;
    }
    const score = compared ? matched / compared : 0;
    if (score > best.score) best = { layoutId: index.layout.id, score };
  }
  return { supported: true, layoutId: best.score >= MATCH_THRESHOLD ? best.layoutId : null };
}

/**
 * onChange receives { status: 'unknown' | 'ok' | 'mismatch' | 'no-physical-keyboard', suggestedId }.
 */
export function createLayoutInference(keyIndexes, selectedId, onChange) {
  // Recent informative observations: { isMatch, explainedBy: Set<layoutId> }.
  // A sliding window adapts if the user switches the OS layout mid-session.
  let recent = [];
  let lastReport = '';

  const report = (status, suggestedId = null) => {
    const signature = `${status}:${suggestedId}`;
    if (signature === lastReport) return;
    lastReport = signature;
    onChange({ status, suggestedId });
  };

  const selected = () => keyIndexes.find((index) => index.layout.id === selectedId);

  function observe({ code, key, shift, altGr, ctrl, meta }) {
    if (!code || key === 'Unidentified') {
      report('no-physical-keyboard');
      return;
    }
    if ((ctrl || meta) && !altGr) return; // shortcuts
    if (key !== DEAD && [...key].length !== 1) return; // modifiers, arrows, Backspace…

    const layer = altGr ? 'altGr' : shift ? 'shift' : 'base';
    const expectedBy = (index) => (index.isDead(code, layer) ? DEAD : index.charFor(code, layer));
    const expected = expectedBy(selected());
    if (expected === undefined) return; // key or layer unknown in the chosen layout

    const others = keyIndexes.filter((index) => index.layout.id !== selectedId);
    const isMatch = sameChar(key, expected);
    const isInformative = !isMatch || others.some((index) => !sameChar(expectedBy(index), expected));
    if (!isInformative) return;

    const explainedBy = new Set(
      others.filter((index) => sameChar(key, expectedBy(index))).map((index) => index.layout.id),
    );
    recent = [...recent, { isMatch, explainedBy }].slice(-WINDOW_SIZE);

    const misses = recent.filter((observation) => !observation.isMatch);
    if (misses.length >= MIN_MISMATCHES && misses.length > recent.length - misses.length) {
      const suggested = others.find((index) =>
        misses.every((observation) => observation.explainedBy.has(index.layout.id)),
      );
      report('mismatch', suggested?.layout.id ?? null);
    } else {
      report('ok');
    }
  }

  function reset(newSelectedId) {
    selectedId = newSelectedId;
    recent = [];
    lastReport = '';
    report('unknown');
  }

  return { observe, reset };
}

// Case-insensitive so CapsLock does not count as a layout difference.
function sameChar(a, b) {
  return a !== undefined && b !== undefined && a.toLowerCase() === b.toLowerCase();
}
