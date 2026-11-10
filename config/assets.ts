/**
 * VYOMI — image asset manifest.
 *
 * The brief: "If suitable image generation or approved assets are unavailable,
 * flag the missing asset instead of inserting unrelated stock imagery."
 *
 * Every image slot on the site is declared here. `src: null` means the approved
 * asset has not been supplied yet, and <AssetSlot> renders a labelled, correctly
 * proportioned placeholder naming the exact shot required. No stock photography
 * is substituted anywhere.
 *
 * To supply an asset: drop the file into /public/img/ and set `src`.
 * Dimensions are already reserved via `ratio`, so nothing reflows.
 */

export interface ImageSlot {
  /** Stable id, also used as the React key and in the asset report. */
  id: string;
  /** The exact shot required. Rendered in the placeholder for client review. */
  need: string;
  /** Recommended master capture/export size before responsive derivatives. */
  master: string;
  /** Aspect ratio as a CSS ratio string, e.g. '4 / 3'. Reserves layout space. */
  ratio: string;
  /** `contain` when the full equipment silhouette must stay visible. */
  fit: 'cover' | 'contain';
  /** Desktop object-position. Protects faces, hands, machine silhouettes. */
  focal: string;
  /** Mobile object-position when the desktop crop would clip the subject. */
  focalMobile?: string;
  /** Path under /public once supplied, else null. */
  src: string | null;
  /** Separate mobile crop when one is needed. */
  srcMobile?: string | null;
  /** Meaningful alt text for the supplied image. */
  alt: string;
  /**
   * Set true for generated/conceptual interiors so the UI can label them as
   * representative rather than actual club photography.
   */
  conceptual?: boolean;
}

const slot = (s: ImageSlot): ImageSlot => s;

/* ------------------------------------------------------------------
   1 — Explore the club
   Areas confirmed by the brief. No invented floor plans.
   ------------------------------------------------------------------ */

export const CLUB_AREAS: ImageSlot[] = [
  slot({
    id: 'area-reception',
    need: 'Reception and lounge — wide interior, desk and seating, warm interior lighting',
    master: '3840 × 2160',
    ratio: '16 / 9',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/area-reception.png',
    alt: 'Vyomi reception and lounge',
    conceptual: true,
  }),
  slot({
    id: 'area-training-floor',
    need: 'Training floor — wide view along the Panatta equipment range',
    master: '3840 × 2880',
    ratio: '4 / 3',
    fit: 'cover',
    focal: '50% 55%',
    src: '/img/area-training-floor.png',
    alt: 'Vyomi training floor',
  }),
  slot({
    id: 'area-studio',
    need: 'Studio — empty group-class room, mirrors and flooring visible',
    master: '3840 × 2560',
    ratio: '3 / 2',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/area-studio.png',
    alt: 'Vyomi group studio',
  }),
  slot({
    id: 'area-wellness',
    need: 'Wellness spaces — spa / salt bath room interior',
    master: '2560 × 3200',
    ratio: '4 / 5',
    fit: 'cover',
    focal: '50% 45%',
    src: '/img/area-wellness.png',
    alt: 'Vyomi wellness area',
  }),
  slot({
    id: 'area-lift',
    need: 'Dedicated lift — entrance lobby showing the club lift',
    master: '2560 × 3200',
    ratio: '4 / 5',
    fit: 'cover',
    focal: '50% 40%',
    src: '/img/area-lift.png',
    alt: 'Dedicated lift to Vyomi',
  }),
  slot({
    id: 'area-parking',
    need: 'Parking — covered parking bay at the building entrance',
    master: '3840 × 2560',
    ratio: '3 / 2',
    fit: 'cover',
    focal: '50% 60%',
    src: '/img/area-parking.jpg',
    alt: 'Parking at Vyomi',
  }),
];

/* ------------------------------------------------------------------
   2 — Equipment
   Categories confirmed by the brief. `contain` where the whole machine
   must read; a free-weight photo must never stand in for a pin-loaded machine.
   ------------------------------------------------------------------ */

