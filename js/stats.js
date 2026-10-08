// Typing statistics derived from a typing session.

const CHARS_PER_WORD = 5; // standard definition of a "word" for WPM
const MIN_ELAPSED_MS = 2000; // below this, WPM is too noisy to show

/**
 * Live stats for one exercise.
 * @returns {{ wpm: number|null, accuracy: number|null, position: number, total: number }}
 *   wpm: net words per minute (see netWpm), null until there is enough data
 *   accuracy: % of keystrokes that were right (null before the first keystroke)
 */
export function computeStats(session, now = Date.now()) {
  const elapsedMs = session.startedAt === null ? 0 : (session.finishedAt ?? now) - session.startedAt;
  return {
    wpm: elapsedMs >= MIN_ELAPSED_MS ? netWpm(session.keystrokes, session.currentErrors, elapsedMs) : null,
    accuracy: accuracyOf(session.keystrokes, session.mistakes),
    position: session.position,
    total: session.target.length,
  };
}

/**
 * Stats for several exercises done in a row (a lesson). Time counts only while typing
 * each exercise, not the pauses between them.
 *   grossWpm: every keystroke / 5 / minutes
 *   wpm (net): gross minus uncorrected errors per minute, never below 0
 *   correctedErrors: mistakes that were fixed (Backspace, or retyped in kids mode)
 *   uncorrectedErrors: wrong characters left in the text
 *   keyStats: per expected character, [errors, attempts]
 */
export function combineStats(sessions) {
  const started = sessions.filter((session) => session.startedAt !== null);
  const sum = (pick) => started.reduce((total, session) => total + pick(session), 0);
  const durationMs = sum((s) => (s.finishedAt ?? s.startedAt) - s.startedAt);
  const keystrokes = sum((s) => s.keystrokes);
  const mistakes = sum((s) => s.mistakes);
  const uncorrectedErrors = sum((s) => s.currentErrors);
  const enoughTime = durationMs >= MIN_ELAPSED_MS;

  const keyStats = {};
  for (const session of started) {
    for (const [char, [errors, attempts]] of Object.entries(session.keyTally())) {
      keyStats[char] ??= [0, 0];
      keyStats[char][0] += errors;
      keyStats[char][1] += attempts;
    }
  }

  return {
    wpm: enoughTime ? netWpm(keystrokes, uncorrectedErrors, durationMs) : null,
    grossWpm: enoughTime ? Math.round(keystrokes / CHARS_PER_WORD / minutes(durationMs)) : null,
    accuracy: accuracyOf(keystrokes, mistakes),
    correctedErrors: mistakes - uncorrectedErrors,
    uncorrectedErrors,
    durationMs,
    keyStats,
  };
}

function netWpm(keystrokes, uncorrectedErrors, elapsedMs) {
  return Math.max(0, Math.round((keystrokes / CHARS_PER_WORD - uncorrectedErrors) / minutes(elapsedMs)));
}

function accuracyOf(keystrokes, mistakes) {
  return keystrokes > 0 ? Math.round((100 * (keystrokes - mistakes)) / keystrokes) : null;
}

const minutes = (ms) => ms / 60000;
