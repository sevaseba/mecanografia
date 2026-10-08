// Create (#/perfiles/nuevo) or edit (#/perfiles/:id/editar) a profile.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { navigate, redirect } from '../router.js';
import { confirmDialog } from '../dialog.js';
import { profiles, AVATARS, MODES, ProfileError } from '../profiles.js';
import { layouts, defaultLayoutId } from '../layouts/index.js';
import { createKeyIndex } from '../keystrokes.js';
import { detectSystemLayout } from '../layout-check.js';
import { createCalibrationView } from '../calibration-view.js';

const text = strings.profileForm;
const keyIndexes = layouts.map(createKeyIndex);

export const title = (params) => (params.id ? text.editTitle : text.newTitle);

export function render(container, params) {
  const editing = params.id ? profiles.get(params.id) : null;
  if (params.id && !editing) {
    redirect('/');
    return;
  }

  const usedAvatars = new Set(profiles.list().map((profile) => profile.avatar));
  const initial = editing ?? {
    name: '',
    avatar: AVATARS.find((avatar) => !usedAvatars.has(avatar)) ?? AVATARS[0],
    mode: 'kids',
    layoutId: defaultLayoutId,
  };

  // --- Fields ---
  const nameError = el('p', { id: 'profile-name-error', class: 'field-error', hidden: true });
  const nameInput = el('input', {
    id: 'profile-name',
    type: 'text',
    value: initial.name,
    maxlength: '30',
    autocomplete: 'off',
    required: true,
    'aria-describedby': 'profile-name-error',
  });

  const avatarField = radioGroup(
    'avatar',
    text.avatarLabel,
    AVATARS.map((avatar) => ({ value: avatar, label: el('span', { class: 'avatar-option' }, avatar) })),
    initial.avatar,
    'avatar-grid',
  );
  const modeField = radioGroup(
    'mode',
    text.modeLabel,
    MODES.map((mode) => ({ value: mode, label: optionCard(strings.modes[mode], text.modeDescriptions[mode]) })),
    initial.mode,
    'option-grid',
  );
  const layoutField = radioGroup(
    'layout',
    text.layoutLabel,
    layouts.map((layout) => ({ value: layout.id, label: optionCard(layout.name, text.layoutDescriptions[layout.id]) })),
    initial.layoutId,
    'option-grid',
  );

  const calibration = createCalibrationView({
    keyIndexes,
    layoutId: initial.layoutId,
    onUseLayout: (layoutId) => setLayout(layoutId),
  });
  layoutField.element.addEventListener('change', () => calibration.setLayout(layoutField.value()));

  // A new profile starts with the layout the computer is using, when the browser can tell.
  if (!editing) {
    detectSystemLayout(keyIndexes).then(({ layoutId }) => {
      if (layoutId) setLayout(layoutId);
    });
  }

  function setLayout(layoutId) {
    layoutField.select(layoutId);
    calibration.setLayout(layoutId);
  }

  // --- Form ---
  const formError = el('p', { class: 'field-error', role: 'alert', hidden: true });
  const form = el(
    'form',
    { class: 'profile-form', novalidate: true },
    el('div', { class: 'field' }, el('label', { for: 'profile-name' }, text.nameLabel), nameInput, nameError),
    avatarField.element,
    modeField.element,
    layoutField.element,
    el('details', { class: 'calibration-details' }, el('summary', {}, strings.calibration.title), calibration.element),
    formError,
    el(
      'div',
      { class: 'form-actions' },
      el('button', { type: 'submit', class: 'button' }, editing ? text.save : text.create),
      el('a', { class: 'button button--secondary', href: backPath() }, text.cancel),
    ),
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = {
      name: nameInput.value,
      avatar: avatarField.value(),
      mode: modeField.value(),
      layoutId: layoutField.value(),
    };
    try {
      if (editing) profiles.update(editing.id, fields);
      else profiles.create(fields);
    } catch (error) {
      if (!(error instanceof ProfileError)) throw error;
      showError(error.reason);
      return;
    }
    navigate(editing ? backPath() : '/inicio');
  });

  function showError(reason) {
    const message = text.errors[reason];
    if (reason === 'name-empty' || reason === 'name-taken') {
      nameError.textContent = message;
      nameError.hidden = false;
      nameInput.setAttribute('aria-invalid', 'true');
      nameInput.focus();
    } else {
      formError.textContent = message;
      formError.hidden = false;
    }
  }

  nameInput.addEventListener('input', () => {
    nameError.hidden = true;
    nameInput.removeAttribute('aria-invalid');
  });

  // Editing the active profile comes from its home; editing another one, from the picker.
  function backPath() {
    return editing && profiles.active()?.id === editing.id ? '/inicio' : '/';
  }

  container.append(el('h1', {}, editing ? text.editTitle : text.newTitle), form);
  if (editing) container.append(removeSection(editing));
  if (!editing) nameInput.focus();
}

function removeSection(profile) {
  const pickerText = strings.picker;
  const remove = async () => {
    const confirmed = await confirmDialog({
      title: pickerText.removeTitle(profile.name),
      message: pickerText.removeMessage,
      confirmLabel: pickerText.removeConfirm,
      cancelLabel: pickerText.cancel,
      danger: true,
    });
    if (!confirmed) return;
    profiles.remove(profile.id);
    navigate('/');
  };
  return el(
    'div',
    { class: 'danger-zone' },
    el('button', { type: 'button', class: 'button button--danger', onClick: remove }, text.removeProfile),
  );
}

function optionCard(name, description) {
  return el(
    'span',
    { class: 'option-card' },
    el('span', { class: 'option-card__name' }, name),
    el('span', { class: 'option-card__description' }, description),
  );
}

/** Accessible radio group (native radios, styled as tiles). */
function radioGroup(name, legend, options, selected, layoutClass) {
  const inputs = options.map(({ value }) =>
    el('input', { type: 'radio', name, value, checked: value === selected, class: 'choice-tile__input' }),
  );
  const element = el(
    'fieldset',
    { class: 'field' },
    el('legend', {}, legend),
    el(
      'div',
      { class: layoutClass },
      options.map(({ label }, i) => el('label', { class: 'choice-tile' }, inputs[i], label)),
    ),
  );
  return {
    element,
    value: () => inputs.find((input) => input.checked)?.value,
    select: (value) => inputs.forEach((input) => (input.checked = input.value === value)),
  };
}
