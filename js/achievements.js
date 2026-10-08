// Streaks, medals and trouble keys. Pure functions over a profile's saved progress.

const STREAK_MEDALS = [
  ['streak-3', 3],
  ['streak-7', 7],
];
const FIVE_LESSONS = 5;
const MIN_ATTEMPTS_FOR_RATE = 10;

/** Medal catalog (names live in strings.js). Unit medals: 'unit:<layoutId>:<unitIndex>'. */
export const MEDAL_ICONS = {
  'first-lesson': '🥉',
  'five-lessons': '🥈',
  unit: '🏅',
  'streak-3': '🔥',
  'streak-7': '🏆',
};

export const medalIcon = (medalId) => MEDAL_ICONS[medalId.startsWith('unit:') ? 'unit' : medalId];

/**
 * Days in a row (local time) with at least one lesson attempt, counting back from today
 * or, if nothing was done today yet, from yesterday.
 */
export function currentStreak(isoDates, today = new Date()) {
  const days = new Set(isoDates.map((date) => dayKey(new Date(date))));
  const cursor = new Date(today);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** All lesson attempt dates of a profile, in every layout. */
export function attemptDates(profile) {
  return Object.values(profile.progress ?? {}).flatMap((progress) => (progress.history ?? []).map((entry) => entry.date));
}

/** Medals the profile has just earned (not in profile.medals yet), given the current course. */
export function newMedals(profile, course, today = new Date()) {
  const passedIn = (layoutId) =>
    new Set(
      Object.entries(profile.progress?.[layoutId]?.lessons ?? {})
        .filter(([, result]) => result.stars > 0)
        .map(([id]) => id),
    );
  const totalPassed = Object.keys(profile.progress ?? {}).reduce((sum, layoutId) => sum + passedIn(layoutId).size, 0);
  const passedHere = passedIn(course.layoutId);
  const streak = currentStreak(attemptDates(profile), today);

  const earned = [];
  if (totalPassed >= 1) earned.push('first-lesson');
  if (totalPassed >= FIVE_LESSONS) earned.push('five-lessons');
  course.units.forEach((unit, unitIndex) => {
    if (unit.lessons.every((lesson) => passedHere.has(lesson.id))) earned.push(`unit:${course.layoutId}:${unitIndex}`);
  });
  for (const [medalId, days] of STREAK_MEDALS) if (streak >= days) earned.push(medalId);

  return earned.filter((medalId) => !profile.medals?.[medalId]);
}

/**
 * The characters that cost the most: worst error rate among those with enough attempts,
 * then (if there are fewer than `count`) the ones with most errors.
 * keyStats: { char: [errors, attempts] }
 */
export function troubleKeys(keyStats, count = 5) {
  const withErrors = Object.entries(keyStats).filter(([, [errors]]) => errors > 0);
  const byRate = withErrors
    .filter(([, [, attempts]]) => attempts >= MIN_ATTEMPTS_FOR_RATE)
    .sort(([, [e1, a1]], [, [e2, a2]]) => e2 / a2 - e1 / a1 || e2 - e1);
  const byErrors = withErrors
    .filter(([char]) => !byRate.some(([ranked]) => ranked === char))
    .sort(([, [e1]], [, [e2]]) => e2 - e1);
  return [...byRate, ...byErrors].slice(0, count).map(([char]) => char);
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
