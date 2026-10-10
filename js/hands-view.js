// Two hands resting on the on-screen keyboard (palms down, seen from above): each fingertip
// sits on its home-row key and the thumbs on the space bar. Everything is built from the
// layout geometry, so it fits any layout.
//
// The hands never hide the keyboard: the skin is see-through (the whole hand is painted at
// once and then faded, so overlapping parts do not get darker) while outlines, creases and
// nails stay crisp. The nails carry each finger's color.
//
// The look (skin tone or kids costume) comes from hand-skins.js; its colors from CSS.
//
// To press another key, the finger reaches it: its tip goes to the key while the whole hand
// moves part of the way, as a real hand does. Shapes are recomputed on every animation frame,
// so fingers stretch smoothly with no seams or squashed tips.
//
// Placement: 'over' (on the keyboard, see-through) or 'below' (the same hands in a strip under
// the keyboard, solid; the finger in use only bends a little towards its key).
// Purely visual (aria-hidden): screens describe the finger in text for assistive tech.

import { keyCenters, boardSize } from './keyboard-geometry.js';
import { ROLE_RANK } from './guidance.js';
import { HAND_SKINS, DEFAULT_SKIN, DEFAULT_PLACEMENT } from './hand-skins.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
export const BELOW_BOARD = 2; // key units of palm and wrist under the keyboard (they fade out)
const MOVE_MS = 140;
const HAND_FOLLOW = 0.25; // share of a reach done by the whole hand instead of the finger,
const STRETCH = { min: 0.7, max: 1.3 }; // and more if the finger would stretch or curl too much
const TIP_DOWN = 0.42; // a reaching fingertip touches the bottom of its key, leaving the label visible
const BEND = 0.35; // below the keyboard, how far a finger in use moves towards its key
const ABOVE_TIPS = 0.7; // below the keyboard, room above the resting fingertips
const BELOW_CUT = 0.2; // below the keyboard, how much palm is shown under the keyboard's bottom line
const FADE = { over: 1.8, below: 1.3 }; // key units over which the wrists fade out

// Finger proportions in key units: length from the touching point to the knuckle, width at
// the knuckle and at the tip. Middle finger longest, ring a bit longer than index, pinky
// clearly shorter and thinner; slim enough to leave a little air between relaxed fingers.
// rest: how far down its home key each fingertip rests. The tips are not in a straight line:
// the middle finger sits higher on its key and the pinky lower, as on a real hand.
const FINGERS = {
  2: { length: 2.2, base: 0.74, tip: 0.6, rest: 0.4 },
  3: { length: 2.6, base: 0.76, tip: 0.62, rest: 0.22 },
  4: { length: 2.4, base: 0.7, tip: 0.57, rest: 0.32 },
  5: { length: 1.75, base: 0.6, tip: 0.5, rest: 0.5 },
};
const THUMB = { base: 0.84, tip: 0.68 };
const FAN = 0.16; // knuckles sit a bit closer to the middle of the hand than the tips
const OUTLINE_FROM = -0.3; // a finger's outline starts just above the knuckle, where the palm hides it
const CREASES = [0.42, 0.72]; // finger joints, as a share of the way from knuckle to tip
const THUMB_CREASES = [0.55];

/**
 * @param {object} keyIndex  see keystrokes.js
 * @param {object} [options]
 * @param {object} [options.skin]       one of HAND_SKINS (screens pick it with skinFor)
 * @param {'below' | 'over'} [options.placement]
 */
