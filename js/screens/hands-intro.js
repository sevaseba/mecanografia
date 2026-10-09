// "Posición de las manos" (#/posicion-de-las-manos), opened from the lessons map. The
// lesson screen shows the same intro on its own the first time (see lesson.js).

import { redirect, navigate } from '../router.js';
import { strings } from '../strings.js';
import { profiles } from '../profiles.js';
import { getLayout } from '../layouts/index.js';
import { createKeyIndex } from '../keystrokes.js';
import { markIntroDone } from '../hands-intro.js';
import { createHandsIntroView } from '../hands-intro-view.js';
import { createVoiceToggle } from '../sound-toggle.js';

const text = strings.handsIntro;

export const title = text.title;

export function render(container) {
  const profile = profiles.active();
  if (!profile) {
    redirect('/');
    return;
  }

  const view = createHandsIntroView({
    keyIndex: createKeyIndex(getLayout(profile.layoutId)),
    backHref: '#/lecciones',
    finishLabel: text.backToMap,
    ...voiceOptions(profile),
    onDone: () => {
      saveIntroDone(profile);
      navigate('/lecciones');
    },
  });
  container.append(view.element);
  view.start();
  return view.destroy;
}

/** Voice switch (kids only) and setting for the intro, shared with the lesson screen. */
export function voiceOptions(profile) {
  const voiceToggle = createVoiceToggle(profile.id);
  voiceToggle.classList.add('only-kids');
  return {
    tools: [voiceToggle],
    voiceEnabled: () => profiles.get(profile.id)?.settings.voice ?? false,
  };
}

export function saveIntroDone(profile) {
  const progress = profiles.progressFor(profile.id, profile.layoutId);
  profiles.saveProgress(profile.id, profile.layoutId, markIntroDone(progress, new Date().toISOString()));
}
