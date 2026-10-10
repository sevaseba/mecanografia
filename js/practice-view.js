// Practice screen layout shared by free typing and lessons. Everything fits one viewport:
//
//   stats bar (back · title · PPM · accuracy · progress · screen tools)
//   layout warning (only when needed)
//   [kids: big current-char card] single scrolling text line
//   on-screen keyboard with the hands (over it, or below it: the profile chooses)
//   short finger cue (adult only)

import { el } from './dom.js';
import { strings } from './strings.js';
import { announce } from './announcer.js';
import { getLayout } from './layouts/index.js';
import { attachKeyboardInput } from './input.js';
import { createTypingSession } from './typing-session.js';
import { computeStats } from './stats.js';
import { guideFor } from './guidance.js';
import { createKeyboardView } from './keyboard-view.js';
import { createHandsView } from './hands-view.js';
import { createTextLineView } from './text-line-view.js';
import { createLayoutInference, detectSystemLayout } from './layout-check.js';
import { playHit, playMiss } from './sound.js';
import { pickOne } from './random.js';

const text = strings.practice;
const UPCOMING_CHARS = 3;
const STATS_REFRESH_MS = 1000;
const VISIBLE_SPACE = '␣';
const MISS_SIGNAL_MS = 400;

/**
 * @param {object} options
 * @param {string} options.title          screen title (h1)
 * @param {object} options.keyIndex       key index of the chosen layout (keystrokes.js)
 * @param {object[]} options.keyIndexes   all key indexes, to detect the OS layout
 * @param {Node[]} [options.tools]        screen-specific controls for the stats bar
 * @param {(layoutId: string) => void} [options.onLayoutSuggestion]  "use this layout" button
 * @param {(session: object) => void} [options.onFinish]  the current text was completed
 * @param {() => boolean} [options.soundEnabled]  play a sound for each right/wrong key
 * @param {object} [options.hands]       look and placement of the hands (handsOf in hand-skins.js)
 */
