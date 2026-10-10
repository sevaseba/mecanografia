// Looks for the hands on the keyboard: five skin tones for everyone and, for kids, costumes.
// Colors live in CSS ([data-skin="…"] on the hands overlay); this file says how each look is
// drawn. Costumes are original designs, never copies of existing characters.
//
// Each skin:
//   id, icon     identifier and the emoji that stands for it in pickers (names: strings.hands)
//   kidsOnly     only offered to kids profiles
//   tip          'nail', 'claw' (pointed) or 'light' (square light);
//                always in the finger's color, which kids' instructions rely on
//   joints       'crease' (skin creases), 'band' (straight joints) or 'none'
//   back(svg, frame)  optional drawing on the back of the hand. frame: the hand at rest:
//                width, sign (+1 left hand, -1 right hand); (0, 0) is the middle of the back
//                of the hand. Returns SVG nodes in key units.
//   finger       optional drawing on each finger, which stretches with it:
//                build(svg, finger) → nodes; update(nodes, shape) on every frame, where
//                shape.at(t) = { y, half } at a share t of the way from knuckle (0) to tip (1).
//   finger.n     in build: 1 for thumbs, 2…5 for index…pinky

export const DEFAULT_SKIN = 'tone-3';

// Where the hands are drawn: in a strip under the keyboard (solid) or on it (see-through,
// fingers stretch to each key). Chosen per profile.
export const HAND_PLACEMENTS = ['below', 'over'];
export const DEFAULT_PLACEMENT = 'below';

const tone = (n, icon) => ({ id: `tone-${n}`, icon, kidsOnly: false, tip: 'nail', joints: 'crease' });

