/**
 * V CLUB Motion System
 * 
 * Strict motion constants for luxury pacing.
 * Slow and heavy reads as expensive; fast and snappy reads as cheap.
 * Never use durations under 0.5s. Never use linear or bounce easing.
 */

export const DURATION_REVEAL = 1.1;
export const DURATION_FAST = 0.6;
export const EASE = 'power3.out';
export const EASE_EXPO = 'expo.out';
export const STAGGER = 0.08;
export const LENIS_LERP = 0.085;
export const TRIGGER_START = 'top 78%';

/**
 * Utility to check if user prefers reduced motion or device is below 768px breakpoint.
 * Heavy motion is disabled below 768px with a still fallback.
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth < 768;
  return prefersReduced || isMobile;
};

