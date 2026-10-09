// "Posición de las manos": the guided intro shown before the first lesson of a course.
// Pure logic: which steps there are and which keys each one lights up or asks for, all
// derived from the layout data (homeRow and each key's finger).
//
// Step shapes:
//   { id, highlight: { primary: [code], zone: [code] } }   explanation, advanced with a button
//   { id, sequence: [{ code, zone: [code], back }] }        press each key in order
//     (back: true when the finger returns to its home key)
//
// Progress: the course progress of a layout gets introCompletedAt (ISO date) once the
// intro is finished or skipped.

const INDEX_FINGERS = ['L2', 'R2'];

export function buildIntroSteps(keyIndex) {
  const { homeRow } = keyIndex.layout;
  const fingerOf = (code) => keyIndex.keysByCode.get(code).finger;
  const bumps = homeRow.filter((code) => INDEX_FINGERS.includes(fingerOf(code)));
  const restingKeys = [...homeRow, 'Space'];

  return [
    { id: 'fingers', highlight: { primary: [], zone: [] } },
    { id: 'home', highlight: { primary: bumps, zone: restingKeys } },
    { id: 'homeKeys', sequence: restingKeys.map((code) => ({ code, zone: restingKeys, back: false })) },
    {
      id: 'zones',
      sequence: homeRow.flatMap((home) => {
        const zone = zoneOf(keyIndex, fingerOf(home));
        const reach = keyAbove(keyIndex, home);
        return [
          { code: reach, zone, back: false },
          { code: home, zone, back: true },
        ];
      }),
    },
    { id: 'done', highlight: { primary: [], zone: [] } },
  ];
}

/** Every key pressed with a finger. */
export function zoneOf(keyIndex, finger) {
  return [...keyIndex.keysByCode.values()].filter((key) => key.finger === finger).map((key) => key.code);
}

/** The key of the same finger in the row above, closest to the home key horizontally. */
export function keyAbove(keyIndex, homeCode) {
  const { rows } = keyIndex.layout;
  const positions = keyPositions(rows);
  const rowIndex = rows.findIndex((row) => row.some((key) => key.code === homeCode));
  const finger = keyIndex.keysByCode.get(homeCode).finger;
  const homeCenter = positions.get(homeCode);
  const candidates = rows[rowIndex - 1].filter((key) => key.finger === finger);
  candidates.sort((a, b) => Math.abs(positions.get(a.code) - homeCenter) - Math.abs(positions.get(b.code) - homeCenter));
  return candidates[0].code;
}

// Horizontal center of every key, in key units from the keyboard's left edge.
function keyPositions(rows) {
  const positions = new Map();
  for (const row of rows) {
    let x = 0;
    for (const key of row) {
      const width = key.width ?? 1;
      if (key.code) positions.set(key.code, x + width / 2);
      x += width;
    }
  }
  return positions;
}

/** Targets for keyboard-view / hands-view: zone keys plus the key(s) to press now. */
export function introTargets(keyIndex, { primary = [], zone = [] }) {
  const target = (code, role) => ({ code, finger: keyIndex.keysByCode.get(code)?.finger ?? null, role, badge: null });
  return [...zone.filter((code) => !primary.includes(code)).map((code) => target(code, 'zone')), ...primary.map((code) => target(code, 'primary'))];
}

export const isIntroDone = (progress) => Boolean(progress?.introCompletedAt);

export function markIntroDone(progress, date) {
  return { ...progress, introCompletedAt: progress?.introCompletedAt ?? date };
}
