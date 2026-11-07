'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface Discipline {
  id: string;
  index: string;
  name: string;
  tagline: string;
  description: string;
  chips: string[];
  duration: string;
  intensity: string;
  nextSession: string;
  image: string;
  gradeFilter: string;
  chipAccentClass?: string;
}

const DISCIPLINES: Discipline[] = [
  {
    id: 'fitness',
    index: '01',
    name: 'FITNESS',
    tagline: 'PRECISE · TECHNICAL · NEUROMUSCULAR',
    description:
      'Hyper-calibrated strength and conditioning engineered around structural biomechanics, periodised kinetic loading, and Olympic bar speed telemetry.',
    chips: ['PANATTA MONOLITH', '60 MIN', 'COACHED 1:1'],
    duration: '60 MIN',
    intensity: 'HIGH / VARIABLE',
    nextSession: 'TODAY · 17:30 IST',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=85',
    gradeFilter: 'grayscale(0.7) contrast(1.15) brightness(0.9)',
  },
  {
    id: 'hyrox',
    index: '02',
    name: 'HYROX',
    tagline: 'COMPETITIVE · RELENTLESS · CALIBRATED',
    description:
      'Official competition simulations featuring 8 functional endurance stations, weighted sled pacing, SkiErg intervals, and continuous lactate threshold conditioning.',
    chips: ['8 STATIONS', '60 MIN', 'COMPETITION SPEC'],
    duration: '60 MIN',
    intensity: 'MAXIMUM LACTATE',
    nextSession: 'TOMORROW · 06:00 IST',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1600&q=85',
    gradeFilter: 'grayscale(0.65) contrast(1.25) brightness(0.85)',
    chipAccentClass: 'border-[var(--panatta)] text-[var(--panatta)]',
  },
  {
    id: 'pilates',
    index: '03',
    name: 'PILATES',
    tagline: 'CONTROLLED · EXACT · DECOMPRESSIVE',
    description:
      'Reformer kinetics dedicated to spinal articulation, deep transverse core engagement, eccentric deceleration, and athletic hip mobility.',
    chips: ['REFORMER LAB', '50 MIN', 'MAX 8 FELLOWS'],
    duration: '50 MIN',
    intensity: 'MODERATE / DEEP TENSION',
    nextSession: 'TODAY · 18:30 IST',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1600&q=85',
    gradeFilter: 'grayscale(0.55) contrast(1.08) brightness(0.95)',
  },
  {
    id: 'zumba',
    index: '04',
    name: 'ZUMBA',
    tagline: 'SOCIAL · RHYTHMIC · HIGH FREQUENCY',
    description:
      'Polyrhythmic cardiovascular conditioning driven by acoustic sound dampening, dynamic footwork drills, and sustained aerobic output.',
    chips: ['CHOREOGRAPHED', '55 MIN', 'HIGH OUTPUT'],
    duration: '55 MIN',
    intensity: 'HIGH CARDIO',
    nextSession: 'WEDNESDAY · 19:15 IST',
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=1600&q=85',
    gradeFilter: 'grayscale(0.35) contrast(1.1) brightness(0.92)',
    chipAccentClass: 'border-[var(--champagne)] text-[var(--champagne)]',
  },
  {
    id: 'wellness',
    index: '05',
    name: 'WELLNESS',
    tagline: 'QUIET · RESTORATIVE · THERMAL',
    description:
      'Subterranean contrast hydrotherapy, Himalayan salt micro-particle aerosol, 90°C Nordic dry heat, and sub-zero cellular vasoconstriction.',
    chips: ['SALT SANCTUARY', 'COLD PLUNGE', 'RESTORATIVE'],
    duration: '45 MIN',
    intensity: 'PARASYMPATHETIC RESET',
    nextSession: 'DAILY · OPEN ACCESS',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1600&q=85',
    gradeFilter: 'grayscale(0.5) contrast(1.05) brightness(0.8) sepia(0.12)',
  },
];

