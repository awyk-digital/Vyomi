'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import gsap from 'gsap';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Circular wipe between routes.
 *
 * A control dispatches `vyomi:ripple` with the href and the screen point the
 * click happened at. A disc grows from exactly that point until it covers the
 * viewport, the route is pushed underneath it, and once the new page has
 * mounted the disc fades away — so the Studio link reads as the door opening
 * at the spot you pressed, rather than a page swap.
 *
 * Sequencing: the push is issued partway through the expansion, not after it.
 * Next.js needs that head start to fetch and render the route, and the cover
 * is already opaque enough by then to hide the swap. Waiting for the full
 * expansion first would add its whole duration to the navigation.
 *
 * Safety: a timeout always clears the cover even if the route never resolves,
 * so a failed navigation can never leave the page behind an opaque layer.
 * Reduced-motion visitors navigate immediately with no cover at all.
 */

export const RIPPLE_EVENT = 'vyomi:ripple';

export interface RippleDetail {
  href: string;
  x: number;
  y: number;
}

/** Fires the wipe. Falls back to a plain push when motion is reduced. */
export function rippleTo(detail: RippleDetail) {
  window.dispatchEvent(new CustomEvent(RIPPLE_EVENT, { detail }));
}

export default function RouteRipple() {
  const router = useRouter();
  const pathname = usePathname();
  const discRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const navigating = useRef(false);
  const failsafe = useRef(0);

  // Clear the cover once the new route has painted.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !navigating.current) return;

    navigating.current = false;
    window.clearTimeout(failsafe.current);

    gsap.to(wrap, {
      autoAlpha: 0,
      duration: 0.55,
      ease: 'power2.out',
      onComplete: () => {
        wrap.style.visibility = 'hidden';
      },
    });
  }, [pathname]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const disc = discRef.current;
    if (!wrap || !disc) return;

    const onRipple = (e: Event) => {
      const { href, x, y } = (e as CustomEvent<RippleDetail>).detail;

      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }

      // Radius that reaches the furthest corner from the press point.
      const w = window.innerWidth;
      const h = window.innerHeight;
      const radius = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));

      navigating.current = true;

      gsap.set(wrap, { autoAlpha: 1, visibility: 'visible' });
      gsap.set(disc, {
        left: x,
        top: y,
        width: radius * 2,
        height: radius * 2,
        xPercent: -50,
        yPercent: -50,
        scale: 0,
      });

      gsap.to(disc, {
        scale: 1,
        duration: 0.82,
        ease: 'power3.inOut',
      });

      // Hand off to the router while the disc is still opening.
      window.setTimeout(() => router.push(href), 240);

      // Never strand the visitor behind the cover.
      window.clearTimeout(failsafe.current);
      failsafe.current = window.setTimeout(() => {
        if (!navigating.current) return;
        navigating.current = false;
        gsap.to(wrap, { autoAlpha: 0, duration: 0.4 });
      }, 4000);
    };

    window.addEventListener(RIPPLE_EVENT, onRipple as EventListener);
    return () => {
      window.removeEventListener(RIPPLE_EVENT, onRipple as EventListener);
      window.clearTimeout(failsafe.current);
    };
  }, [router]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] invisible opacity-0"
    >
      <span
        ref={discRef}
        className="absolute block rounded-full will-change-transform"
        style={{
          background:
            'radial-gradient(circle at center, #0B0B0B 0%, #080808 58%, #050505 100%)',
          boxShadow: '0 0 120px 40px rgba(176,141,87,0.10)',
        }}
      />
    </div>
  );
}