export function createPracticeView({
  title,
  keyIndex,
  keyIndexes,
  tools = [],
  onLayoutSuggestion,
  onFinish,
  soundEnabled = () => false,
  hands: handsOptions,
}) {
  const state = {
    keyIndex,
    session: createTypingSession(''),
    lang: '',
    system: null, // detectSystemLayout() result
    inference: { status: 'unknown', suggestedId: null },
  };

  // --- Stats bar ---
  const wpmValue = el('span', { class: 'stat__value' });
  const accuracyValue = el('span', { class: 'stat__value' });
  const progressValue = el('span', { class: 'stat__value' });
  const progressBar = el('progress', { class: 'stat__bar', max: '1', value: '0', 'aria-hidden': 'true' });

  const statsBar = el(
    'header',
    { class: 'practice-bar' },
    el('a', { class: 'practice-bar__back', href: '#/inicio', 'aria-label': text.back }, '←'),
    el('h1', { class: 'practice-bar__title' }, title),
    el(
      'dl',
      { class: 'stats' },
      stat(text.wpmLabel, [wpmValue], 'stat only-adult', true),
      stat(text.accuracyLabel, [accuracyValue], 'stat only-adult'),
      stat(text.progressLabel, [progressBar, progressValue], 'stat stat--progress', true),
    ),
    el('div', { class: 'practice-bar__tools' }, tools),
  );

  const layoutBanner = el('div', { class: 'layout-banner', role: 'status' });

  // --- Stage ---
  const textarea = el('textarea', {
    class: 'practice-input',
    'aria-label': text.practiceLabel,
    'aria-describedby': 'practice-sr-hint',
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    rows: '1',
  });
  const cardCurrent = el('span', { class: 'char-card__current' });
  const cardUpcoming = el('span', { class: 'char-card__upcoming' });
  const charCard = el('div', { class: 'char-card only-kids', 'aria-hidden': 'true' }, cardCurrent, cardUpcoming);
  const textLine = createTextLineView();
  const finishMessage = el(
    'div',
    { class: 'practice-finish' },
    el('p', { class: 'practice-finish__title' }, text.finished),
    el('p', { class: 'practice-finish__stats only-adult' }),
  );
  const focusPrompt = el('p', { class: 'practice-prompt', 'aria-hidden': 'true' }, text.focusPrompt);
  const focusRow = el('div', { class: 'practice-focus' }, textarea, charCard, textLine.element, finishMessage, focusPrompt);

  const keyboard = createKeyboardView(keyIndex.layout);
  const hands = createHandsView(keyIndex, handsOptions);
  const board = el('div', { class: 'keyboard-board' }, keyboard.element, hands.element);
  const fingerCue = el('p', { class: 'finger-cue only-adult', 'aria-hidden': 'true' });
  const srHint = el('p', { id: 'practice-sr-hint', class: 'visually-hidden' });

  const stage = el(
    'div',
    { class: 'practice-stage', onClick: () => textarea.focus() },
    focusRow,
    board,
    fingerCue,
    srHint,
  );

  const element = el('div', { class: 'practice-screen' }, statsBar, layoutBanner, stage);

  // --- Input wiring ---
  const inference = createLayoutInference(keyIndexes, keyIndex.layout.id, (result) => {
    const wasWarning = isWarning();
    state.inference = result;
    renderLayoutBanner();
    if (!wasWarning && isWarning()) announce(layoutBanner.textContent);
  });

  // Physical key that produced the latest text, to flash it green or red.
  let lastCharKeyCode = null;
  let lastCheer;

  const input = attachKeyboardInput(textarea, {
    onKey: (key) => {
      keyboard.flash(key.code);
      inference.observe(key);
      if (key.key === 'Dead' || [...key.key].length === 1) lastCharKeyCode = key.code;
    },
    onText: (chars) => {
      const wasDone = state.session.done;
      // Kids mode waits on the expected character; adult mode moves on and marks the error.
      const advanceOnError = !isKids();
      for (const char of chars) {
        const correct = state.session.type(char, { advanceOnError });
        if (correct === null) continue;
        keyboard.flashResult(lastCharKeyCode, correct);
        if (soundEnabled()) (correct ? playHit : playMiss)();
        if (!correct && !advanceOnError) signalMiss();
      }
      render();
      if (!wasDone && state.session.done) {
        // Kids get a different cheer each time; adults a plain "done".
        const cheer = isKids() ? pickOne(strings.encouragement.exerciseDone, lastCheer) : text.finished;
        lastCheer = cheer;
        finishMessage.querySelector('.practice-finish__title').textContent = cheer;
        announce(`${cheer} ${text.finishedStats(computeStats(state.session))}`);
        onFinish?.(state.session);
      }
    },
    onBackspace: () => {
      state.session.backspace();
      render();
    },
    onDeadChange: renderGuidance,
  });

  const refreshSystemLayout = async () => {
    state.system = await detectSystemLayout(keyIndexes);
    renderLayoutBanner();
  };
  textarea.addEventListener('focus', refreshSystemLayout);
  refreshSystemLayout();

  // WPM changes with time, not only with keystrokes.
  const statsTimer = setInterval(() => {
    if (state.session.startedAt !== null && !state.session.done) renderStats();
  }, STATS_REFRESH_MS);

  // --- Public API ---
  function setText(newText, lang) {
    state.session = createTypingSession(newText);
    state.lang = lang;
    textLine.setText(state.session.target, lang);
    render();
  }

  function setLayout(newKeyIndex) {
    state.keyIndex = newKeyIndex;
    keyboard.setLayout(newKeyIndex.layout);
    hands.setLayout(newKeyIndex);
    inference.reset(newKeyIndex.layout.id);
    render();
  }

  function restart() {
    setText(state.session.target.join(''), state.lang);
  }

  function destroy() {
    clearInterval(statsTimer);
    input.detach();
    textLine.destroy();
  }

  let missTimer = null;
  function signalMiss() {
    focusRow.classList.remove('is-miss');
    void focusRow.offsetWidth; // restart the animation on repeated misses
    focusRow.classList.add('is-miss');
    clearTimeout(missTimer);
    missTimer = setTimeout(() => focusRow.classList.remove('is-miss'), MISS_SIGNAL_MS);
  }

  // --- Rendering ---
  function render() {
    const { session } = state;
    textLine.update(session);
    element.classList.toggle('is-done', session.done);
    renderCard();
    renderStats();
    renderGuidance();
  }

  function renderCard() {
    const { session } = state;
    const visible = (char) => (char === ' ' ? VISIBLE_SPACE : char);
    cardCurrent.textContent = session.done ? '' : visible(session.target[session.position]);
    cardUpcoming.textContent = session.target
      .slice(session.position + 1, session.position + 1 + UPCOMING_CHARS)
      .map(visible)
      .join(' ');
  }

  function renderStats() {
    const stats = computeStats(state.session);
    wpmValue.textContent = text.wpm(stats.wpm);
    accuracyValue.textContent = text.accuracy(stats.accuracy);
    progressValue.textContent = text.progress(stats.position, stats.total);
    progressBar.value = stats.total ? stats.position / stats.total : 0;
    finishMessage.querySelector('.practice-finish__stats').textContent = text.finishedStats(stats);
  }

  function renderGuidance() {
    const { session, keyIndex: index } = state;
    const char = session.done ? undefined : session.target[session.position];
    const guide = guideFor(index, char, input.deadPending);

    keyboard.show(guide.targets);
    hands.show(guide.targets);
    fingerCue.textContent = fingerCueFor(guide.targets);
    srHint.textContent = guide.typable ? screenReaderHint(index, char) : text.notTypable(char, index.layout.name);
  }

  function isWarning() {
    const { system, inference: inferred, keyIndex: index } = state;
    return (
      inferred.status === 'mismatch' ||
      inferred.status === 'no-physical-keyboard' ||
      Boolean(system?.supported && system.layoutId !== index.layout.id)
    );
  }

  function renderLayoutBanner() {
    const messages = strings.layoutCheck;
    const selectedName = state.keyIndex.layout.name;
    const { system, inference: inferred } = state;
    let message = '';
    let suggestedId = null;

    if (inferred.status === 'no-physical-keyboard') {
      message = messages.noPhysicalKeyboard;
    } else if (inferred.status === 'mismatch') {
      message = `${messages.typingMismatch(selectedName)} ${messages.howToFix}`;
      suggestedId = inferred.suggestedId;
    } else if (isWarning()) {
      message = system.layoutId
        ? messages.systemIs(getLayout(system.layoutId).name, selectedName)
        : messages.systemUnknown(selectedName);
      message += ` ${messages.howToFix}`;
      suggestedId = system.layoutId;
    }

    layoutBanner.hidden = !message;
    const children = [el('p', {}, message)];
    if (suggestedId && onLayoutSuggestion) {
      children.push(
        el(
          'button',
          { type: 'button', class: 'button', onClick: () => onLayoutSuggestion(suggestedId) },
          messages.useLayout(getLayout(suggestedId).name),
        ),
      );
    }
    layoutBanner.replaceChildren(...children);
  }

  function fingerCueFor(targets) {
    const fingerNames = (roles) => {
      const fingers = targets.filter((t) => roles.includes(t.role) && t.finger).map((t) => t.finger);
      return [...new Set(fingers)].map((finger) => strings.fingers[finger]);
    };
    const now = fingerNames(['primary', 'modifier']);
    const then = fingerNames(['secondary']);
    if (!now.length) return '';
    return then.length ? text.fingersThen(text.fingersNow(now), text.fingersNow(then)) : text.fingersNow(now);
  }

  function screenReaderHint(index, char) {
    if (char === undefined) return '';
    const strokes = index.strokesFor(char);
    const deadDone = input.deadPending && strokes[0].dead;
    const remaining = deadDone ? strokes.slice(1) : strokes;
    const description = remaining.map((stroke) => describeStroke(index, stroke)).join(text.srThen);
    return deadDone
      ? text.srDeadReady(index.charFor(strokes[0].code, strokes[0].layer), description)
      : text.srNextKey(description);
  }

  render();
  return { element, focus: () => textarea.focus(), setText, setLayout, restart, refresh: render, destroy };
}

const isKids = () => document.documentElement.dataset.mode === 'kids';

function stat(label, values, className, hideLabel = false) {
  return el('div', { class: className }, el('dt', { class: hideLabel ? 'visually-hidden' : null }, label), el('dd', {}, values));
}

function describeStroke(index, stroke) {
  const key = index.keysByCode.get(stroke.code);
  const label = stroke.code === 'Space' ? text.space : stroke.code === 'Enter' ? text.enter : key[stroke.layer];
  const keyText = text.srKey(label, strings.fingers[key.finger]);
  const modifiers = index.modifiersFor(stroke).map(modifierName);
  return modifiers.length ? text.srWithModifier(modifiers.join(' + '), keyText) : keyText;
}

function modifierName(code) {
  if (code === 'ShiftLeft') return text.shiftLeft;
  if (code === 'ShiftRight') return text.shiftRight;
  return text.altGraph;
}
