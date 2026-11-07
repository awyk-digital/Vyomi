'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isLowPowerDevice, prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

/**
 * How far the footage drifts inside its frame, as a percentage of frame
 * height, and the scale needed to keep the edges covered while it does.
 */
const DRIFT = 6;
const COVER = 1.15;

interface ChapterVideoProps {
  /** Path under /public. */
  src: string;
  /** Poster frame, shown before playback and whenever motion is suppressed. */
  poster: string;
  /**
   * CSS aspect-ratio string. Reserves layout space so nothing shifts on
   * load. Omit it to drive the ratio from `className` instead, which is how
   * a plate gets a different crop on phones than on desktop.
   */
  ratio?: string;
  /** Describes the footage for assistive technology. */
  label: string;
  /** Provenance note rendered along the lower edge. */
  caption?: string;
  /**
   * Dissolves the top and bottom edges into --ink, the way the hero does,
   * so a full-bleed clip lands on the page colour instead of stopping at a
   * hard rectangle. Leave it off for a clip sitting inside a column, where
   * the edge is meant to read as an edge.
   */
  bleed?: boolean;
  /** Responsive sizes hint for the poster. */
  sizes?: string;
  /**
   * Padding for the provenance note. A full-bleed plate needs it pushed in
   * to the page gutter so the note lands on the same left margin as the
   * body copy instead of against the viewport edge.
   */
  captionClassName?: string;
  className?: string;
}

/**
 * A looping, silent clip used as a chapter plate.
 *
 * Behaviour, beyond what a bare <video autoplay loop muted> gives:
 *
 *  1. It only plays while on screen, and stops in a background tab, so a
 *     page carrying several clips never decodes all of them at once.
 *  2. It honours `prefers-reduced-motion`, re-reading the preference live,
 *     and offers an explicit control rather than ambushing anyone.
 *  3. It downloads nothing until needed — `preload="none"`, with the poster
 *     carrying the composition until playback actually begins.
 *
 * Presentation:
 *
 *  - The poster is a real layer underneath the video rather than the
 *    `poster` attribute, so the first frame cross-fades in over ~0.9s
 *    instead of popping. If autoplay is refused, the poster simply stays.
 *  - A hairline along the bottom edge tracks the loop in the bronze-to-lime
 *    brand gradient. It is the only moving chrome, and it earns its place by
 *    being informational: it shows how long the loop runs.
 *
 * The clips are silent by construction — the audio tracks were stripped at
 * encode time rather than muted at runtime, so there is no sound to leak if
 * a browser ignores the `muted` attribute.
 */
