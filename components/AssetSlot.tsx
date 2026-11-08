'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { isLowPowerDevice, prefersReducedMotion } from '@/lib/motion';
import type { ImageSlot } from '@/config/assets';

gsap.registerPlugin(ScrollTrigger);

const DRIFT = 6;
const COVER = 1.15;

interface AssetSlotProps {
  slot: ImageSlot;
  /** Tailwind classes for the wrapper. The aspect ratio comes from the slot. */
  className?: string;
  /** Pass true for above-the-fold images. */
  priority?: boolean;
  /** Responsive sizes hint for next/image. */
  sizes?: string;
  /** Overrides the slot ratio where a section needs a different crop. */
  ratio?: string;
  /** Rounded corners are off by default — the system uses square edges. */
  rounded?: boolean;
  /**
   * Suppresses the overlaid "representative interior" strip. Use where the
   * caller shows that note itself — e.g. inside a parallax wrapper, where an
   * overlay would be shifted out of the visible crop.
   */
  hideConceptualLabel?: boolean;
}

/**
 * Renders an approved image, or — while none has been supplied — a labelled
 * placeholder at the correct proportions naming the exact shot required.
 *
 * Layout space is always reserved from `slot.ratio`, so supplying an asset
 * later causes no layout shift.
 *
 * Chapter plates receive the same subtle scroll-linked parallax drift
 * ChapterVideo has: scale(1.15) with yPercent -6 to 6, scrubbed, gated
 * behind prefersReducedMotion() and isLowPowerDevice().
 */
export default function AssetSlot({
  slot,
  className = '',
  priority = false,
  sizes = '100vw',
  ratio,
  rounded = false,
  hideConceptualLabel = false,
}: AssetSlotProps) {
  const figureRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const aspectRatio = ratio ?? slot.ratio;
  const radius = rounded ? '2px' : '0';

  useEffect(() => {
    const fig = figureRef.current;
    const media = mediaRef.current;
    if (!fig || !media) return;
    if (slot.fit === 'contain') return;
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
  }, [slot.fit]);

  // Supplied asset path
  if (slot.src) {
    return (
      <figure
        ref={figureRef}
        className={`relative overflow-hidden bg-charcoal ${className}`}
        style={{ aspectRatio, borderRadius: radius }}
      >
        <div ref={mediaRef} className="absolute inset-0 will-change-transform">
          <Image
            src={slot.src}
            alt={slot.alt}
            fill
            priority={priority}
            sizes={sizes}
            className={slot.fit === 'contain' ? 'object-contain' : 'object-cover'}
            style={{ objectPosition: slot.focal }}
          />
        </div>
        {/* Subtle edge vignette, per the art-direction notes */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 58%, rgba(8,8,8,0.42) 100%)',
          }}
        />
        {slot.conceptual && !hideConceptualLabel && (
          <figcaption className="t-label absolute bottom-0 left-0 right-0 bg-ink/70 px-3 py-1.5 text-[0.625rem] text-muted">
            Representative interior — not club photography
          </figcaption>
        )}
      </figure>
    );
  }

  // Awaiting approved asset
  return (
    <div
      role="img"
      aria-label={`Image pending: ${slot.need}`}
      className={`relative overflow-hidden border border-hairline bg-charcoal ${className}`}
      style={{ aspectRatio, borderRadius: radius }}
    >
      {/* Faint diagonal hatch so an unfilled slot reads as deliberate, not broken */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(245,245,242,0.035) 0px, rgba(245,245,242,0.035) 1px, transparent 1px, transparent 9px)',
        }}
      />

      {/* Corner brackets */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-3">
        <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-hairline-2" />
        <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-hairline-2" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-hairline-2" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-hairline-2" />
      </span>

      <div className="relative flex h-full w-full flex-col justify-between gap-3 p-4 sm:p-5">
        <span className="t-label text-[0.625rem] text-burgundy">Asset required</span>

        <p className="max-w-[34ch] text-[0.78rem] font-normal leading-snug text-muted">
          {slot.need}
        </p>

        <span className="nums t-label text-[0.5625rem] text-faint">
          {slot.master} · {slot.fit}
        </span>
      </div>
    </div>
  );
}
