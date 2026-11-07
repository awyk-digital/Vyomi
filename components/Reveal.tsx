'use client';

import { useEffect, useRef, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  REVEAL_DUR,
  REVEAL_Y,
  STAGGER,
  EASE_OUT,
  TRIGGER_START,
  prefersReducedMotion,
} from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** Staggers direct children instead of revealing the block as one unit. */
  stagger?: boolean;
}

/**
 * Subtle opacity + vertical reveal on scroll. Transform and opacity only.
 *
 * Content is visible by default and only hidden once the effect confirms it
 * will animate, so nothing is ever stranded invisible if JS fails to run.
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  stagger = false,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const targets = stagger ? Array.from(el.children) : [el];
    if (targets.length === 0) return;

    gsap.set(targets, { opacity: 0, y: REVEAL_Y });

    const tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: REVEAL_DUR,
      ease: EASE_OUT,
      delay,
      stagger: stagger ? STAGGER : 0,
      scrollTrigger: { trigger: el, start: TRIGGER_START, once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(targets, { clearProps: 'opacity,transform' });
    };
  }, [delay, stagger]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
