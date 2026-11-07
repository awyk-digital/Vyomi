'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LENIS_LERP } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProps {
  children: ReactNode;
}

/**
 * SmoothScroll
 * Integrates Lenis smooth scrolling with GSAP ScrollTrigger ticker.
 * Uses LENIS_LERP (0.085) for an unhurried, heavy luxury feel.
 * Disables smooth lerp if prefers-reduced-motion is active.
 */
export default function SmoothScroll({ children }: SmoothScrollProps) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Instantiate Lenis
    const lenis = new Lenis({
      lerp: prefersReducedMotion ? 1 : LENIS_LERP,
      smoothWheel: !prefersReducedMotion,
      syncTouch: false,
    });

    // Synchronize ScrollTrigger with Lenis scroll events
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis through GSAP ticker for frame-perfect sync
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    // Initial refresh
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

