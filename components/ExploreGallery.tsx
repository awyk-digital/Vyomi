'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import AssetSlot from '@/components/AssetSlot';
import AccentRule from '@/components/AccentRule';
import Iridescent from '@/components/Iridescent';
import SectionHeading from '@/components/SectionHeading';
import { AREAS } from '@/data/club';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * 3D Architectural Gallery
 * Features dynamic cylindrical/coverflow perspective transforms,
 * depth scaling, smooth continuous loop, interactive drag/swipe,
 * mouse wheel navigation, and click-to-center.
 */

const CARD_WIDTH = 420;
const CARD_GAP = 28;
const STEP_DISTANCE = CARD_WIDTH + CARD_GAP;
const COPIES = 3; // 3 copies ensure seamless infinite 3D loop even on ultra-wide screens
const SPEED = 24; // CSS pixels/sec during idle auto-glide

export default function ExploreGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [paused, setPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const offsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const lapRef = useRef(0);
  const initializedRef = useRef(false);

  const isPausedRef = useRef(false);
  isPausedRef.current = paused;

  // Pointer drag state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startOffsetRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const totalCards = AREAS.length * COPIES;
  const singleLap = AREAS.length * STEP_DISTANCE;

  useEffect(() => {
    lapRef.current = singleLap;

    const container = containerRef.current;
    const containerWidth = container ? container.offsetWidth : (typeof window !== 'undefined' ? window.innerWidth : 1200);
    const containerCenter = containerWidth / 2;

    // Start centered on the first card of the middle copy (copy 1, index = AREAS.length)
    if (!initializedRef.current) {
      const initialOffset = singleLap + CARD_WIDTH / 2 - containerCenter;
      offsetRef.current = initialOffset;
      targetOffsetRef.current = initialOffset;
      initializedRef.current = true;
    }

    const track = trackRef.current;
    if (!track) return;

    let lastTime = performance.now();
    let rId: number;

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const lap = lapRef.current;
      if (lap > 0) {
        // Continuous auto-glide when not paused and not prefersReducedMotion
        if (!isPausedRef.current && !isDraggingRef.current && !prefersReducedMotion()) {
          targetOffsetRef.current += SPEED * dt;
        }

        // Smooth spring-like easing towards target offset
        const diff = targetOffsetRef.current - offsetRef.current;
        offsetRef.current += diff * Math.min(dt * 8, 0.35);

        // Seamless wrap within [lap, 2 * lap)
        while (offsetRef.current >= 2 * lap) {
          offsetRef.current -= lap;
          targetOffsetRef.current -= lap;
        }
        while (offsetRef.current < lap) {
          offsetRef.current += lap;
          targetOffsetRef.current += lap;
        }

        // Translate track
        track.style.transform = `translate3d(-${offsetRef.current.toFixed(2)}px, 0, 0)`;

        // Calculate 3D perspective transforms for each card
        const currContainer = containerRef.current;
        const cWidth = currContainer ? currContainer.offsetWidth : 1200;
        const cCenter = cWidth / 2;
        const focalRadius = Math.max(cWidth * 0.44, 420);

        for (let i = 0; i < totalCards; i++) {
          const card = cardRefs.current[i];
          if (!card) continue;

          // Card center relative to visible viewport container
          const cardCenter = i * STEP_DISTANCE + CARD_WIDTH / 2 - offsetRef.current;
          const dist = cardCenter - cCenter;
          const norm = dist / focalRadius;

          // Clamp for cards offscreen
          const clampedNorm = Math.max(-2.5, Math.min(2.5, norm));
          const absNorm = Math.abs(clampedNorm);

          // 3D rotation around Y:
          // Center card = 0deg (straight). Cards on left tilt towards center (positive rotY),
          // cards on right tilt towards center (negative rotY).
          const rotY = -clampedNorm * 28;

          // Depth translation along Z axis:
          // Center card pops forward (+35px), cards to the sides recede into background
          const transZ = 35 - Math.min(absNorm, 1.8) * 120;

          // Scale: center card is largest, diminishing towards edges
          const scale = Math.max(0.82, 1.05 - absNorm * 0.14);

          // Opacity & Brightness dropoff for atmospheric studio lighting
          const opacity = Math.max(0.4, 1 - absNorm * 0.32);
          const brightness = Math.max(0.65, 1 - absNorm * 0.26);

          card.style.transform = `translate3d(0, 0, ${transZ.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
          card.style.opacity = opacity.toFixed(2);
          card.style.filter = `brightness(${brightness.toFixed(2)})`;
          card.style.zIndex = String(Math.round(100 - absNorm * 25));
        }
      }

      rId = requestAnimationFrame(tick);
    };

    rId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rId);
    };
  }, [singleLap, totalCards]);

  const handleNext = useCallback(() => {
    targetOffsetRef.current += STEP_DISTANCE;
  }, []);

  const handlePrev = useCallback(() => {
    targetOffsetRef.current -= STEP_DISTANCE;
  }, []);

  // Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isDraggingRef.current = true;
    setIsDragging(true);
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    startOffsetRef.current = targetOffsetRef.current;
    setPaused(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 6) {
      hasDraggedRef.current = true;
    }
    targetOffsetRef.current = startOffsetRef.current - dx * 1.35;
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    setTimeout(() => {
      setPaused(false);
      hasDraggedRef.current = false;
    }, 600);
  };

  // Center a card when clicked
  const handleCardClick = (idx: number) => {
    if (hasDraggedRef.current) return;
    const container = containerRef.current;
    const cWidth = container ? container.offsetWidth : 1200;
    const targetCenter = idx * STEP_DISTANCE + CARD_WIDTH / 2;
    targetOffsetRef.current = targetCenter - cWidth / 2;
  };

  // Horizontal wheel support
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      targetOffsetRef.current += e.deltaX * 0.9;
    }
  };

  const renderCards = (copy: number) =>
    AREAS.map((area, i) => {
      const idx = copy * AREAS.length + i;
      return (
        <figure
          key={`${copy}-${area.slot.id}`}
          ref={(el) => {
            cardRefs.current[idx] = el;
          }}
          onClick={() => handleCardClick(idx)}
          className="mr-7 shrink-0 cursor-pointer select-none"
          style={{
            width: `min(82vw, ${CARD_WIDTH}px)`,
            transformStyle: 'preserve-3d',
            willChange: 'transform, filter, opacity',
          }}
        >
          <div
            className="group relative overflow-hidden aspect-[4/3] w-full rounded-[3px] border border-hairline/60 bg-charcoal shadow-[0_25px_50px_-12px_rgba(0,0,0,0.9)] transition-all duration-300 hover:border-gold/40 hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.95)]"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <AssetSlot
              slot={area.slot}
              ratio="auto"
              className="h-full w-full"
              sizes="(max-width: 767px) 82vw, 420px"
              hideConceptualLabel={Boolean(area.slot.src)}
            />

            {/* Subtle photographic lens glare overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            />
          </div>

          <figcaption className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="t-label nums text-faint">
              {String((i % AREAS.length) + 1).padStart(2, '0')}
            </span>
            <span className="t-small text-heading transition-colors group-hover:text-gold">
              {area.caption}
            </span>
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

        {/* Small Navigation Bar — 3D Controls */}
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
              3D Explore
            </span>
            <span className="text-sm text-heading transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>

      {/* 3D Stage Container */}
      <div
        ref={containerRef}
        className={`relative overflow-hidden py-12 select-none touch-pan-y ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          perspective: '1300px',
          perspectiveOrigin: '50% 50%',
        }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => {
          if (!isDraggingRef.current) setPaused(false);
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max will-change-transform py-4"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {Array.from({ length: COPIES }).map((_, c) => (
            <div
              key={c}
              className="flex"
              style={{ transformStyle: 'preserve-3d' }}
              aria-hidden={c !== 1}
            >
              {renderCards(c)}
            </div>
          ))}
        </div>

        {/* Ambient edge fades dissolving cards as they curve away */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-[clamp(3rem,10vw,10rem)] z-30"
          style={{
            background: 'linear-gradient(to right, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-[clamp(3rem,10vw,10rem)] z-30"
          style={{
            background: 'linear-gradient(to left, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
      </div>

      <div className="mt-6 px-pad-x flex items-center justify-between">
        <Iridescent className="t-small text-faint">
          Drag to spin 3D view · Click any image to focus · Hover to pause
        </Iridescent>
      </div>
    </section>
  );
}
