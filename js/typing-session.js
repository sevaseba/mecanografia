// Typing exercise state: target text, what was typed at each position, errors and timing.
// Pure logic, no DOM. `now` is injectable for tests.

export function createTypingSession(text, { now = () => Date.now() } = {}) {
  const target = [...text.normalize('NFC')];
  const typed = []; // { char, correct } per position
  let keystrokes = 0; // every typed character, including later corrected ones
  let mistakes = 0; // every wrong keystroke, even if later corrected
  let startedAt = null;
  let finishedAt = null;

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
    /** Registers one typed character. Returns whether it was correct, or null if finished. */
    type(char) {
      if (typed.length >= target.length) return null;
      startedAt ??= now();
      const normalized = char.normalize('NFC');
      const correct = normalized === target[typed.length];
      keystrokes += 1;
      if (!correct) mistakes += 1;
      typed.push({ char: normalized, correct });
      if (typed.length === target.length) finishedAt = now();
      return correct;
    },
    backspace() {
      if (finishedAt !== null) return;
      typed.pop();
    },
  };
}
