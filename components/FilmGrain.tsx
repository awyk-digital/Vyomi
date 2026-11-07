'use client';

import { useEffect, useRef } from 'react';
import { isLowPowerDevice, prefersReducedMotion } from '@/lib/motion';

/**
 * Animated film grain across the whole viewport.
 *
 * A dark site made of flat blacks and large photographs bands badly on cheap
 * panels and reads as flat on good ones. A low-opacity moving grain breaks the
 * gradient steps up and gives the page a physical, shot-on-something quality.
 *
 * Cost control, in order of importance:
 *   - one small noise tile (128²) is generated, then repeated as a pattern,
 *     so per-frame work is a single fillRect rather than per-pixel writes;
 *   - a pool of pre-rendered tiles is cycled instead of generating new noise
 *     each time, so steady-state cost is effectively just the fill;
 *   - it ticks at ~12fps, not 60 — real film grain is not smooth;
 *   - it does not run at all for reduced-motion or low-power visitors.
 *
 * Purely decorative: aria-hidden, pointer-events none, and the page is
 * completely unaffected if it never mounts.
 */

const TILE = 128;
const POOL = 6;
const FPS = 12;

export default function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || isLowPowerDevice()) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // --- build the tile pool once -------------------------------------
    const tiles: HTMLCanvasElement[] = [];
    for (let t = 0; t < POOL; t++) {
      const tile = document.createElement('canvas');
      tile.width = TILE;
      tile.height = TILE;
      const tctx = tile.getContext('2d');
      if (!tctx) return;

      const img = tctx.createImageData(TILE, TILE);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        // Monochrome noise; alpha carries the variation so the overlay
        // blend has something to work with on both light and dark areas.
        const v = (Math.random() * 255) | 0;
        d[i] = v;
        d[i + 1] = v;
        d[i + 2] = v;
        d[i + 3] = 255;
      }
      tctx.putImageData(img, 0, 0);
      tiles.push(tile);
    }

    const patterns = tiles.map((t) => ctx.createPattern(t, 'repeat'));

    let raf = 0;
    let last = 0;
    let frame = 0;
    const interval = 1000 / FPS;

    const resize = () => {
      // Grain is sub-pixel detail; rendering it at 1x and letting the
      // browser scale is both cheaper and closer to how film actually looks.
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < interval) return;
      last = now;

      const pattern = patterns[frame % patterns.length];
      frame++;
      if (!pattern) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Pause entirely in a background tab.
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="grain-layer" />;
}
