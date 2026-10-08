// "Teclado libre": type a sample text with the active profile's layout and mode.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { redirect } from '../router.js';
import { profiles } from '../profiles.js';
import { layouts } from '../layouts/index.js';
import { createKeyIndex } from '../keystrokes.js';
import { createPracticeView } from '../practice-view.js';
import { createSoundToggle } from '../sound-toggle.js';

const text = strings.freeTyping;
const keyIndexes = layouts.map(createKeyIndex);
const indexFor = (layoutId) => keyIndexes.find((index) => index.layout.id === layoutId);

export const title = text.title;

export function render(container) {
  const profile = profiles.active();
  if (!profile) {
    redirect('/');
    return;
  }

  const sampleSelect = el(
    'select',
    { id: 'free-typing-sample', onChange: () => changeSample(sampleSelect.value) },
    Object.entries(text.samples).map(([id, sample]) => el('option', { value: id }, sample.name)),
  );
  const layoutName = el('span', { class: 'tool tool--info' });
  const restartButton = el(
    'button',
    {
      type: 'button',
      class: 'button button--secondary button--small',
      onClick: () => {
        view.restart();
        view.focus();
      },
    },
    strings.practice.restart,
  );

  const soundToggle = createSoundToggle(profile.id);
  soundToggle.classList.add('only-kids');

  const view = createPracticeView({
    title: text.title,
    keyIndex: indexFor(profile.layoutId),
    keyIndexes,
    tools: [
      layoutName,
      el('div', { class: 'tool' }, el('label', { for: 'free-typing-sample' }, text.textLabel), sampleSelect),
      soundToggle,
      restartButton,
    ],
    soundEnabled: () => profiles.get(profile.id)?.settings.sound ?? false,
    // "Use this layout" in the layout warning changes the profile's layout.
    onLayoutSuggestion: (layoutId) => {
      profiles.update(profile.id, { layoutId });
      useLayout(layoutId);
      view.focus();
    },
  });

  container.append(view.element);
  useLayout(profile.layoutId);
  view.focus();

  function useLayout(layoutId) {
    const index = indexFor(layoutId);
    layoutName.textContent = strings.practice.layoutUsed(index.layout.name);
    view.setLayout(index);
    changeSample(index.layout.language);
  }

  function changeSample(sampleId) {
    sampleSelect.value = sampleId;
    view.setText(text.samples[sampleId].text, sampleId);
  }

  return view.destroy;
}
