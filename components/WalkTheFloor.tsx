'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Zone {
  id: string;
  name: string;
  description: string;
  area: string;
  image: string;
}

const ZONES: Zone[] = [
  {
    id: 'zone-1',
    name: 'Reception & lounge',
    description: 'Blackened steel desk, backlit onyx, and quiet acoustic timber panels.',
    area: '2,400 sq ft',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'zone-2',
    name: 'Strength floor',
    description: 'Italian Panatta Monolith apparatus and vibration-isolated Olympic platforms.',
    area: '6,200 sq ft',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'zone-3',
    name: 'Reformer studio',
    description: 'Allegro II reformers positioned beside daylight sheers in a peaceful hall.',
    area: '1,800 sq ft',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'zone-4',
    name: 'Recovery suite',
    description: 'Himalayan salt room, dry cedar sauna, and chilled contrast plunge pools.',
    area: '2,600 sq ft',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1920&q=85',
  },
];

export default function WalkTheFloor() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeZone = ZONES[activeIndex];

  return (
    <section className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)] py-20 px-[var(--pad-x)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between border-b border-[var(--hairline)] pb-6">
          <div>
            <span className="type-label block text-[var(--bone-dim)] mb-2 tracking-[0.22em]">
              The space
            </span>
            <h2 className="font-display text-3 font-light text-[var(--bone)]">
              Walk the floor.
            </h2>
          </div>
          <span className="type-label font-mono text-[0.68rem] text-[var(--bone-dim)]">
            Architectural layout
          </span>
        </div>

        {/* 16/9 Frame with soft grade */}
        <div className="relative w-full aspect-[16/9] max-h-[70vh] overflow-hidden bg-[var(--surface)] rounded-[2px] mb-8">
          {ZONES.map((zone, idx) => (
            <div
              key={zone.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                idx === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <Image
                src={zone.image}
                alt={zone.name}
                fill
                sizes="100vw"
                className="object-cover"
                style={{
                  filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-transparent to-transparent pointer-events-none"
              />
            </div>
          ))}

          <div className="absolute bottom-6 left-6 right-6 z-20 flex items-center justify-between">
            <span className="type-label text-[0.68rem] text-[var(--bone)] font-mono">
              0{activeIndex + 1} / 04
            </span>
            <span className="type-label text-[0.68rem] text-[var(--champagne)]">
              {activeZone.name}
            </span>
          </div>
        </div>

        {/* Zone Selector buttons and area indicator */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[var(--hairline)] pt-6">
          {ZONES.map((zone, idx) => (
            <button
              key={zone.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className="group flex flex-col items-start text-left focus:outline-none"
            >
              <span className="font-mono text-step--1 text-[var(--bone-dim)] mb-1">
                0{idx + 1}
              </span>
              <span
                className={`font-display text-1 font-light transition-colors ${
                  idx === activeIndex ? 'text-[var(--bone)]' : 'text-[var(--bone-dim)] opacity-50 group-hover:opacity-100'
                }`}
              >
                {zone.name}
              </span>
              <p className="type-body text-step--1 text-[var(--bone-dim)] font-light mt-1">
                {zone.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
