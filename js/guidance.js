// Works out which keys and fingers to light up for the next character.
//
// Returns { typable, targets } where each target is { code, finger, role, badge }:
//   role 'primary'   key to press now
//   role 'modifier'  key held together with the primary one (Shift, AltGr)
//   role 'secondary' key to press right after (the letter that follows a dead key)
//   role 'zone'      keys that belong to a finger (hands intro), shown without urgency
//   badge            1 / 2 to show the order when there are two steps, else null

// Lower is more urgent. A key or finger with two roles shows the most urgent one.
export const ROLE_RANK = { primary: 0, modifier: 1, secondary: 2, trouble: 3, zone: 4 };

export function guideFor(keyIndex, char, deadPending) {
  const strokes = char === undefined ? null : keyIndex.strokesFor(char);
  if (!strokes) return { typable: char === undefined, targets: [] };

  // Once the dead key of a composed character was pressed, only the rest remains.
  const remaining = deadPending && strokes[0].dead ? strokes.slice(1) : strokes;
  const twoSteps = remaining.length > 1;
  const targets = [];

  remaining.slice(0, 2).forEach((stroke, step) => {
    const isNow = step === 0;
    const badge = twoSteps ? step + 1 : null;
    targets.push(target(keyIndex, stroke.code, isNow ? 'primary' : 'secondary', badge));
    for (const code of keyIndex.modifiersFor(stroke)) {
      targets.push(target(keyIndex, code, isNow ? 'modifier' : 'secondary', null));
    }
  });

  return { typable: true, targets };
}

function target(keyIndex, code, role, badge) {
  return { code, finger: keyIndex.keysByCode.get(code)?.finger ?? null, role, badge };
}
