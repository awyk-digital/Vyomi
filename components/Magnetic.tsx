'use client';

import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react';
import gsap from 'gsap';
import { DURATION_FAST, EASE_EXPO, EASE, shouldReduceMotion } from '@/lib/motion';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  maxDistance?: number;
}

/**
 * Magnetic Wrapper
 * Translates child element up to 12px toward the cursor on hover,
 * and springs back smoothly on leave.
 * 
 * Disabled below 768px and when prefers-reduced-motion is active.
 * Uses strict motion tokens (DURATION_FAST 0.6s, EASE_EXPO / EASE).
 */
export default function Magnetic({
  children,
  className = '',
  maxDistance = 12,
}: MagneticProps) {
  const magneticRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset position if window shrinks below breakpoint
    const handleResize = () => {
      if (shouldReduceMotion() && magneticRef.current) {
        gsap.to(magneticRef.current, { x: 0, y: 0, duration: 0.2 });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion()) return;

    const el = magneticRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Relative distance from center (-1 to 1)
    const normX = (e.clientX - centerX) / (rect.width / 2);
    const normY = (e.clientY - centerY) / (rect.height / 2);

    const targetX = Math.max(Math.min(normX * maxDistance, maxDistance), -maxDistance);
    const targetY = Math.max(Math.min(normY * maxDistance, maxDistance), -maxDistance);

    gsap.to(el, {
      x: targetX,
      y: targetY,
      duration: DURATION_FAST,
      ease: EASE,
      overwrite: 'auto',
    });
  };

  const handleMouseLeave = () => {
    if (shouldReduceMotion()) return;

    const el = magneticRef.current;
    if (!el) return;

    // Spring back on leave
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: DURATION_FAST,
      ease: EASE_EXPO,
      overwrite: 'auto',
    });
  };

  return (
    <div
      ref={magneticRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block will-change-transform ${className}`}
    >
      {children}
    </div>
  );
}

