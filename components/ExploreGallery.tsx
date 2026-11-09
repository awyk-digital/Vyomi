'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import AssetSlot from '@/components/AssetSlot';
import AccentRule from '@/components/AccentRule';
import Iridescent from '@/components/Iridescent';
import SectionHeading from '@/components/SectionHeading';
import { AREAS } from '@/data/club';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Luxury 3D Architectural Rotunda
 * Features true circular cylinder projection, buttery smooth momentum physics,
 * magnetic docking, zero reflection artifacts, and compositor-accelerated 120fps motion.
 */

const N = AREAS.length; // 6 spaces

export default function ExploreGallery() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Buttery physics state
  const progressRef = useRef(0);
  const targetProgressRef = useRef(0);
  const velocityRef = useRef(0);

  // Interaction tracking
  const isInteractingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const idleTimerRef = useRef(0);

  // Main buttery 3D render loop
  useEffect(() => {
    let rId: number;
    let lastTick = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTick) / 1000, 0.05);
      lastTick = now;

      // Idle auto-advance after 4.8 seconds of inactivity
      if (!isInteractingRef.current && !isHoveredRef.current && !prefersReducedMotion()) {
        idleTimerRef.current += dt;
        if (idleTimerRef.current > 4.8) {
          targetProgressRef.current = Math.round(targetProgressRef.current) + 1;
          idleTimerRef.current = 0;
        }
      } else {
        idleTimerRef.current = 0;
      }

      // Buttery physics: drag vs coasting & magnetic docking
      if (isInteractingRef.current) {
        // High-frequency responsive follow during drag
        const diff = targetProgressRef.current - progressRef.current;
        progressRef.current += diff * Math.min(dt * 16, 0.42);
      } else {
        // Friction decay on momentum velocity
        velocityRef.current *= Math.pow(0.86, dt * 60);
        targetProgressRef.current += velocityRef.current * dt;

        // Smooth magnetic pull towards nearest card when velocity slows down
        const snapTarget = Math.round(targetProgressRef.current);
        const snapDiff = snapTarget - targetProgressRef.current;
        if (Math.abs(velocityRef.current) < 1.4) {
          targetProgressRef.current += snapDiff * Math.min(dt * 6.5, 0.22);
        }

        // Velvety smooth exponential spring interpolation
        const diff = targetProgressRef.current - progressRef.current;
        progressRef.current += diff * Math.min(dt * 7.5, 0.26);
      }

      const currentProg = progressRef.current;

      // Active card index
      const active = Math.round(currentProg) % N;
      const normalizedActive = (active + N) % N;
      setActiveIndex(normalizedActive);

      // Measure stage for responsive 3D geometry
      const stage = stageRef.current;
      const stageWidth = stage ? stage.offsetWidth : (typeof window !== 'undefined' ? window.innerWidth : 1200);
      const isMobile = stageWidth < 768;

      // Cylindrical 3D layout parameters
      const stepAngleDeg = isMobile ? 44 : 36;
      const stepAngleRad = (stepAngleDeg * Math.PI) / 180;
      const radius = isMobile ? Math.max(stageWidth * 0.58, 300) : Math.max(stageWidth * 0.48, 540);

      // Project each card onto the 3D rotunda cylinder
      // Uses ONLY GPU compositor-accelerated properties (transform3d, opacity)
      for (let i = 0; i < N; i++) {
        const cardEl = cardRefs.current[i];
        if (!cardEl) continue;

        // Circular delta relative to progress (-N/2 to +N/2)
        let delta = (i - currentProg) % N;
        if (delta > N / 2) delta -= N;
        if (delta < -N / 2) delta += N;

        const angle = delta * stepAngleRad;
        const absDelta = Math.abs(delta);

        // Cylindrical coordinates
        const x = Math.sin(angle) * radius;
        const z = (Math.cos(angle) - 1) * radius * 0.85;
        const rotY = -delta * stepAngleDeg * 0.82;

        // Smooth scale: prominent at center, receding gently
        const scale = Math.max(0.72, 1.05 - absDelta * 0.15);

        // Atmospheric lighting and opacity (no blur filter for locked 120fps)
        const opacity = Math.max(0.22, 1 - absDelta * 0.34);
        const zIndex = Math.round(100 - absDelta * 20);

        if (!prefersReducedMotion()) {
          cardEl.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), 0, ${z.toFixed(2)}px) rotateY(${rotY.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
          cardEl.style.opacity = opacity.toFixed(3);
        } else {
          cardEl.style.transform = `translate3d(calc(-50% + ${(delta * 340).toFixed(2)}px), 0, 0)`;
          cardEl.style.opacity = (1 - absDelta * 0.4).toFixed(3);
        }

        cardEl.style.zIndex = String(zIndex);
      }

      rId = requestAnimationFrame(tick);
    };

    rId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rId);
    };
  }, []);

  // Smooth navigation triggers
  const goToIndex = useCallback((targetIndex: number) => {
    idleTimerRef.current = 0;
    velocityRef.current = 0;
    const current = progressRef.current;
    let diff = (targetIndex - (current % N)) % N;
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;
    targetProgressRef.current = current + diff;
  }, []);

  const handleNext = useCallback(() => {
    idleTimerRef.current = 0;
    velocityRef.current = 0;
    targetProgressRef.current = Math.round(targetProgressRef.current) + 1;
  }, []);

  const handlePrev = useCallback(() => {
    idleTimerRef.current = 0;
    velocityRef.current = 0;
    targetProgressRef.current = Math.round(targetProgressRef.current) - 1;
  }, []);

  // Buttery pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    isInteractingRef.current = true;
    setIsDragging(true);
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isInteractingRef.current) return;
    const currentX = e.clientX;
    const dx = currentX - lastXRef.current;
    const now = performance.now();
    const dt = Math.max((now - lastTimeRef.current) / 1000, 0.001);

    if (Math.abs(currentX - startXRef.current) > 5) {
      hasDraggedRef.current = true;
    }

    // Measure instant velocity for buttery flick release
    const instantVelocity = -dx / dt / 550;
    velocityRef.current = velocityRef.current * 0.4 + instantVelocity * 0.6;
    lastXRef.current = currentX;
    lastTimeRef.current = now;

    // Direct, silky responsive dragging
    const stageWidth = stageRef.current?.offsetWidth || 1000;
    const sensitivity = (stageWidth < 768 ? 2.3 : 1.6) / stageWidth;
    targetProgressRef.current -= dx * sensitivity;
  };

  const handlePointerUp = () => {
    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;
    setIsDragging(false);

    // Apply fluid momentum coasting on release
    const momentum = Math.max(-1.8, Math.min(1.8, velocityRef.current * 0.28));
    targetProgressRef.current = targetProgressRef.current + momentum;

    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 120);
  };

  // Buttery wheel & trackpad scrolling
  const handleWheel = (e: React.WheelEvent) => {
    // Intercept horizontal scroll or vertical scroll with high intent
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) > 3) {
      idleTimerRef.current = 0;
      targetProgressRef.current += delta * 0.0025;
      velocityRef.current = delta * 0.015;
    }
  };

  // Click card to glide it directly to center
  const handleCardClick = (i: number) => {
    if (hasDraggedRef.current) return;
    goToIndex(i);
  };

  const activeArea = AREAS[activeIndex] || AREAS[0];

  return (
    <section
      id="explore"
      className="relative border-t border-hairline bg-ink py-section-y overflow-hidden"
      aria-labelledby="explore-heading"
    >
      {/* Subtle warm ambient glow behind the rotunda */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[800px] rounded-full blur-[130px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(176,141,87,0.35) 0%, rgba(140,34,48,0.12) 50%, transparent 70%)',
        }}
      />

      {/* Header with Navigation Bar */}
      <div className="mb-8 px-pad-x md:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <span className="t-label mb-2 block uppercase tracking-widest text-bronze">
            3D Architectural Walkthrough
          </span>
          <SectionHeading
            id="explore-heading"
            className="t-h2 uppercase text-heading"
            stagger={0.08}
          >
            Explore Vyomi.
          </SectionHeading>
          <div className="mt-5 max-w-shell">
            <AccentRule />
          </div>
        </div>

        {/* Small Navigation Bar — Luxury Rotunda Controls */}
        <div className="flex items-center gap-3 self-start sm:self-end">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous space"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-charcoal/80 backdrop-blur-md text-muted transition-colors duration-300 hover:border-bronze hover:bg-charcoal hover:text-heading active:scale-95"
          >
            <span className="text-base transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next space"
            className="group flex h-10 items-center gap-3 rounded-full border border-hairline bg-charcoal/80 px-5 backdrop-blur-md text-muted transition-colors duration-300 hover:border-bronze hover:bg-charcoal hover:text-heading active:scale-95"
          >
            <span className="t-label text-[0.625rem] tracking-wider uppercase text-bronze font-medium">
              Next Space
            </span>
            <span className="text-base text-heading transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>
        </div>
      </div>

      {/* 3D Rotunda Stage */}
      <div
        ref={stageRef}
        className={`relative mx-auto w-full max-w-shell select-none touch-pan-y ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          perspective: '1400px',
          perspectiveOrigin: '50% 50%',
          height: 'clamp(320px, 44vw, 420px)',
        }}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerEnter={() => {
          isHoveredRef.current = true;
        }}
        onPointerLeave={() => {
          isHoveredRef.current = false;
        }}
      >
        {AREAS.map((area, i) => {
          const isCurrent = activeIndex === i;
          return (
            <div
              key={area.slot.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              onClick={() => handleCardClick(i)}
              className="absolute top-0 left-1/2 will-change-transform"
              style={{
                width: 'min(80vw, 440px)',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Card Body — Clean, zero reflection, rich luxury depth */}
              <div
                className={`group relative aspect-[4/3] w-full overflow-hidden rounded-[2px] transition-[border-color,box-shadow] duration-500 ${
                  isCurrent
                    ? 'border border-bronze/60 shadow-[0_25px_60px_-10px_rgba(0,0,0,0.92),0_0_30px_rgba(176,141,87,0.12)] ring-1 ring-bronze/25'
                    : 'border border-hairline/60 shadow-[0_15px_40px_rgba(0,0,0,0.85)]'
                }`}
              >
                <AssetSlot
                  slot={area.slot}
                  ratio="auto"
                  className="h-full w-full"
                  sizes="(max-width: 767px) 80vw, 440px"
                  hideConceptualLabel={Boolean(area.slot.src)}
                />

                {/* Subtle photographic lens glare sheen */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                />

                {/* Focal badge for the centered active space */}
                {isCurrent && (
                  <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2 rounded-full border border-bronze/50 bg-ink/80 px-3 py-1 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-bronze animate-pulse" />
                    <span className="t-label text-[0.5625rem] tracking-widest uppercase text-heading">
                      Focal View
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Card Caption */}
              <figcaption className="mt-3.5 flex items-baseline justify-between px-1">
                <div className="flex items-baseline gap-2.5">
                  <span className="t-label nums font-medium text-bronze">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    className={`t-small transition-colors duration-300 font-medium ${
                      isCurrent ? 'text-heading' : 'text-muted group-hover:text-heading'
                    }`}
                  >
                    {area.caption}
                  </span>
                </div>
                {area.slot.conceptual && area.slot.src && (
                  <span className="t-label text-[0.5625rem] text-faint">
                    Conceptual
                  </span>
                )}
              </figcaption>
            </div>
          );
        })}

        {/* Ambient atmospheric edge dissolves */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-[clamp(2rem,7vw,7rem)] z-30"
          style={{
            background: 'linear-gradient(to right, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-[clamp(2rem,7vw,7rem)] z-30"
          style={{
            background: 'linear-gradient(to left, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
      </div>

      {/* Luxury Feature Bar & Quick-Jump Selector */}
      <div className="mt-8 px-pad-x">
        <div className="mx-auto max-w-shell border border-hairline/80 bg-charcoal/40 p-5 backdrop-blur-md sm:p-6 rounded-[2px]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-hairline/60 pb-4">
            <div className="flex items-center gap-3">
              <span className="t-label nums px-2 py-0.5 rounded border border-bronze/40 text-bronze text-[0.6875rem]">
                {String(activeIndex + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
              </span>
              <h3 className="t-h3 uppercase text-heading font-medium tracking-wide">
                {activeArea.caption}
              </h3>
            </div>

            <Iridescent className="t-label text-[0.625rem] tracking-wider uppercase text-faint">
              Swipe or drag to scroll · Click space to focus
            </Iridescent>
          </div>

          {/* Quick-Jump Selector Pills */}
          <div className="mt-4 flex flex-wrap gap-2 pt-1">
            {AREAS.map((a, idx) => {
              const selected = activeIndex === idx;
              return (
                <button
                  key={a.slot.id}
                  type="button"
                  onClick={() => goToIndex(idx)}
                  className={`t-label px-3.5 py-1.5 rounded-full text-[0.6875rem] transition-colors duration-300 border ${
                    selected
                      ? 'border-bronze bg-bronze/15 text-heading font-medium shadow-[0_0_15px_rgba(176,141,87,0.25)]'
                      : 'border-hairline bg-surface/40 text-faint hover:border-hairline-2 hover:text-muted hover:bg-surface'
                  }`}
                >
                  <span className="mr-1.5 nums opacity-60">0{idx + 1}</span>
                  {a.caption}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
