// Plays recorded voice clips, one after the other. Only clips listed in the voice index
// are played: a sentence without a clip is silently skipped (no failed requests).

import { VOICE_DIR, VOICE_INDEX, clipName } from './voice-clips.js';

let available = null; // Promise<Set<file name>>

function availableClips() {
  available ??= fetch(VOICE_INDEX)
    .then((response) => (response.ok ? response.json() : { clips: [] }))
    .then((index) => new Set(index.clips))
    .catch(() => new Set());
  return available;
}

export function createVoice() {
  const audio = new Audio();
  let queue = [];
  let request = 0; // ignores clip lists that arrive after a newer say() or stop()

  audio.addEventListener('ended', playNext);

  function playNext() {
    const next = queue.shift();
    if (!next) return;
    audio.src = `${VOICE_DIR}${next}`;
    // Autoplay may be blocked before the first user gesture: then the "Escuchar" button helps.
    audio.play().catch(() => {
      queue = [];
    });
  }

  /** Says the sentences in order, replacing whatever was being said. */
  async function say(sentences) {
    const current = ++request;
    const clips = await availableClips();
    if (current !== request) return;
    audio.pause();
    queue = sentences.map(clipName).filter((name) => clips.has(name));
    playNext();
  }

  function stop() {
    request += 1;
    queue = [];
    audio.pause();
  }

  return { say, stop };
}
