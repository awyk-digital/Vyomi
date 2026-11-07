'use client';

import { useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LENIS_LERP, prefersReducedMotion, isLowPowerDevice } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scrolling via Lenis, wired into ScrollTrigger.
 *
 * Deliberately conservative:
 *  - skipped entirely for reduced-motion and low-power devices, which then get
 *    plain native scrolling with every reveal still firing;
 *  - keyboard, wheel and touch all keep their normal behaviour — no hijacking,
 *    no scroll-jacked section snapping;
 *  - the raf loop stops while the tab is hidden.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (prefersReducedMotion() || isLowPowerDevice()) {
      ScrollTrigger.refresh();
      return;
    }

    let lenis: import('lenis').default | null = null;
    let rafId = 0;
    let cancelled = false;
    let cleanupVisibility: (() => void) | null = null;

    // Dynamic import keeps Lenis out of the bundle for devices that skip it.
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;

      lenis = new Lenis({
        lerp: LENIS_LERP,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        // Native touch scrolling stays untouched; Lenis only smooths wheel.
        smoothWheel: true,
        autoRaf: false,
      });

      lenis.on('scroll', ScrollTrigger.update);

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      const onVisibility = () => {
        if (document.hidden) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        } else if (!rafId) {
          rafId = requestAnimationFrame(raf);
        }
      };
      document.addEventListener('visibilitychange', onVisibility);

      /**
       * Same-page anchors.
       *
       * A native hash jump sets window.scrollY directly, which Lenis then
       * fights on its next frame. Routing in-page links through lenis.scrollTo
       * keeps the chapter nav, footer links and skip-link landing exactly where
       * they should. Modified clicks and cross-page links are left alone.
       */
      const onClick = (e: MouseEvent) => {
        if (e.defaultPrevented || e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        const anchor = (e.target as HTMLElement)?.closest?.('a[href]');
        if (!(anchor instanceof HTMLAnchorElement)) return;
        if (anchor.target && anchor.target !== '_self') return;

        const url = new URL(anchor.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname !== window.location.pathname) return;
        if (!url.hash || url.hash === '#') return;

        const target = document.querySelector(url.hash);
        if (!target) return;

        e.preventDefault();
        lenis?.scrollTo(target as HTMLElement, { offset: -24 });
        history.pushState(null, '', url.hash);
        // Keep keyboard focus with the visual position.
        (target as HTMLElement).setAttribute('tabindex', '-1');
        (target as HTMLElement).focus({ preventScroll: true });
      };
      document.addEventListener('click', onClick);

      // Land correctly when the page is opened on a deep link.
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
          requestAnimationFrame(() => {
            lenis?.scrollTo(target as HTMLElement, { offset: -24, immediate: true });
            ScrollTrigger.refresh();
          });
        }
      }

      ScrollTrigger.refresh();

      cleanupVisibility = () => {
        document.removeEventListener('visibilitychange', onVisibility);
        document.removeEventListener('click', onClick);
      };
    });

    return () => {
      cancelled = true;
      cleanupVisibility?.();
      if (rafId) cancelAnimationFrame(rafId);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
