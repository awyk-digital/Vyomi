'use client';

import { useState } from 'react';
import Image from 'next/image';
import SplitText from '@/components/SplitText';
import Reveal from '@/components/Reveal';
import Magnetic from '@/components/Magnetic';
import { ArrowUpRight } from '@/components/Icons';

interface EquipmentItem {
  id: string;
  category: string;
  name: string;
  origin: string;
  spec: string;
  details: string;
  image: string;
  telemetry: {
    load: string;
    tolerance: string;
    vector: string;
  };
}

const PANATTA_COLLECTION: EquipmentItem[] = [
  {
    id: 'panatta-01',
    category: 'MONOLITH SERIES',
    name: 'MONOLITH SUPER SQUAT',
    origin: 'APIRO, ITALY · PANATTA BESPOKE',
    spec: 'LINEAR BEARING GUIDE · CONVERGENT PIVOT',
    details:
      'Engineered specifically with variable resistance cams to align directly with the human quadriceps torque curve. Upholstered in full-grain cognac saddle leather with matte anthracite carbon steel frame.',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=85',
    telemetry: {
      load: '450 KG MAX',
      tolerance: '±0.02 MM',
      vector: '32° BIOMECHANICAL ANGLE',
    },
  },
  {
    id: 'panatta-02',
    category: 'FREEWEIGHT LINE',
    name: 'DUAL LINEAR LEG PRESS',
    origin: 'APIRO, ITALY · PANATTA BESPOKE',
    spec: 'INDEPENDENT BILATERAL CARRIAGES',
    details:
      'Eliminates left-right dominance discrepancies through fully segregated carriage systems. Integrated hydraulic disengagement and knurled aircraft-grade aluminium footplates.',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=85',
    telemetry: {
      load: '600 KG MAX',
      tolerance: '±0.01 MM',
      vector: '45° TRUE VECTOR',
    },
  },
  {
    id: 'panatta-03',
    category: 'CABLE ARCHITECTURE',
    name: 'MULTI-FLIGHT PULLEY TOWER',
    origin: 'APIRO, ITALY · PANATTA SPECIAL EDITION',
    spec: 'AERONAUTICAL DURALUMIN PULLEYS',
    details:
      'Ultra-fluid transmission with zero initial drag. 1:1 and 2:1 ratio selectors allow hyper-accurate micro-loading down to 0.5kg increments for rotator cuff and kinetic chain rehabilitation.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=1200&q=85',
    telemetry: {
      load: '120 KG / STACK',
      tolerance: 'ZERO DRAG',
      vector: '360° MULTI-AXIS',
    },
  },
];

