// Keyboard capture on a (visually hidden) textarea.
//
// Two separate signals:
// - onKey: every keydown, with the physical key (event.code). Used for highlighting and
//   for detecting the OS layout.
// - onText: the characters actually produced, taken from `input`/`compositionend`.
//   This is the source of truth for correctness: the OS has already composed dead keys
//   (´ + a → "á"), whatever the platform does in between (Windows sends key "Dead",
//   macOS/Linux use composition events).

export function attachKeyboardInput(textarea, handlers) {
  const { onKey, onText, onBackspace, onDeadChange } = handlers;
  let composing = false;
  let deadPending = false;

  const setDeadPending = (value) => {
    if (value === deadPending) return;
    deadPending = value;
    onDeadChange?.(value);
  };

  const emitText = (data) => {
    setDeadPending(false);
    if (data) onText?.([...data]);
  };

  const onKeyDown = (event) => {
    onKey?.({
      code: event.code,
      key: event.key,
      shift: event.shiftKey,
      altGr: event.getModifierState('AltGraph'),
      ctrl: event.ctrlKey,
      meta: event.metaKey,
      repeat: event.repeat,
    });

    if (event.key === 'Dead') {
      setDeadPending(true);
    } else if (event.key === 'Backspace' && !composing) {
      // The textarea is always empty, so Backspace would not fire an input event.
      event.preventDefault();
      setDeadPending(false);
      onBackspace?.();
    }
  };

  const onCompositionStart = () => {
    composing = true;
    setDeadPending(true);
  };

  const onCompositionEnd = (event) => {
    composing = false;
    emitText(event.data);
    textarea.value = '';
  };

  const onInput = (event) => {
    if (composing || event.isComposing) return;
    if (event.inputType === 'insertLineBreak') emitText('\n');
    else if (event.inputType.startsWith('insert')) emitText(event.data ?? textarea.value);
    textarea.value = '';
  };

  textarea.addEventListener('keydown', onKeyDown);
  textarea.addEventListener('compositionstart', onCompositionStart);
  textarea.addEventListener('compositionend', onCompositionEnd);
  textarea.addEventListener('input', onInput);

  return {
    get deadPending() {
      return deadPending;
    },
    detach() {
      textarea.removeEventListener('keydown', onKeyDown);
      textarea.removeEventListener('compositionstart', onCompositionStart);
      textarea.removeEventListener('compositionend', onCompositionEnd);
      textarea.removeEventListener('input', onInput);
    },
  };
}
