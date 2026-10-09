// Español Latinoamericano (Windows "Latin American", KLID 0000080A). Physical ISO keyboard.
//
// Layout data contract (every file in js/layouts/ follows it):
// - id, name: identifier and user-facing name. language: ISO code of the course language.
// - homeRow: codes of the home-row keys, left pinky to right pinky (where the fingers rest).
// - rows: physical rows, top to bottom. Each key:
//     code     KeyboardEvent.code of the physical key
//     finger   L5..L1 / R1..R5 (pinky..thumb), or 'T' for either thumb (Space);
//              omitted on keys that are not part of touch typing (Ctrl, Win, …)
//     width    in key units (default 1)
//     base, shift, altGr   character produced on each layer (omit if none)
//     dead     layers whose character is a dead key, e.g. ['base', 'shift']
//     altGraph true on the key that acts as AltGr (usually AltRight)
//   Keys without characters are modifiers/controls; their labels come from strings.js.
//   { spacer: true, width } leaves an empty gap (e.g. above the ISO Enter).
// - deadKeys: dead character → { follower character: composed result }.
//   Dead key + space always produces the dead character itself.

export default {
  id: 'es-latam',
  name: 'Español Latinoamericano',
  language: 'es',
  homeRow: ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'],
  rows: [
    [
      { code: 'Backquote', finger: 'L5', base: '|', shift: '°', altGr: '¬' },
      { code: 'Digit1', finger: 'L5', base: '1', shift: '!' },
      { code: 'Digit2', finger: 'L4', base: '2', shift: '"' },
      { code: 'Digit3', finger: 'L3', base: '3', shift: '#' },
      { code: 'Digit4', finger: 'L2', base: '4', shift: '$' },
      { code: 'Digit5', finger: 'L2', base: '5', shift: '%' },
      { code: 'Digit6', finger: 'L2', base: '6', shift: '&' },
      { code: 'Digit7', finger: 'R2', base: '7', shift: '/' },
      { code: 'Digit8', finger: 'R3', base: '8', shift: '(' },
      { code: 'Digit9', finger: 'R4', base: '9', shift: ')' },
      { code: 'Digit0', finger: 'R5', base: '0', shift: '=' },
      { code: 'Minus', finger: 'R5', base: "'", shift: '?', altGr: '\\' },
      { code: 'Equal', finger: 'R5', base: '¿', shift: '¡' },
      { code: 'Backspace', width: 2 },
    ],
    [
      { code: 'Tab', width: 1.5 },
      { code: 'KeyQ', finger: 'L5', base: 'q', shift: 'Q', altGr: '@' },
      { code: 'KeyW', finger: 'L4', base: 'w', shift: 'W' },
      { code: 'KeyE', finger: 'L3', base: 'e', shift: 'E' },
      { code: 'KeyR', finger: 'L2', base: 'r', shift: 'R' },
      { code: 'KeyT', finger: 'L2', base: 't', shift: 'T' },
      { code: 'KeyY', finger: 'R2', base: 'y', shift: 'Y' },
      { code: 'KeyU', finger: 'R2', base: 'u', shift: 'U' },
      { code: 'KeyI', finger: 'R3', base: 'i', shift: 'I' },
      { code: 'KeyO', finger: 'R4', base: 'o', shift: 'O' },
      { code: 'KeyP', finger: 'R5', base: 'p', shift: 'P' },
      { code: 'BracketLeft', finger: 'R5', base: '´', shift: '¨', dead: ['base', 'shift'] },
      { code: 'BracketRight', finger: 'R5', base: '+', shift: '*', altGr: '~' },
      { spacer: true, width: 1.5 },
    ],
    [
      { code: 'CapsLock', width: 1.75 },
      { code: 'KeyA', finger: 'L5', base: 'a', shift: 'A' },
      { code: 'KeyS', finger: 'L4', base: 's', shift: 'S' },
      { code: 'KeyD', finger: 'L3', base: 'd', shift: 'D' },
      { code: 'KeyF', finger: 'L2', base: 'f', shift: 'F' },
      { code: 'KeyG', finger: 'L2', base: 'g', shift: 'G' },
      { code: 'KeyH', finger: 'R2', base: 'h', shift: 'H' },
      { code: 'KeyJ', finger: 'R2', base: 'j', shift: 'J' },
      { code: 'KeyK', finger: 'R3', base: 'k', shift: 'K' },
      { code: 'KeyL', finger: 'R4', base: 'l', shift: 'L' },
      { code: 'Semicolon', finger: 'R5', base: 'ñ', shift: 'Ñ' },
      { code: 'Quote', finger: 'R5', base: '{', shift: '[', altGr: '^', dead: ['altGr'] },
      { code: 'Backslash', finger: 'R5', base: '}', shift: ']', altGr: '`', dead: ['altGr'] },
      { code: 'Enter', finger: 'R5', width: 1.25 },
    ],
    [
      { code: 'ShiftLeft', finger: 'L5', width: 1.25 },
      { code: 'IntlBackslash', finger: 'L5', base: '<', shift: '>' },
      { code: 'KeyZ', finger: 'L5', base: 'z', shift: 'Z' },
      { code: 'KeyX', finger: 'L4', base: 'x', shift: 'X' },
      { code: 'KeyC', finger: 'L3', base: 'c', shift: 'C' },
      { code: 'KeyV', finger: 'L2', base: 'v', shift: 'V' },
      { code: 'KeyB', finger: 'L2', base: 'b', shift: 'B' },
      { code: 'KeyN', finger: 'R2', base: 'n', shift: 'N' },
      { code: 'KeyM', finger: 'R2', base: 'm', shift: 'M' },
      { code: 'Comma', finger: 'R3', base: ',', shift: ';' },
      { code: 'Period', finger: 'R4', base: '.', shift: ':' },
      { code: 'Slash', finger: 'R5', base: '-', shift: '_' },
      { code: 'ShiftRight', finger: 'R5', width: 2.75 },
    ],
    [
      { code: 'ControlLeft', width: 1.25 },
      { code: 'MetaLeft', width: 1.25 },
      { code: 'AltLeft', width: 1.25 },
      { code: 'Space', finger: 'T', width: 6.25 },
      { code: 'AltRight', finger: 'R1', altGraph: true, width: 1.25 },
      { code: 'MetaRight', width: 1.25 },
      { code: 'ContextMenu', width: 1.25 },
      { code: 'ControlRight', width: 1.25 },
    ],
  ],
  deadKeys: {
    '´': { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'ý', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', Y: 'Ý' },
    '¨': { a: 'ä', e: 'ë', i: 'ï', o: 'ö', u: 'ü', y: 'ÿ', A: 'Ä', E: 'Ë', I: 'Ï', O: 'Ö', U: 'Ü' },
    '^': { a: 'â', e: 'ê', i: 'î', o: 'ô', u: 'û', A: 'Â', E: 'Ê', I: 'Î', O: 'Ô', U: 'Û' },
    '`': { a: 'à', e: 'è', i: 'ì', o: 'ò', u: 'ù', A: 'À', E: 'È', I: 'Ì', O: 'Ò', U: 'Ù' },
  },
};
