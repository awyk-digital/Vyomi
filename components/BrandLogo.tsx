'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { SUPPLIED } from '@/config/assets';
import { INTRO } from '@/lib/motion';
import { shouldRunIntro, markIntroDone } from '@/lib/intro';

/**
 * The persistent Vyomi mark, fixed top-left, and the opening sequence.
 * Pure logo presentation with zero artificial sheens, white highlights, or detailing overlays.
 */
export default function BrandLogo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const introRunning = useRef(false);

  /**
   * Keeping the mark clear of page content: it retires while the visitor
   * reads downward and returns the moment they scroll back up.
   */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let lastY = window.scrollY;
    let hidden = false;
    let frame = 0;

    const update = () => {
      frame = 0;
      if (introRunning.current) return;

      const y = window.scrollY;
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      lastY = y;

      const atTop = y < 120;
      const shouldHide = !atTop && goingDown;
      const shouldShow = atTop || goingUp;

      if (shouldHide && !hidden) {
        hidden = true;
        gsap.to(wrap, {
          autoAlpha: 0,
          y: -10,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: true,
        });
      } else if (shouldShow && hidden) {
        hidden = false;
        gsap.to(wrap, {
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: true,
        });
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

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (!shouldRunIntro()) {
      gsap.set(wrap, { opacity: 1 });
      markIntroDone();
      return;
    }

    introRunning.current = true;

    // Measure the settled position, then work out the transform that puts
    // the mark at the centre of the viewport at intro size.
    const rect = wrap.getBoundingClientRect();
    if (rect.width === 0) {
      gsap.set(wrap, { opacity: 1 });
      markIntroDone();
      return;
    }

    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;width:${INTRO.introWidth}`;
    document.body.appendChild(probe);
    const introWidth = probe.getBoundingClientRect().width || 260;
    probe.remove();

    const scale = introWidth / rect.width;
    const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
    const dy = window.innerHeight * 0.46 - (rect.top + rect.height / 2);

    const tl = gsap.timeline({
      onComplete: () => {
        introRunning.current = false;
        markIntroDone();
      },
    });

    // 1 — reveal, centred and large
    tl.fromTo(
      wrap,
      { opacity: 0, scale: scale * 0.92, x: dx, y: dy },
      {
        opacity: 1,
        scale,
        x: dx,
        y: dy,
        duration: INTRO.logoIn,
        ease: 'power2.out',
      },
      0
    );

    // 2 — travel and scale into the corner (transform only)
    tl.to(
      wrap,
      {
        x: 0,
        y: 0,
        scale: 1,
        duration: INTRO.flipDur,
        ease: 'power3.inOut',
      },
      INTRO.flipStart
    );

    return () => {
      introRunning.current = false;
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="fixed z-50 opacity-0 will-change-transform"
      style={{
        top: 'clamp(0.875rem, 2.2vw, 1.75rem)',
        left: 'var(--pad-x)',
        width: 'var(--logo-w)',
      }}
    >
      <Link
        href="/"
        aria-label="Vyomi Fitness Club — home"
        className="relative block"
      >
        <span
          className="relative block w-full"
          style={{ aspectRatio: `${SUPPLIED.logo.width} / ${SUPPLIED.logo.height}` }}
        >
          <Image
            src={SUPPLIED.logo.src}
            alt="Vyomi Fitness Club"
            fill
            priority
            unoptimized
            sizes="(max-width: 768px) 28vw, 360px"
            className="object-contain"
          />
        </span>
      </Link>
    </div>
  );
}
