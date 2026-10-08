// WPM over time as an SVG line chart, no libraries. One series (the title names it, so no
// legend), recessive grid, the last value labeled directly, a hover/keyboard tooltip and
// a table view for screen readers.

import { el } from './dom.js';
import { strings } from './strings.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 16, right: 40, bottom: 28, left: 40 };
const GRID_LINES = 4;

/**
 * @param {{ wpm: number, accuracy: number, date: string }[]} sessions  oldest first
 */
export function createWpmChart(sessions) {
  const text = strings.progress;
  const values = sessions.map((session) => session.wpm);
  const max = niceMax(Math.max(...values));
  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (sessions.length === 1 ? plotWidth / 2 : (i / (sessions.length - 1)) * plotWidth);
  const y = (value) => PAD.top + plotHeight - (value / max) * plotHeight;

  const svg = svgNode('svg', { class: 'wpm-chart__svg', viewBox: `0 0 ${WIDTH} ${HEIGHT}`, 'aria-hidden': 'true' });

  // Grid and y labels.
  for (let i = 0; i <= GRID_LINES; i++) {
    const value = (max / GRID_LINES) * i;
    svg.append(
      svgNode('line', { class: 'wpm-chart__grid', x1: PAD.left, x2: WIDTH - PAD.right, y1: y(value), y2: y(value) }),
      svgNode('text', { class: 'wpm-chart__axis', x: PAD.left - 8, y: y(value), dy: '0.35em', 'text-anchor': 'end' }, value),
    );
  }
  svg.append(
    svgNode('text', { class: 'wpm-chart__axis', x: PAD.left + plotWidth / 2, y: HEIGHT - 6, 'text-anchor': 'middle' }, text.chartAxisSessions),
  );

  // Line, points, last value.
  const points = sessions.map((session, i) => [x(i), y(session.wpm)]);
  svg.append(svgNode('polyline', { class: 'wpm-chart__line', points: points.map((p) => p.join(',')).join(' ') }));
  for (const [px, py] of points) svg.append(svgNode('circle', { class: 'wpm-chart__point', cx: px, cy: py, r: 4 }));
  const [lastX, lastY] = points.at(-1);
  svg.append(
    svgNode('text', { class: 'wpm-chart__label', x: lastX + 8, y: lastY, dy: '0.35em' }, values.at(-1)),
  );

  // Hover / keyboard layer.
  const crosshair = svgNode('line', { class: 'wpm-chart__crosshair', y1: PAD.top, y2: PAD.top + plotHeight, visibility: 'hidden' });
  const focusRing = svgNode('circle', { class: 'wpm-chart__focus', r: 7, visibility: 'hidden' });
  svg.append(crosshair, focusRing);
  const tooltip = el('div', { class: 'wpm-chart__tooltip', hidden: true });
  const live = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });

  const show = (i) => {
    const [px, py] = points[i];
    const session = sessions[i];
    crosshair.setAttribute('x1', px);
    crosshair.setAttribute('x2', px);
    crosshair.setAttribute('visibility', 'visible');
    focusRing.setAttribute('cx', px);
    focusRing.setAttribute('cy', py);
    focusRing.setAttribute('visibility', 'visible');
    const label = tooltipText(i, session);
    tooltip.textContent = label;
    tooltip.hidden = false;
    tooltip.style.left = `${(px / WIDTH) * 100}%`;
    tooltip.style.top = `${(py / HEIGHT) * 100}%`;
    live.textContent = label;
  };
  const hide = () => {
    crosshair.setAttribute('visibility', 'hidden');
    focusRing.setAttribute('visibility', 'hidden');
    tooltip.hidden = true;
  };

  let active = sessions.length - 1;
  const plot = el(
    'div',
    {
      class: 'wpm-chart__plot',
      tabindex: '0',
      role: 'img',
      'aria-label': text.chartSummary(sessions.length, Math.min(...values), Math.max(...values), values.at(-1)),
    },
    svg,
    tooltip,
  );
  plot.addEventListener('pointermove', (event) => {
    const box = svg.getBoundingClientRect();
    const svgX = ((event.clientX - box.left) / box.width) * WIDTH;
    active = nearestIndex(points, svgX);
    show(active);
  });
  plot.addEventListener('pointerleave', hide);
  plot.addEventListener('focus', () => show(active));
  plot.addEventListener('blur', hide);
  plot.addEventListener('keydown', (event) => {
    const moves = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity };
    if (!(event.key in moves)) return;
    event.preventDefault();
    active = Math.min(sessions.length - 1, Math.max(0, active + moves[event.key]));
    show(active);
  });

  return el(
    'figure',
    { class: 'wpm-chart' },
    el('figcaption', {}, text.chartTitle),
    plot,
    live,
    el(
      'details',
      { class: 'wpm-chart__table' },
      el('summary', {}, text.chartTable),
      el(
        'table',
        {},
        el('thead', {}, el('tr', {}, el('th', { scope: 'col' }, text.chartSession), el('th', { scope: 'col' }, 'PPM'), el('th', { scope: 'col' }, text.avgAccuracy))),
        el(
          'tbody',
          {},
          sessions.map((session, i) =>
            el('tr', {}, el('td', {}, String(i + 1)), el('td', {}, String(session.wpm)), el('td', {}, `${session.accuracy} %`)),
          ),
        ),
      ),
    ),
  );
}

function tooltipText(i, session) {
  const date = new Date(session.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  return strings.progress.chartTooltip(i + 1, date, session.wpm, session.accuracy);
}

function nearestIndex(points, svgX) {
  let best = 0;
  points.forEach(([px], i) => {
    if (Math.abs(px - svgX) < Math.abs(points[best][0] - svgX)) best = i;
  });
  return best;
}

// Axis maximum: a multiple of GRID_LINES × a round step, so every grid label is a whole
// number (0-20 by 5, 0-40 by 10, 0-80 by 20…).
function niceMax(value) {
  for (const step of [5, 10, 20, 25, 50]) {
    if (value <= step * GRID_LINES) return step * GRID_LINES;
  }
  return Math.ceil(value / (50 * GRID_LINES)) * 50 * GRID_LINES;
}

function svgNode(tag, attrs, textContent) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  if (textContent !== undefined) node.textContent = String(textContent);
  return node;
}
