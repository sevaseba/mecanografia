// "Posición de las manos" screen: a step panel above the on-screen keyboard and hands.
// Explanation steps advance with a button; practice steps wait for the lit key, identified
// by its physical position (KeyboardEvent.code), so the OS layout does not matter here.
// Kids get short texts, read aloud by a recorded voice when it is on.
//
//   bar (back · title · step N of M · screen tools · Saltear)
//   panel (step title, explanation, what to press now / Escuchar · Siguiente;
//          first step: finger colors and the hands picker)
//   on-screen keyboard with the hands

import { el } from './dom.js';
import { strings } from './strings.js';
import { announce } from './announcer.js';
import { attachKeyboardInput } from './input.js';
import { createKeyboardView } from './keyboard-view.js';
import { createHandsView } from './hands-view.js';
import { createHandsPicker } from './hands-picker.js';
import { skinFor } from './hand-skins.js';
import { buildIntroSteps, introTargets } from './hands-intro.js';
import { introCopy } from './hands-intro-copy.js';
import { createVoice } from './voice.js';

const text = strings.handsIntro;
const NEXT_STEP_DELAY_MS = 600;
// Keys that never count as a wrong answer: navigation and modifiers pressed on their own.
const IGNORED_KEYS = new Set(['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock']);

/**
 * @param {object} options
 * @param {object} options.keyIndex      key index of the profile's layout (keystrokes.js)
 * @param {string} options.backHref      where the ← link goes
 * @param {string} options.finishLabel   button on the last step
 * @param {Node[]} [options.tools]       screen-specific controls for the bar
 * @param {() => boolean} [options.voiceEnabled]  read the kids texts aloud
 * @param {object} [options.hands]      look and placement of the hands (handsOf in hand-skins.js)
 * @param {(settings: { hands, handsPlacement }) => void} [options.onHandsChange]  picked in the first step
 * @param {() => void} options.onDone    finished or skipped
 */
