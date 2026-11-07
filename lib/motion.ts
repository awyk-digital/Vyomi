/**
 * VYOMI motion constants.
 *
 * Restraint is the rule: transform and opacity only, no bounce, no spin,
 * no scroll hijacking. Every value here is deliberately short — the brief
 * asks for motion that feels fast and precise rather than ceremonial.
 */

/* Opening logo sequence.
   Plays on every full page load, so it has to stay short enough to never
   feel like a gate — the whole timeline lands inside ~2.1s and the hero
   video is already decoding underneath it the entire time. */
export const INTRO = {
  logoIn: 0.58,
  glowStart: 0.34,
  glowDur: 0.9,
  sheenStart: 0.44,
  sheenDur: 0.72,
  /** Second, faster highlight pass — reads as polished metal, not a loader. */
  sheen2Start: 0.86,
  sheen2Dur: 0.5,
  flipStart: 1.16,
  flipDur: 0.86,
  contentStart: 1.52,
  contentDur: 0.62,
  /** Intro logo width before it settles into the corner. */
  introWidth: 'clamp(200px, 28vw, 360px)',
  /** Hard ceiling used by the failsafe in lib/intro.ts. */
  totalMs: 2300,
} as const;

/* Scroll reveals */
export const REVEAL_DUR = 0.8;
export const REVEAL_Y = 24;
export const STAGGER = 0.06;
export const EASE_OUT = 'power3.out';
export const EASE_IN_OUT = 'power3.inOut';
export const TRIGGER_START = 'top 82%';

/* Lenis */
export const LENIS_LERP = 0.1;

/** True when the visitor has asked for reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * True on devices where heavier scroll-linked work should be dropped:
 * reduced-motion preference, very low core count, or a coarse low-end pointer.
 * Essential content never depends on this returning false.
 */
export function isLowPowerDevice(): boolean {
  if (typeof window === 'undefined') return false;
  if (prefersReducedMotion()) return true;
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (cores <= 4) return true;
  if (typeof mem === 'number' && mem <= 4) return true;
  return false;
}
