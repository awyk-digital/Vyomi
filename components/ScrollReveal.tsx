'use client';

import { useEffect, useRef, useState, type ElementType } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  text: string;
  as?: 'h2' | 'p' | 'blockquote';
  size?: 'statement' | 'step-2' | 'step-1';
  align?: 'left' | 'center';
  className?: string;
}

export default function ScrollReveal({
  text,
  as: Component = 'h2',
  size = 'statement',
  align = 'left',
  className = '',
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const words = text.split(/\s+/);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const el = containerRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth < 768;
    const wordSpans = el.querySelectorAll<HTMLSpanElement>('.scroll-reveal-word');
    if (!wordSpans.length) return;

    // Set initial state
    gsap.set(wordSpans, { opacity: 0.18, willChange: 'opacity' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: el,
        start: isMobile ? 'top 90%' : 'top 80%',
        end: isMobile ? 'top 40%' : 'top 25%',
        scrub: 0.6,
        onLeave: () => {
          gsap.set(wordSpans, { willChange: 'auto' });
        },
        onEnterBack: () => {
          gsap.set(wordSpans, { willChange: 'opacity' });
        },
      },
    });

    tl.to(wordSpans, {
      opacity: 1,
      stagger: {
        each: 0.08,
        from: 'start',
      },
      ease: 'none',
    });

    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    let timer: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timer);
      timer = setTimeout(handleResize, 250);
    };

    window.addEventListener('resize', debouncedResize);

    return () => {
      window.removeEventListener('resize', debouncedResize);
      tl.kill();
      if (tl.scrollTrigger) tl.scrollTrigger.kill();
    };
  }, [mounted, text]);

  // Size styling map
  const sizeClasses = {
    statement: 'text-statement font-display font-medium tracking-tight leading-[1.12]',
    'step-2': 'text-2 font-display font-medium tracking-tight leading-[1.2]',
    'step-1': 'text-1 font-body font-light tracking-normal leading-[1.4]',
  };

  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <Component
      ref={containerRef as any}
      className={`block text-[var(--bone)] ${sizeClasses[size]} ${alignClass} ${className}`}
    >
      {/* Full accessible text always in DOM, word spans for scroll illumination */}
      {words.map((word, i) => (
        <span
          key={i}
          className="scroll-reveal-word inline-block mr-[0.25em] last:mr-0 transition-opacity"
          style={{ opacity: mounted ? 0.18 : 1 }}
        >
          {word}
        </span>
      ))}
    </Component>
  );
}