export const HAND_SKINS = [
  tone(1, '✋🏻'),
  tone(2, '✋🏼'),
  tone(3, '✋🏽'),
  tone(4, '✋🏾'),
  tone(5, '✋🏿'),

  {
    id: 'web',
    icon: '🕸️',
    kidsOnly: true,
    tip: 'nail',
    joints: 'none',
    back: (svg, { width }) => {
      const radius = width * 0.5;
      const spokes = 8;
      const point = (i, r) => {
        const angle = (i * 2 * Math.PI) / spokes - Math.PI / 2;
        return `${(r * Math.cos(angle)).toFixed(3)} ${(r * Math.sin(angle) * 0.85).toFixed(3)}`;
      };
      const rays = Array.from({ length: spokes }, (_, i) => `M 0 0 L ${point(i, radius)}`).join(' ');
      // Rings sag a little between spokes, like a real web.
      const ring = (r) =>
        Array.from({ length: spokes }, (_, i) => `${i ? 'Q' : 'M'} ${i ? `${point(i - 0.5, r * 0.82)} ` : ''}${point(i, r)}`).join(' ') +
        ` Q ${point(spokes - 0.5, r * 0.82)} ${point(0, r)}`;
      return [
        svg('path', { class: 'hand-skin__pattern', d: `${rays} ${ring(radius * 0.35)} ${ring(radius * 0.65)} ${ring(radius * 0.95)}` }),
        ...spider(svg),
      ];
    },
    finger: {
      // Two lines along the finger, crossed by sagging threads.
      build: (svg) => [svg('path', { class: 'hand-skin__pattern' })],
      update: ([web], shape) => {
        const along = [0.08, 0.92].map((t) => shape.at(t));
        const lines = [-0.35, 0.35].map((k) => `M ${along[0].half * k} ${along[0].y} L ${along[1].half * k} ${along[1].y}`);
        const threads = [0.35, 0.7].map((t) => {
          const { y, half } = shape.at(t);
          return `M ${-half} ${y} Q 0 ${y + 0.09} ${half} ${y}`;
        });
        web.setAttribute('d', [...lines, ...threads].join(' '));
      },
    },
  },

  {
    id: 'armor',
    icon: '🛡️',
    kidsOnly: true,
    tip: 'nail',
    joints: 'none',
    // A plate on the back of the hand with a glowing circle in the middle.
    back: (svg, { width }) => {
      const half = width * 0.42;
      return [
        svg('path', {
          class: 'hand-skin__line',
          d: `M ${-half} -0.55 Q 0 -0.75 ${half} -0.55 L ${half * 0.85} 0.6 Q 0 0.75 ${-half * 0.85} 0.6 Z`,
        }),
        svg('circle', { class: 'hand-skin__glow', cx: 0, cy: 0, r: 0.62 }),
        svg('circle', { class: 'hand-skin__accent', cx: 0, cy: 0, r: 0.38 }),
        svg('circle', { class: 'hand-skin__light', cx: 0, cy: 0, r: 0.24 }),
      ];
    },
    finger: {
      // Gold bands at the joints, as between armor plates.
      build: (svg) => [svg('path', { class: 'hand-skin__band' }), svg('path', { class: 'hand-skin__band' })],
      update: (bands, shape) => {
        [0.4, 0.7].forEach((t, i) => {
          const { y, half } = shape.at(t);
          bands[i].setAttribute('d', `M ${-half} ${y - 0.03} L ${half} ${y - 0.03} L ${half} ${y + 0.03} L ${-half} ${y + 0.03} Z`);
        });
      },
    },
  },

  {
    id: 'tiger',
    icon: '🐯',
    kidsOnly: true,
    tip: 'claw',
    joints: 'none',
    // Wavy brush strokes across the back of the paw, from alternate sides, always inside it.
    back: (svg, { width }) => {
      const half = width * 0.4;
      const stripe = (side, y, length) => brushStroke(side * half, -side * (length - half), y, 0.07);
      return [
        svg('path', {
          class: 'hand-skin__dark',
          d: [stripe(1, -0.45, 0.85), stripe(-1, -0.18, 1), stripe(1, 0.1, 0.95), stripe(-1, 0.38, 0.85)].join(' '),
        }),
      ];
    },
    finger: {
      // Two thin strokes on each finger, from alternate sides.
      build: (svg) => [svg('path', { class: 'hand-skin__dark' })],
      update: ([stripes], shape) => {
        const d = [0.3, 0.6].map((t, i) => {
          const { y, half } = shape.at(t);
          const side = i % 2 ? 1 : -1;
          return brushStroke(side * half * 0.9, -side * half * 0.55, y, 0.045);
        });
        stripes.setAttribute('d', d.join(' '));
      },
    },
  },

  {
    id: 'sparkle',
    icon: '✨',
    kidsOnly: true,
    tip: 'nail',
    joints: 'none',
    // Little stars scattered on the back of the glove (they twinkle in CSS).
    back: (svg, { width, sign }) =>
      [
        [-0.3, -0.35, 0.2],
        [0.25, -0.15, 0.14],
        [-0.05, 0.25, 0.17],
        [0.35, 0.45, 0.1],
        [-0.4, 0.5, 0.12],
      ].map(([x, y, r], i) =>
        svg('path', {
          class: 'hand-skin__sparkle',
          style: `animation-delay: ${i * 0.37}s`,
          d: sparklePath(sign * x * width, y, r),
        }),
      ),
    finger: {
      build: (svg, { n }) => [svg('path', { class: 'hand-skin__sparkle', style: `animation-delay: ${n * 0.29}s` })],
      update: ([sparkle], shape) => {
        const { y } = shape.at(0.5);
        sparkle.setAttribute('d', sparklePath(0, y, 0.11));
      },
    },
  },

  {
    id: 'robot',
    icon: '🤖',
    kidsOnly: true,
    tip: 'light',
    joints: 'none',
    // A panel with a glowing core and circuit traces that run up to the fingers.
    back: (svg, { width }) => {
      const half = width * 0.38;
      const traces = [-0.75, -0.25, 0.25, 0.75]
        .map((k) => {
          const x = k * half * 0.8;
          return `M ${k * 0.22} -0.12 L ${k * 0.22} -0.3 L ${x} -0.42 L ${x} -0.62`;
        })
        .join(' ');
      const rivets = [
        [-half + 0.12, -0.5],
        [half - 0.12, -0.5],
        [-half + 0.12, 0.52],
        [half - 0.12, 0.52],
      ];
      return [
        svg('rect', { class: 'hand-skin__line', x: -half, y: -0.66, width: half * 2, height: 1.34, rx: 0.2 }),
        svg('path', { class: 'hand-skin__trace', d: traces }),
        ...rivets.map(([cx, cy]) => svg('circle', { class: 'hand-skin__dark', cx, cy, r: 0.05 })),
        svg('circle', { class: 'hand-skin__glow', cx: 0, cy: 0.12, r: 0.34 }),
        svg('circle', { class: 'hand-skin__light', cx: 0, cy: 0.12, r: 0.17 }),
      ];
    },
    finger: {
      // Metal phalanges joined by dark hinges, with a trace up the middle.
      build: (svg) => [svg('path', { class: 'hand-skin__dark' }), svg('path', { class: 'hand-skin__trace' })],
      update: ([hinges, trace], shape) => {
        hinges.setAttribute(
          'd',
          [0.38, 0.68]
            .map((t) => {
              const { y, half } = shape.at(t);
              return `M ${-half} ${y - 0.035} L ${half} ${y - 0.035} L ${half} ${y + 0.035} L ${-half} ${y + 0.035} Z`;
            })
            .join(' '),
        );
        const from = shape.at(0.05);
        const to = shape.at(0.85);
        trace.setAttribute('d', `M 0 ${from.y} L 0 ${to.y}`);
      },
    },
  },

  {
    id: 'monster',
    icon: '👾',
    kidsOnly: true,
    tip: 'claw',
    joints: 'crease',
    // Spots of different sizes.
    back: (svg, { width, sign }) =>
      [
        [-0.25, -0.35, 0.22],
        [0.3, -0.1, 0.15],
        [-0.05, 0.35, 0.18],
        [0.38, 0.5, 0.1],
        [-0.42, 0.25, 0.09],
      ].map(([x, y, r]) => svg('circle', { class: 'hand-skin__spot', cx: sign * x * width * 0.7, cy: y, r })),
  },
];

