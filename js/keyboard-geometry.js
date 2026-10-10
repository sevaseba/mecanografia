// Where each key sits on the on-screen keyboard, in key units (1 = the side of a key).
// Mirrors keyboard.css: keys are separated by GAP and the board has a GAP of padding, so a
// key of width w advances w × (1 + GAP) and a row advances 1 + GAP.

export const GAP = 0.1;
const PITCH = 1 + GAP;

/** Centers of every key: Map code → { x, y, width } (x from the left edge, y from the top). */
export function keyCenters(layout) {
  const centers = new Map();
  layout.rows.forEach((row, rowIndex) => {
    let left = GAP;
    for (const key of row) {
      const width = key.width ?? 1;
      const span = width * PITCH - GAP;
      if (key.code) centers.set(key.code, { x: left + span / 2, y: GAP + rowIndex * PITCH + 0.5, width: span });
      left += width * PITCH;
    }
  });
  return centers;
}

/** Size of the whole board (keys, gaps and padding) in key units. */
export function boardSize(layout) {
  const rowWidth = (row) => row.reduce((sum, key) => sum + (key.width ?? 1) * PITCH, 0) + GAP;
  return { width: Math.max(...layout.rows.map(rowWidth)), height: GAP + layout.rows.length * PITCH };
}
