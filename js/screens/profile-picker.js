// "¿Quién va a practicar?": pick, create, edit or delete profiles; export/import backups.
// Showing this screen means nobody is practicing yet, so it clears the active profile.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { announce } from '../announcer.js';
import { navigate } from '../router.js';
import { confirmDialog } from '../dialog.js';
import { profiles } from '../profiles.js';
import { getLayout } from '../layouts/index.js';
import { serializeBackup, parseBackup, BackupError } from '../storage.js';

const text = strings.picker;

export const title = text.title;

// Message to show after the screen redraws itself (profile removed, backup imported).
let pendingMessage = null;

export function render(container) {
  if (profiles.active()) profiles.setActive(null);

  const list = profiles.list();
  const status = el('div', { class: 'picker-status', role: 'status' });
  if (pendingMessage) {
    showStatus(status, pendingMessage);
    pendingMessage = null;
  }

  const children = [
    el('h1', {}, text.title),
    list.length === 0 ? el('p', { class: 'lead' }, strings.picker.welcome) : null,
    storageWarning(),
    el(
      'ul',
      { class: 'profile-grid' },
      list.map((profile) => profileCard(profile, (message) => rerender(container, message))),
      el(
        'li',
        { class: 'profile-card profile-card--new' },
        el(
          'a',
          { class: 'profile-card__main', href: '#/perfiles/nuevo' },
          el('span', { class: 'profile-card__avatar', 'aria-hidden': 'true' }, '＋'),
          el('span', { class: 'profile-card__name' }, list.length === 0 ? text.createFirst : text.newProfile),
        ),
      ),
    ),
    backupSection(list.length, status, (message) => rerender(container, message)),
    status,
  ];
  container.append(...children.filter(Boolean));
}

function rerender(container, message) {
  pendingMessage = message;
  container.replaceChildren();
  render(container);
  // The redrawn screen replaced the button that had focus: start again from the title.
  const heading = container.querySelector('h1');
  heading.tabIndex = -1;
  heading.focus();
  announce(message);
}

function storageWarning() {
  if (!profiles.persistent) return el('p', { class: 'alert alert--warning' }, text.notPersistent);
  if (!profiles.canSave) return el('p', { class: 'alert alert--warning' }, text.readOnly);
  return null;
}

function profileCard(profile, onRemoved) {
  const summary = text.profileSummary(strings.modes[profile.mode], getLayout(profile.layoutId).name);

  const remove = async () => {
    const confirmed = await confirmDialog({
      title: text.removeTitle(profile.name),
      message: text.removeMessage,
      confirmLabel: text.removeConfirm,
      cancelLabel: text.cancel,
      danger: true,
    });
    if (!confirmed) return;
    profiles.remove(profile.id);
    onRemoved(text.removed(profile.name));
  };

  return el(
    'li',
    { class: 'profile-card' },
    el(
      'button',
      {
        type: 'button',
        class: 'profile-card__main',
        'aria-label': `${text.choose(profile.name)}. ${summary}`,
        onClick: () => {
          profiles.setActive(profile.id);
          navigate('/inicio');
        },
      },
      el('span', { class: 'profile-card__avatar', 'aria-hidden': 'true' }, profile.avatar),
      el('span', { class: 'profile-card__name' }, profile.name),
      el('span', { class: 'profile-card__summary' }, summary),
    ),
    el(
      'div',
      { class: 'profile-card__actions' },
      el('a', { href: `#/perfiles/${encodeURIComponent(profile.id)}/editar`, 'aria-label': text.editLabel(profile.name) }, text.edit),
      el('button', { type: 'button', class: 'link-button', 'aria-label': text.removeLabel(profile.name), onClick: remove }, text.remove),
    ),
  );
}

function backupSection(profileCount, status, onImported) {
  const backupText = strings.backup;
  const fileInput = el('input', { type: 'file', accept: 'application/json,.json', hidden: true });

  const exportBackup = () => {
    const date = new Date().toISOString().slice(0, 10);
    const blob = new Blob([serializeBackup(profiles.exportData())], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = el('a', { href: url, download: backupText.fileName(date) });
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showStatus(status, backupText.exported);
  };

  fileInput.addEventListener('change', async () => {
    const [file] = fileInput.files;
    fileInput.value = ''; // allow choosing the same file again
    if (!file) return;

    let data;
    try {
      data = parseBackup(await file.text());
    } catch (error) {
      if (!(error instanceof BackupError)) throw error;
      showStatus(status, backupText.errors[error.reason], true);
      return;
    }

    if (profileCount > 0) {
      const confirmed = await confirmDialog({
        title: backupText.importTitle,
        message: backupText.importMessage(profileCount, data.profiles.length),
        confirmLabel: backupText.importConfirm,
        cancelLabel: text.cancel,
        danger: true,
      });
      if (!confirmed) return;
    }
    profiles.replaceAll({ ...data, activeProfileId: null });
    onImported(backupText.imported(data.profiles.length));
  });

  return el(
    'section',
    { class: 'backup', 'aria-labelledby': 'backup-title' },
    el('h2', { id: 'backup-title' }, backupText.title),
    el('p', { class: 'muted' }, backupText.description),
    el(
      'div',
      { class: 'backup__actions' },
      el(
        'button',
        { type: 'button', class: 'button button--secondary', disabled: profileCount === 0, onClick: exportBackup },
        backupText.export,
      ),
      el('button', { type: 'button', class: 'button button--secondary', onClick: () => fileInput.click() }, backupText.import),
      fileInput,
    ),
  );
}

function showStatus(status, message, isError = false) {
  status.className = isError ? 'picker-status alert alert--warning' : 'picker-status muted';
  status.replaceChildren(el('p', {}, message));
}
