// Optional keyboard check: the user presses two physical keys and we see which layout
// the operating system produces. Right of L: ñ (es-latam) vs ; (en-us). Left of Backspace:
// ¿ (es-latam) vs ¡ (Spain) vs = (en-us), which also catches a Spain layout.

import { el } from './dom.js';
import { strings } from './strings.js';
import { getLayout } from './layouts/index.js';
import { createKeyboardView } from './keyboard-view.js';
import { layoutsMatchingKey } from './layout-check.js';

const STEPS = ['Semicolon', 'Equal'];
const IGNORED_KEYS = ['Tab', 'Escape', 'Shift', 'Control', 'Alt', 'AltGraph', 'Meta', 'CapsLock'];

/**
 * @param {object[]} options.keyIndexes  key indexes of all registered layouts
 * @param {string} options.layoutId      layout currently chosen in the form
 * @param {(layoutId: string) => void} options.onUseLayout
 */
export function createCalibrationView({ keyIndexes, layoutId, onUseLayout }) {
  const text = strings.calibration;
  let selectedLayoutId = layoutId;
  let step = 0;
  let candidates = keyIndexes.map((index) => index.layout.id);
  let typed = [];

  const stepLabel = el('p', { class: 'calibration__step muted' });
  const prompt = el('p', { class: 'calibration__prompt' });
  const keyboard = createKeyboardView(getLayout(selectedLayoutId));
  const capture = el(
    'div',
    { class: 'calibration__capture', tabindex: '0', role: 'button', 'aria-label': text.captureLabel },
    el('span', { class: 'calibration__idle' }, text.captureIdle),
    el('span', { class: 'calibration__active' }, text.captureActive),
  );
  const feedback = el('div', { class: 'calibration__feedback', role: 'status' });
  const element = el(
    'div',
    { class: 'calibration' },
    el('p', { class: 'muted' }, text.intro),
    stepLabel,
    prompt,
    keyboard.element,
    capture,
    feedback,
  );

  capture.addEventListener('keydown', (event) => {
    if (IGNORED_KEYS.includes(event.key) || step >= STEPS.length) return;
    event.preventDefault();
    const expectedCode = STEPS[step];
    if (event.code !== expectedCode) {
      feedback.replaceChildren(el('p', {}, text.wrongKey));
      return;
    }
    const matching = layoutsMatchingKey(keyIndexes, event.code, event.key);
    candidates = candidates.filter((id) => matching.includes(id));
    typed.push(event.key === 'Dead' ? '´' : event.key);
    step += 1;
    if (step < STEPS.length) renderStep();
    else showResult();
  });

  function renderStep() {
    feedback.replaceChildren();
    stepLabel.textContent = text.step(step + 1, STEPS.length);
    prompt.textContent = text.prompts[STEPS[step]];
    element.classList.remove('is-finished');
    keyboard.show([{ code: STEPS[step], role: 'primary', badge: null }]);
  }

  function showResult() {
    element.classList.add('is-finished');
    keyboard.show([]);
    const again = el('button', { type: 'button', class: 'button button--secondary', onClick: restart }, text.again);

    if (candidates.length !== 1) {
      const chars = typed.map((char) => `«${char}»`).join(' y ');
      feedback.replaceChildren(el('p', { class: 'alert alert--warning' }, text.noMatch(chars)), again);
      return;
    }

    const [detectedId] = candidates;
    const detected = getLayout(detectedId);
    const children = [el('p', {}, text.matches(detected.name))];
    if (detectedId === selectedLayoutId) {
      children.push(el('p', { class: 'muted' }, text.matchesSelected));
    } else {
      children.push(
        el('p', {}, text.differs(detected.name)),
        el(
          'button',
          {
            type: 'button',
            class: 'button',
            onClick: () => {
              onUseLayout(detectedId);
              showResult();
            },
          },
          text.useLayout(detected.name),
        ),
      );
    }
    children.push(again);
    feedback.replaceChildren(...children);
  }

  function restart() {
    step = 0;
    candidates = keyIndexes.map((index) => index.layout.id);
    typed = [];
    renderStep();
    capture.focus();
  }

  /** Keeps the drawing in sync with the layout chosen in the form. */
  function setLayout(newLayoutId) {
    selectedLayoutId = newLayoutId;
    keyboard.setLayout(getLayout(newLayoutId));
    if (step < STEPS.length) keyboard.show([{ code: STEPS[step], role: 'primary', badge: null }]);
  }

  renderStep();
  return { element, setLayout };
}
