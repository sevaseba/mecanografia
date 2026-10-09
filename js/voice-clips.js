// Recorded voice clips (kids mode): which file holds each sentence.
//
// A clip is named after its sentence ("Apretá la A con el meñique izquierdo." →
// apreta-la-a-con-el-menique-izquierdo.mp3), so sentences shared by several layouts share
// one file, and changing a text simply asks for a new clip. tools/generate-voice.mjs
// records the missing ones and lists the available clips in VOICE_INDEX.

export const VOICE_DIR = './assets/audio/kids/';
export const VOICE_INDEX = `${VOICE_DIR}index.json`;

// How symbols are read aloud (and named in files).
const SPOKEN_SYMBOLS = { ';': 'punto y coma' };

// Spanish names of the letters, so a lone "F" is never read the English way.
const LETTER_NAMES = {
  A: 'a', B: 'be', C: 'ce', D: 'de', E: 'e', F: 'efe', G: 'ge', H: 'hache', I: 'i', J: 'jota',
  K: 'ka', L: 'ele', M: 'eme', N: 'ene', Ñ: 'eñe', O: 'o', P: 'pe', Q: 'cu', R: 'erre', S: 'ese',
  T: 'te', U: 'u', V: 've', W: 'doble ve', X: 'equis', Y: 'ye', Z: 'zeta',
};

/** The sentence as it must be read aloud. */
export function spokenText(text) {
  return text
    .replace(/[;]/g, (symbol) => SPOKEN_SYMBOLS[symbol])
    .replace(/(?<=\bla )[A-ZÑ](?!\p{L})/gu, (letter) => LETTER_NAMES[letter]);
}

/** File name of a sentence's clip. */
export function clipName(text) {
  const slug = spokenText(text)
    .toLowerCase()
    .replace(/ñ/g, 'ny')
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // drop the accents NFD split off
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${slug}.mp3`;
}
