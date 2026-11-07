'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import AssetSlot from '@/components/AssetSlot';
import AccentRule from '@/components/AccentRule';
import Iridescent from '@/components/Iridescent';
import SectionHeading from '@/components/SectionHeading';
import { AREAS } from '@/data/club';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Horizontal architectural gallery, running continuously in loop mode,
 * with an interactive small navigation bar (right arrow type) for exploration.
 */

/** Coordinated card geometry — desktop width × height, inside the brief's range. */
const GEOMETRY = [
  { w: 440, h: 300 },
  { w: 360, h: 340 },
  { w: 420, h: 280 },
  { w: 330, h: 360 },
  { w: 350, h: 330 },
  { w: 400, h: 265 },
] as const;

/** Constant travel speed in CSS pixels per second. */
const SPEED = 26;
/** Step distance when clicking navigation arrows (~average card width + margin). */
const STEP_DISTANCE = 410;

export default function ExploreGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  const offsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const lapRef = useRef(0);
  const isPausedRef = useRef(false);
  isPausedRef.current = paused;

  // Measure track and run continuous RAF loop with wrap-around
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      // scrollWidth covers both copies; one lap is half of it.
      lapRef.current = track.scrollWidth / 2;
    };

    measure();

    let lastTime = performance.now();
    let rId: number;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const lap = lapRef.current;
      if (lap > 0) {
        // Continuous auto-glide when not paused and not prefersReducedMotion
        if (!isPausedRef.current && !prefersReducedMotion()) {
          targetOffsetRef.current += SPEED * dt;
        }

        // Smoothly interpolate towards targetOffset
        const diff = targetOffsetRef.current - offsetRef.current;
        offsetRef.current += diff * Math.min(dt * 7, 0.3);

        // Seamless infinite loop wrap-around
        while (offsetRef.current >= lap) {
          offsetRef.current -= lap;
          targetOffsetRef.current -= lap;
        }
        while (offsetRef.current < 0) {
          offsetRef.current += lap;
          targetOffsetRef.current += lap;
        }

        track.style.transform = `translate3d(-${offsetRef.current.toFixed(2)}px, 0, 0)`;
      }

      rId = requestAnimationFrame(tick);
    };

    rId = requestAnimationFrame(tick);

    const ro = new ResizeObserver(measure);
    ro.observe(track);

    return () => {
      cancelAnimationFrame(rId);
      ro.disconnect();
    };
  }, []);

  const handleNext = useCallback(() => {
    targetOffsetRef.current += STEP_DISTANCE;
  }, []);

  const handlePrev = useCallback(() => {
    targetOffsetRef.current -= STEP_DISTANCE;
  }, []);

  const renderCards = (copy: number) =>
    AREAS.map((area, i) => {
      const g = GEOMETRY[i % GEOMETRY.length];
      return (
        <figure
          key={`${copy}-${area.slot.id}`}
          className="mr-6 shrink-0"
          style={{
            width: `min(82vw, ${g.w}px)`,
            marginTop: `${area.offset}rem`,
          }}
        >
          <div
            className="overflow-hidden"
            style={{ height: `clamp(220px, 46vw, ${g.h}px)` }}
          >
            <AssetSlot
              slot={area.slot}
              ratio="auto"
              className="h-full w-full"
              sizes="(max-width: 767px) 82vw, 460px"
              hideConceptualLabel={Boolean(area.slot.src)}
            />
          </div>

          <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="t-label nums text-faint">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="t-small text-heading">{area.caption}</span>
            {area.slot.conceptual && area.slot.src && (
              <span className="t-label text-[0.5625rem] text-faint">
                Representative
              </span>
            )}
          </figcaption>
        </figure>
      );
    });

  return (
    <section
      id="explore"
      className="border-t border-hairline bg-ink py-section-y"
      aria-labelledby="explore-heading"
    >
      {/* Header with Navigation Bar */}
      <div className="mb-10 px-pad-x md:mb-14 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <SectionHeading
            id="explore-heading"
            className="t-h2 uppercase text-heading"
            stagger={0.08}
          >
            Explore Vyomi.
          </SectionHeading>
          <div className="mt-6 max-w-shell">
            <AccentRule />
          </div>
        </div>

        {/* Small Navigation Bar — Right Arrow Type (Loop Mode) */}
        <div className="flex items-center gap-2 self-start sm:self-end">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous image"
            className="group flex h-9 w-9 items-center justify-center rounded-full border border-hairline bg-surface/70 backdrop-blur-md text-muted transition-all duration-300 hover:border-hairline-2 hover:bg-surface hover:text-heading active:scale-95"
          >
            <span className="text-sm transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next image"
            className="group flex h-9 items-center gap-2.5 rounded-full border border-hairline bg-surface/70 px-4 backdrop-blur-md text-muted transition-all duration-300 hover:border-hairline-2 hover:bg-surface hover:text-heading active:scale-95"
          >
            <span className="t-label text-[0.625rem] text-faint group-hover:text-muted transition-colors">
              Explore
            </span>
            <span className="text-sm text-heading transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>

      {/* Running strip in loop mode */}
      <div
        className="relative overflow-hidden"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="marquee-track flex w-max will-change-transform"
          style={{ animation: 'none' }}
          data-paused={paused ? 'true' : 'false'}
        >
          <div className="flex">{renderCards(0)}</div>
          <div className="flex" aria-hidden="true">
            {renderCards(1)}
          </div>
        </div>

        {/* Edge fades so cards dissolve into the page rather than being cut */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-[clamp(2rem,8vw,7rem)]"
          style={{
            background: 'linear-gradient(to right, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-[clamp(2rem,8vw,7rem)]"
          style={{
            background: 'linear-gradient(to left, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
      </div>

      <div className="mt-8 px-pad-x flex items-center justify-between">
        <Iridescent className="t-small text-faint">
          Hover to pause · Click right arrow to explore in loop
        </Iridescent>
      </div>
    </section>
  );
}
