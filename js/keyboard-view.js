// On-screen keyboard: draws a layout with finger colors and highlights keys.
// Purely visual (aria-hidden); screens describe the next key in text for assistive tech.

import { el } from './dom.js';
import { strings } from './strings.js';

const PRESS_FLASH_MS = 160;

export function createKeyboardView(layout) {
  const element = el('div', { class: 'keyboard', 'aria-hidden': 'true' });
  let keyElements = new Map();

  function render(currentLayout) {
    keyElements = new Map();
    const rows = currentLayout.rows.map((row) =>
      el(
        'div',
        { class: 'keyboard__row' },
        row.map((key) => {
          const keyElement = renderKey(key);
          if (key.code) keyElements.set(key.code, keyElement);
          return keyElement;
        }),
      ),
    );
    element.replaceChildren(...rows);
  }

  /** Highlights the next key and the modifiers to hold with it. Pass null to clear. */
  function showNext(next) {
    for (const keyElement of keyElements.values()) {
      keyElement.classList.remove('key--next', 'key--next-modifier');
    }
    if (!next) return;
    keyElements.get(next.code)?.classList.add('key--next');
    for (const code of next.modifiers) keyElements.get(code)?.classList.add('key--next-modifier');
  }

  function flash(code) {
    const keyElement = keyElements.get(code);
    if (!keyElement) return;
    keyElement.classList.add('key--pressed');
    setTimeout(() => keyElement.classList.remove('key--pressed'), PRESS_FLASH_MS);
  }

  render(layout);
  return { element, setLayout: render, showNext, flash };
}

export function renderFingerLegend() {
  return el(
    'ul',
    { class: 'finger-legend' },
    Object.entries(strings.fingerGroups).map(([group, name]) =>
      el('li', {}, el('span', { class: 'finger-legend__swatch', 'data-finger-group': group }), name),
    ),
  );
}

function renderKey(key) {
  const style = `--w: ${key.width ?? 1}`;
  if (key.spacer) return el('div', { class: 'key key--spacer', style });

  const attrs = { class: 'key', style, 'data-code': key.code };
  if (key.finger) attrs['data-finger-group'] = fingerGroup(key.finger);

  if (!key.base) {
    const label = key.altGraph ? strings.keyLabels.AltGraph : strings.keyLabels[key.code] ?? '';
    return el('div', { ...attrs, class: 'key key--modifier' }, el('span', { class: 'key__label' }, label));
  }

  const isLetter = key.base !== key.shift && key.base.toUpperCase() === key.shift;
  if (isLetter) {
    return el('div', attrs, el('span', { class: 'key__label key__label--letter' }, key.shift));
  }

  const legend = (layer, className) =>
    key[layer]
      ? el('span', { class: `key__label ${className}` }, key[layer])
      : null;
  return el(
    'div',
    attrs,
    legend('shift', 'key__label--shift'),
    legend('base', 'key__label--base'),
    legend('altGr', 'key__label--altgr'),
  );
}

// 'L5' and 'R5' are both pinkies: same color on both hands.
function fingerGroup(finger) {
  return finger === 'T' ? 'thumb' : finger.slice(1);
}
