import { el } from '../dom.js';
import { strings } from '../strings.js';

const text = strings.notFound;

export const title = text.title;

export function render(container) {
  container.append(
    el('h1', {}, text.title),
    el('p', {}, text.body),
    el('a', { class: 'button', href: '#/' }, text.back),
  );
}
