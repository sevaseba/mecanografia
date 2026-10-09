// On/off switches for the active profile's sounds and voice (toggle buttons with aria-pressed).

import { el } from './dom.js';
import { strings } from './strings.js';
import { profiles } from './profiles.js';

export const createSoundToggle = (profileId) => createToggle(profileId, 'sound', strings.sound, ['🔊', '🔇']);

export const createVoiceToggle = (profileId) => createToggle(profileId, 'voice', strings.voice, ['🗣️', '🤐']);

function createToggle(profileId, setting, text, [iconOn, iconOff]) {
  const button = el('button', { type: 'button', class: 'button button--secondary button--small sound-toggle' });

  const render = () => {
    const on = profiles.get(profileId)?.settings[setting] ?? false;
    button.setAttribute('aria-pressed', String(on));
    button.title = on ? text.on : text.off;
    button.replaceChildren(el('span', { 'aria-hidden': 'true' }, `${on ? iconOn : iconOff} `), text.label);
  };

  button.addEventListener('click', () => {
    const on = button.getAttribute('aria-pressed') === 'true';
    profiles.updateSettings(profileId, { [setting]: !on });
    render();
  });

  render();
  return button;
}
