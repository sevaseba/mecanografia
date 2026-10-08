// Typing exercise state: target text, what was typed at each position, errors and timing.
// Pure logic, no DOM. `now` is injectable for tests.

export function createTypingSession(text, { now = () => Date.now() } = {}) {
  const target = [...text.normalize('NFC')];
  const typed = []; // { char, correct } per position
  let keystrokes = 0; // every typed character, including later corrected ones
  let mistakes = 0; // every wrong keystroke, even if later corrected
  let startedAt = null;
  let finishedAt = null;
  const tally = {}; // expected character → [errors, attempts]

  return {
    target,
    typed,
    get position() {
      return typed.length;
    },
    get done() {
      return typed.length >= target.length;
    },
    get currentErrors() {
      return typed.filter((entry) => !entry.correct).length;
    },
    get keystrokes() {
      return keystrokes;
    },
    get mistakes() {
      return mistakes;
    },
    get startedAt() {
      return startedAt;
    },
    get finishedAt() {
      return finishedAt;
    },
    /**
     * Registers one typed character. Returns whether it was correct, or null if finished.
     * With advanceOnError false, a wrong character counts as a mistake but the position
     * stays on the expected character until it is typed right.
     */
    type(char, { advanceOnError = true } = {}) {
      if (typed.length >= target.length) return null;
      startedAt ??= now();
      const normalized = char.normalize('NFC');
      const expected = target[typed.length];
      const correct = normalized === expected;
      keystrokes += 1;
      if (!correct) mistakes += 1;
      tally[expected] ??= [0, 0];
      tally[expected][1] += 1;
      if (!correct) tally[expected][0] += 1;
      if (!correct && !advanceOnError) return false;
      typed.push({ char: normalized, correct });
      if (typed.length === target.length) finishedAt = now();
      return correct;
    },
    backspace() {
      if (finishedAt !== null) return;
      typed.pop();
    },
    /** Per expected character: [errors, attempts], to find the keys that cost the most. */
    keyTally() {
      return structuredClone(tally);
    },
  };
}
