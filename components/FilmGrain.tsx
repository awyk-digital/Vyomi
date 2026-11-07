'use client';

/**
 * Film Grain Overlay
 * Fixed, full viewport, pointer-events none, z-index 9999, opacity 0.025.
 * Uses an SVG feTurbulence noise with mix-blend-mode overlay.
 * Subtle — felt, not seen.
 */
export default function FilmGrain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] h-full w-full select-none"
      style={{
        opacity: 0.025,
        mixBlendMode: 'overlay',
      }}
    >
      <svg
        className="h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <filter id="film-grain-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain-filter)" />
      </svg>
    </div>
  );
}
