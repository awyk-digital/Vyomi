'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { value: 18000, suffix: ' sq ft', label: 'Sanctuary area' },
  { value: 40, suffix: '+', label: 'Weekly sessions' },
  { value: 12, suffix: '', label: 'Accredited coaches' },
  { value: 1, suffix: ' of 1', label: 'Exclusive floor' },
];

export default function StatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const targets = el.querySelectorAll<HTMLSpanElement>('.stat-counter');

    targets.forEach((target, i) => {
      const finalVal = STATS[i].value;
      const counter = { val: 0 };

      gsap.to(counter, {
        val: finalVal,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          if (target) {
            target.textContent = Math.floor(counter.val).toLocaleString('en-US');
          }
        },
      });
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full border-t border-b border-[var(--hairline)] bg-[var(--ink)] py-14 px-[var(--pad-x)]"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-y-10 lg:gap-y-0">
        {STATS.map((item, idx) => (
          <div
            key={item.label}
            className={`flex flex-col items-start px-4 md:px-8 ${
              idx !== 0 ? 'lg:border-l lg:border-[var(--hairline)]' : ''
            } ${idx % 2 === 1 ? 'border-l border-[var(--hairline)] lg:border-l' : ''}`}
          >
            <div className="font-display text-3 font-light text-[var(--bone)] tabular-nums leading-none mb-2">
              <span className="stat-counter">{item.value.toLocaleString('en-US')}</span>
              <span className="text-2 font-light">{item.suffix}</span>
            </div>
            <span className="type-label text-[0.68rem] text-[var(--bone-dim)]">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
