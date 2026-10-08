// Single line of target text that scrolls horizontally: the current character stays at a
// fixed anchor, what was typed slides out to the left and fades away.

import { el } from './dom.js';

const ANCHOR = 0.4; // current character position, as a fraction of the line width

export function createTextLineView() {
  const track = el('div', { class: 'text-line__track' });
  const element = el('div', { class: 'text-line' }, track);
  let spans = [];

  function setText(chars, lang) {
    track.lang = lang;
    spans = chars.map((char) => el('span', { class: char === ' ' ? 'char char--space' : 'char' }, char));
    track.replaceChildren(...spans);
  }

  /** session: typing session (typed entries + position). */
  function update(session) {
    spans.forEach((span, position) => {
      const entry = session.typed[position];
      span.classList.toggle('char--correct', entry?.correct === true);
      span.classList.toggle('char--wrong', entry?.correct === false);
      span.classList.toggle('char--current', position === session.position);
    });
    recenter(session.position);
  }

  function recenter(position) {
    const current = spans[Math.min(position, spans.length - 1)];
    if (!current) return;
    const offset = position >= spans.length ? current.offsetLeft + current.offsetWidth : current.offsetLeft;
    track.style.transform = `translateX(${element.clientWidth * ANCHOR - offset}px)`;
  }

  // Keep the anchor right when the line changes size (window resize, mode change).
  const resizeObserver = new ResizeObserver(() => {
    const position = spans.findIndex((span) => span.classList.contains('char--current'));
    recenter(position === -1 ? spans.length : position);
  });
  resizeObserver.observe(element);

  return { element, setText, update, destroy: () => resizeObserver.disconnect() };
}
