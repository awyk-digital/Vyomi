'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { SUPPLIED } from '@/config/assets';
import { INTRO } from '@/lib/motion';
import { shouldRunIntro, markIntroDone } from '@/lib/intro';

/**
 * The persistent Vyomi mark, fixed top-left, and the opening sequence.
 *
 * Opening: the mark reveals centred and large over the dark page, a warm
 * bloom swells behind it, two highlight passes travel across the artwork,
 * then the same element flies into its corner position as the hero resolves.
 * Runs on every full page load (see lib/intro.ts) and lands inside ~2.1s.
 *
 * The element lives at its FINAL position in the DOM; the intro animates a
 * transform delta away from that and back. Nothing animates layout
 * properties, so there is no reflow and the corner position is correct even
 * if the timeline never runs.
 *
 * Legibility over bright video frames comes from a drop-shadow on the artwork
 * itself — NOT from a dark plate behind it. A plate reads as a grey smudge on
 * a dark page, which is exactly the thing this mark must not look like.
 */
export default function BrandLogo() {
  const isLightPage = usePathname() === '/catalogue';
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLSpanElement>(null);
  const sheen2Ref = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLSpanElement>(null);
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
    const sheen = sheenRef.current;
    const sheen2 = sheen2Ref.current;
    const glow = glowRef.current;
    if (!wrap || !sheen || !sheen2 || !glow) return;

    if (!shouldRunIntro()) {
      gsap.set(wrap, { opacity: 1 });
      gsap.set(glow, { opacity: 0 });
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

    // 2 — warm bloom swells behind the mark and settles back out
    tl.fromTo(
      glow,
      { opacity: 0, scale: 0.6 },
      {
        opacity: 1,
        scale: 1.15,
        duration: INTRO.glowDur,
        ease: 'power2.inOut',
      },
      INTRO.glowStart
    );

    // 3 — first, slow highlight across the logo artwork
    tl.fromTo(
      sheen,
      { xPercent: -170 },
      { xPercent: 270, duration: INTRO.sheenDur, ease: 'power1.inOut' },
      INTRO.sheenStart
    );

    // 4 — second, faster pass: polished metal rather than a loading bar
    tl.fromTo(
      sheen2,
      { xPercent: -170 },
      { xPercent: 270, duration: INTRO.sheen2Dur, ease: 'power2.inOut' },
      INTRO.sheen2Start
    );

    // 5 — travel and scale into the corner (transform only)
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

    // 6 — bloom retires as the mark lands
    tl.to(
      glow,
      { opacity: 0, duration: 0.5, ease: 'power2.out' },
      INTRO.flipStart + 0.1
    );

    return () => {
      introRunning.current = false;
      tl.kill();
    };
  }, []);

  const maskStyle = {
    WebkitMaskImage: `url(${SUPPLIED.logo.src})`,
    maskImage: `url(${SUPPLIED.logo.src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  } as const;

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
      {/* Opening bloom — intro only, never visible at rest */}
      <span
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute opacity-0 will-change-transform"
        style={{
          inset: '-120% -130%',
          background:
            'radial-gradient(ellipse at center, rgba(176,141,87,0.30) 0%, rgba(176,141,87,0.13) 32%, rgba(214,245,91,0.05) 54%, transparent 74%)',
        }}
      />

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
            sizes="(max-width: 768px) 28vw, 360px"
            className="object-contain"
            /*
             * Carries the mark over bright video frames without putting a
             * visible dark shape on the page. Two stacked shadows: a tight
             * one for edge definition, a wide soft one for separation.
             */
            style={{
              filter: isLightPage
                ? 'drop-shadow(0 2px 6px rgba(24,20,16,0.16))'
                : 'drop-shadow(0 1px 2px rgba(0,0,0,0.55)) drop-shadow(0 4px 18px rgba(0,0,0,0.45))',
            }}
          />

          {/* Highlights, clipped to the logo artwork via its own alpha */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={maskStyle}
          >
            <span
              ref={sheenRef}
              className="absolute inset-y-0 block w-1/3 will-change-transform"
              style={{
                background:
                  'linear-gradient(104deg, transparent 0%, rgba(255,255,255,0.08) 32%, rgba(255,255,255,0.82) 50%, rgba(255,255,255,0.08) 68%, transparent 100%)',
              }}
            />
            <span
              ref={sheen2Ref}
              className="absolute inset-y-0 block w-1/4 will-change-transform"
              style={{
                background:
                  'linear-gradient(104deg, transparent 0%, rgba(255,240,205,0.52) 50%, transparent 100%)',
              }}
            />
          </span>
        </span>
      </Link>
    </div>
  );
}
