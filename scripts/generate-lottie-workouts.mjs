import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'lottie');

// Helper to create a keyframed animated property
function kf(keyframes) {
  return {
    a: 1,
    k: keyframes.map((k, i) => ({
      t: k.t,
      s: k.s,
      e: i < keyframes.length - 1 ? keyframes[i + 1].s : k.s,
      i: { x: [0.3], y: [1] },
      o: { x: [0.3], y: [0] },
    })),
  };
}

function staticVal(val) {
  return { a: 0, k: val };
}

// 1. INCLINE BENCH PRESS (Panatta Monolith Series)
const inclinePressLottie = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120, // 2-second loop at 60fps
  w: 600,
  h: 600,
  nm: 'Incline Press Workout Lottie',
  ddd: 0,
  assets: [],
  layers: [
    // Layer 1: Force Vector Glow
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Force Vector Pulse',
      sr: 1,
      ks: {
        o: kf([
          { t: 0, s: [10] },
          { t: 60, s: [85] },
          { t: 90, s: [100] },
          { t: 120, s: [10] },
        ]),
        r: staticVal(0),
        p: kf([
          { t: 0, s: [320, 290, 0] },
          { t: 60, s: [320, 160, 0] },
          { t: 120, s: [320, 290, 0] },
        ]),
        a: staticVal([0, 0, 0]),
        s: kf([
          { t: 0, s: [60, 60, 100] },
          { t: 60, s: [110, 110, 100] },
          { t: 120, s: [60, 60, 100] },
        ]),
      },
      shapes: [
        {
          ty: 'el',
          s: staticVal([70, 70]),
          p: staticVal([0, 0]),
        },
        {
          ty: 'fl',
          c: staticVal([0.84, 0.96, 0.36, 0.4]), // lime phosphor
          o: staticVal(50),
        },
      ],
    },
    // Layer 2: Moving Barbell with Burgundy Olympic Plates
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Olympic Barbell & Weights',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(-15), // angled with incline bench
        p: kf([
          { t: 0, s: [320, 280, 0] },
          { t: 60, s: [340, 150, 0] },
          { t: 120, s: [320, 280, 0] },
        ]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        // Bar shaft
        {
          ty: 'rc',
          s: staticVal([240, 10]),
          p: staticVal([0, 0]),
          r: staticVal(4),
        },
        {
          ty: 'fl',
          c: staticVal([0.92, 0.92, 0.9, 1]), // steel
          o: staticVal(100),
        },
        // Left Weight Plate (Burgundy)
        {
          ty: 'rc',
          s: staticVal([18, 90]),
          p: staticVal([-90, 0]),
          r: staticVal(3),
        },
        {
          ty: 'fl',
          c: staticVal([0.55, 0.13, 0.19, 1]), // burgundy
          o: staticVal(100),
        },
        // Right Weight Plate (Burgundy)
        {
          ty: 'rc',
          s: staticVal([18, 90]),
          p: staticVal([90, 0]),
          r: staticVal(3),
        },
        {
          ty: 'fl',
          c: staticVal([0.55, 0.13, 0.19, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Layer 3: Athlete Arms (Kinematic Forearms)
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Forearms & Elbows',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: kf([
          { t: 0, s: [35] },
          { t: 60, s: [-10] },
          { t: 120, s: [35] },
        ]),
        p: staticVal([280, 310, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([12, 70]),
          p: staticVal([0, -35]),
          r: staticVal(5),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Layer 4: Incline Bench & Backrest
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: '30° Incline Bench',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(-30),
        p: staticVal([260, 350, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([22, 280]),
          p: staticVal([0, 0]),
          r: staticVal(6),
        },
        {
          ty: 'fl',
          c: staticVal([0.12, 0.12, 0.12, 1]), // dark leather
          o: staticVal(100),
        },
        {
          ty: 'st',
          c: staticVal([0.55, 0.13, 0.19, 0.8]), // burgundy stitching
          w: staticVal(2),
        },
      ],
    },
    // Layer 5: Torso & Head
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: 'Athlete Torso & Head',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(-30),
        p: staticVal([270, 340, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        // Torso
        {
          ty: 'rc',
          s: staticVal([36, 170]),
          p: staticVal([0, 0]),
          r: staticVal(12),
        },
        {
          ty: 'fl',
          c: staticVal([0.95, 0.95, 0.94, 1]),
          o: staticVal(100),
        },
        // Head
        {
          ty: 'el',
          s: staticVal([46, 46]),
          p: staticVal([0, -115]),
        },
        {
          ty: 'fl',
          c: staticVal([0.95, 0.95, 0.94, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Layer 6: Structural Frame Pillars
    {
      ddd: 0,
      ind: 6,
      ty: 4,
      nm: 'Panatta Frame Uprights',
      sr: 1,
      ks: {
        o: staticVal(40),
        r: staticVal(0),
        p: staticVal([300, 360, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([12, 340]),
          p: staticVal([-120, 0]),
          r: staticVal(2),
        },
        {
          ty: 'rc',
          s: staticVal([12, 340]),
          p: staticVal([120, 0]),
          r: staticVal(2),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(25),
        },
      ],
    },
  ],
};

// 2. PENDULUM HACK SQUAT (Quad Biomechanics)
const hackSquatLottie = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 600,
  h: 600,
  nm: 'Hack Squat Workout Lottie',
  ddd: 0,
  assets: [],
  layers: [
    // Sled & Shoulder Pads (Travels at 45° angle)
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Sled & Shoulder Harness',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(45),
        p: kf([
          { t: 0, s: [380, 180, 0] },  // Top lockout
          { t: 60, s: [250, 310, 0] }, // Deep 90° squat stretch
          { t: 120, s: [380, 180, 0] },// Return to top
        ]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        // Backrest pad
        {
          ty: 'rc',
          s: staticVal([30, 160]),
          p: staticVal([0, 0]),
          r: staticVal(6),
        },
        {
          ty: 'fl',
          c: staticVal([0.14, 0.14, 0.14, 1]),
          o: staticVal(100),
        },
        // Shoulder pads (Burgundy)
        {
          ty: 'rc',
          s: staticVal([24, 40]),
          p: staticVal([-20, -75]),
          r: staticVal(4),
        },
        {
          ty: 'fl',
          c: staticVal([0.55, 0.13, 0.19, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Athlete Torso & Head (Tied to sled)
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Lifter Torso',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(45),
        p: kf([
          { t: 0, s: [390, 190, 0] },
          { t: 60, s: [260, 320, 0] },
          { t: 120, s: [390, 190, 0] },
        ]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([28, 130]),
          p: staticVal([0, 0]),
          r: staticVal(10),
        },
        {
          ty: 'fl',
          c: staticVal([0.95, 0.95, 0.94, 1]),
          o: staticVal(100),
        },
        // Head
        {
          ty: 'el',
          s: staticVal([42, 42]),
          p: staticVal([0, -85]),
        },
        {
          ty: 'fl',
          c: staticVal([0.95, 0.95, 0.94, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Dynamic Knee Joint & Quadriceps Contraction
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Knee Flexion & Quad Arc',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: kf([
          { t: 0, s: [10] },
          { t: 60, s: [85] },
          { t: 120, s: [10] },
        ]),
        p: staticVal([200, 420, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([16, 95]),
          p: staticVal([0, -45]),
          r: staticVal(6),
        },
        {
          ty: 'fl',
          c: staticVal([0.88, 0.88, 0.86, 1]),
          o: staticVal(100),
        },
      ],
    },
    // 45° Linear Guide Rails & Base Plate
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Linear Guide Rails',
      sr: 1,
      ks: {
        o: staticVal(50),
        r: staticVal(45),
        p: staticVal([300, 270, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([12, 380]),
          p: staticVal([25, 0]),
          r: staticVal(3),
        },
        {
          ty: 'rc',
          s: staticVal([12, 380]),
          p: staticVal([-25, 0]),
          r: staticVal(3),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(30),
        },
      ],
    },
    // Footplate
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: 'Angled Footplate',
      sr: 1,
      ks: {
        o: staticVal(90),
        r: staticVal(-45),
        p: staticVal([170, 440, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([18, 120]),
          p: staticVal([0, 0]),
          r: staticVal(4),
        },
        {
          ty: 'fl',
          c: staticVal([0.55, 0.13, 0.19, 1]),
          o: staticVal(100),
        },
      ],
    },
  ],
};

// 3. HYROX POWER SLED PUSH
const sledPushLottie = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 60, // 1-second sprint cadence loop
  w: 600,
  h: 600,
  nm: 'Sled Push HYROX Lottie',
  ddd: 0,
  assets: [],
  layers: [
    // Sled Frame & Weight Stack
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Sled Chassis & Uprights',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(0),
        p: staticVal([400, 360, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        // Sled runners
        {
          ty: 'rc',
          s: staticVal([130, 12]),
          p: staticVal([0, 60]),
          r: staticVal(4),
        },
        {
          ty: 'fl',
          c: staticVal([0.69, 0.55, 0.34, 1]), // bronze/gold
          o: staticVal(100),
        },
        // Vertical push poles
        {
          ty: 'rc',
          s: staticVal([12, 170]),
          p: staticVal([-30, -25]),
          r: staticVal(3),
        },
        {
          ty: 'rc',
          s: staticVal([12, 170]),
          p: staticVal([30, -25]),
          r: staticVal(3),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(90),
        },
        // Heavy Burgundy Plates on Post
        {
          ty: 'rc',
          s: staticVal([35, 90]),
          p: staticVal([0, 10]),
          r: staticVal(4),
        },
        {
          ty: 'fl',
          c: staticVal([0.55, 0.13, 0.19, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Athlete Torso at 45° angle
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: '45° Sprint Torso & Arms',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(-45),
        p: staticVal([310, 310, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        // Spine
        {
          ty: 'rc',
          s: staticVal([28, 140]),
          p: staticVal([0, 0]),
          r: staticVal(8),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(100),
        },
        // Head
        {
          ty: 'el',
          s: staticVal([42, 42]),
          p: staticVal([10, -90]),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(100),
        },
        // Arms locked to poles
        {
          ty: 'rc',
          s: staticVal([14, 90]),
          p: staticVal([35, -45]),
          r: staticVal(5),
        },
        {
          ty: 'fl',
          c: staticVal([0.88, 0.88, 0.86, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Piston Leg 1 (Front Stride)
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Piston Leg 1',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: kf([
          { t: 0, s: [-30] },
          { t: 30, s: [40] },
          { t: 60, s: [-30] },
        ]),
        p: staticVal([260, 360, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([14, 85]),
          p: staticVal([0, 40]),
          r: staticVal(6),
        },
        {
          ty: 'fl',
          c: staticVal([0.95, 0.95, 0.94, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Piston Leg 2 (Rear Drive)
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Piston Leg 2',
      sr: 1,
      ks: {
        o: staticVal(80),
        r: kf([
          { t: 0, s: [40] },
          { t: 30, s: [-30] },
          { t: 60, s: [40] },
        ]),
        p: staticVal([240, 360, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([14, 85]),
          p: staticVal([0, 40]),
          r: staticVal(6),
        },
        {
          ty: 'fl',
          c: staticVal([0.65, 0.65, 0.65, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Turf Floor Track
    {
      ddd: 0,
      ind: 5,
      ty: 4,
      nm: 'Sprint Turf Lane',
      sr: 1,
      ks: {
        o: staticVal(50),
        r: staticVal(0),
        p: staticVal([300, 430, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([450, 6]),
          p: staticVal([0, 0]),
          r: staticVal(1),
        },
        {
          ty: 'fl',
          c: staticVal([0.69, 0.55, 0.34, 1]),
          o: staticVal(100),
        },
      ],
    },
  ],
};

// 4. SKIERG TRIPLE EXTENSION
const skiErgLottie = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 90,
  w: 600,
  h: 600,
  nm: 'SkiErg Workout Lottie',
  ddd: 0,
  assets: [],
  layers: [
    // Flywheel & Machine Tower
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Air Flywheel & Tower',
      sr: 1,
      ks: {
        o: staticVal(80),
        r: staticVal(0),
        p: staticVal([180, 300, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        // Main upright column
        {
          ty: 'rc',
          s: staticVal([16, 380]),
          p: staticVal([0, 0]),
          r: staticVal(4),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(40),
        },
        // Flywheel drum
        {
          ty: 'el',
          s: staticVal([90, 90]),
          p: staticVal([0, 90]),
        },
        {
          ty: 'fl',
          c: staticVal([0.15, 0.15, 0.15, 1]),
          o: staticVal(100),
        },
        {
          ty: 'st',
          c: staticVal([0.69, 0.55, 0.34, 1]),
          w: staticVal(4),
        },
      ],
    },
    // Athlete Torso Hinge
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Hip Hinge Torso',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: kf([
          { t: 0, s: [-10] }, // Standing tall
          { t: 45, s: [55] },  // Deep powerful hinge
          { t: 90, s: [-10] }, // Return tall
        ]),
        p: staticVal([320, 320, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([28, 140]),
          p: staticVal([0, -60]),
          r: staticVal(8),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(100),
        },
        {
          ty: 'el',
          s: staticVal([44, 44]),
          p: staticVal([0, -150]),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(100),
        },
      ],
    },
    // SkiErg Drive Arms & Pull Cords
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Drive Arms & Handles',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: kf([
          { t: 0, s: [-40] },
          { t: 45, s: [65] },
          { t: 90, s: [-40] },
        ]),
        p: staticVal([290, 240, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([12, 100]),
          p: staticVal([0, 45]),
          r: staticVal(5),
        },
        {
          ty: 'fl',
          c: staticVal([0.69, 0.55, 0.34, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Legs
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Legs & Floor',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(0),
        p: staticVal([320, 390, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([18, 90]),
          p: staticVal([0, 0]),
          r: staticVal(6),
        },
        {
          ty: 'fl',
          c: staticVal([0.88, 0.88, 0.86, 1]),
          o: staticVal(100),
        },
      ],
    },
  ],
};

// 5. REFORMER PILATES CARRIAGE GLIDE
const reformerGlideLottie = {
  v: '5.7.4',
  fr: 60,
  ip: 0,
  op: 120,
  w: 600,
  h: 600,
  nm: 'Reformer Pilates Lottie',
  ddd: 0,
  assets: [],
  layers: [
    // Reformer Sliding Carriage Bed
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Sliding Carriage Bed',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(0),
        p: kf([
          { t: 0, s: [270, 360, 0] },  // Home position near footbar
          { t: 60, s: [380, 360, 0] }, // Full spring elongation glide
          { t: 120, s: [270, 360, 0] },// Controlled eccentric return
        ]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        // Carriage platform
        {
          ty: 'rc',
          s: staticVal([180, 26]),
          p: staticVal([0, 0]),
          r: staticVal(4),
        },
        {
          ty: 'fl',
          c: staticVal([0.16, 0.16, 0.16, 1]),
          o: staticVal(100),
        },
        // Shoulder block
        {
          ty: 'rc',
          s: staticVal([16, 32]),
          p: staticVal([55, -20]),
          r: staticVal(3),
        },
        {
          ty: 'fl',
          c: staticVal([0.84, 0.96, 0.36, 1]), // lime accent
          o: staticVal(100),
        },
        // Supine Athlete
        {
          ty: 'rc',
          s: staticVal([120, 20]),
          p: staticVal([0, -18]),
          r: staticVal(6),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(100),
        },
        // Head
        {
          ty: 'el',
          s: staticVal([32, 32]),
          p: staticVal([70, -22]),
        },
        {
          ty: 'fl',
          c: staticVal([0.96, 0.96, 0.95, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Extending Legs to Footbar
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Leg Press & Footbar Connection',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: kf([
          { t: 0, s: [45] },  // Knees bent at chest
          { t: 60, s: [10] },  // Legs extended long
          { t: 120, s: [45] },
        ]),
        p: staticVal([210, 345, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([14, 80]),
          p: staticVal([-30, -15]),
          r: staticVal(5),
        },
        {
          ty: 'fl',
          c: staticVal([0.92, 0.92, 0.9, 1]),
          o: staticVal(100),
        },
      ],
    },
    // Spring Coil Assembly (Expands and contracts)
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: 'Tension Springs',
      sr: 1,
      ks: {
        o: staticVal(80),
        r: staticVal(0),
        p: staticVal([170, 362, 0]),
        a: staticVal([0, 0, 0]),
        s: kf([
          { t: 0, s: [60, 100, 100] },
          { t: 60, s: [140, 100, 100] },
          { t: 120, s: [60, 100, 100] },
        ]),
      },
      shapes: [
        {
          ty: 'rc',
          s: staticVal([80, 8]),
          p: staticVal([40, 0]),
          r: staticVal(2),
        },
        {
          ty: 'fl',
          c: staticVal([0.84, 0.96, 0.36, 1]),
          o: staticVal(80),
        },
      ],
    },
    // Wooden Frame & Footbar
    {
      ddd: 0,
      ind: 4,
      ty: 4,
      nm: 'Reformer Frame & Footbar',
      sr: 1,
      ks: {
        o: staticVal(100),
        r: staticVal(0),
        p: staticVal([300, 375, 0]),
        a: staticVal([0, 0, 0]),
        s: staticVal([100, 100, 100]),
      },
      shapes: [
        // Wood base rail
        {
          ty: 'rc',
          s: staticVal([460, 16]),
          p: staticVal([0, 0]),
          r: staticVal(3),
        },
        {
          ty: 'fl',
          c: staticVal([0.22, 0.18, 0.15, 1]), // dark walnut wood
          o: staticVal(100),
        },
        // Steel footbar upright
        {
          ty: 'rc',
          s: staticVal([14, 90]),
          p: staticVal([-190, -40]),
          r: staticVal(4),
        },
        {
          ty: 'fl',
          c: staticVal([0.84, 0.96, 0.36, 1]), // lime footbar
          o: staticVal(100),
        },
      ],
    },
  ],
};

// Write out all files to public/lottie
writeFileSync(join(outDir, 'incline-press.json'), JSON.stringify(inclinePressLottie, null, 2));
writeFileSync(join(outDir, 'hack-squat.json'), JSON.stringify(hackSquatLottie, null, 2));
writeFileSync(join(outDir, 'sled-push.json'), JSON.stringify(sledPushLottie, null, 2));
writeFileSync(join(outDir, 'skierg.json'), JSON.stringify(skiErgLottie, null, 2));
writeFileSync(join(outDir, 'reformer.json'), JSON.stringify(reformerGlideLottie, null, 2));

console.log('Successfully generated 5 high-quality Lottie workout animations in public/lottie/');