export default function EquipmentSection() {
  const [activeItem, setActiveItem] = useState<EquipmentItem>(PANATTA_COLLECTION[0]);

  return (
    <section id="floor" className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)] py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Section Header with Panatta Crimson Accent */}
        <div className="flex flex-col items-start md:flex-row md:items-end md:justify-between border-b border-[var(--hairline)] pb-8 mb-16">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              {/* Panatta Crimson Accent used exclusively in this section */}
              <span className="h-2 w-2 bg-[var(--panatta)]" />
              <span className="type-label text-[var(--panatta)] tracking-[0.2em] font-medium">
                OFFICIAL PANATTA BESPOKE INSTALLATION
              </span>
            </div>
            <SplitText as="h2" className="font-display text-4 font-semibold uppercase text-[var(--bone)]">
              THE PANATTA FLOOR
            </SplitText>
          </div>
          <div className="mt-4 md:mt-0 text-left md:text-right">
            <span className="type-label block font-mono text-[var(--bone-dim)]">APIRO, MARCHE · ITALIA</span>
            <span className="type-label text-[0.65rem] text-[var(--bone-dim)]">
              HAND-CRAFTED BIOMECHANICAL APPARATUS
            </span>
          </div>
        </div>

        {/* Narrative Intro */}
        <Reveal delay={0.15} className="mb-16">
          <p className="type-body text-1 text-[var(--bone)] font-light max-w-3xl">
            V CLUB is equipped exclusively with bespoke editions from <strong className="font-medium text-[var(--bone)]">Panatta Sport</strong>, the legendary Italian artisanal manufacturer whose machines replicate exact joint articulation. Hand-welded in Apiro, Italy.
          </p>
        </Reveal>

        {/* Main Interactive Showcase */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
          {/* Left Column: Equipment Selector List */}
          <div className="flex flex-col space-y-3 lg:col-span-5">
            <span className="type-label mb-2 text-[var(--bone-dim)]">SELECT APPARATUS</span>
            {PANATTA_COLLECTION.map((item, index) => {
              const isSelected = item.id === activeItem.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItem(item)}
                  className={`group relative flex flex-col items-start border p-6 text-left transition-all ${
                    isSelected
                      ? 'border-[var(--panatta)] bg-[var(--surface)]'
                      : 'border-[var(--hairline)] bg-transparent hover:border-[var(--bone-dim)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <div className="flex w-full items-center justify-between mb-2">
                    <span
                      className={`type-label text-[0.68rem] transition-colors ${
                        isSelected ? 'text-[var(--panatta)]' : 'text-[var(--bone-dim)]'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="type-label font-mono text-[0.65rem] tabular-nums text-[var(--bone-dim)]">
                      0{index + 1} / 03
                    </span>
                  </div>

                  <h3 className="font-display text-1 font-medium text-[var(--bone)] group-hover:text-[var(--bone)]">
                    {item.name}
                  </h3>

                  <p className="type-label mt-2 text-[0.68rem] text-[var(--bone-dim)]">
                    {item.spec}
                  </p>
                </button>
              );
            })}

            {/* Panatta Credo Stamp */}
            <div className="mt-6 border border-[var(--hairline)] p-6 bg-[var(--surface-2)]">
              <span className="type-label block mb-2 text-[var(--panatta)]">CERTIFICATE OF ORIGIN</span>
              <p className="type-body text-bone-dim text-0 text-[0.85rem]">
                Every single machine at V CLUB carries a serialised chassis plate, custom weighted resistance curves, and acoustic dampening to preserve quiet sanctuary operations.
              </p>
            </div>
          </div>

          {/* Right Column: Active Machine Detail & Image Stage */}
          <div className="lg:col-span-7">
            <div className="border border-[var(--hairline)] bg-[var(--surface)] p-6 md:p-8">
              {/* Image Frame */}
              <div className="relative aspect-[16/10] w-full overflow-hidden border border-[var(--hairline)] bg-[var(--ink)] mb-8">
                <Image
                  key={activeItem.id}
                  src={activeItem.image}
                  alt={`${activeItem.name} handcrafted by Panatta Sport in Italy`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover opacity-90 transition-all duration-700 ease-out hover:scale-105"
                />
                <div className="absolute top-4 left-4 border border-[var(--panatta)] bg-[var(--ink)]/90 px-3 py-1 text-label text-[var(--panatta)]">
                  PANATTA SPECIAL EDITION
                </div>
                <div className="absolute bottom-4 right-4 bg-[var(--ink)]/90 px-3 py-1 text-label text-[var(--bone-dim)] font-mono">
                  {activeItem.origin}
                </div>
              </div>

              {/* Machine Specs and Telemetry */}
              <div className="flex flex-col space-y-6">
                <div>
                  <span className="type-label text-[var(--panatta)] block mb-1">
                    {activeItem.category}
                  </span>
                  <h3 className="font-display text-2 font-medium text-[var(--bone)]">
                    {activeItem.name}
                  </h3>
                  <p className="type-body text-bone-dim text-0 mt-3 max-w-prose">
                    {activeItem.details}
                  </p>
                </div>

                {/* Telemetry Metrics Grid */}
                <div className="grid grid-cols-3 gap-4 border-t border-[var(--hairline)] pt-6">
                  <div>
                    <span className="type-label text-[var(--bone-dim)] block mb-1">MAX CAPACITY</span>
                    <span className="font-display text-1 font-semibold text-[var(--bone)] tabular-nums">
                      {activeItem.telemetry.load}
                    </span>
                  </div>

                  <div>
                    <span className="type-label text-[var(--bone-dim)] block mb-1">TOLERANCE</span>
                    <span className="font-display text-1 font-semibold text-[var(--bone)] tabular-nums">
                      {activeItem.telemetry.tolerance}
                    </span>
                  </div>

                  <div>
                    <span className="type-label text-[var(--bone-dim)] block mb-1">ANGLE VECTOR</span>
                    <span className="font-display text-1 font-semibold text-[var(--bone)] tabular-nums">
                      {activeItem.telemetry.vector}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