/** The skin to use: unknown ids, and kids-only skins for adults, fall back to the default. */
export function skinFor(id, mode) {
  const skin = HAND_SKINS.find((candidate) => candidate.id === id);
  if (!skin || (skin.kidsOnly && mode !== 'kids')) return HAND_SKINS.find((candidate) => candidate.id === DEFAULT_SKIN);
  return skin;
}

/** Skins offered to a profile mode. */
export const skinsFor = (mode) => HAND_SKINS.filter((skin) => mode === 'kids' || !skin.kidsOnly);

/** The hands a profile chose, as createHandsView takes them. */
export const handsOf = (profile) => ({ skin: skinFor(profile.settings.hands, profile.mode), placement: profile.settings.handsPlacement });

// --- Shapes ---

// A tiny spider: round body, head and eight legs.
function spider(svg) {
  const legs = [-1, 1]
    .flatMap((side) =>
      [-0.12, -0.04, 0.04, 0.12].map(
        (y, i) => `M ${side * 0.06} ${y} Q ${side * 0.2} ${y - 0.1 + i * 0.04} ${side * 0.26} ${y + 0.06 + (i - 1.5) * 0.05}`,
      ),
    )
    .join(' ');
  return [
    svg('path', { class: 'hand-skin__pattern hand-skin__pattern--thick', d: legs }),
    svg('ellipse', { class: 'hand-skin__dark', cx: 0, cy: 0.04, rx: 0.08, ry: 0.11 }),
    svg('circle', { class: 'hand-skin__dark', cx: 0, cy: -0.1, r: 0.05 }),
  ];
}

// A tiger stripe: thick where it starts (x1) and tapering to a point (x2), slightly wavy.
function brushStroke(x1, x2, y, thickness) {
  const mid = (x1 + x2) / 2;
  return (
    `M ${x1} ${y - thickness} Q ${mid} ${y - thickness * 1.6} ${x2} ${y} ` +
    `Q ${mid} ${y + thickness * 0.4} ${x1} ${y + thickness} Z`
  );
}

// Four-pointed sparkle centered on (cx, cy).
function sparklePath(cx, cy, r) {
  const k = r * 0.28;
  return (
    `M ${cx} ${cy - r} Q ${cx + k} ${cy - k} ${cx + r} ${cy} Q ${cx + k} ${cy + k} ${cx} ${cy + r} ` +
    `Q ${cx - k} ${cy + k} ${cx - r} ${cy} Q ${cx - k} ${cy - k} ${cx} ${cy - r} Z`
  );
}
