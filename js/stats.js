// Typing statistics derived from a typing session.

const CHARS_PER_WORD = 5; // standard definition of a "word" for WPM
const MIN_ELAPSED_MS = 2000; // below this, WPM is too noisy to show

/**
 * @returns {{ wpm: number|null, accuracy: number|null, position: number, total: number }}
 *   wpm: words per minute counting only correct characters (null until there is enough data)
 *   accuracy: % of keystrokes that were right (null before the first keystroke)
 */
export function computeStats(session, now = Date.now()) {
  const elapsedMs = session.startedAt === null ? 0 : (session.finishedAt ?? now) - session.startedAt;
  const correctChars = session.typed.filter((entry) => entry.correct).length;
  const wpm =
    elapsedMs >= MIN_ELAPSED_MS ? Math.round(correctChars / CHARS_PER_WORD / (elapsedMs / 60000)) : null;
  const accuracy =
    session.keystrokes > 0
      ? Math.round((100 * (session.keystrokes - session.mistakes)) / session.keystrokes)
      : null;
  return { wpm, accuracy, position: session.position, total: session.target.length };
}
