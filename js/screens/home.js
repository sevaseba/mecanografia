import { el } from '../dom.js';
import { strings } from '../strings.js';

const text = strings.home;

export const title = text.title;

export function render(container) {
  container.append(
    el('h1', {}, text.title),
    el('p', { class: 'lead' }, text.lead),
    el('p', {}, text.about),
    el(
      'div',
      { class: 'card' },
      el('p', { class: 'muted' }, text.comingSoon),
      el('a', { class: 'button', href: '#/teclado-libre' }, text.freeTypingLink),
    ),
  );
}