export const EQUIPMENT_IMAGES: Record<string, ImageSlot[]> = {
  'plate-loaded': [
    slot({
      id: 'eq-plate-main',
      need: 'Plate-loaded machine, full silhouette, burgundy Panatta frame, three-quarter view',
      master: '3200 × 2400',
      ratio: '4 / 3',
      fit: 'contain',
      focal: '50% 50%',
      src: '/img/eq-plate-main.png',
      alt: 'Plate-loaded Panatta machine',
    }),
    slot({
      id: 'eq-plate-detail-1',
      need: 'Detail — loaded plate stack and sleeve, shallow depth of field',
      master: '2048 × 2048',
      ratio: '1 / 1',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/eq-plate-detail-1.png',
      alt: 'Weight plates on a loading sleeve',
    }),
    slot({
      id: 'eq-plate-detail-2',
      need: 'Detail — handle, knurling or adjustment pin on the same machine',
      master: '2048 × 2560',
      ratio: '4 / 5',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/eq-plate-detail-2.png',
      alt: 'Machine handle detail',
    }),
  ],
  'pin-loaded': [
    slot({
      id: 'eq-pin-main',
      need: 'Pin-loaded selectorised machine, FULL machine visible including weight stack',
      master: '3200 × 2400',
      ratio: '4 / 3',
      fit: 'contain',
      focal: '50% 50%',
      src: '/img/eq-pin-main.jpg',
      alt: 'Pin-loaded selectorised machine',
    }),
    slot({
      id: 'eq-pin-detail-1',
      need: 'Detail — selector pin inserted in the weight stack (must be a pin-loaded stack)',
      master: '2048 × 2048',
      ratio: '1 / 1',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/eq-pin-detail-1.jpg',
      alt: 'Selector pin in a weight stack',
    }),
    slot({
      id: 'eq-pin-detail-2',
      need: 'Detail — seat adjustment or pulley on the same machine',
      master: '2048 × 2560',
      ratio: '4 / 5',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/eq-pin-detail-2.png',
      alt: 'Seat adjustment detail',
    }),
  ],
  conditioning: [
    slot({
      id: 'eq-cond-main',
      need: 'Conditioning zone — ergs, sled track or turf lane, full width of the area',
      master: '3200 × 2400',
      ratio: '4 / 3',
      fit: 'cover',
      focal: '50% 55%',
      src: '/img/eq-cond-main.png',
      alt: 'Conditioning zone',
    }),
    slot({
      id: 'eq-cond-detail-1',
      need: 'Detail — erg monitor, flywheel or sled handle',
      master: '2048 × 2048',
      ratio: '1 / 1',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/eq-cond-detail-1.png',
      alt: 'Conditioning equipment detail',
    }),
    slot({
      id: 'eq-cond-detail-2',
      need: 'Detail — turf lane markings or sled loaded with plates',
      master: '2048 × 2560',
      ratio: '4 / 5',
      fit: 'cover',
      focal: '50% 55%',
      src: '/img/eq-cond-detail-2.png',
      alt: 'Sled and turf lane detail',
    }),
  ],
};

/* ------------------------------------------------------------------
   3 — Trainers
   Levels confirmed by the brief; identities are not.
   Generated portraits must never stand in for real people.
   ------------------------------------------------------------------ */

export const TRAINER_PORTRAITS: ImageSlot[] = [
  slot({
    id: 'trainer-l1',
    need: 'Level 1 trainer portrait — real staff member, waist-up, clean dark background, generous headroom',
    master: '2400 × 3200',
    ratio: '3 / 4',
    fit: 'cover',
    focal: '50% 25%',
    src: '/img/trainer-l1-v5.jpg',
    alt: 'Vyomi Level 1 Trainer',
  }),
  slot({
    id: 'trainer-l2',
    need: 'Level 2 trainer portrait — same framing, lighting and lens as Level 1',
    master: '2400 × 3200',
    ratio: '3 / 4',
    fit: 'cover',
    focal: '50% 25%',
    src: '/img/trainer-l2-v5.jpg',
    alt: 'Vyomi Level 2 Trainer',
  }),
  slot({
    id: 'trainer-l3',
    need: 'Level 3 trainer portrait — same framing, lighting and lens as Level 1',
    master: '2400 × 3200',
    ratio: '3 / 4',
    fit: 'cover',
    focal: '50% 25%',
    src: '/img/trainer-l3-v5.jpg',
    alt: 'Vyomi Level 3 Trainer',
  }),
];

