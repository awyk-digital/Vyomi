'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  className?: string;
}

/**
 * A looping, silent clip used as a chapter plate.
 *
 * Three things this does that a bare <video autoplay loop muted> does not:
 *
 *  1. It only plays while on screen. An IntersectionObserver pauses the
 *     element once it leaves the viewport, so a page carrying several clips
 *     does not decode all of them at once.
 *  2. It honours `prefers-reduced-motion`. Readers who ask for less movement
 *     get the poster frame and an explicit control, never an ambush of
 *     motion — and the choice is re-read if they change it mid-session.
 *  3. It never downloads until needed. `preload="none"` means the poster is
 *     the only cost until playback actually begins.
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
  className = '',
}: ChapterVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [override, setOverride] = useState(false);

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

    if (suppressed) {
      el.pause();
      return;
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
    return () => io.disconnect();
  }, [suppressed]);

  const start = useCallback(() => {
    setOverride(true);
    void ref.current?.play().catch(() => {});
  }, []);

  return (
    <figure
      className={`relative overflow-hidden bg-charcoal ${className}`}
      style={ratio ? { aspectRatio: ratio } : undefined}
    >
      <video
        ref={ref}
        src={src}
        poster={poster}
        loop
        muted
        playsInline
        preload="none"
        aria-label={label}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Edge vignette — matches the still plates in AssetSlot. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 58%, rgba(8,8,8,0.42) 100%)',
        }}
      />

      {suppressed && (
        <button
          type="button"
          onClick={start}
          className="t-label absolute bottom-3 right-3 z-10 border border-hairline-2 bg-ink/80 px-3 py-1.5 text-[0.625rem] text-heading transition-colors hover:bg-ink"
        >
          Play walkthrough
        </button>
      )}

      {caption && (
        <figcaption className="t-label pointer-events-none absolute inset-x-0 bottom-0 bg-ink/70 px-3 py-1.5 text-[0.625rem] text-muted">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
