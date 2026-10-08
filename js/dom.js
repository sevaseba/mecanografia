// Tiny helper to build DOM nodes without innerHTML.

/**
 * el('p', { class: 'lead' }, 'Hola') → <p class="lead">Hola</p>
 * Attributes starting with "on" are attached as event listeners.
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (name.startsWith('on') && typeof value === 'function') {
      node.addEventListener(name.slice(2).toLowerCase(), value);
    } else if (value === true) {
      node.setAttribute(name, '');
    } else if (value !== false && value != null) {
      node.setAttribute(name, value);
    }
  }
  node.append(...children.flat().filter((child) => child != null));
  return node;
}
