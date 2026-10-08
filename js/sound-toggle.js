// On/off switch for the active profile's sounds (a toggle button with aria-pressed).

import { el } from './dom.js';
import { strings } from './strings.js';
import { profiles } from './profiles.js';

export function createSoundToggle(profileId) {
  const button = el('button', { type: 'button', class: 'button button--secondary button--small sound-toggle' });

  const render = () => {
    const on = profiles.get(profileId)?.settings.sound ?? false;
    button.setAttribute('aria-pressed', String(on));
    button.title = on ? strings.sound.on : strings.sound.off;
    button.replaceChildren(el('span', { 'aria-hidden': 'true' }, on ? '🔊 ' : '🔇 '), strings.sound.label);
  };

  button.addEventListener('click', () => {
    const on = button.getAttribute('aria-pressed') === 'true';
    profiles.updateSettings(profileId, { sound: !on });
    render();
  });

  render();
  return button;
}
