// Records the kids voice clips with ElevenLabs text to speech, using a rioplatense voice.
// Development tool, not part of the app: run it from the project root after changing any
// kids text of the hands intro, then bump CACHE_VERSION in sw.js.
//
//   node tools/generate-voice.mjs --list   sentences and clips, nothing is recorded
//   node tools/generate-voice.mjs          records the missing clips
//   node tools/generate-voice.mjs --force  records every clip again (e.g. after changing the voice)
//
// Needs the environment variables ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID (a voice from
// the ElevenLabs library added to "My Voices"). ELEVENLABS_MODEL is optional.
// Clips no sentence uses any more are deleted, and assets/audio/kids/index.json lists the rest.

import { existsSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { layouts } from '../js/layouts/index.js';
import { createKeyIndex } from '../js/keystrokes.js';
import { buildIntroSteps } from '../js/hands-intro.js';
import { spokenSentences } from '../js/hands-intro-copy.js';
import { VOICE_DIR, VOICE_INDEX, clipName, spokenText } from '../js/voice-clips.js';

const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
const SPEED = 0.95; // a touch slower than the default, for kids (0.9 felt slow)
const FORMAT = 'mp3_44100_64';

const root = new URL('../', import.meta.url);
const dir = new URL(VOICE_DIR, root);
const indexFile = new URL(VOICE_INDEX, root);
const args = new Set(process.argv.slice(2));

const sentences = new Map(); // clip name → sentence
for (const layout of layouts) {
  const keyIndex = createKeyIndex(layout);
  for (const sentence of spokenSentences(keyIndex, buildIntroSteps(keyIndex))) sentences.set(clipName(sentence), sentence);
}

if (args.has('--list')) {
  for (const [name, sentence] of sentences) {
    console.log(`${existsSync(new URL(name, dir)) ? '✓' : '·'} ${name}  «${spokenText(sentence)}»`);
  }
  process.exit(0);
}

const key = process.env.ELEVENLABS_API_KEY;
const voiceId = process.env.ELEVENLABS_VOICE_ID;
if (!key || !voiceId) {
  console.error('Faltan ELEVENLABS_API_KEY y ELEVENLABS_VOICE_ID.');
  process.exit(1);
}

let recorded = 0;
for (const [name, sentence] of sentences) {
  const file = new URL(name, dir);
  if (existsSync(file) && !args.has('--force')) continue;
  writeFileSync(file, await synthesize(spokenText(sentence)));
  recorded += 1;
  console.log(`grabado ${name}`);
}

for (const name of readdirSync(dir).filter((name) => name.endsWith('.mp3') && !sentences.has(name))) {
  unlinkSync(new URL(name, dir));
  console.log(`borrado ${name} (ya no se usa)`);
}

writeFileSync(indexFile, `${JSON.stringify({ clips: [...sentences.keys()].sort() }, null, 2)}\n`);
console.log(`Listo: ${recorded} clips nuevos, ${sentences.size} en total. Subí CACHE_VERSION en sw.js.`);

async function synthesize(text) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${FORMAT}`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: SPEED },
    }),
  });
  if (!response.ok) throw new Error(`ElevenLabs respondió ${response.status}: ${await response.text()}`);
  return Buffer.from(await response.arrayBuffer());
}