/* ------------------------------------------------------------------
   4 — Classes
   Only classes the brief confirms. Imagery must match the activity:
   mat work must not illustrate reformer Pilates.
   ------------------------------------------------------------------ */

export const CLASS_IMAGES: ImageSlot[] = [
  slot({
    id: 'class-hyrox',
    need: 'HYROX training — sled push or wall balls in the conditioning zone',
    master: '2400 × 3000',
    ratio: '4 / 5',
    fit: 'cover',
    focal: '50% 40%',
    src: '/img/class-hyrox.png',
    alt: 'HYROX conditioning session',
  }),
  slot({
    id: 'class-reformer',
    need: 'Reformer Pilates — on an actual reformer carriage with footbar and straps visible (not mat work)',
    master: '2400 × 3000',
    ratio: '4 / 5',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/class-reformer.png',
    alt: 'Reformer Pilates session',
  }),
  slot({
    id: 'class-strength',
    need: 'Strength class — coached barbell or machine work on the training floor',
    master: '2400 × 3000',
    ratio: '4 / 5',
    fit: 'cover',
    focal: '50% 40%',
    src: '/img/class-strength.png',
    alt: 'Strength training session',
  }),
];

/* ------------------------------------------------------------------
   5 — Wellness
   Spa, salt bath and recovery confirmed by the brief.
   ------------------------------------------------------------------ */

export const WELLNESS_IMAGES: ImageSlot[] = [
  slot({
    id: 'wellness-main',
    need: 'Spa / recovery room — medium landscape interior, natural material colour retained. NO swimming pool: the brief confirms spa, salt bath and recovery only',
    master: '3840 × 2160',
    ratio: '16 / 9',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/wellness-main.jpg',
    alt: 'Vyomi spa and recovery room',
  }),
  slot({
    id: 'wellness-salt',
    need: 'Salt bath — tub or salt room detail, controlled highlights',
    master: '2048 × 2560',
    ratio: '4 / 5',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/wellness-salt.png',
    alt: 'Salt bath',
  }),
  slot({
    id: 'wellness-detail',
    need: 'Recovery detail — folded towels, timber bench or shower fittings',
    master: '2048 × 2048',
    ratio: '1 / 1',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/wellness-detail.png',
    alt: 'Recovery area detail',
  }),
];

