// Two hands seen from above (palms down), drawn as a pictogram: each finger is its own
// shape colored like its keys. The fingers to use light up; the rest are dimmed.
// Purely visual (aria-hidden): screens describe the finger in text for assistive tech.

import { ROLE_RANK } from './guidance.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const VIEW_WIDTH = 200;
const VIEW_HEIGHT = 210;
const FINGER_BOTTOM = 150;

// Left hand geometry; the right hand is its mirror image. The palm is drawn over the
// finger bases, so each finger reads as a separate shape coming out of it.
const FINGERS = [
  { id: 5, x: 12, top: 58, width: 34 },
  { id: 4, x: 50, top: 26, width: 35 },
  { id: 3, x: 89, top: 10, width: 35 },
  { id: 2, x: 128, top: 30, width: 35 },
];
const PALM = { x: 8, y: 100, width: 158, height: 100, radius: 40 };
const THUMB = { x: 152, y: 112, width: 32, height: 82, pivotX: 168, pivotY: 194, angle: 42 };

export function createHandsView() {
  const element = document.createElement('div');
  element.className = 'hands';
  element.setAttribute('aria-hidden', 'true');

  const fingerShapes = new Map(); // 'L2' → { shape, badge }
  for (const side of ['L', 'R']) element.append(drawHand(side, fingerShapes));

  /** targets: [{ finger, role, badge }] as produced by guidance.js. */
  function show(targets) {
    for (const { shape, badge } of fingerShapes.values()) {
      shape.removeAttribute('data-role');
      badge.setAttribute('visibility', 'hidden');
    }
    element.classList.toggle('hands--guiding', targets.length > 0);

    for (const { finger, role, badge } of targets) {
      // 'T' (Space) can be pressed with either thumb.
      for (const id of finger === 'T' ? ['L1', 'R1'] : [finger]) {
        const entry = fingerShapes.get(id);
        if (!entry) continue;
        // If a finger has two roles, the most urgent one wins.
        const current = entry.shape.getAttribute('data-role');
        if (!current || ROLE_RANK[role] < ROLE_RANK[current]) entry.shape.setAttribute('data-role', role);
        if (badge) {
          entry.badge.setAttribute('visibility', 'visible');
          entry.badge.querySelector('text').textContent = String(badge);
        }
      }
    }
  }

  return { element, show };
}

function drawHand(side, fingerShapes) {
  const mirror = side === 'R';
  const mx = (x, width = 0) => (mirror ? VIEW_WIDTH - x - width : x);

  const svg = svgNode('svg', {
    class: `hand hand--${side === 'L' ? 'left' : 'right'}`,
    viewBox: `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`,
  });

  const badges = [];
  for (const finger of FINGERS) {
    const x = mx(finger.x, finger.width);
    const shape = svgNode('rect', {
      class: 'hand__finger',
      'data-finger-group': finger.id,
      x,
      y: finger.top,
      width: finger.width,
      height: FINGER_BOTTOM - finger.top,
      rx: finger.width / 2,
    });
    const badge = drawBadge(x + finger.width / 2, finger.top + 17);
    svg.append(shape);
    badges.push(badge);
    fingerShapes.set(`${side}${finger.id}`, { shape, badge });
  }

  svg.append(
    svgNode('rect', {
      class: 'hand__palm',
      x: mx(PALM.x, PALM.width),
      y: PALM.y,
      width: PALM.width,
      height: PALM.height,
      rx: PALM.radius,
    }),
  );

  const thumbX = mx(THUMB.x, THUMB.width);
  const pivotX = mx(THUMB.pivotX);
  const angle = mirror ? -THUMB.angle : THUMB.angle;
  const thumb = svgNode('rect', {
    class: 'hand__finger',
    'data-finger-group': 'thumb',
    x: thumbX,
    y: THUMB.y,
    width: THUMB.width,
    height: THUMB.height,
    rx: THUMB.width / 2,
    transform: `rotate(${angle} ${pivotX} ${THUMB.pivotY})`,
  });
  const thumbBadge = drawBadge(thumbX + THUMB.width / 2, THUMB.y + 17);
  thumbBadge.setAttribute('transform', `rotate(${angle} ${pivotX} ${THUMB.pivotY})`);
  svg.append(thumb, ...badges, thumbBadge);
  fingerShapes.set(`${side}1`, { shape: thumb, badge: thumbBadge });

  return svg;
}

function drawBadge(cx, cy) {
  const group = svgNode('g', { class: 'hand__badge', visibility: 'hidden' });
  group.append(svgNode('circle', { cx, cy, r: 12 }), svgNode('text', { x: cx, y: cy, dy: '0.35em' }));
  return group;
}

function svgNode(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  return node;
}
