'use client';

import Link from 'next/link';
import type { MouseEvent } from 'react';
import { rippleTo } from '@/components/RouteRipple';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * The single Studio control: a small curved liquid-glass capsule.
 *
 * 132 × 46px, within the 120–150 × 44–48 range from the brief. It is one
 * control, not a dock — no tabs, no menu, no oversized frosted panel.
 *
 * Refraction is done with `backdrop-filter`, which genuinely samples and
 * blurs the hero video behind it. A WebGL pass was considered and rejected:
 * at this size it would cost a canvas and a render loop for no visible gain.
 *
 * Clicking runs the circular wipe in RouteRipple, opening from the exact
 * point pressed. It stays a real `<a href>`: middle-click, ctrl/cmd-click and
 * "open in new tab" all behave normally, and it still navigates with JS off
 * or motion reduced — the wipe is layered on top of a working link, never in
 * place of one.
 */
export default function StudioCapsule({
  className = '',
  label = 'Studio',
}: {
  className?: string;
  label?: string;
}) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    // Leave every modified click to the browser.
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) {
      return;
    }
    if (prefersReducedMotion()) return;

    e.preventDefault();
    rippleTo({ href: '/studio', x: e.clientX, y: e.clientY });
  };

  return (
    <Link
      href="/studio"
      onClick={onClick}
      className={`glass-capsule shine group inline-flex h-[46px] w-[132px] items-center justify-center gap-1.5 rounded-full hover:-translate-y-0.5 ${className}`}
    >
      <span className="t-ui relative text-heading">{label}</span>
      <span
        aria-hidden="true"
        className="relative text-heading transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        ↗
      </span>
    </Link>
  );
}
