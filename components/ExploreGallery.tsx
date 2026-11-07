'use client';

import { useEffect, useRef, useState } from 'react';
import AssetSlot from '@/components/AssetSlot';
import AccentRule from '@/components/AccentRule';
import Iridescent from '@/components/Iridescent';
import SectionHeading from '@/components/SectionHeading';
import { AREAS } from '@/data/club';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Horizontal architectural gallery, running continuously.
 *
 * The strip advances on its own at a constant slow speed rather than waiting
 * to be dragged — a static row of cropped cards reads as broken on a landing
 * page, where nothing has told the visitor it is scrollable.
 *
 * How it loops: the card set is rendered twice and the track is translated by
 * exactly -50%, so the moment the first copy has fully passed, the second
 * copy is sitting in precisely the position the first started from and the
 * animation restarts invisibly. The duplicate is `aria-hidden`, so assistive
 * tech and crawlers see each area once.
 *
 * Speed is derived from the measured track width, not hard-coded, so the pace
 * is identical whether there are five cards or fifteen, and on every viewport.
 *
 * It pauses on hover and on keyboard focus, so nothing slides away from
 * someone who is actually looking at it. Reduced-motion visitors get a plain,
 * manually scrollable row (see globals.css).
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

export default function ExploreGallery() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // Derive the loop duration from the real rendered width so the perceived
  // speed never changes with card count or viewport.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (prefersReducedMotion()) return;

    const measure = () => {
      // scrollWidth covers both copies; one lap is half of it.
      const lap = track.scrollWidth / 2;
      if (lap <= 0) return;
      track.style.setProperty('--marquee-dur', `${(lap / SPEED).toFixed(1)}s`);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
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
      {/* Header */}
      <div className="mb-10 px-pad-x md:mb-14">
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

      {/* Running strip */}
      <div
        className="relative overflow-hidden"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="marquee-track"
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

      <p className="mt-8 px-pad-x">
        <Iridescent className="t-small text-faint">
          Hover to pause
        </Iridescent>
      </p>
    </section>
  );
}
