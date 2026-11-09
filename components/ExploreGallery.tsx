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
 * Features true circular cylinder projection, optical Leica-style depth of field,
 * polished stone floor reflections, brushed bronze accents, and weighted inertial physics.
 */

const N = AREAS.length; // 6 spaces

export default function ExploreGallery() {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Smooth continuous float progress
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

  // Main 3D render loop
  useEffect(() => {
    let rId: number;
    let lastTick = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;

      // Handle idle auto-drift
      if (!isInteractingRef.current && !isHoveredRef.current && !prefersReducedMotion()) {
        idleTimerRef.current += dt;
        if (idleTimerRef.current > 4.2) {
          targetProgressRef.current += 1;
          idleTimerRef.current = 0;
        }
      } else {
        idleTimerRef.current = 0;
      }

      // High-end spring damping physics
      const diff = targetProgressRef.current - progressRef.current;
      progressRef.current += diff * Math.min(dt * 6.5, 0.32);

      const currentProg = progressRef.current;

      // Update active index state for UI highlights
      const active = Math.round(currentProg) % N;
      const normalizedActive = (active + N) % N;
      setActiveIndex(normalizedActive);

      // Measure stage for responsive 3D geometry
      const stage = stageRef.current;
      const stageWidth = stage ? stage.offsetWidth : (typeof window !== 'undefined' ? window.innerWidth : 1200);
      const isMobile = stageWidth < 768;

      // Angular geometry of the rotunda
      const stepAngleDeg = isMobile ? 44 : 38;
      const stepAngleRad = (stepAngleDeg * Math.PI) / 180;
      const radius = isMobile ? Math.max(stageWidth * 0.58, 300) : Math.max(stageWidth * 0.46, 560);

      // Project each card onto the 3D cylinder
      for (let i = 0; i < N; i++) {
        const cardEl = cardRefs.current[i];
        if (!cardEl) continue;

        // Circular distance from current progress (-N/2 to +N/2)
        let delta = (i - currentProg) % N;
        if (delta > N / 2) delta -= N;
        if (delta < -N / 2) delta += N;

        const angle = delta * stepAngleRad;
        const absDelta = Math.abs(delta);

        // 3D Rotunda coordinates
        const x = Math.sin(angle) * radius;
        const z = (Math.cos(angle) - 1) * radius * 0.88;
        const rotY = -delta * stepAngleDeg * 0.85;

        // Scale: active card prominent, receding smoothly
        const scale = Math.max(0.72, 1.05 - absDelta * 0.15);

        // Optical depth of field bokeh blur: crisp in focus at center, smooth falloff on sides
        const blur = Math.max(0, (absDelta - 0.28) * 2.2);

        // Studio lighting & atmospheric attenuation
        const opacity = Math.max(0.2, 1 - absDelta * 0.35);
        const brightness = Math.max(0.55, 1 - absDelta * 0.24);

        // Layer order: active card always on top
        const zIndex = Math.round(100 - absDelta * 20);

        if (!prefersReducedMotion()) {
          cardEl.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), 0, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
          cardEl.style.filter = `blur(${blur.toFixed(1)}px) brightness(${brightness.toFixed(2)})`;
          cardEl.style.opacity = opacity.toFixed(2);
        } else {
          cardEl.style.transform = `translate3d(calc(-50% + ${(delta * 340).toFixed(1)}px), 0, 0)`;
          cardEl.style.opacity = (1 - absDelta * 0.4).toFixed(2);
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

  // Navigation handlers with weighted momentum
  const goToIndex = useCallback((targetIndex: number) => {
    idleTimerRef.current = 0;
    const current = progressRef.current;
    let diff = (targetIndex - (current % N)) % N;
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;
    targetProgressRef.current = current + diff;
  }, []);

  const handleNext = useCallback(() => {
    idleTimerRef.current = 0;
    targetProgressRef.current = Math.round(targetProgressRef.current) + 1;
  }, []);

  const handlePrev = useCallback(() => {
    idleTimerRef.current = 0;
    targetProgressRef.current = Math.round(targetProgressRef.current) - 1;
  }, []);

  // Pointer drag & touch swipe mechanics
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

    if (Math.abs(currentX - startXRef.current) > 6) {
      hasDraggedRef.current = true;
    }

    // Measure drag velocity for flick physics
    velocityRef.current = -dx / dt / 800;
    lastXRef.current = currentX;
    lastTimeRef.current = now;

    // Direct drag response
    const stageWidth = stageRef.current?.offsetWidth || 1000;
    const sensitivity = (stageWidth < 768 ? 2.4 : 1.7) / stageWidth;
    targetProgressRef.current -= dx * sensitivity;
    progressRef.current -= dx * sensitivity;
  };

  const handlePointerUp = () => {
    if (!isInteractingRef.current) return;
    isInteractingRef.current = false;
    setIsDragging(false);

    // Apply inertia and magnetically snap to nearest card
    const inertia = Math.max(-1.5, Math.min(1.5, velocityRef.current * 0.35));
    targetProgressRef.current = Math.round(targetProgressRef.current + inertia);

    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 150);
  };

  // Card click: bring directly to front center
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
      {/* Subtle ambient luxury floor spotlight behind the rotunda */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[480px] w-[850px] rounded-full blur-[140px] opacity-25"
        style={{
          background: 'radial-gradient(circle, rgba(176,141,87,0.35) 0%, rgba(140,34,48,0.15) 50%, transparent 70%)',
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
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-charcoal/80 backdrop-blur-md text-muted transition-all duration-300 hover:border-bronze hover:bg-charcoal hover:text-heading active:scale-95"
          >
            <span className="text-base transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next space"
            className="group flex h-10 items-center gap-3 rounded-full border border-hairline bg-charcoal/80 px-5 backdrop-blur-md text-muted transition-all duration-300 hover:border-bronze hover:bg-charcoal hover:text-heading active:scale-95"
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
          perspective: '1500px',
          perspectiveOrigin: '50% 46%',
          height: 'clamp(360px, 48vw, 480px)',
        }}
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
              className="absolute top-0 left-1/2 will-change-transform transition-shadow"
              style={{
                width: 'min(80vw, 440px)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Card Body with Polished Stone Floor Reflection */}
              <div
                className={`group relative aspect-[4/3] w-full overflow-hidden rounded-[2px] transition-all duration-500 ${
                  isCurrent
                    ? 'border border-bronze/60 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(176,141,87,0.15)] ring-1 ring-bronze/30'
                    : 'border border-hairline/60 shadow-[0_20px_50px_rgba(0,0,0,0.9)]'
                }`}
                style={{
                  WebkitBoxReflect:
                    'below 12px linear-gradient(to bottom, transparent 65%, rgba(0,0,0,0.42))',
                }}
              >
                <AssetSlot
                  slot={area.slot}
                  ratio="auto"
                  className="h-full w-full"
                  sizes="(max-width: 767px) 80vw, 440px"
                  hideConceptualLabel={Boolean(area.slot.src)}
                />

                {/* Subtle photographic lens glare overlay */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.10] opacity-80 transition-opacity duration-500 group-hover:opacity-100"
                />

                {/* Floating badge for active focal card */}
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
              <figcaption className="mt-4 flex items-baseline justify-between px-1">
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

        {/* Ambient atmospheric edge fades */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-[clamp(2.5rem,8vw,8rem)] z-30"
          style={{
            background: 'linear-gradient(to right, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-[clamp(2.5rem,8vw,8rem)] z-30"
          style={{
            background: 'linear-gradient(to left, var(--ink) 0%, rgba(8,8,8,0) 100%)',
          }}
        />
      </div>

      {/* Luxury Spotlight Feature Bar & Quick-Jump Selector */}
      <div className="mt-12 px-pad-x">
        {/* Active Space Details Card */}
        <div className="mx-auto max-w-shell border border-hairline/80 bg-charcoal/40 p-5 backdrop-blur-md sm:p-6 rounded-[2px] transition-all duration-500">
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
              Drag to rotate 3D view · Click space to focus
            </Iridescent>
          </div>

          {/* Quick Jump Selector Pills */}
          <div className="mt-4 flex flex-wrap gap-2 pt-1">
            {AREAS.map((a, idx) => {
              const selected = activeIndex === idx;
              return (
                <button
                  key={a.slot.id}
                  type="button"
                  onClick={() => goToIndex(idx)}
                  className={`t-label px-3.5 py-1.5 rounded-full text-[0.6875rem] transition-all duration-300 border ${
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
