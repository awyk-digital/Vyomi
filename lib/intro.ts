'use client';

import { useEffect, useState } from 'react';
import { INTRO, prefersReducedMotion } from '@/lib/motion';

/**
 * Coordinates the opening logo sequence.
 *
 * Scope is the *document*, not the browser session: every full page load —
 * including a hard refresh — plays the sequence, while client-side navigation
 * between the homepage and the Studio page does not. `sessionStorage` is
 * deliberately not used here; it survives a reload, which silently suppressed
 * the intro for the rest of the tab's life.
 *
 * Reduced-motion visitors skip it entirely and land on the settled layout.
 */

const EVENT = 'vyomi:intro-done';
const EVENT_UNVEIL = 'vyomi:intro-unveil';

/**
 * Module scope is re-created on every document load and shared across
 * client-side route changes — exactly the lifetime the sequence needs.
 */
let doneInThisDocument = false;
let unveiledInThisDocument = false;

/** True when the intro should animate now. */
export function shouldRunIntro(): boolean {
  if (typeof window === 'undefined') return false;
  if (doneInThisDocument) return false;
  if (prefersReducedMotion()) return false;
  return true;
}

/** Marks the intro background unveiling and notifies listeners. */
export function markIntroUnveil(): void {
  unveiledInThisDocument = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_UNVEIL));
  }
}

/** Marks the intro finished and notifies listeners. */
export function markIntroDone(): void {
  unveiledInThisDocument = true;
  doneInThisDocument = true;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_UNVEIL));
    window.dispatchEvent(new Event(EVENT));
  }
}

/** True once the background can be unveiled. */
export function isIntroUnveiled(): boolean {
  if (typeof window === 'undefined') return false;
  return unveiledInThisDocument || doneInThisDocument || !shouldRunIntro();
}

/** True once the intro has finished, or immediately when it will not run. */
export function isIntroDone(): boolean {
  if (typeof window === 'undefined') return false;
  return doneInThisDocument || !shouldRunIntro();
}

/**
 * Subscribes to the moment the opening veil lifts (when the logo begins its flight).
 */
export function useIntroUnveil(): boolean {
  const [unveiled, setUnveiled] = useState(false);

  useEffect(() => {
    if (isIntroUnveiled()) {
      setUnveiled(true);
      return;
    }
    const onUnveil = () => setUnveiled(true);
    window.addEventListener(EVENT_UNVEIL, onUnveil);
    window.addEventListener(EVENT, onUnveil);

    const failsafe = window.setTimeout(() => setUnveiled(true), INTRO.totalMs);

    return () => {
      window.removeEventListener(EVENT_UNVEIL, onUnveil);
      window.removeEventListener(EVENT, onUnveil);
      window.clearTimeout(failsafe);
    };
  }, []);

  return unveiled;
}

/**
 * Subscribes to intro completion.
 *
 * Returns false only while the sequence is actually running, so hero content
 * is revealed immediately for reduced-motion visitors and on later navigations.
 */
export function useIntroDone(): boolean {
  // Server render and first client paint agree on `false`, avoiding a hydration
  // mismatch; the effect below settles the real value straight away.
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (isIntroDone()) {
      setDone(true);
      return;
    }
    const onDone = () => setDone(true);
    window.addEventListener(EVENT, onDone);

    // Safety net: never leave hero content hidden if the timeline is
    // interrupted (tab backgrounded mid-sequence, GSAP failing to load, …).
    const failsafe = window.setTimeout(() => setDone(true), INTRO.totalMs + 800);

    return () => {
      window.removeEventListener(EVENT, onDone);
      window.clearTimeout(failsafe);
    };
  }, []);

  return done;
}
