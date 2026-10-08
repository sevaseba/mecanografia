// Courses: one per layout, loaded from lessons/<layoutId>/. Lesson rules (stars, unlocking,
// recommended lesson) and progress updates are pure functions.
//
// Progress per profile and layout (profile.progress[layoutId]):
// { lessons: { [lessonId]: { stars, bestAccuracy, bestWpm, attempts, completedAt } },
//   history: [{ lessonId, date, wpm, accuracy, durationMs, stars }] }   // last HISTORY_LIMIT

export const HISTORY_LIMIT = 200;
const STAR_THRESHOLDS = [90, 95, 98]; // accuracy % for 1, 2 and 3 stars; 1 star = passed
const KIDS_SHORT_UNITS = 3; // in kids mode, exercises of the first units are kept short…
const KIDS_SHORT_LENGTH = 40; // …at most this many characters

const courses = new Map(); // layoutId → Promise<course>

/** Loads (once) the course for a layout. */
export function getCourse(layoutId) {
  if (!courses.has(layoutId)) {
    const loading = loadCourse(layoutId).catch((error) => {
      courses.delete(layoutId); // allow retrying
      throw error;
    });
    courses.set(layoutId, loading);
  }
  return courses.get(layoutId);
}

async function loadCourse(layoutId) {
  const base = `./lessons/${layoutId}/`;
  const index = await fetchJson(`${base}index.json`);
  const ids = index.units.flatMap((unit) => unit.lessons);
  const lessons = await Promise.all(ids.map((id) => fetchJson(`${base}${id}.json`)));
  return buildCourse(index, lessons);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response.json();
}

/**
 * Numbers the lessons and works out the keys allowed in each one: space plus every key
 * introduced in that lesson or before.
 */
export function buildCourse(index, lessons) {
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const allowed = new Set([' ']);
  const ordered = [];
  const units = index.units.map((unit, unitIndex) => ({
    title: unit.title,
    lessons: unit.lessons.map((id) => {
      const lesson = byId.get(id);
      lesson.newKeys.forEach((key) => allowed.add(key));
      const entry = { ...lesson, number: ordered.length + 1, unitIndex, allowedKeys: [...allowed] };
      ordered.push(entry);
      return entry;
    }),
  }));
  return {
    layoutId: index.layout,
    units,
    lessons: ordered,
    get: (id) => ordered.find((lesson) => lesson.id === id) ?? null,
    next: (id) => ordered[ordered.findIndex((lesson) => lesson.id === id) + 1] ?? null,
  };
}

/** The lesson's fixed exercises for a mode: kids get short texts in the first units. */
export function exercisesFor(lesson, mode) {
  return isShortForKids(lesson, mode)
    ? lesson.exercises.map((text) => trimToWords(text, KIDS_SHORT_LENGTH))
    : lesson.exercises;
}

/** Length for the random exercise, consistent with exercisesFor (undefined = default). */
export function randomExerciseLength(lesson, mode) {
  return isShortForKids(lesson, mode) ? KIDS_SHORT_LENGTH : undefined;
}

const isShortForKids = (lesson, mode) => mode === 'kids' && lesson.unitIndex < KIDS_SHORT_UNITS;

function trimToWords(text, maxLength) {
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : text.slice(0, maxLength)).trimEnd();
}

export function starsFor(accuracy) {
  return STAR_THRESHOLDS.filter((threshold) => accuracy >= threshold).length;
}

export const PASS_ACCURACY = STAR_THRESHOLDS[0];

/**
 * @returns {Map<string, { status: 'locked'|'available'|'completed', stars: number, recommended: boolean }>}
 *   kids: a lesson opens when the previous one is passed. adult: everything is open.
 *   recommended: the first lesson not passed yet.
 */
export function lessonStates(course, progress, mode) {
  const results = progress?.lessons ?? {};
  const states = new Map();
  let previousPassed = true;
  let recommendedGiven = false;
  for (const lesson of course.lessons) {
    const stars = results[lesson.id]?.stars ?? 0;
    const completed = stars > 0;
    const open = mode === 'adult' || previousPassed;
    const recommended = !completed && open && !recommendedGiven;
    if (recommended) recommendedGiven = true;
    states.set(lesson.id, { status: completed ? 'completed' : open ? 'available' : 'locked', stars, recommended });
    previousPassed = completed;
  }
  return states;
}

/**
 * New progress after an attempt. result: { accuracy, wpm (may be null), durationMs, keyStats? }.
 * keyStats ({ char: [errors, attempts] }) accumulate in progress.keyStats.
 */
export function recordAttempt(progress, lessonId, result, date) {
  const stars = starsFor(result.accuracy);
  const lessons = progress?.lessons ?? {};
  const previous = lessons[lessonId] ?? { stars: 0, bestAccuracy: 0, bestWpm: 0, attempts: 0, completedAt: null };
  const updated = {
    stars: Math.max(previous.stars, stars),
    bestAccuracy: Math.max(previous.bestAccuracy, result.accuracy),
    bestWpm: Math.max(previous.bestWpm, result.wpm ?? 0),
    attempts: previous.attempts + 1,
    completedAt: previous.completedAt ?? (stars > 0 ? date : null),
  };
  const history = [
    ...(progress?.history ?? []),
    { lessonId, date, wpm: result.wpm, accuracy: result.accuracy, durationMs: result.durationMs, stars },
  ].slice(-HISTORY_LIMIT);
  const keyStats = structuredClone(progress?.keyStats ?? {});
  for (const [char, [errors, attempts]] of Object.entries(result.keyStats ?? {})) {
    keyStats[char] ??= [0, 0];
    keyStats[char][0] += errors;
    keyStats[char][1] += attempts;
  }
  return { ...progress, lessons: { ...lessons, [lessonId]: updated }, history, keyStats };
}
