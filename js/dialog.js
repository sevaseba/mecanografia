// Confirmation dialog on the native <dialog> element (modal, focus trap and Escape for free).

import { el } from './dom.js';

/**
 * @returns {Promise<boolean>} true if confirmed
 */
export function confirmDialog({ title, message, confirmLabel, cancelLabel, danger = false }) {
  return new Promise((resolve) => {
    const cancelButton = el('button', { type: 'button', class: 'button button--secondary' }, cancelLabel);
    const confirmButton = el(
      'button',
      { type: 'button', class: danger ? 'button button--danger' : 'button' },
      confirmLabel,
    );
    const dialog = el(
      'dialog',
      { class: 'dialog', 'aria-labelledby': 'dialog-title', 'aria-describedby': 'dialog-message' },
      el('h2', { id: 'dialog-title' }, title),
      el('p', { id: 'dialog-message' }, message),
      el('div', { class: 'dialog__actions' }, cancelButton, confirmButton),
    );

    const previousFocus = document.activeElement;
    const close = (result) => {
      dialog.close();
      dialog.remove();
      previousFocus?.focus?.();
      resolve(result);
    };
    cancelButton.addEventListener('click', () => close(false));
    confirmButton.addEventListener('click', () => close(true));
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault(); // Escape: close through our own path
      close(false);
    });

    document.body.append(dialog);
    dialog.showModal();
    // Destructive actions start on "cancel" so Enter never deletes by accident.
    (danger ? cancelButton : confirmButton).focus();
  });
}
