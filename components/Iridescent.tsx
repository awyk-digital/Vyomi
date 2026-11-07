'use client';

import { useCallback, useEffect, useRef, type ElementType } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

interface IridescentProps {
  /** Plain text only — the effect duplicates the string into paint layers. */
  children: string;
  as?: ElementType;
  className?: string;
}

/**
 * Cursor-tracked iridescent fill for large display text.
 *
 * Four stacked copies of the same string:
 *   1. the real, opaque text — always readable, never animated;
 *   2. an oil-slick gradient clipped to the glyphs;
 *   3. + 4. red and cyan copies offset by ~1.5px and screened back in,
 *      which is what produces the chromatic fringe on the letter edges.
 *
 * Layers 2–4 are masked by a radial spotlight centred on the pointer, so the
 * colour only exists where the cursor is and falls off smoothly around it.
 * The mask centre and the reveal amount are CSS custom properties written
 * from a pointermove handler; the paint itself stays entirely in the
 * compositor.
 *
 * Only the duplicated layers carry colour — the base glyphs underneath never
 * change, so contrast is identical with the effect on, off, or unsupported.
 * Copies are aria-hidden, so assistive tech reads the string once.
 */
export default function Iridescent({
  children,
  as: Tag = 'span',
  className = '',
}: IridescentProps) {
  const ref = useRef<HTMLElement>(null);
  const raf = useRef(0);
  const pending = useRef<{ x: number; y: number } | null>(null);

  const flush = useCallback(() => {
    raf.current = 0;
    const el = ref.current;
    const p = pending.current;
    if (!el || !p) return;
    el.style.setProperty('--mx', `${p.x}%`);
    el.style.setProperty('--my', `${p.y}%`);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    // Hover is the whole interaction; on touch there is no cursor to track.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const onMove = (e: PointerEvent) => {
      const box = el.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      pending.current = {
        x: ((e.clientX - box.left) / box.width) * 100,
        y: ((e.clientY - box.top) / box.height) * 100,
      };
      if (!raf.current) raf.current = requestAnimationFrame(flush);
    };

    const onEnter = (e: PointerEvent) => {
      onMove(e);
      el.style.setProperty('--irid', '1');
    };

    const onLeave = () => {
      el.style.setProperty('--irid', '0');
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [flush]);

  return (
    <Tag ref={ref} className={`irid ${className}`.trim()}>
      <span className="irid__base">{children}</span>
      <span aria-hidden="true" className="irid__layer irid__r">
        {children}
      </span>
      <span aria-hidden="true" className="irid__layer irid__c">
        {children}
      </span>
      <span aria-hidden="true" className="irid__layer irid__fill">
        {children}
      </span>
    </Tag>
  );
}
