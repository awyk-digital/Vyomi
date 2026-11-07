'use client';

import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * A 1px rule that draws itself left-to-right in bronze→lime when it enters
 * the viewport, then stays.
 *
 * Used as section punctuation. The line exists at full width either way —
 * only the coloured pass is animated — so the layout never depends on JS.
 */
export default function AccentRule({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.classList.add('is-in');
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add('is-in');
        io.disconnect();
      },
      { threshold: 0.6 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`accent-rule ${className}`.trim()}
    />
  );
}
