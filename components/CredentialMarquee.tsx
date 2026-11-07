'use client';

import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const ITEMS = [
  'Panatta equipped',
  'Hyrox ready',
  'Olympic platform',
  'Himalayan salt room',
  'Contrast hydrotherapy',
  'Reformer pilates',
  'Private coaching',
  'Restorative recovery',
];

export default function CredentialMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let xPos = 0;
    const baseSpeed = 0.6;
    let currentSpeed = baseSpeed;

    const onScroll = () => {
      const getVel = (ScrollTrigger as unknown as { getVelocity?: () => number }).getVelocity;
      const velocity = typeof getVel === 'function' ? getVel() : 0;
      const addedSpeed = Math.min(Math.abs(velocity) / 400, 2.5);
      currentSpeed = baseSpeed + addedSpeed;
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    let isPaused = false;
    const onEnter = () => (isPaused = true);
    const onLeave = () => (isPaused = false);
    track.addEventListener('mouseenter', onEnter);
    track.addEventListener('mouseleave', onLeave);

    let rafId: number;
    const animate = () => {
      if (!isPaused) {
        currentSpeed += (baseSpeed - currentSpeed) * 0.05;
        xPos -= currentSpeed;
        const halfWidth = track.scrollWidth / 2;
        if (Math.abs(xPos) >= halfWidth) {
          xPos = 0;
        }
        track.style.transform = `translate3d(${xPos}px, 0, 0)`;
      }
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', onScroll);
      track.removeEventListener('mouseenter', onEnter);
      track.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative z-20 h-20 w-full border-t border-b border-[var(--hairline)] bg-[var(--ink)] overflow-hidden flex items-center select-none">
      <div
        ref={trackRef}
        className="flex items-center whitespace-nowrap will-change-transform cursor-pointer"
      >
        {[...Array(2)].map((_, setIdx) => (
          <div key={setIdx} className="flex items-center space-x-10 pr-10">
            {ITEMS.map((item, itemIdx) => (
              <div key={itemIdx} className="flex items-center space-x-10">
                <span className="font-display text-1 font-light text-[var(--bone-dim)] hover:text-[var(--bone)] transition-colors">
                  {item}
                </span>
                <span className="h-1 w-1 rotate-45 bg-[var(--champagne)]/60 flex-shrink-0" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
