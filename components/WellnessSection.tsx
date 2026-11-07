'use client';

import Image from 'next/image';
import LightSweep from '@/components/LightSweep';

interface WellnessOffering {
  id: string;
  name: string;
  description: string;
  spec: string;
  aspect: 'aspect-[3/4]' | 'aspect-[4/5]';
  image: string;
}

const OFFERINGS: WellnessOffering[] = [
  {
    id: 'salt',
    name: 'Himalayan salt room',
    description: 'Dry saline halotherapy bricks calming mucosal airways in amber light.',
    spec: '45 min · 24°C',
    aspect: 'aspect-[4/5]',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'sauna',
    name: 'Infrared cedar sauna',
    description: 'Gentle full-spectrum wavelengths encouraging deep muscular release.',
    spec: '20 min · 65°C',
    aspect: 'aspect-[3/4]',
    image: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'plunge',
    name: 'Cold plunge pool',
    description: 'Chilled mineral hydrotherapy restoring systemic vascular tone.',
    spec: '3 min · 6°C',
    aspect: 'aspect-[4/5]',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'compression',
    name: 'Compression lounge',
    description: 'Pneumatic lymphatic boots easing lower-body recovery in quiet stillness.',
    spec: '30 min · Lounge',
    aspect: 'aspect-[3/4]',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=1000&q=85',
  },
];

export default function WellnessSection() {
  return (
    <section
      id="wellness"
      className="relative w-full border-t border-[var(--hairline)] bg-[var(--surface)] py-[var(--section-y)] px-[var(--pad-x)] overflow-hidden"
    >
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="border-b border-[var(--hairline)] pb-6 mb-16 flex items-end justify-between">
          <h2 className="font-display text-3 font-light text-[var(--bone)]">
            Recover.
          </h2>
          <span className="type-label text-[0.68rem] text-[var(--champagne)]">
            Restoration
          </span>
        </div>

        {/* Light Sweep statement */}
        <div className="mb-20 max-w-3xl">
          <LightSweep
            text="What you do after the session decides what the session was worth."
            as="p"
            size="step-2"
            align="left"
            className="text-[var(--bone)]"
          />
        </div>

        {/* 2-Column Asymmetric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
          {OFFERINGS.map((item, idx) => (
            <div
              key={item.id}
              className={`group flex flex-col ${idx % 2 === 1 ? 'md:mt-12' : ''}`}
            >
              <div
                className={`relative w-full ${item.aspect} overflow-hidden bg-[var(--ink)] mb-4 rounded-[2px]`}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{
                    filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/70 via-transparent to-transparent pointer-events-none"
                />

                <div className="absolute top-4 left-4 bg-[var(--ink)]/80 backdrop-blur-md px-3 py-1 text-label text-[0.62rem] text-[var(--champagne)] font-mono">
                  {item.spec}
                </div>
              </div>

              <h3 className="font-display text-2 font-light text-[var(--bone)] mb-1">
                {item.name}
              </h3>
              <p className="type-body text-0 text-[var(--bone-dim)] font-light leading-relaxed max-w-[45ch]">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Booking Note */}
        <div className="mt-16 border-t border-[var(--hairline)] pt-6 flex items-center justify-between">
          <p className="type-body text-step--1 text-[var(--bone-dim)]">
            Hydrothermal suite available daily for all guests.
          </p>

          <a
            href="https://wa.me/919999999999?text=Hi%20Vyomi%20%E2%80%94%20I'd%20like%20to%20inquire%20about%20a%20wellness%20session."
            target="_blank"
            rel="noopener noreferrer"
            className="text-label text-[0.68rem] text-[var(--bone)] hover:text-[var(--champagne)] transition-colors inline-flex items-center space-x-1"
          >
            <span>Reserve recovery</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}
