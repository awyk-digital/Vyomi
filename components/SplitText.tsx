'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DURATION_REVEAL, EASE, STAGGER, TRIGGER_START, shouldReduceMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  children: string;
  className?: string;
  as?: ElementType;
  delay?: number;
}

/**
 * SplitText Component
 * Splits a heading into lines and staggers them in using STAGGER (0.08s)
 * and DURATION_REVEAL (1.1s) with EASE ('power3.out').
 * 
 * - Wraps each line in an overflow-hidden mask for high-end editorial line reveals.
 * - Preserves accessible text for SEO and screen readers via aria-label.
 * - Respects prefers-reduced-motion and mobile (<768px) with a still fallback.
 */
export default function SplitText({
  children,
  className = '',
  as: Component = 'h2',
  delay = 0,
}: SplitTextProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  // Group words into lines on mount and on resize
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const el = containerRef.current;
    if (!el) return;

    // Check if children has explicit line breaks
    if (children.includes('\n')) {
      setLines(children.split('\n').map((l) => l.trim()).filter(Boolean));
      setReady(true);
      return;
    }

    // Otherwise, temporarily render words to measure offsetTop lines
    const words = children.trim().split(/\s+/);
    const tempContainer = document.createElement('div');
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.position = 'absolute';
    tempContainer.style.pointerEvents = 'none';
    tempContainer.style.width = `${el.clientWidth || window.innerWidth}px`;

    // Copy essential font styling for exact line-break measurement
    const computed = window.getComputedStyle(el);
    tempContainer.style.font = computed.font;
    tempContainer.style.fontSize = computed.fontSize;
    tempContainer.style.fontFamily = computed.fontFamily;
    tempContainer.style.fontWeight = computed.fontWeight;
    tempContainer.style.letterSpacing = computed.letterSpacing;
    tempContainer.style.lineHeight = computed.lineHeight;
    tempContainer.style.textTransform = computed.textTransform;

    tempContainer.innerHTML = words.map((w) => `<span class="inline-block">${w}&nbsp;</span>`).join('');
    document.body.appendChild(tempContainer);

    const spans = Array.from(tempContainer.children) as HTMLElement[];
    const groupedLines: string[][] = [];
    let currentTop = -1;
    let currentLine: string[] = [];

    spans.forEach((span, idx) => {
      const top = span.offsetTop;
      if (currentTop === -1 || Math.abs(top - currentTop) < 4) {
        currentLine.push(words[idx]);
        currentTop = top;
      } else {
        groupedLines.push(currentLine);
        currentLine = [words[idx]];
        currentTop = top;
      }
    });

    if (currentLine.length > 0) {
      groupedLines.push(currentLine);
    }

    document.body.removeChild(tempContainer);
    setLines(groupedLines.map((l) => l.join(' ')));
    setReady(true);
  }, [children]);

  // Animate lines once computed
  useEffect(() => {
    if (!ready || lines.length === 0) return;

    const el = containerRef.current;
    if (!el) return;

    if (shouldReduceMotion()) {
      // Instant reveal for mobile or reduced motion
      const targets = el.querySelectorAll('.split-line-inner');
      gsap.set(targets, { y: '0%', opacity: 1 });
      return;
    }

    const targets = el.querySelectorAll('.split-line-inner');
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          y: '105%',
          opacity: 0,
        },
        {
          y: '0%',
          opacity: 1,
          duration: DURATION_REVEAL,
          ease: EASE,
          stagger: STAGGER,
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
  }, [ready, lines, delay]);

  return (
    <Component
      ref={containerRef}
      className={`block ${className}`}
      aria-label={children}
    >
      {ready ? (
        <span aria-hidden="true" className="block">
          {lines.map((line, idx) => (
            <span key={idx} className="block overflow-hidden py-[0.05em]">
              <span className="split-line-inner block will-change-transform">
                {line}
              </span>
            </span>
          ))}
        </span>
      ) : (
        // Fallback for SSR and initial hydration to prevent layout shift
        <span className="opacity-0">{children}</span>
      )}
    </Component>
  );
}