export default function StudioSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDiscipline = DISCIPLINES[activeIndex];

  return (
    <section
      id="studio"
      className="relative h-[100svh] w-full overflow-hidden bg-[var(--ink)] flex items-center border-t border-[var(--hairline)]"
      role="region"
      aria-label="The Studio Disciplines"
    >
      {/* Media Stage (Full-bleed background) */}
      <div className="absolute inset-0 z-0 h-full w-full">
        {DISCIPLINES.map((item, idx) => {
          const isSelected = idx === activeIndex;
          return (
            <div
              key={item.id}
              className={`absolute inset-0 h-full w-full transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isSelected ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              <Image
                src={item.image}
                alt={`${item.name} session at Vyomi Fitness Club`}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover transition-transform duration-1000 ease-out"
                style={{
                  filter: item.gradeFilter,
                }}
              />
              {/* Density gradient behind left sidebar */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-r from-[#070707]/90 via-[#070707]/60 to-transparent pointer-events-none"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent pointer-events-none"
              />
            </div>
          );
        })}
      </div>

      {/* Ghosted Index Number Top-Right (01-05 at clamp(6rem, 14vw, 16rem)) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-6 right-[var(--pad-x)] z-10 select-none font-display font-semibold text-[clamp(6rem,14vw,16rem)] text-[var(--bone)] opacity-[0.08] leading-none"
      >
        {activeDiscipline.index}
      </div>

      {/* Glass Panel Sidebar (Left: 340px wide, 32px from left edge, vertically centred, ~70vh tall) */}
      <aside
        className="relative z-20 hidden lg:flex flex-col justify-between w-[340px] ml-8 h-[70vh] p-6 rounded-[2px]"
        style={{
          background: 'var(--glass)',
          backdropFilter: 'blur(30px) saturate(1.35)',
          WebkitBackdropFilter: 'blur(30px) saturate(1.35)',
          border: '1px solid rgba(242, 239, 234, 0.12)',
          boxShadow: 'inset 0 1px 0 rgba(242, 239, 234, 0.15)',
        }}
      >
        {/* Panel Header */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="type-label text-[var(--bone-dim)] tracking-[0.2em]">THE STUDIO</span>
            <span className="type-label font-mono text-[0.65rem] text-[var(--champagne)]">5 DISCIPLINES</span>
          </div>
          <div className="h-px w-full bg-[var(--hairline)]" />
        </div>

        {/* 5 Rows */}
        <div role="tablist" className="flex flex-col my-auto divide-y divide-[var(--hairline)]">
          {DISCIPLINES.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${item.id}`}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`group relative flex items-center justify-between py-4 px-2 text-left transition-all duration-300 focus:outline-none ${
                  isActive ? 'bg-[rgba(242,239,234,0.04)] pl-3' : 'hover:translate-x-2'
                }`}
              >
                {/* Active Champagne Indicator Bar on Left */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-[var(--champagne)]" />
                )}

                <div className="flex items-center space-x-3">
                  <span className="font-mono text-[0.75rem] text-[var(--bone-dim)] w-[26px]">
                    {item.index}
                  </span>
                  <span
                    className={`font-display text-2 uppercase font-medium tracking-tight transition-colors ${
                      isActive
                        ? 'text-[var(--bone)]'
                        : 'text-[var(--bone-dim)] opacity-50 group-hover:text-[var(--bone)] group-hover:opacity-100'
                    }`}
                  >
                    {item.name}
                  </span>
                </div>

                <span
                  className={`text-[0.8rem] transition-opacity ${
                    isActive ? 'opacity-100 text-[var(--champagne)]' : 'opacity-0 group-hover:opacity-60 text-[var(--bone)]'
                  }`}
                >
                  ↗
                </span>
              </button>
            );
          })}
        </div>

        {/* Below List: Live Operational Readout */}
        <div className="border-t border-[var(--hairline)] pt-4 text-label text-[0.68rem] text-[var(--bone-dim)] flex flex-col space-y-2">
          <div className="flex justify-between">
            <span>INTENSITY</span>
            <span className="text-[var(--bone)] tabular-nums">{activeDiscipline.intensity}</span>
          </div>
          <div className="flex justify-between">
            <span>NEXT SESSION</span>
            <span className="text-[var(--bone)] font-mono">{activeDiscipline.nextSession}</span>
          </div>
          <a
            href="#timetable"
            className="inline-flex items-center space-x-1 pt-1 text-[var(--champagne)] hover:underline"
          >
            <span>VIEW SCHEDULE</span>
            <span>↗</span>
          </a>
        </div>
      </aside>

      {/* Overlaid Bottom-Right Content at --pad-x */}
      <div
        id={`panel-${activeDiscipline.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeDiscipline.id}`}
        className="relative z-20 ml-auto mr-[var(--pad-x)] mt-auto mb-16 max-w-[42ch] flex flex-col items-start px-6 lg:px-0"
      >
        <span className="type-label text-[var(--champagne)] mb-2 tracking-[0.2em]">
          {activeDiscipline.tagline}
        </span>

        <h3 className="font-display text-4 font-semibold uppercase text-[var(--bone)] leading-none mb-4">
          {activeDiscipline.name}
        </h3>

        <p className="type-body text-0 text-[var(--bone-dim)] font-light leading-relaxed mb-6">
          {activeDiscipline.description}
        </p>

        {/* Three Spec Chips inside 1px hairline frames */}
        <div className="flex flex-wrap items-center gap-2.5">
          {activeDiscipline.chips.map((chip, cIdx) => (
            <span
              key={cIdx}
              className={`border border-[var(--hairline)] bg-[var(--surface)]/80 backdrop-blur-md px-3 py-1.5 rounded-[2px] text-label text-[0.65rem] text-[var(--bone)] font-mono ${
                activeDiscipline.chipAccentClass || ''
              }`}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

