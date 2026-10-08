// "Teclado libre": type a sample text on any layout, with per-character feedback,
// next-key guidance on the on-screen keyboard and OS layout checks.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { announce } from '../announcer.js';
import { layouts, defaultLayoutId, getLayout } from '../layouts/index.js';
import { createKeyIndex } from '../keystrokes.js';
import { attachKeyboardInput } from '../input.js';
import { createTypingSession } from '../typing-session.js';
import { createKeyboardView, renderFingerLegend } from '../keyboard-view.js';
import { detectSystemLayout, createLayoutInference } from '../layout-check.js';

const text = strings.freeTyping;
const keyIndexes = layouts.map(createKeyIndex);

export const title = text.title;

export function render(container) {
  const state = {
    keyIndex: indexFor(defaultLayoutId),
    sampleId: getLayout(defaultLayoutId).language,
    session: null,
    system: null, // result of detectSystemLayout()
    inference: { status: 'unknown', suggestedId: null },
  };

  // --- Controls ---
  const layoutSelect = el(
    'select',
    { id: 'layout-select', onChange: () => changeLayout(layoutSelect.value) },
    layouts.map((layout) => el('option', { value: layout.id }, layout.name)),
  );

  const sampleRadios = Object.entries(text.samples).map(([id, sample]) =>
    el(
      'label',
      { class: 'choice' },
      el('input', { type: 'radio', name: 'sample', value: id, onChange: () => changeSample(id) }),
      sample.name,
    ),
  );

  const layoutStatus = el('div', { class: 'layout-status', role: 'status' });

  // --- Practice area ---
  const textarea = el('textarea', {
    class: 'practice__input',
    'aria-label': text.practiceLabel,
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    rows: '1',
  });
  const targetText = el('p', { class: 'practice__text', lang: '' });
  const prompt = el('p', { class: 'practice__prompt muted' }, text.startPrompt);
  const practice = el('div', { class: 'practice', onClick: () => textarea.focus() }, textarea, targetText, prompt);

  const hintLine = el('p', { class: 'hint' });
  const progressLine = el('p', { class: 'muted' });
  const restartButton = el('button', { type: 'button', class: 'button button--secondary', onClick: () => { restart(); textarea.focus(); } }, text.restart);

  const keyboard = createKeyboardView(state.keyIndex.layout);

  container.append(
    el('h1', {}, text.title),
    el('p', {}, text.intro),
    el(
      'div',
      { class: 'controls' },
      el('div', { class: 'field' }, el('label', { for: 'layout-select' }, text.layoutLabel), layoutSelect),
      el('fieldset', { class: 'field' }, el('legend', {}, text.textLabel), el('div', { class: 'choices' }, sampleRadios)),
    ),
    layoutStatus,
    practice,
    hintLine,
    el('div', { class: 'practice-footer' }, progressLine, restartButton),
    keyboard.element,
    renderFingerLegend(),
  );

  // --- Input wiring ---
  const inference = createLayoutInference(keyIndexes, state.keyIndex.layout.id, (result) => {
    const wasWarning = isWarning();
    state.inference = result;
    renderLayoutStatus();
    if (!wasWarning && isWarning()) announce(layoutStatus.textContent);
  });

  const input = attachKeyboardInput(textarea, {
    onKey: (key) => {
      keyboard.flash(key.code);
      inference.observe(key);
    },
    onText: (chars) => {
      for (const char of chars) state.session.type(char);
      renderSession();
      if (state.session.done) announce(text.finished(state.session.mistakes));
    },
    onBackspace: () => {
      state.session.backspace();
      renderSession();
    },
    onDeadChange: renderGuidance,
  });

  textarea.addEventListener('focus', refreshSystemLayout);

  // --- Initial state: prefer the layout the OS is using, if we know it ---
  selectLayoutControls();
  restart();
  refreshSystemLayout().then(() => {
    if (state.system?.layoutId && state.system.layoutId !== state.keyIndex.layout.id) {
      changeLayout(state.system.layoutId);
    }
  });

  // --- Actions ---
  function changeLayout(layoutId) {
    state.keyIndex = indexFor(layoutId);
    state.sampleId = state.keyIndex.layout.language;
    keyboard.setLayout(state.keyIndex.layout);
    inference.reset(layoutId);
    selectLayoutControls();
    restart();
  }

  function changeSample(sampleId) {
    state.sampleId = sampleId;
    restart();
  }

  function restart() {
    state.session = createTypingSession(text.samples[state.sampleId].text);
    targetText.lang = state.sampleId;
    targetText.replaceChildren(
      ...state.session.target.map((char) => el('span', { class: char === ' ' ? 'char char--space' : 'char' }, char)),
    );
    renderSession();
  }

  async function refreshSystemLayout() {
    state.system = await detectSystemLayout(keyIndexes);
    renderLayoutStatus();
  }

  // --- Rendering ---
  function selectLayoutControls() {
    layoutSelect.value = state.keyIndex.layout.id;
    for (const label of sampleRadios) {
      const radio = label.querySelector('input');
      radio.checked = radio.value === state.sampleId;
    }
  }

  function renderSession() {
    const { session } = state;
    targetText.querySelectorAll('.char').forEach((span, position) => {
      const entry = session.typed[position];
      span.classList.toggle('char--correct', entry?.correct === true);
      span.classList.toggle('char--wrong', entry?.correct === false);
      span.classList.toggle('char--current', position === session.position);
    });
    progressLine.textContent = text.progress(session.position, session.target.length, session.currentErrors);
    renderGuidance();
  }

  function renderGuidance() {
    const { session, keyIndex } = state;
    if (session.done) {
      hintLine.textContent = text.finished(session.mistakes);
      keyboard.showNext(null);
      return;
    }

    const char = session.target[session.position];
    const strokes = keyIndex.strokesFor(char);
    if (!strokes) {
      hintLine.textContent = strings.hint.notTypable(char, keyIndex.layout.name);
      keyboard.showNext(null);
      return;
    }

    // Once the dead key of a composed character was pressed, guide the remaining strokes.
    const deadDone = input.deadPending && strokes[0].dead;
    const remaining = deadDone ? strokes.slice(1) : strokes;
    const description = remaining.map(describeStroke).join(strings.hint.then);
    hintLine.textContent = deadDone
      ? strings.hint.deadReady(keyIndex.charFor(strokes[0].code, strokes[0].layer), description)
      : strings.hint.nextKey(description);
    keyboard.showNext({ code: remaining[0].code, modifiers: keyIndex.modifiersFor(remaining[0]) });
  }

  function describeStroke(stroke) {
    const { keyIndex } = state;
    const key = keyIndex.keysByCode.get(stroke.code);
    const label =
      stroke.code === 'Space' ? strings.hint.space : stroke.code === 'Enter' ? strings.hint.enter : key[stroke.layer];
    const keyText = strings.hint.key(label, strings.fingers[key.finger]);
    const modifiers = keyIndex.modifiersFor(stroke).map(modifierName);
    return modifiers.length ? strings.hint.withModifier(modifiers.join(' + '), keyText) : keyText;
  }

  function isWarning() {
    return (
      state.inference.status === 'mismatch' ||
      state.inference.status === 'no-physical-keyboard' ||
      (state.system?.supported && state.system.layoutId !== state.keyIndex.layout.id)
    );
  }

  function renderLayoutStatus() {
    const messages = strings.layoutCheck;
    const selectedName = state.keyIndex.layout.name;
    const { system, inference: inferred } = state;
    let message;
    let suggestedId = null;

    if (inferred.status === 'no-physical-keyboard') {
      message = messages.noPhysicalKeyboard;
    } else if (inferred.status === 'mismatch') {
      message = `${messages.typingMismatch(selectedName)} ${messages.howToFix}`;
      suggestedId = inferred.suggestedId;
    } else if (system?.supported && system.layoutId !== state.keyIndex.layout.id) {
      message = system.layoutId
        ? messages.systemIs(getLayout(system.layoutId).name, selectedName)
        : messages.systemUnknown(selectedName);
      message += ` ${messages.howToFix}`;
      suggestedId = system.layoutId;
    } else if (system?.supported) {
      message = messages.systemMatches(selectedName);
    } else if (system) {
      message = messages.unsupported;
    } else {
      message = '';
    }

    const warning = isWarning();
    layoutStatus.className = warning ? 'layout-status alert alert--warning' : 'layout-status muted';
    const children = [el('p', {}, message)];
    if (warning && suggestedId) {
      children.push(
        el(
          'button',
          { type: 'button', class: 'button', onClick: () => changeLayout(suggestedId) },
          messages.useLayout(getLayout(suggestedId).name),
        ),
      );
    }
    layoutStatus.replaceChildren(...children);
  }
}

function indexFor(layoutId) {
  return keyIndexes.find((index) => index.layout.id === layoutId);
}

function modifierName(code) {
  if (code === 'ShiftLeft') return strings.hint.shiftLeft;
  if (code === 'ShiftRight') return strings.hint.shiftRight;
  return strings.hint.altGraph;
}
