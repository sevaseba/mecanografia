// Searches the ElevenLabs voice library for female rioplatense voices to choose the kids
// voice, and writes a page to listen to them side by side. Development tool, not part of the app.
//
//   node tools/find-voices.mjs                 searches and writes the page with each voice's preview
//   node tools/find-voices.mjs --sample ID...  also records the same guide sentences with those voices
//
// Needs ELEVENLABS_API_KEY. Searching is free; --sample uses a few hundred characters per voice
// (a library voice may first need "Add to My Voices" on the ElevenLabs site).
// The page and the samples go to the system temp folder, outside the project.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const API = 'https://api.elevenlabs.io/v1';
const MODEL = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
const SPEED = 0.95; // same as generate-voice.mjs
const SAMPLE =
  'Cada dedo tiene un color. Apretá las teclas de su mismo color. ' +
  'Poné los índices en la efe y la jota: tienen una rayita. ¡Muy bien! Ya sabés dónde va cada dedo.';

// Several searches, because the library labels accents inconsistently.
const SEARCHES = [
  { accent: 'argentine' },
  { accent: 'rioplatense' },
  { search: 'argentina' },
  { search: 'argentine' },
  { search: 'rioplatense' },
  { search: 'maestra' },
  { search: 'teacher', accent: 'argentine' },
];
// Words in a voice's labels that suggest warmth; they only sort the list.
const WARM = ['warm', 'calm', 'soft', 'gentle', 'friendly', 'sweet', 'cálid', 'dulce', 'suave', 'maestra', 'teacher', 'educat', 'children', 'niñ', 'story', 'cuento'];
const RIOPLATENSE = ['argentin', 'rioplat', 'buenos aires', 'uruguay'];

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('Falta ELEVENLABS_API_KEY.');
  process.exit(1);
}

const dir = join(tmpdir(), 'mecanografia-voces');
mkdirSync(dir, { recursive: true });
const listFile = join(dir, 'voces.json');
const args = process.argv.slice(2);

let voices;
if (args[0] === '--sample') {
  if (!existsSync(listFile)) {
    console.error('Primero corré la búsqueda: node tools/find-voices.mjs');
    process.exit(1);
  }
  voices = JSON.parse(readFileSync(listFile, 'utf8'));
  for (const id of args.slice(1)) {
    try {
      writeFileSync(join(dir, `${id}.mp3`), await synthesize(id));
      console.log(`grabada la muestra de ${voices.find((voice) => voice.id === id)?.name ?? id}`);
    } catch (error) {
      console.error(`${id}: ${error.message}`);
    }
  }
} else {
  voices = await search();
  writeFileSync(listFile, JSON.stringify(voices, null, 2));
  for (const [i, voice] of voices.entries()) {
    console.log(`${String(i + 1).padStart(2)}. ${voice.name}  [${voice.id}]  ${[voice.accent, voice.age, voice.descriptive].filter(Boolean).join(', ')}`);
  }
}

const page = join(dir, 'voces.html');
writeFileSync(page, html(voices));
console.log(`\n${voices.length} voces. Abrí la página para escucharlas:\n${pathToFileURL(page).href}`);

async function search() {
  const found = new Map();
  for (const params of SEARCHES) {
    const query = new URLSearchParams({ gender: 'female', language: 'es', page_size: '100', ...params });
    const response = await fetch(`${API}/shared-voices?${query}`, { headers: { 'xi-api-key': key } });
    if (!response.ok) throw new Error(`ElevenLabs respondió ${response.status}: ${await response.text()}`);
    for (const voice of (await response.json()).voices ?? []) {
      found.set(voice.voice_id, {
        id: voice.voice_id,
        name: voice.name,
        accent: voice.accent,
        age: voice.age,
        descriptive: voice.descriptive,
        useCase: voice.use_case,
        description: voice.description ?? '',
        uses: voice.cloned_by_count ?? 0,
        preview: voice.preview_url,
      });
    }
  }
  const text = (voice) => [voice.name, voice.accent, voice.descriptive, voice.useCase, voice.description].join(' ').toLowerCase();
  // Only voices that say they are rioplatense; the warmest and most used first.
  return [...found.values()]
    .filter((voice) => RIOPLATENSE.some((word) => text(voice).includes(word)))
    .map((voice) => ({ ...voice, warmth: WARM.filter((word) => text(voice).includes(word)).length }))
    .sort((a, b) => b.warmth - a.warmth || b.uses - a.uses);
}

async function synthesize(voiceId) {
  const response = await fetch(`${API}/text-to-speech/${voiceId}?output_format=mp3_44100_64`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({ text: SAMPLE, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75, speed: SPEED } }),
  });
  if (!response.ok) throw new Error(`ElevenLabs respondió ${response.status}: ${await response.text()}`);
  return Buffer.from(await response.arrayBuffer());
}

function html(list) {
  const escape = (value) => String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rows = list
    .map(
      (voice, i) => `<li>
  <h2>${i + 1}. ${escape(voice.name)}</h2>
  <p class="tags">${escape([voice.accent, voice.age, voice.descriptive, voice.useCase].filter(Boolean).join(' · '))} · usada ${voice.uses} veces</p>
  <p>${escape(voice.description)}</p>
  <p>Muestra de la biblioteca: <audio controls preload="none" src="${escape(voice.preview)}"></audio></p>
  ${existsSync(join(dir, `${voice.id}.mp3`)) ? `<p><strong>Nuestra frase:</strong> <audio controls preload="none" src="${voice.id}.mp3"></audio></p>` : ''}
  <code>${voice.id}</code>
</li>`,
    )
    .join('\n');
  return `<!doctype html>
<html lang="es-AR"><head><meta charset="utf-8"><title>Voces rioplatenses</title>
<style>
  body { font: 18px system-ui, sans-serif; max-width: 52rem; margin: 2rem auto; padding: 0 1rem; }
  ol { list-style: none; padding: 0; } li { border: 1px solid #ccc; border-radius: 8px; padding: 0.5rem 1rem; margin-bottom: 1rem; }
  h2 { margin: 0.3rem 0; font-size: 1.2em; } .tags { color: #555; } audio { vertical-align: middle; }
</style></head>
<body><h1>Voces rioplatenses para la guía infantil</h1>
<p>Frase de prueba: «${escape(SAMPLE)}»</p>
<ol>
${rows}
</ol></body></html>
`;
}