export const WELLNESS_AMENITY_IMAGES = {
  spa: {
    left: slot({
      id: 'wellness-spa-left',
      need: 'Finnish cedar sauna & vitality spa with amber lighting',
      master: '2048 × 2560',
      ratio: '4 / 5',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-spa-left.jpg',
      alt: 'Vyomi Finnish cedar sauna and vitality spa',
    }),
    right: slot({
      id: 'wellness-spa-right',
      need: 'Vitality hydrotherapy pool with cascading brass spout',
      master: '2048 × 2048',
      ratio: '1 / 1',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-spa-right.jpg',
      alt: 'Vitality hydrotherapy pool',
    }),
  },
  'salt-bath': {
    left: slot({
      id: 'wellness-salt-left',
      need: 'Salt bath — glowing Himalayan salt brick wall relaxation room',
      master: '2048 × 2560',
      ratio: '4 / 5',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-salt-left.png',
      alt: 'Himalayan salt bath room',
    }),
    right: slot({
      id: 'wellness-salt-right',
      need: 'Salt sanctuary detail with backlit crystal bricks and river stones',
      master: '2048 × 2048',
      ratio: '1 / 1',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-salt-right.jpg',
      alt: 'Himalayan salt crystals and river stones',
    }),
  },
  'recovery-suite': {
    left: slot({
      id: 'wellness-recovery-left',
      need: 'Sports recovery suite with zero-gravity loungers and compression therapy',
      master: '2048 × 2560',
      ratio: '4 / 5',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-recovery-left.jpg',
      alt: 'Athletic recovery lounge with zero-gravity loungers',
    }),
    right: slot({
      id: 'wellness-recovery-right',
      need: 'Infrared therapy panel and percussive recovery equipment',
      master: '2048 × 2048',
      ratio: '1 / 1',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-recovery-right.jpg',
      alt: 'Infrared therapy and percussive recovery station',
    }),
  },
  'changing-rooms': {
    left: slot({
      id: 'wellness-changing-left',
      need: 'Executive locker room and changing salon with dark fluted oak',
      master: '2048 × 2560',
      ratio: '4 / 5',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-changing-left.jpg',
      alt: 'Executive changing salon and fluted oak lockers',
    }),
    right: slot({
      id: 'wellness-changing-right',
      need: 'Luxury grooming vanity with circular backlit bronze mirror',
      master: '2048 × 2048',
      ratio: '1 / 1',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-changing-right.jpg',
      alt: 'Luxury private grooming vanity',
    }),
  },
  showers: {
    left: slot({
      id: 'wellness-showers-left',
      need: 'Walk-in rainfall shower sanctuary with dark charcoal slate slabs',
      master: '2048 × 2560',
      ratio: '4 / 5',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-showers-left.jpg',
      alt: 'Walk-in dark slate rainfall shower',
    }),
    right: slot({
      id: 'wellness-showers-right',
      need: 'Folded waffle cotton towels on timber bench with brass fittings',
      master: '2048 × 2048',
      ratio: '1 / 1',
      fit: 'cover',
      focal: '50% 50%',
      src: '/img/wellness-showers-right.png',
      alt: 'Changing and shower details with waffle towels',
    }),
  },
} as const;

export const WELLNESS_AMENITY_SLOTS: ImageSlot[] = Object.values(
  WELLNESS_AMENITY_IMAGES
).flatMap((a) => [a.left, a.right]);

/* ------------------------------------------------------------------
   Studio page — one wide plate per chapter
   ------------------------------------------------------------------ */

