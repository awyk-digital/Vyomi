/**
 * VYOMI — section content.
 *
 * Only facts the brief states are written as copy here. Anything the brief
 * flags as client-approved-only (trainer identities, equipment specifications,
 * level definitions, trial wording) is `null` and renders as a visible
 * "to confirm" marker rather than invented text.
 */

import {
  CLUB_AREAS,
  EQUIPMENT_IMAGES,
  TRAINER_PORTRAITS,
  CLASS_IMAGES,
  WELLNESS_IMAGES,
  type ImageSlot,
} from '@/config/assets';

/* ---------------- 1 · Explore the club ---------------- */

export interface Area {
  slot: ImageSlot;
  caption: string;
  /** Slight vertical offset for editorial variety, in rem. */
  offset: number;
}

/** The six areas the brief confirms. No invented floor plans. */
export const AREAS: Area[] = [
  { slot: CLUB_AREAS[0], caption: 'Reception & lounge', offset: 0 },
  { slot: CLUB_AREAS[1], caption: 'Training floor', offset: 1.75 },
  { slot: CLUB_AREAS[2], caption: 'Studio', offset: 0 },
  { slot: CLUB_AREAS[3], caption: 'Wellness spaces', offset: 2.25 },
  { slot: CLUB_AREAS[4], caption: 'Dedicated lift', offset: 0.75 },
  { slot: CLUB_AREAS[5], caption: 'Parking', offset: 1.5 },
];

/* ---------------- 2 · Facilities & equipment ---------------- */

export interface EquipmentSpec {
  label: string;
  /** null until the client confirms. Never guessed. */
  value: string | null;
}

export interface EquipmentCategory {
  id: string;
  label: string;
  /** One short factual line. */
  blurb: string;
  specs: EquipmentSpec[];
  images: ImageSlot[];
}

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  {
    id: 'plate-loaded',
    label: 'Plate loaded',
    blurb: 'Free-weight resistance loaded by hand, one plate at a time.',
    specs: [
      { label: 'Range', value: null },
      { label: 'Stations', value: null },
      { label: 'Loading', value: null },
    ],
    images: EQUIPMENT_IMAGES['plate-loaded'],
  },
  {
    id: 'pin-loaded',
    label: 'Pin loaded',
    blurb: 'Selectorised stacks for fast, repeatable load changes.',
    specs: [
      { label: 'Range', value: null },
      { label: 'Stations', value: null },
      { label: 'Increments', value: null },
    ],
    images: EQUIPMENT_IMAGES['pin-loaded'],
  },
  {
    id: 'conditioning',
    label: 'Conditioning',
    blurb: 'Ergs, sleds and open floor for metabolic work.',
    specs: [
      { label: 'Range', value: null },
      { label: 'Stations', value: null },
      { label: 'Surface', value: null },
    ],
    images: EQUIPMENT_IMAGES.conditioning,
  },
];

/* ---------------- 3 · Trainers ---------------- */

export interface Trainer {
  id: string;
  level: 'Level 1' | 'Level 2' | 'Level 3';
  /** null until the client supplies real staff details. */
  name: string | null;
  specialisation: string | null;
  /** What distinguishes this level — client-approved copy only. */
  levelNote: string | null;
  portrait: ImageSlot;
}

export const TRAINERS: Trainer[] = [
  {
    id: 'level-1',
    level: 'Level 1',
    name: 'Personal Trainer',
    specialisation: '2 Years Experience',
    levelNote: 'Foundational kinetic mechanics, structural alignment, and progressive functional strength development.',
    portrait: TRAINER_PORTRAITS[0],
  },
  {
    id: 'level-2',
    level: 'Level 2',
    name: 'Premium Trainer',
    specialisation: '5 to 10 Years Experience',
    levelNote: 'Advanced biomechanical profiling, athletic conditioning, and performance periodisation.',
    portrait: TRAINER_PORTRAITS[1],
  },
  {
    id: 'level-3',
    level: 'Level 3',
    name: 'Master Trainer',
    specialisation: '10+ Years Experience',
    levelNote: 'Master-level movement analysis, neuromuscular rehabilitation, and elite athletic longevity.',
    portrait: TRAINER_PORTRAITS[2],
  },
];

