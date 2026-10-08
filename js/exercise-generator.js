// The random exercise at the end of each lesson, different on every attempt so that
// repeating a lesson is practice, not memory. `random` is injectable for tests.

const TARGET_LENGTH = 48;
const MIN_WORDS = 4;
const MAX_PARTS = 40;

export function randomExercise(lesson, { random = Math.random, length = TARGET_LENGTH } = {}) {
  const pick = (list) => list[Math.floor(random() * list.length)];
  const nextPart =
    lesson.words.length >= MIN_WORDS ? () => pick(lesson.words) : () => letterGroup(lesson, pick, random);

  const parts = [];
  while (parts.length < MAX_PARTS) {
    let part = nextPart();
    if (part === parts.at(-1)) part = nextPart(); // avoid "sal sal" when possible
    if ([...parts, part].join(' ').length > length) break;
    parts.push(part);
  }
  return parts.join(' ');
}

// 2–4 letters, always including at least one of the lesson's new keys.
function letterGroup(lesson, pick, random) {
  const letters = lesson.allowedKeys.filter((key) => key !== ' ');
  const newKeys = lesson.newKeys.length ? lesson.newKeys : letters;
  const size = 2 + Math.floor(random() * 3);
  const group = Array.from({ length: size }, () => pick(random() < 0.6 ? newKeys : letters));
  if (!group.some((key) => newKeys.includes(key))) group[0] = pick(newKeys);
  return group.join('');
}