export const STUDIO_IMAGES: Record<string, ImageSlot> = {
  // studio-fitness retired: the Fitness chapter now leads with the
  // walkthrough clip (/video/tour-fitness.mp4) rather than a still plate.
  hyrox: slot({
    id: 'studio-hyrox',
    need: 'HYROX zone — sled lane and ergs, wide establishing plate',
    master: '3840 × 2160',
    ratio: '16 / 9',
    fit: 'cover',
    focal: '50% 50%',
    focalMobile: '55% 50%',
    src: '/img/studio-hyrox.png',
    alt: 'Vyomi HYROX zone',
  }),
  fitnessDetailA: slot({
    id: 'studio-fitness-detail-a',
    need: 'Rack or machine detail — knurling, pin or hand on a grip, shallow depth of field',
    master: '2400 × 3000',
    ratio: '4 / 5',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/studio-fitness-detail-a.png',
    alt: 'Equipment detail on the Vyomi training floor',
  }),
  fitnessDetailB: slot({
    id: 'studio-fitness-detail-b',
    need: 'Training floor looking down the range — burgundy Panatta frames receding',
    master: '3000 × 2400',
    ratio: '5 / 4',
    fit: 'cover',
    focal: '50% 55%',
    src: '/img/studio-fitness-detail-b.png',
    alt: 'Panatta equipment range',
  }),
  hyroxDetail: slot({
    id: 'studio-hyrox-detail',
    need: 'Sled loaded on the lane, or an erg handle mid-pull — motion implied, no faces needed',
    master: '3000 × 2400',
    ratio: '5 / 4',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/studio-hyrox-detail.jpg',
    alt: 'HYROX conditioning detail',
  }),

  /* ---- Zumba ---- */
  zumba: slot({
    id: 'studio-zumba',
    need: 'Zumba class mid-movement — group studio, warm lighting, motion blur acceptable',
    master: '3840 × 2160',
    ratio: '16 / 9',
    fit: 'cover',
    focal: '50% 45%',
    src: '/img/studio-zumba.png',
    alt: 'Zumba class at Vyomi',
  }),
  zumbaDetailA: slot({
    id: 'studio-zumba-detail-a',
    need: 'Studio floor and mirror detail — empty room, reflected lighting',
    master: '2400 × 3000',
    ratio: '4 / 5',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/studio-zumba-detail-a.png',
    alt: 'Group studio mirror and floor',
  }),
  zumbaDetailB: slot({
    id: 'studio-zumba-detail-b',
    need: 'Sound system or studio lighting detail — close, architectural',
    master: '2048 × 2048',
    ratio: '1 / 1',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/studio-zumba-detail-b.png',
    alt: 'Studio sound and lighting detail',
  }),

  /* ---- Pilates (the showpiece chapter) ---- */
  pilates: slot({
    id: 'studio-pilates',
    need: 'Reformer studio — wide establishing plate showing a ROW of reformer carriages, footbars and straps clearly visible. Not mat work.',
    master: '3840 × 2160',
    ratio: '16 / 9',
    fit: 'cover',
    focal: '50% 50%',
    focalMobile: '55% 50%',
    src: '/img/studio-pilates.png',
    alt: 'Vyomi reformer Pilates studio',
  }),
  pilatesDetailA: slot({
    id: 'studio-pilates-detail-a',
    need: 'Reformer carriage detail — springs, footbar and shoulder blocks, shallow depth of field',
    master: '2400 × 3000',
    ratio: '4 / 5',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/studio-pilates-detail-a.jpg',
    alt: 'Reformer carriage detail',
  }),
  pilatesDetailB: slot({
    id: 'studio-pilates-detail-b',
    need: 'Straps and handles hanging at rest against the carriage — quiet, still frame',
    master: '2048 × 2048',
    ratio: '1 / 1',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/studio-pilates-detail-b.png',
    alt: 'Reformer straps and handles',
  }),

  wellness: slot({
    id: 'studio-wellness',
    need: 'Wellness suite — wide establishing plate',
    master: '3840 × 2160',
    ratio: '16 / 9',
    fit: 'cover',
    focal: '50% 50%',
    src: '/img/studio-wellness.jpg',
    alt: 'Vyomi wellness suite',
  }),
};

/* ------------------------------------------------------------------
   Supplied assets — the three files that do exist
   ------------------------------------------------------------------ */

export const SUPPLIED = {
  /** Client logo, 7 Nov. Transparent PNG, near-square portrait (0.912). */
  logo: { src: '/logo.png', width: 1198, height: 1313 },
  /**
   * Reception walkthrough, 7 Nov. Source was 1920 × 1080 with black bars baked
   * into the frame; re-encoded from the original at 1834 × 1044 with the bars
   * cropped and the house grade applied. Poster is a frame of this same cut.
   */
  heroVideo: '/video/hero.mp4',
  heroPoster: '/video/hero-poster.jpg',
  heroVideoSize: { width: 1834, height: 1044 },
} as const;

/** Every declared slot, for the outstanding-asset report. */
export const ALL_SLOTS: ImageSlot[] = [
  ...CLUB_AREAS,
  ...Object.values(EQUIPMENT_IMAGES).flat(),
  ...TRAINER_PORTRAITS,
  ...CLASS_IMAGES,
  ...WELLNESS_IMAGES,
  ...WELLNESS_AMENITY_SLOTS,
  ...Object.values(STUDIO_IMAGES),
];

export const MISSING_SLOTS = ALL_SLOTS.filter((s) => s.src === null);