export function createHandsView(keyIndex, { skin = HAND_SKINS.find(({ id }) => id === DEFAULT_SKIN), placement = DEFAULT_PLACEMENT } = {}) {
  const element = svgNode('svg', { class: 'hands', 'aria-hidden': 'true' });
  let hands = [];
  let current = null; // pose being shown: { L: pose, R: pose }
  let goal = null;
  let frame = null;

  function setLayout(newKeyIndex) {
    keyIndex = newKeyIndex;
    const { layout } = keyIndex;
    const size = boardSize(layout);
    element.replaceChildren(fadeMask(size));
    hands = ['L', 'R'].map((side) => buildHand(side, layout, size));
    applyPlacement();
    hands.forEach(decorate);
    const handsGroup = svgNode('g', { mask: `url(#${FADE_ID})` });
    hands.forEach((hand) => handsGroup.append(hand.group));
    element.append(handsGroup);
    current = restPose();
    goal = current;
    draw(current);
  }

  // Over: the drawing covers the keyboard. Below: only the part from the fingertips down.
  function applyPlacement() {
    const size = boardSize(keyIndex.layout);
    const below = placement === 'below';
    const top = below ? Math.min(...hands.flatMap((hand) => [...hand.fingers.values()].map((f) => f.rest.y))) - ABOVE_TIPS : 0;
    const bottom = size.height + (below ? BELOW_CUT : BELOW_BOARD);
    element.dataset.placement = placement;
    element.setAttribute('viewBox', `0 ${top} ${size.width} ${bottom - top}`);
    element.style.aspectRatio = `${size.width} / ${bottom - top}`;
    const gradient = element.querySelector(`#${FADE_ID}-gradient`);
    gradient.setAttribute('y1', bottom - FADE[placement]);
    gradient.setAttribute('y2', bottom);
  }

  function setPlacement(newPlacement) {
    placement = newPlacement;
    applyPlacement();
    current = restPose();
    goal = current;
    draw(current);
  }

  /** targets: [{ code, finger, role }] as produced by guidance.js. */
  function show(targets) {
    const roles = new Map(); // finger id → most urgent role
    const reaches = new Map(); // finger id → key code to reach
    for (const { code, finger, role } of targets) {
      for (const id of finger === 'T' ? ['L1', 'R1'] : finger ? [finger] : []) {
        const currentRole = roles.get(id);
        if (!currentRole || ROLE_RANK[role] < ROLE_RANK[currentRole]) roles.set(id, role);
        if ((role === 'primary' || role === 'modifier') && finger !== 'T') reaches.set(id, code);
      }
    }
    for (const hand of hands) {
      let used = false;
      for (const [id, finger] of hand.fingers) {
        const role = roles.get(id);
        if (role) used = true;
        for (const part of [finger.body, finger.lines]) {
          if (role) part.setAttribute('data-role', role);
          else part.removeAttribute('data-role');
        }
        // Fingers in use go above the palm and the other fingers, a little less see-through.
        (role ? hand.activeSkin : finger.skinLayer).append(finger.body);
        (role ? hand.activeLines : finger.linesLayer).append(finger.lines);
      }
      // A hand with nothing to do fades, so the eye goes to the other one.
      hand.group.classList.toggle('is-idle', roles.size > 0 && !used);
    }
    animateTo(poseFor(reaches));
  }

  // --- Poses: where each hand is shifted and where each fingertip is ---

  function restPose() {
    return Object.fromEntries(
      hands.map((hand) => [
        hand.side,
        { shift: { x: 0, y: 0 }, tips: Object.fromEntries([...hand.fingers].map(([id, f]) => [id, { ...f.rest }])) },
      ]),
    );
  }

  function poseFor(reaches) {
    const pose = restPose();
    const centers = keyCenters(keyIndex.layout);
    for (const hand of hands) {
      // The hand follows its farthest reach a little; that finger does the rest.
      let follow = { x: 0, y: 0 };
      let farthest = 0;
      const wanted = [];
      for (const [id, finger] of hand.fingers) {
        const code = reaches.get(id);
        const center = code && centers.get(code);
        if (!center) continue;
        // On a wide key (Shift, Enter…) the finger goes to its nearest part, as people do.
        const reach = Math.max(0, center.width / 2 - 0.45);
        const target = { x: clamp(finger.rest.x, center.x - reach, center.x + reach), y: center.y + TIP_DOWN };
        if (placement === 'below') {
          wanted.push([id, bendTowards(finger.rest, target)]);
          continue;
        }
        wanted.push([id, target]);
        const distance = Math.hypot(target.x - finger.rest.x, target.y - finger.rest.y);
        if (distance > farthest) {
          farthest = distance;
          follow = handFollow(finger, target);
        }
      }
      const handPose = pose[hand.side];
      handPose.shift = follow;
      for (const id of Object.keys(handPose.tips)) {
        handPose.tips[id] = { x: handPose.tips[id].x + follow.x, y: handPose.tips[id].y + follow.y };
      }
      for (const [id, target] of wanted) handPose.tips[id] = target;
    }
    return pose;
  }

  function animateTo(next) {
    cancelAnimationFrame(frame);
    const from = current;
    goal = next;
    if (reducedMotion()) {
      current = next;
      draw(current);
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / MOVE_MS);
      current = mixPose(from, goal, easeOut(t));
      draw(current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  }

  function draw(pose) {
    for (const hand of hands) drawHand(hand, pose[hand.side], skin);
  }

  /** Changes the look: one of HAND_SKINS (screens pick it with skinFor). */
  function setSkin(newSkin) {
    skin = newSkin;
    hands.forEach(decorate);
    draw(current);
  }

  // The skin's drawings: on the back of each hand (it only moves with the hand) and on each
  // finger (redrawn on every frame, so it stretches with the finger).
  function decorate(hand) {
    element.dataset.skin = skin.id;
    hand.back.replaceChildren(...(skin.back?.(svgNode, { ...hand.backFrame, sign: hand.sign }) ?? []));
    for (const [id, finger] of hand.fingers) {
      finger.decorNodes = skin.finger?.build(svgNode, { n: Number(id[1]) }) ?? [];
      finger.decor.replaceChildren(...finger.decorNodes);
    }
  }

  setLayout(keyIndex);
  return { element, show, setLayout, setSkin, setPlacement, placement: () => placement };
}

// Below the keyboard the finger does not travel: it just leans a little towards its key.
function bendTowards(rest, target) {
  const dx = target.x - rest.x;
  const dy = target.y - rest.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return { x: rest.x, y: rest.y - BEND / 2 }; // its own key: a small lift
  const move = Math.min(BEND, distance);
  return { x: rest.x + (dx / distance) * move, y: rest.y + (dy / distance) * move };
}

// How far the hand moves so that a finger reaches target without stretching or curling
// beyond what a real finger does.
function handFollow(finger, target) {
  const restLength = Math.hypot(finger.rest.x - finger.knuckle.x, finger.rest.y - finger.knuckle.y);
  const follow = { x: (target.x - finger.rest.x) * HAND_FOLLOW, y: (target.y - finger.rest.y) * HAND_FOLLOW };
  const dx = target.x - (finger.knuckle.x + follow.x);
  const dy = target.y - (finger.knuckle.y + follow.y);
  const length = Math.hypot(dx, dy);
  const allowed = Math.min(Math.max(length, restLength * STRETCH.min), restLength * STRETCH.max);
  const extra = 1 - allowed / length; // > 0: the hand moves closer; < 0: it moves back
  return { x: follow.x + dx * extra, y: follow.y + dy * extra };
}

// --- Building one hand ---

// Layers, bottom to top: skin (see-through, painted as one piece), the skin of the fingers
// in use, crisp lines (outlines, creases, nails), and the lines of the fingers in use.
function buildHand(side, layout, size) {
  const centers = keyCenters(layout);
  const sign = side === 'L' ? 1 : -1; // +1: towards the right is towards the middle of the board
  const homeCodes = side === 'L' ? layout.homeRow.slice(0, 4) : layout.homeRow.slice(4).reverse();
  // Finger ids from the pinky to the index: L5 L4 L3 L2 / R5 R4 R3 R2.
  const ids = [5, 4, 3, 2].map((n) => `${side}${n}`);
  const tips = homeCodes.map((code, i) => {
    const center = centers.get(code);
    return { x: center.x, y: center.y + FINGERS[ids[i][1]].rest };
  });
  const middleX = tips.reduce((sum, tip) => sum + tip.x, 0) / tips.length;

  const group = svgNode('g', { class: `hands__hand hands__hand--${side === 'L' ? 'left' : 'right'}` });
  const skin = svgNode('g', { class: 'hands__skin' });
  const thumbSkin = svgNode('g', {});
  const fingerSkin = svgNode('g', {});
  const palm = svgNode('path', { class: 'hands__palm' });
  skin.append(thumbSkin, fingerSkin, palm);
  const activeSkin = svgNode('g', { class: 'hands__skin hands__skin--active' });
  const lines = svgNode('g', {});
  const palmEdge = svgNode('path', { class: 'hands__palm-edge' });
  const back = svgNode('g', { class: 'hand-skin' });
  const thumbLines = svgNode('g', {});
  const fingerLines = svgNode('g', {});
  lines.append(palmEdge, back, thumbLines, fingerLines);
  const activeLines = svgNode('g', {});
  group.append(skin, activeSkin, lines, activeLines);

  const fingers = new Map();
  ids.forEach((id, i) => {
    const proportions = FINGERS[id[1]];
    const tip = tips[i];
    const knuckle = {
      x: tip.x + (middleX - tip.x) * FAN,
      y: tip.y + Math.sqrt(proportions.length ** 2 - ((middleX - tip.x) * FAN) ** 2),
    };
    fingers.set(id, { ...buildFinger(id, fingerSkin, fingerLines, CREASES), ...proportions, rest: tip, knuckle });
  });

  // Thumb: comes out of the inner side of the palm and rests on the space bar, towards the
  // middle of the board.
  const index = fingers.get(`${side}2`);
  const space = centers.get('Space');
  const thumbRest = { x: index.rest.x + sign * 0.95, y: space.y + 0.1 };
  const thumbKnuckle = { x: index.knuckle.x + sign * 0.1, y: index.knuckle.y + 1.45 };
  fingers.set(`${side}1`, {
    ...buildFinger(`${side}1`, thumbSkin, thumbLines, THUMB_CREASES),
    ...THUMB,
    rest: thumbRest,
    knuckle: thumbKnuckle,
  });

  // Middle of the back of the hand, at rest: where a skin draws its marks.
  const pinky = fingers.get(`${side}5`);
  const backFrame = {
    x: (pinky.knuckle.x + index.knuckle.x) / 2,
    y: (pinky.knuckle.y + index.knuckle.y) / 2 + 0.95,
    width: Math.abs(index.knuckle.x - pinky.knuckle.x) + (FINGERS[2].base + FINGERS[5].base) / 2,
  };

  return {
    side,
    sign,
    group,
    fingers,
    palm,
    palmEdge,
    back,
    backFrame,
    activeSkin,
    activeLines,
    bottom: size.height + BELOW_BOARD,
  };
}

function buildFinger(id, skinLayer, linesLayer, creaseAt) {
  const group = id.endsWith('1') ? 'thumb' : id[1];
  const body = svgNode('path', { class: 'hands__finger-body', 'data-finger-group': group });
  const lines = svgNode('g', { class: 'hands__finger', 'data-finger-group': group });
  const outline = svgNode('path', { class: 'hands__finger-outline' });
  const creases = creaseAt.map(() => svgNode('path', { class: 'hands__crease' }));
  const decor = svgNode('g', { class: 'hand-skin' });
  const nail = svgNode('path', { class: 'hands__nail' });
  lines.append(outline, ...creases, decor, nail);
  skinLayer.append(body);
  linesLayer.append(lines);
  return { body, lines, outline, creases, creaseAt, decor, decorNodes: [], nail, skinLayer, linesLayer };
}

// --- Drawing a pose ---

function drawHand(hand, pose, skin) {
  const { shift, tips } = pose;
  hand.back.setAttribute('transform', `translate(${hand.backFrame.x + shift.x} ${hand.backFrame.y + shift.y})`);
  const knuckles = new Map();
  const roots = new Map(); // finger id → where its outline starts on each side: { left, right }
  for (const [id, finger] of hand.fingers) {
    const knuckle = { x: finger.knuckle.x + shift.x, y: finger.knuckle.y + shift.y };
    knuckles.set(id, knuckle);
    roots.set(id, drawFinger(finger, knuckle, tips[id], skin));
  }
  drawPalm(hand, knuckles, roots);
}

function drawFinger(finger, knuckle, tip, skin) {
  const dx = tip.x - knuckle.x;
  const dy = tip.y - knuckle.y;
  const length = Math.hypot(dx, dy);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90; // 0° = pointing up
  const rb = finger.base / 2;
  const rt = finger.tip / 2;
  // Local frame: knuckle at (0, 0), tip touching point at (0, -length); the tip is a half
  // circle. The skin runs a little past the knuckle so it joins the palm; the outline stops
  // just above it, so a finger drawn above the palm shows no seam.
  const top = -length + rt * 0.35;
  const sides = [
    `M ${-rb} ${OUTLINE_FROM}`,
    `C ${-rb} ${top * 0.5} ${-rt} ${top * 0.6} ${-rt} ${top}`,
    `A ${rt} ${rt} 0 0 1 ${rt} ${top}`,
    `C ${rt} ${top * 0.6} ${rb} ${top * 0.5} ${rb} ${OUTLINE_FROM}`,
  ].join(' ');
  const transform = `translate(${knuckle.x} ${knuckle.y}) rotate(${angle})`;
  const radians = (angle * Math.PI) / 180;
  const toBoard = (x, y) => ({
    x: knuckle.x + x * Math.cos(radians) - y * Math.sin(radians),
    y: knuckle.y + x * Math.sin(radians) + y * Math.cos(radians),
  });
  finger.body.setAttribute('d', `${sides} L ${rb} 0.05 L ${-rb} 0.05 Z`);
  finger.body.setAttribute('transform', transform);
  finger.lines.setAttribute('transform', transform);
  finger.outline.setAttribute('d', sides);
  // Width of the finger at a share t of the way from the knuckle to the tip.
  const shape = { at: (t) => ({ y: top * t, half: rb + (rt - rb) * t }) };
  // Joints: short skin creases, straight joints across the whole finger, or nothing.
  finger.creases.forEach((crease, i) => {
    const { y, half } = shape.at(finger.creaseAt[i]);
    const joints = {
      crease: `M ${-half * 0.55} ${y} Q 0 ${y + 0.07} ${half * 0.55} ${y}`,
      band: `M ${-half} ${y} L ${half} ${y}`,
      none: '',
    };
    crease.setAttribute('d', joints[skin.joints]);
  });
  skin.finger?.update(finger.decorNodes, shape);
  // The tip, always in the finger's color.
  finger.nail.setAttribute('d', tipPath(skin.tip, top, rt));
  // Where the outline starts on each side, so the palm can join it.
  return { left: toBoard(-rb, OUTLINE_FROM), right: toBoard(rb, OUTLINE_FROM) };
}

// Local frame of a finger: (0, top) is the center of its rounded tip, of radius rt.
function tipPath(kind, top, rt) {
  const half = rt * 0.6;
  if (kind === 'claw') {
    // Pointed, poking out past the fingertip.
    const base = top + rt * 0.35;
    return `M ${-half} ${base} Q ${-half * 0.7} ${top - rt * 0.6} 0 ${top - rt - 0.24} Q ${half * 0.7} ${top - rt * 0.6} ${half} ${base} Z`;
  }
  if (kind === 'light') {
    return `M ${-half} ${top - rt * 0.5} h ${half * 2} v ${rt * 1.1} h ${-half * 2} Z`;
  }
  // A rounded nail.
  const nailTop = top - rt * 0.72;
  const nailBottom = top + rt * 0.95;
  return (
    `M ${-half} ${nailBottom} L ${-half} ${nailTop + half} ` +
    `A ${half} ${half} 0 0 1 ${half} ${nailTop + half} L ${half} ${nailBottom} ` +
    `Q 0 ${nailBottom + 0.08} ${-half} ${nailBottom} Z`
  );
}

// The back of the hand: from the knuckles down to the wrist, which fades out. Its outline
// joins the fingers' outlines through the folds of skin between them, so the hand reads as
// one shape and each finger's length shows.
function drawPalm(hand, knuckles, roots) {
  const { sign } = hand;
  const id = (n) => `${hand.side}${n}`;
  const pinky = knuckles.get(id(5));
  const ring = knuckles.get(id(4));
  const middle = knuckles.get(id(3));
  const index = knuckles.get(id(2));
  const thumb = knuckles.get(id(1));
  const pinkyHalf = FINGERS[5].base / 2 + 0.05;
  const indexHalf = FINGERS[2].base / 2 + 0.05;
  const outer = { x: pinky.x - sign * pinkyHalf, y: pinky.y + 0.15 };
  const inner = { x: index.x + sign * indexHalf, y: index.y + 0.1 };
  const wristOuter = { x: outer.x + sign * 0.55, y: hand.bottom };
  const wristInner = { x: thumb.x - sign * 0.1, y: hand.bottom };
  const top = (point) => `${point.x} ${point.y - 0.12}`;
  const d = [
    `M ${outer.x} ${outer.y}`,
    `Q ${pinky.x} ${pinky.y - 0.25} ${top(ring)}`,
    `Q ${middle.x} ${middle.y - 0.2} ${top(index)}`,
    `Q ${inner.x} ${inner.y - 0.15} ${inner.x} ${inner.y + 0.2}`,
    `Q ${inner.x + sign * 0.25} ${thumb.y - 0.4} ${thumb.x + sign * 0.15} ${thumb.y}`,
    `L ${wristInner.x} ${wristInner.y}`,
    `L ${wristOuter.x} ${wristOuter.y}`,
    `Q ${outer.x - sign * 0.05} ${outer.y + 1.2} ${outer.x} ${outer.y}`,
    'Z',
  ].join(' ');
  hand.palm.setAttribute('d', d);
  // Sides of the hand, from the wrist up to the outer edge of the pinky and of the index.
  const towardsMiddle = sign > 0 ? 'right' : 'left';
  const towardsOutside = sign > 0 ? 'left' : 'right';
  const pinkyOutside = roots.get(id(5))[towardsOutside];
  const indexInside = roots.get(id(2))[towardsMiddle];
  const edges = [
    `M ${wristOuter.x} ${wristOuter.y} Q ${outer.x - sign * 0.05} ${outer.y + 1.2} ${outer.x} ${outer.y}`,
    `L ${pinkyOutside.x} ${pinkyOutside.y}`,
    `M ${indexInside.x} ${indexInside.y} L ${inner.x} ${inner.y + 0.2}`,
    `Q ${inner.x + sign * 0.25} ${thumb.y - 0.4} ${thumb.x + sign * 0.15} ${thumb.y}`,
  ];
  // Folds of skin between neighboring fingers: a short curve that dips towards the wrist.
  const order = [5, 4, 3, 2].map(id);
  for (let i = 0; i < order.length - 1; i += 1) {
    const from = roots.get(order[i])[towardsMiddle];
    const to = roots.get(order[i + 1])[towardsOutside];
    const dip = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 + 0.22 };
    edges.push(`M ${from.x} ${from.y} Q ${dip.x} ${dip.y} ${to.x} ${to.y}`);
  }
  hand.palmEdge.setAttribute('d', edges.join(' '));
}