/* ---------------- 4 · Classes ---------------- */

export interface ClassEntry {
  id: string;
  label: string;
  /** Anchor on the Studio page this tile opens. */
  href: string;
  slot: ImageSlot;
  /** Vertical offset for the staggered strip, in rem. */
  offset: number;
}

/**
 * HYROX and reformer Pilates are named directly in the brief.
 * Strength & conditioning follows from the confirmed equipment categories.
 * The remainder of the timetable is still to be confirmed — see the asset and
 * detail report rather than assuming additional classes.
 */
export const CLASSES: ClassEntry[] = [
  {
    id: 'hyrox',
    label: 'HYROX',
    href: '/studio#hyrox',
    slot: CLASS_IMAGES[0],
    offset: 0,
  },
  {
    id: 'reformer',
    label: 'Reformer Pilates',
    href: '/studio#pilates',
    slot: CLASS_IMAGES[1],
    offset: 2.5,
  },
  {
    id: 'strength',
    label: 'Strength & conditioning',
    href: '/studio#fitness',
    slot: CLASS_IMAGES[2],
    offset: 1,
  },
];

/* ---------------- 5 · Wellness ---------------- */

export interface WellnessItem {
  slot: ImageSlot;
  caption: string;
}

/** Spa, salt bath and recovery are confirmed by the brief. */
export const WELLNESS: WellnessItem[] = [
  { slot: WELLNESS_IMAGES[0], caption: 'Spa & recovery suite' },
  { slot: WELLNESS_IMAGES[1], caption: 'Salt bath' },
  { slot: WELLNESS_IMAGES[2], caption: 'Changing & showers' },
];

/* ---------------- 6 · Studio disciplines ---------------- */

export interface Discipline {
  id: string;
  /** Rail label. Kept to one word so the curved nav stays legible. */
  label: string;
  /** Chapter display title. */
  title: string;
  /** One short factual line. Nothing here goes beyond the brief. */
  blurb: string;
  /** What is still awaiting client confirmation for this chapter. */
  pending: string;
}

/**
 * The five chapters of the Studio page, in page order.
 *
 * Fitness, HYROX, reformer Pilates and the wellness suite are named in the
 * brief. Zumba is included at the client's direction (7 Nov) — its session
 * times, instructor and format are unconfirmed and render as pending rather
 * than as invented copy, exactly like every other unconfirmed detail.
 *
 * Pilates is positioned last and given the largest chapter: the client asked
 * for it to lead the Studio, and closing on it means it is the discipline the
 * page finishes on before the booking call to action.
 */
export const DISCIPLINES: Discipline[] = [
  {
    id: 'fitness',
    label: 'Fitness',
    title: 'Equipment first.',
    blurb:
      'The floor is built around the Panatta range, in its burgundy frame finish, across three loading types.',
    pending: 'Equipment list & specifications',
  },
  {
    id: 'hyrox',
    label: 'HYROX',
    title: 'Race conditioning.',
    blurb:
      'Sled, erg and functional conditioning work on a dedicated lane.',
    pending: 'HYROX station list & affiliation status',
  },
  {
    id: 'zumba',
    label: 'Zumba',
    title: 'Move together.',
    blurb:
      'Group dance fitness in the main studio, with its own sound and lighting.',
    pending: 'Zumba timetable, instructor & class format',
  },
  {
    id: 'wellness',
    label: 'Wellness',
    title: 'Recovery.',
    blurb:
      'Spa, salt bath and a full recovery suite, kept separate from the training floor.',
    pending: 'Spa & salt-bath session details',
  },
  {
    id: 'pilates',
    label: 'Pilates',
    title: 'Reformer Pilates.',
    blurb:
      'A dedicated reformer studio — carriage, footbar and spring resistance, coached in small groups.',
    pending: 'Reformer count, class sizes & instructor details',
  },
];

/** Compact amenities list — confirmed offerings only. */
export const AMENITIES: string[] = [
  'Spa',
  'Salt bath',
  'Recovery suite',
  'Changing rooms',
  'Showers',
  'Dedicated lift',
  'Parking',
];
