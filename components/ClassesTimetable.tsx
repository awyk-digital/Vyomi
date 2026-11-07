'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SCHEDULE_DATA, CLASS_CATEGORIES, WEEK_DAYS } from '@/data/schedule';

const FEATURED_CLASSES = [
  {
    name: 'Hyrox conditioning',
    duration: '60 min',
    intensity: 'High output',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=85',
  },
  {
    name: 'Reformer pilates',
    duration: '50 min',
    intensity: 'Controlled',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=85',
  },
  {
    name: 'Strength fundamentals',
    duration: '60 min',
    intensity: 'Calibrated',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=85',
  },
  {
    name: 'Mobility & recovery',
    duration: '45 min',
    intensity: 'Restorative',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=85',
  },
];

export default function ClassesTimetable() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('MON');

  return (
    <section id="timetable" className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)] py-20 px-[var(--pad-x)]">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-[var(--hairline)] pb-6 mb-12 flex flex-col md:flex-row md:items-end md:justify-between">
          <div>
            <span className="type-label block text-[var(--bone-dim)] mb-2 tracking-[0.22em]">
              The schedule
            </span>
            <h2 className="font-display text-3 font-light text-[var(--bone)]">
              Weekly timetable
            </h2>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {CLASS_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`border px-3 py-1 rounded-[2px] text-label text-[0.65rem] transition-colors ${
                  activeCategory === cat
                    ? 'border-[var(--bone)] bg-[var(--bone)] text-[var(--ink)]'
                    : 'border-[var(--hairline)] text-[var(--bone-dim)] hover:text-[var(--bone)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Featured 4 disciplines horizontal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {FEATURED_CLASSES.map((cls, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)] rounded-[2px] group"
            >
              <Image
                src={cls.image}
                alt={cls.name}
                fill
                sizes="300px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                style={{
                  filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
                }}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-[var(--ink)]/30 to-transparent"
              />

              <div className="absolute bottom-5 left-5 right-5">
                <span className="type-label text-[0.62rem] text-[var(--champagne)] block mb-1">
                  {cls.intensity}
                </span>
                <h3 className="font-display text-1 font-light text-[var(--bone)] mb-1">
                  {cls.name}
                </h3>
                <span className="type-label text-[0.65rem] text-[var(--bone-dim)] font-mono">
                  {cls.duration}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Day Selector for schedule */}
        <div className="flex overflow-x-auto space-x-2 border-b border-[var(--hairline)] pb-4 mb-6">
          {WEEK_DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-1.5 rounded-[2px] text-label text-[0.7rem] font-mono ${
                selectedDay === day
                  ? 'border border-[var(--bone)] text-[var(--bone)]'
                  : 'text-[var(--bone-dim)] opacity-40 hover:opacity-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Schedule List for Selected Day */}
        <div className="divide-y divide-[var(--hairline)] border-b border-[var(--hairline)]">
          {SCHEDULE_DATA.filter((s) => s.day === selectedDay).map((session) => {
            const matchesFilter =
              activeCategory === 'ALL' || session.category === activeCategory;
            return (
              <div
                key={session.id}
                className={`py-4 flex items-center justify-between transition-opacity ${
                  matchesFilter ? 'opacity-100' : 'opacity-20'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-mono text-[0.75rem] text-[var(--champagne)] tabular-nums">
                      {session.time}
                    </span>
                    <span className="type-label text-[0.62rem] text-[var(--bone-dim)]">
                      {session.duration}
                    </span>
                  </div>
                  <p className="font-display text-1 font-light text-[var(--bone)]">
                    {session.name}
                  </p>
                  <span className="type-label text-[0.65rem] text-[var(--bone-dim)] mt-0.5 block">
                    Coach {session.coach}
                  </span>
                </div>

                <a
                  href={`https://wa.me/919999999999?text=Hi%20Vyomi%20%E2%80%94%20I'd%20like%20to%20reserve%20a%20place%20in%20${encodeURIComponent(
                    session.name
                  )}%20on%20${session.day}%20at%20${session.time}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-[var(--hairline)] px-3 py-1.5 text-label text-[0.65rem] text-[var(--bone)] hover:border-[var(--bone-dim)] transition-colors"
                >
                  Reserve ↗
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
