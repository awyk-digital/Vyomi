'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface EquipmentGroup {
  number: string;
  title: string;
  subtitle: string;
  image: string;
  items: string[];
}

const GROUPS: EquipmentGroup[] = [
  {
    number: '01',
    title: 'Plate loaded',
    subtitle: 'Signature Italian biomechanics',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1400&q=85',
    items: [
      'Monolith Super Squat with linear bearings',
      'Dual Linear Leg Press with independent bilateral carriage',
      'Incline Chest Press with converging vectors',
    ],
  },
  {
    number: '02',
    title: 'Pin loaded',
    subtitle: 'Selectorised precision stacks',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1400&q=85',
    items: [
      'Multi-Flight 360° Cable Station',
      'Seated Leg Curl with variable torque cam',
      'Preacher Bicep Curl with micro-load selector',
    ],
  },
  {
    number: '03',
    title: 'Free weights',
    subtitle: 'Calibrated Swedish steel & platforms',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1400&q=85',
    items: [
      'Vibration-isolated Olympic wood platforms',
      'Calibrated Swedish bumper plates',
      'Milled urethane dumbbells to 50kg',
    ],
  },
  {
    number: '04',
    title: 'Conditioning',
    subtitle: 'Metabolic endurance engines',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1400&q=85',
    items: [
      'Concept2 SkiErgs & RowErgs',
      'Assault AirBikes with precision chain drive',
      'Curved non-motorised slat treadmills',
    ],
  },
];

export default function PanattaSection() {
  const containerRef = useRef<HTMLElement>(null);
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const blocks = el.querySelectorAll<HTMLDivElement>('.panatta-group-block');

    blocks.forEach((block, idx) => {
      ScrollTrigger.create({
        trigger: block,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => setActiveNode(idx),
        onEnterBack: () => setActiveNode(idx),
      });

      const img = block.querySelector('.group-img');
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.05, opacity: 0.8 },
          {
            scale: 1.0,
            opacity: 1,
            duration: 1.0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: block,
              start: 'top 75%',
              once: true,
            },
          }
        );
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (el.contains(st.trigger as Node)) st.kill();
      });
    };
  }, []);

  return (
    <section
      id="floor"
      ref={containerRef}
      className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)]"
    >
      <div className="flex flex-col lg:flex-row w-full">
        {/* Left Sticky Column (40% width) */}
        <div className="w-full lg:w-[40%] lg:h-screen lg:sticky lg:top-0 px-[var(--pad-x)] py-16 lg:py-24 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[var(--hairline)] bg-[var(--ink)] z-20">
          <div>
            <span className="type-label block text-[var(--bone-dim)] mb-3 tracking-[0.22em]">
              The floor
            </span>

            <h2 className="font-display text-3 font-light text-[var(--bone)] leading-tight mb-5">
              Panatta. Nothing else.
            </h2>

            {/* Max 2 lines per paragraph */}
            <p className="type-body text-0 text-[var(--bone-dim)] font-light leading-relaxed mb-6">
              Handcrafted in Apiro, Italy, Panatta provides natural joint articulation and fluid resistance curves.
            </p>

            {/* Muted Panatta red badge */}
            <div className="inline-flex items-center space-x-2 border border-[var(--panatta)] px-3 py-1.5 rounded-[2px] bg-[var(--panatta)]/5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--panatta)]" />
              <span className="type-label text-[0.65rem] text-[var(--panatta)]">
                Italian engineered
              </span>
            </div>
          </div>

          {/* Indicator Track */}
          <div className="hidden lg:flex items-center space-x-4 pt-10">
            <div className="relative h-20 w-px bg-[var(--hairline)] flex flex-col justify-between py-1">
              {[0, 1, 2, 3].map((nodeIdx) => (
                <div
                  key={nodeIdx}
                  className={`h-1.5 w-1.5 -ml-[2.5px] rounded-full transition-all duration-300 ${
                    activeNode === nodeIdx
                      ? 'bg-[var(--panatta)] scale-125'
                      : 'bg-[var(--surface)] border border-[var(--hairline)]'
                  }`}
                />
              ))}
            </div>

            <div className="flex flex-col justify-between h-20 text-label text-[0.65rem] text-[var(--bone-dim)] font-mono">
              {GROUPS.map((g, idx) => (
                <span
                  key={g.number}
                  className={`transition-colors duration-300 ${
                    activeNode === idx ? 'text-[var(--bone)]' : 'text-[var(--bone-dim)] opacity-40'
                  }`}
                >
                  {g.number} · {g.title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Scrolling Column (60% width) */}
        <div className="w-full lg:w-[60%] flex flex-col">
          {GROUPS.map((group) => (
            <div
              key={group.number}
              className="panatta-group-block relative min-h-[90vh] border-b border-[var(--hairline)] last:border-b-0 flex flex-col justify-between"
            >
              {/* 4/5 Aspect Image with soft grade */}
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--surface)]">
                <Image
                  src={group.image}
                  alt={group.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="group-img object-cover transition-transform duration-700 ease-out"
                  style={{
                    filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-transparent to-transparent pointer-events-none"
                />

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="font-mono text-step--1 text-[var(--panatta)] block mb-1">
                      {group.number}
                    </span>
                    <h3 className="font-display text-2 font-light text-[var(--bone)] leading-none">
                      {group.title}
                    </h3>
                  </div>
                  <span className="type-label text-[0.65rem] text-[var(--bone-dim)] font-mono hidden sm:block">
                    {group.subtitle}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="px-6 lg:px-10 py-6 bg-[var(--ink)]">
                <div className="flex flex-col divide-y divide-[var(--hairline)]">
                  {group.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="py-3 flex items-center justify-between text-[0.9rem] text-[var(--bone-dim)] font-light">
                      <span>{item}</span>
                      <span className="type-label text-[0.62rem] text-[var(--bone-dim)] font-mono ml-4 flex-shrink-0">
                        {group.number}.0{itemIdx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
