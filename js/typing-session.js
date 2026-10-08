// Typing exercise state: target text, what was typed at each position and errors.
// Pure logic, no DOM.

export function createTypingSession(text) {
  const target = [...text.normalize('NFC')];
  const typed = []; // { char, correct } per position
  let mistakes = 0; // every wrong keystroke, even if later corrected

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
    get mistakes() {
      return mistakes;
    },
    /** Registers one typed character. Returns whether it was correct, or null if finished. */
    type(char) {
      if (typed.length >= target.length) return null;
      const normalized = char.normalize('NFC');
      const correct = normalized === target[typed.length];
      if (!correct) mistakes += 1;
      typed.push({ char: normalized, correct });
      return correct;
    },
    backspace() {
      typed.pop();
    },
  };
}