export default function ChapterVideo({
  src,
  poster,
  ratio,
  label,
  caption,
  bleed = false,
  sizes = '100vw',
  captionClassName = 'px-3 pb-2.5',
  className = '',
}: ChapterVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [override, setOverride] = useState(false);
  const [showing, setShowing] = useState(false);

  // Track the motion preference live; some readers toggle it mid-session.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const suppressed = reduced && !override;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // React can drop the muted attribute during hydration; autoplay policies
    // key off the property, so set it directly.
    el.muted = true;

    const onPlaying = () => setShowing(true);
    el.addEventListener('playing', onPlaying);

    // ~4Hz, which is all a loop indicator needs. Written straight to the
    // node: a progress hairline has no business re-rendering React each tick.
    const onTime = () => {
      const bar = barRef.current;
      if (!bar || !el.duration) return;
      bar.style.transform = `scaleX(${el.currentTime / el.duration})`;
    };
    el.addEventListener('timeupdate', onTime);

    const detach = () => {
      el.removeEventListener('playing', onPlaying);
      el.removeEventListener('timeupdate', onTime);
    };

    if (suppressed) {
      el.pause();
      return detach;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // A refused autoplay is not an error worth surfacing: the poster
          // stays up and the clip simply does not move.
          void el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    const onVisibility = () => {
      if (document.hidden) el.pause();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      detach();
    };
  }, [suppressed]);

  /**
   * Slow drift of the footage inside its own frame as the section travels
   * the viewport — the plate reads as a window onto something continuous
   * rather than a rectangle pinned to the page. Scrubbed, so it is tied to
   * scroll position rather than playing on its own.
   *
   * Dropped entirely for reduced-motion and low-power visitors, the same
   * gate the film grain uses.
   */
  useEffect(() => {
    const fig = figureRef.current;
    const media = mediaRef.current;
    if (!fig || !media) return;
    if (prefersReducedMotion() || isLowPowerDevice()) return;

    const ctx = gsap.context(() => {
      gsap.set(media, { scale: COVER });
      gsap.fromTo(
        media,
        { yPercent: -DRIFT },
        {
          yPercent: DRIFT,
          ease: 'none',
          scrollTrigger: {
            trigger: fig,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    }, fig);

    return () => ctx.revert();
  }, []);

  const start = useCallback(() => {
    setOverride(true);
    void ref.current?.play().catch(() => {});
  }, []);

  return (
    <figure
      ref={figureRef}
      className={`relative overflow-hidden bg-charcoal ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      {/* Only the footage drifts. Everything below this — vignette, join
          bands, caption, loop hairline — stays registered to the frame. */}
      <div ref={mediaRef} className="absolute inset-0 will-change-transform">
        {/* Poster layer. The video cross-fades in over this. */}
        <Image
          src={poster}
          alt=""
          aria-hidden="true"
          fill
          sizes={sizes}
          className="object-cover"
        />

        <video
          ref={ref}
          src={src}
          loop
          muted
          playsInline
          preload="none"
          aria-label={label}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[900ms] ease-editorial"
          style={{ opacity: showing ? 1 : 0 }}
        />
      </div>

      {/* Edge vignette — matches the still plates in AssetSlot. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 58%, rgba(8,8,8,0.42) 100%)',
        }}
      />

      {/* Join bands, so a full-bleed clip lands on --ink rather than an edge. */}
      {bleed && (
        <>
          {/* Proportional, not fixed px: this plate is 2:1 and ~700px tall on
              a desktop but 16:9 and ~210px on a phone, where fixed bands
              would swallow most of the frame. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0"
            style={{
              height: '11%',
              background:
                'linear-gradient(to bottom, var(--ink) 0%, rgba(8,8,8,0) 100%)',
            }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0"
            style={{
              height: '17%',
              background:
                'linear-gradient(to top, var(--ink) 0%, rgba(8,8,8,0.55) 38%, rgba(8,8,8,0) 100%)',
            }}
          />
        </>
      )}

      {suppressed && (
        /* btn-line rather than hand-rolled utilities: `.t-label` is unlayered
           and would force its own colour onto the control. */
        <button
          type="button"
          onClick={start}
          className="btn-line shine absolute bottom-4 right-4 z-20 bg-ink/80 !py-2"
        >
          Play walkthrough
        </button>
      )}

      {caption && (
        <>
          {/* Scrim only where the type sits, not a bar across the frame. */}
          {!bleed && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
              style={{
                background:
                  'linear-gradient(to top, rgba(8,8,8,0.82) 0%, rgba(8,8,8,0) 100%)',
              }}
            />
          )}
          {/* `.t-label` is unlayered, so it governs size and colour here —
              Tailwind text-* utilities would be dead classes. This is the
              same faint meta treatment the still plates use. */}
          <figcaption
            className={`t-label pointer-events-none absolute bottom-0 left-0 z-10 flex items-center gap-2 ${captionClassName}`}
          >
            <span className="accent-tick" aria-hidden="true" />
            <span>{caption}</span>
          </figcaption>
        </>
      )}

      {/* Loop position, in the brand gradient. Transform-only. */}
      <span
        ref={barRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px origin-left"
        style={{
          transform: 'scaleX(0)',
          background:
            'linear-gradient(90deg, var(--bronze) 0%, var(--lime) 100%)',
          opacity: showing ? 0.85 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />
    </figure>
  );
}
