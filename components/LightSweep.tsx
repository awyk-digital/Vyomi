'use client';

import { useEffect, useRef, type ElementType } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface LightSweepProps {
  text: string;
  as?: 'h2' | 'p' | 'span';
  size?: 'statement' | 'step-2' | 'step-1' | 'hero';
  align?: 'left' | 'center';
  className?: string;
}

export default function LightSweep({
  text,
  as: Component = 'h2',
  size = 'statement',
  align = 'left',
  className = '',
}: LightSweepProps) {
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // High scrub = light lags and glides smoothly across letterforms
    const tween = gsap.fromTo(
      el,
      { backgroundPosition: '130% 0' },
      {
        backgroundPosition: '-30% 0',
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          end: 'top 30%',
          scrub: 1.2,
        },
      }
    );

    return () => {
      tween.kill();
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
    };
  }, []);

  const sizeMap = {
    hero: 'text-hero font-display font-light leading-[1.08] tracking-tight',
    statement: 'text-statement font-display font-light leading-[1.12] tracking-tight',
    'step-2': 'text-2 font-display font-light leading-[1.2] tracking-tight',
    'step-1': 'text-1 font-body font-light leading-[1.6]',
  };

  const alignMap = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <Component
      ref={textRef as any}
      className={`light-sweep inline-block ${sizeMap[size]} ${alignMap} ${className}`}
      style={{
        paddingBottom: '2px', // Protects serif descenders in Safari
      }}
    >
      {text}
    </Component>
  );
}

