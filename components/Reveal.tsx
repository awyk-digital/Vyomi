'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DURATION_REVEAL, EASE, TRIGGER_START, shouldReduceMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
}

/**
 * Reveal Component
 * Animates children from:
 *   y: 40, opacity: 0, clip-path: inset(0 0 100% 0)
 * To:
 *   y: 0, opacity: 1, clip-path: inset(0 0 0 0)
 * Using DURATION_REVEAL (1.1s) and EASE ('power3.out'), triggered once at TRIGGER_START ('top 78%').
 * Falls back to still state if prefers-reduced-motion or on mobile (<768px).
 */
export default function Reveal({
  children,
  className = '',
  delay = 0,
  as: Component = 'div',
}: RevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (shouldReduceMotion()) {
      // Instant display for reduced-motion or mobile screens
      gsap.set(el, { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          y: 40,
          opacity: 0,
          clipPath: 'inset(0% 0% 100% 0%)',
        },
        {
          y: 0,
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: DURATION_REVEAL,
          ease: EASE,
          delay,
          scrollTrigger: {
            trigger: el,
            start: TRIGGER_START,
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay]);

  return (
    <Component
      ref={containerRef}
      className={className}
      style={{
        // Initial clip-path to prevent flash of unstyled content before GSAP hydrates
        willChange: 'transform, opacity, clip-path',
      }}
    >
      {children}
    </Component>
  );
}

