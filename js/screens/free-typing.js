// "Teclado libre": type a sample text on any layout. Test bench for the practice view.

import { el } from '../dom.js';
import { strings } from '../strings.js';
import { layouts, defaultLayoutId } from '../layouts/index.js';
import { createKeyIndex } from '../keystrokes.js';
import { detectSystemLayout } from '../layout-check.js';
import { createPracticeView } from '../practice-view.js';

const text = strings.freeTyping;
const keyIndexes = layouts.map(createKeyIndex);
const indexFor = (layoutId) => keyIndexes.find((index) => index.layout.id === layoutId);

export const title = text.title;

export function render(container) {
  const layoutSelect = select(
    'free-typing-layout',
    text.layoutLabel,
    layouts.map((layout) => [layout.id, layout.name]),
    () => changeLayout(layoutSelect.control.value),
  );
  const sampleSelect = select(
    'free-typing-sample',
    text.textLabel,
    Object.entries(text.samples).map(([id, sample]) => [id, sample.name]),
    () => changeSample(sampleSelect.control.value),
  );
  // Until profiles exist (stage 3), the view mode is picked here.
  const modeSelect = select(
    'free-typing-mode',
    text.modeLabel,
    Object.entries(text.modes),
    () => changeMode(modeSelect.control.value),
  );
  const restartButton = el(
    'button',
    { type: 'button', class: 'button button--secondary button--small', onClick: () => { view.restart(); view.focus(); } },
    strings.practice.restart,
  );

  const view = createPracticeView({
    title: text.title,
    keyIndex: indexFor(defaultLayoutId),
    keyIndexes,
    tools: [layoutSelect.field, sampleSelect.field, modeSelect.field, restartButton],
    onLayoutSuggestion: (layoutId) => {
      changeLayout(layoutId);
      view.focus();
    },
  });

  container.append(view.element);
  modeSelect.control.value = document.documentElement.dataset.mode;
  changeLayout(defaultLayoutId);
  view.focus();

  // Prefer the layout the OS is using, if we can tell.
  detectSystemLayout(keyIndexes).then((system) => {
    if (system.layoutId && system.layoutId !== layoutSelect.control.value) changeLayout(system.layoutId);
  });

  function changeLayout(layoutId) {
    layoutSelect.control.value = layoutId;
    view.setLayout(indexFor(layoutId));
    changeSample(indexFor(layoutId).layout.language);
  }

  function changeSample(sampleId) {
    sampleSelect.control.value = sampleId;
    view.setText(text.samples[sampleId].text, sampleId);
  }

  function changeMode(mode) {
    document.documentElement.dataset.mode = mode;
    view.refresh();
  }

  return view.destroy;
}

function select(id, label, options, onChange) {
  const control = el(
    'select',
    { id, onChange },
    options.map(([value, name]) => el('option', { value }, name)),
  );
  const field = el('div', { class: 'tool' }, el('label', { for: id }, label), control);
  return { field, control };
}
