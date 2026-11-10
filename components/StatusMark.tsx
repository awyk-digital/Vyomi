'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { site, presaleDisplay } from '@/config/site';
import { useIntroDone } from '@/lib/intro';

/**
 * Small fixed marker in the top-right corner, opposite the brand mark.
 *
 * It balances the logo across the top of the viewport and carries two live
 * facts: the club's local time, and the pre-sale date. A moving clock is the
 * cheapest honest way to make a pre-launch page feel attended rather than
 * parked — nothing here is decorative filler.
 *
 * Hidden on small screens, where the corner belongs to the logo alone.
 *
 * Hydration: the clock renders empty on the server and on first paint, then
 * fills in from an effect. Rendering a server-side time would guarantee a
 * mismatch, since the server's clock and the visitor's differ.
 */

/** Club local time, independent of where the visitor is. */
function istNow(): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
}

export default function StatusMark() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState<string | null>(null);
  const introDone = useIntroDone();
  const presale = presaleDisplay();
  const isLightPage = usePathname() === '/catalogue';

  useEffect(() => {
    setTime(istNow());
    // Aligning to the next minute boundary avoids a visible lag between the
    // displayed minute and the real one.
    let interval: number | undefined;
    const align = window.setTimeout(() => {
      setTime(istNow());
      interval = window.setInterval(() => setTime(istNow()), 60_000);
    }, (60 - new Date().getSeconds()) * 1000);

    return () => {
      window.clearTimeout(align);
      if (interval) window.clearInterval(interval);
    };
  }, []);

  // Retires on downward scroll and returns on the way back up, matching
  // the brand mark on the opposite corner.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let lastY = window.scrollY;
    let hidden = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      lastY = y;

      const atTop = y < 120;
      if (!atTop && goingDown && !hidden) {
        hidden = true;
        gsap.to(wrap, { autoAlpha: 0, y: -10, duration: 0.35, ease: 'power2.out', overwrite: true });
      } else if ((atTop || goingUp) && hidden) {
        hidden = false;
        gsap.to(wrap, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out', overwrite: true });
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed z-50 hidden text-right transition-opacity duration-[800ms] ease-editorial md:block"
      style={{
        top: 'clamp(0.875rem, 2.2vw, 1.75rem)',
        right: 'var(--pad-x)',
        opacity: introDone ? 1 : 0,
      }}
    >
      <p className={`t-label flex items-center justify-end gap-2 ${isLightPage ? 'text-[#6D665C]' : 'text-faint'}`}>
        <span>{site.city}</span>
        <span className="accent-tick" aria-hidden="true" />
        <span
          className={`nums tabular-nums ${isLightPage ? 'text-[#181614]' : 'text-muted'}`}
          /* Keeps the row from reflowing as digits change width */
          style={{ minWidth: '3.2ch', display: 'inline-block', textAlign: 'left' }}
        >
          {time ?? ' '}
        </span>
      </p>

      {presale && (
        <p className={`t-label mt-2 flex items-center justify-end gap-2 ${isLightPage ? 'text-[#6D665C]' : 'text-faint'}`}>
          <span className="accent-pulse" aria-hidden="true" />
          <span>Pre-sale {presale.replace(/ \d{4}$/, '')}</span>
        </p>
      )}
    </div>
  );
}