export function createHandsIntroView({
  keyIndex,
  backHref,
  finishLabel,
  tools = [],
  voiceEnabled = () => false,
  hands: handsOptions,
  onHandsChange = () => {},
  onDone,
}) {
  const steps = buildIntroSteps(keyIndex);
  // Kids read less: every text has a short version for them, and only theirs are recorded.
  const kids = document.documentElement.dataset.mode === 'kids';
  const copy = introCopy(keyIndex, steps, kids ? 'kids' : 'adult');
  const voice = createVoice();
  let stepIndex = 0;
  let keyPosition = 0;
  let nextTimer = null;

  const counter = el('span', { class: 'tool tool--info' });
  const skipButton = el(
    'button',
    { type: 'button', class: 'button button--secondary button--small', onClick: () => finish() },
    text.skip,
  );
  const bar = el(
    'header',
    { class: 'practice-bar' },
    el('a', { class: 'practice-bar__back', href: backHref, 'aria-label': strings.lessons.backToMap }, '←'),
    el('h1', { class: 'practice-bar__title' }, text.title),
    el('div', { class: 'stats' }, counter),
    el('div', { class: 'practice-bar__tools' }, tools, skipButton),
  );

  const stepTitle = el('h2', { class: 'hands-intro__title' });
  const stepBody = el('p', { class: 'hands-intro__body' });
  // Finger names next to their colors, so kids can learn them without needing them.
  const legend = el(
    'ul',
    { class: 'finger-legend' },
    text.fingerLegend.map(({ group, name }) =>
      el('li', {}, el('span', { class: 'finger-legend__swatch', 'data-finger-group': group, 'aria-hidden': 'true' }), name),
    ),
  );
  // The hands' look and placement, chosen while looking at them.
  const mode = kids ? 'kids' : 'adult';
  const picker = createHandsPicker({
    mode,
    hands: handsOptions?.skin.id,
    handsPlacement: handsOptions?.placement,
    compact: true,
    onChange: (settings) => {
      hands.setSkin(skinFor(settings.hands, mode));
      hands.setPlacement(settings.handsPlacement);
      showKey();
      onHandsChange(settings);
    },
  });
  const instruction = el('p', { id: 'hands-intro-instruction', class: 'hands-intro__instruction' });
  const feedback = el('p', { class: 'hands-intro__feedback' });
  const listenButton = el(
    'button',
    { type: 'button', class: 'button button--secondary only-kids', onClick: () => speak(true) },
    el('span', { 'aria-hidden': 'true' }, '🔊 '),
    text.listen,
  );
  const nextButton = el('button', { type: 'button', class: 'button', onClick: nextStep });
  const textarea = el('textarea', {
    class: 'visually-hidden',
    'aria-label': text.title,
    'aria-describedby': 'hands-intro-instruction',
    autocapitalize: 'off',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    rows: '1',
  });
  const focusPrompt = el('p', { class: 'practice-prompt', 'aria-hidden': 'true' }, text.focusPrompt);
  const panel = el(
    'div',
    { class: 'hands-intro__panel' },
    el('div', { class: 'hands-intro__text' }, stepTitle, stepBody, legend, picker.element, instruction, feedback),
    el('div', { class: 'hands-intro__actions' }, listenButton, nextButton),
    textarea,
    focusPrompt,
  );

  const keyboard = createKeyboardView(keyIndex.layout);
  const hands = createHandsView(keyIndex, handsOptions);
  const stage = el(
    'div',
    {
      class: 'practice-stage hands-intro',
      onClick: () => {
        if (isPracticeStep()) textarea.focus();
      },
    },
    panel,
    el('div', { class: 'keyboard-board' }, keyboard.element, hands.element),
  );
  const element = el('div', { class: 'practice-screen' }, bar, stage);

  const input = attachKeyboardInput(textarea, { onKey });

  const step = () => steps[stepIndex];
  const stepCopy = () => copy.steps[stepIndex];
  const isPracticeStep = () => Boolean(step().sequence);

  function showStep() {
    const current = step();
    counter.textContent = text.stepCounter(stepIndex + 1, steps.length);
    stepTitle.textContent = stepCopy().title;
    stepBody.textContent = stepCopy().body;
    feedback.textContent = '';
    legend.hidden = current.id !== 'fingers';
    picker.element.hidden = current.id !== 'fingers';
    stage.classList.toggle('is-choosing', current.id === 'fingers');
    skipButton.hidden = current.id === 'done';
    nextButton.hidden = isPracticeStep();
    nextButton.textContent = stepIndex === steps.length - 1 ? finishLabel : text.next;
    stage.classList.toggle('is-practice', isPracticeStep());
    keyPosition = 0;
    showKey();
    announce(`${stepCopy().title}. ${stepBody.textContent} ${instruction.textContent}`);
    speak();
    (isPracticeStep() ? textarea : nextButton).focus();
  }

  // Lights up the keys of the current step and says what to press.
  function showKey() {
    const current = step();
    let highlight = current.highlight;
    instruction.textContent = '';
    if (current.sequence) {
      const { code, zone } = current.sequence[keyPosition];
      highlight = { primary: [code], zone };
      instruction.textContent = stepCopy().instructions[keyPosition];
    }
    const targets = introTargets(keyIndex, highlight);
    keyboard.show(targets);
    hands.show(targets);
    keyboard.element.classList.toggle('keyboard--focus', highlight.zone.length > 0 || highlight.primary.length > 0);
  }

  /** Reads the step aloud (kids). onlyInstruction: just the key to press now. */
  function speak(asked = false, onlyInstruction = false) {
    if (!kids || !(asked || voiceEnabled())) return;
    const sentences = onlyInstruction ? [] : [stepBody.textContent];
    if (instruction.textContent) sentences.push(instruction.textContent);
    voice.say(sentences);
  }

  function onKey(key) {
    keyboard.flash(key.code);
    if (!isPracticeStep() || key.repeat || nextTimer || IGNORED_KEYS.has(key.key)) return;
    const { sequence } = step();
    const correct = key.code === sequence[keyPosition].code;
    keyboard.flashResult(key.code, correct);
    if (!correct) {
      feedback.textContent = copy.miss;
      announce(`${copy.miss} ${instruction.textContent}`);
      if (kids && voiceEnabled()) voice.say([copy.miss]);
      return;
    }
    feedback.textContent = '';
    keyPosition += 1;
    if (keyPosition < sequence.length) {
      showKey();
      announce(instruction.textContent);
      speak(false, true);
    } else {
      nextTimer = setTimeout(() => {
        nextTimer = null;
        nextStep();
      }, NEXT_STEP_DELAY_MS);
    }
  }

  function nextStep() {
    if (stepIndex === steps.length - 1) finish();
    else {
      stepIndex += 1;
      showStep();
    }
  }

  function finish() {
    voice.stop();
    onDone();
  }

  function destroy() {
    clearTimeout(nextTimer);
    voice.stop();
    input.detach();
  }

  return { element, start: showStep, destroy };
}
