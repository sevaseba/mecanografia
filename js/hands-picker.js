// Picker for the hands drawn with the keyboard: their look (skin tones for everyone, costumes
// for kids) and where they go (below or over the keyboard). Used in the profile form and in
// a dialog of the hands intro's first step. Native radios drawn as tiles (see profiles.css).

import { el } from './dom.js';
import { strings } from './strings.js';
import { HAND_SKINS, HAND_PLACEMENTS, DEFAULT_SKIN } from './hand-skins.js';

const text = strings.hands;
let count = 0; // radio group names must be unique on the page

/**
 * @param {object} options
 * @param {'kids' | 'adult'} options.mode  adults are only offered the skin tones
 * @param {string} options.hands           selected skin id
 * @param {'below' | 'over'} options.handsPlacement
 * @param {(settings: { hands, handsPlacement }) => void} [options.onChange]
 */
export function createHandsPicker({ mode, hands, handsPlacement, onChange = () => {} }) {
  const id = ++count;
  const skinInputs = new Map();
  const skinTiles = HAND_SKINS.map((skin) => {
    const input = el('input', {
      type: 'radio',
      name: `hands-skin-${id}`,
      value: skin.id,
      checked: skin.id === hands,
      class: 'choice-tile__input',
      'aria-label': text.skins[skin.id],
    });
    skinInputs.set(skin.id, input);
    return el(
      'label',
      { class: 'choice-tile', title: text.skins[skin.id] },
      input,
      el(
        'span',
        { class: 'hand-option' },
        el('span', { class: 'hand-option__icon', 'aria-hidden': 'true' }, skin.icon),
        el('span', { class: 'hand-option__name', 'aria-hidden': 'true' }, text.skins[skin.id]),
      ),
    );
  });
  const placementInputs = HAND_PLACEMENTS.map((placement) =>
    el('input', {
      type: 'radio',
      name: `hands-placement-${id}`,
      value: placement,
      checked: placement === handsPlacement,
      class: 'choice-tile__input',
    }),
  );

  // Labeled radio groups (not fieldsets: a legend cannot sit beside its options).
  const skinLabel = el('span', { id: `hands-skin-label-${id}`, class: 'hands-picker__label' });
  const element = el(
    'div',
    { class: 'hands-picker' },
    el(
      'div',
      { class: 'field hands-picker__group', role: 'radiogroup', 'aria-labelledby': skinLabel.id, 'aria-describedby': `hands-skin-hint-${id}` },
      skinLabel,
      el('span', { class: 'muted', id: `hands-skin-hint-${id}` }, text.hint),
      el('div', { class: 'hands-picker__skins' }, skinTiles),
    ),
    el(
      'div',
      { class: 'field hands-picker__group', role: 'radiogroup', 'aria-labelledby': `hands-placement-label-${id}` },
      el('span', { id: `hands-placement-label-${id}`, class: 'hands-picker__label' }, text.placementLabel),
      el(
        'div',
        { class: 'hands-picker__placements' },
        HAND_PLACEMENTS.map((placement, i) =>
          el(
            'label',
            { class: 'choice-tile' },
            placementInputs[i],
            el('span', { class: 'option-card' }, el('span', { class: 'option-card__name' }, text.placements[placement])),
          ),
        ),
      ),
    ),
  );

  const value = () => ({
    hands: [...skinInputs.values()].find((input) => input.checked)?.value ?? DEFAULT_SKIN,
    handsPlacement: placementInputs.find((input) => input.checked)?.value ?? HAND_PLACEMENTS[0],
  });
  element.addEventListener('change', () => onChange(value()));

  /** Adults only see the skin tones; a costume chosen before falls back to the default. */
  function setMode(newMode) {
    skinLabel.textContent = newMode === 'kids' ? text.kidsLabel : text.label;
    HAND_SKINS.forEach((skin, i) => {
      skinTiles[i].hidden = skin.kidsOnly && newMode !== 'kids';
    });
    const selected = HAND_SKINS.find((skin) => skin.id === value().hands);
    if (selected.kidsOnly && newMode !== 'kids') skinInputs.get(DEFAULT_SKIN).checked = true;
  }
  setMode(mode);

  return { element, value, setMode };
}
