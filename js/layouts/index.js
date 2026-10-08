// Registry of available keyboard layouts. To add a layout, create its data file and list it here.

import esLatam from './es-latam.js';
import enUs from './en-us.js';

export const layouts = [esLatam, enUs];

export const defaultLayoutId = esLatam.id;

export function getLayout(id) {
  return layouts.find((layout) => layout.id === id) ?? null;
}