// The wrists fade out instead of ending in a hard edge (applyPlacement sets where).
const FADE_ID = 'hands-fade';
function fadeMask(size) {
  const height = size.height + BELOW_BOARD;
  const defs = svgNode('defs', {});
  const gradient = svgNode('linearGradient', { id: `${FADE_ID}-gradient`, gradientUnits: 'userSpaceOnUse', x1: 0, x2: 0 });
  gradient.append(svgNode('stop', { offset: 0, 'stop-color': 'white' }), svgNode('stop', { offset: 1, 'stop-color': 'black' }));
  const mask = svgNode('mask', { id: FADE_ID, maskUnits: 'userSpaceOnUse', x: -1, y: -1, width: size.width + 2, height: height + 2 });
  mask.append(svgNode('rect', { x: -1, y: -1, width: size.width + 2, height: height + 2, fill: `url(#${FADE_ID}-gradient)` }));
  defs.append(gradient, mask);
  return defs;
}

// --- Helpers ---

function mixPose(a, b, t) {
  const mix = (p, q) => ({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
  return Object.fromEntries(
    Object.keys(b).map((side) => [
      side,
      {
        shift: mix(a[side].shift, b[side].shift),
        tips: Object.fromEntries(Object.keys(b[side].tips).map((id) => [id, mix(a[side].tips[id], b[side].tips[id])])),
      },
    ]),
  );
}

const easeOut = (t) => 1 - (1 - t) ** 3;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

function svgNode(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  return node;
}
