'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface StudioSectionData {
  id: string;
  index: string;
  name: string;
  headline: string;
  subheadline: string;
  paragraphs: string[];
  pillars: string[];
  specs: { label: string; value: string }[];
  schedule: string;
  image: string;
}

const SECTIONS: StudioSectionData[] = [
  {
    id: 'fitness',
    index: '01',
    name: 'Fitness',
    headline: 'Biomechanical purity.',
    subheadline: 'Movement calibrated to natural joint articulation and structural longevity.',
    paragraphs: [
      'Our physical floor rejects arbitrary fatigue. Training is arranged around purposeful kinetic pathways using bespoke Italian Panatta Monolith apparatus.',
      'Variable resistance cams match your muscles’ natural torque curves throughout each repetition, producing maximal recruitment with zero destructive joint compression.',
      'Every session is monitored with velocity telemetry, ensuring you build dense, functional strength while preserving structural longevity for life outside the floor.',
    ],
    pillars: [
      'Panatta Monolith circular torque cams',
      'Velocity loss tracking under 10%',
      'Active physical therapist review',
    ],
    specs: [
      { label: 'APPARATUS', value: 'Panatta Monolith' },
      { label: 'DURATION', value: '60 Minutes' },
      { label: 'INTENSITY', value: 'Calibrated High' },
    ],
    schedule: 'Monday · Wednesday · Friday · 06:00 & 17:30',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'hyrox',
    index: '02',
    name: 'Hyrox',
    headline: 'Unrelenting pace.',
    subheadline: 'Official race conditioning, pacing economics, and lactate threshold control.',
    paragraphs: [
      'As an official training facility in Vijayawada, we deliver competition-grade Hyrox preparation. Sessions simulate the full 8-station race sequence under controlled conditions.',
      'Work across dedicated weighted sled alleys, Concept2 SkiErgs, rowing stations, and wall-ball targets, structured to expand aerobic work capacity.',
      'Our coaches emphasize pacing economics and lactate clearance, so you develop the physical stamina to sustain high wattage under fatigue without redlining.',
    ],
    pillars: [
      '8 official competition sled & erg stations',
      'Lactate threshold heart rate pacing',
      'Team & individual simulation heats',
    ],
    specs: [
      { label: 'STATIONS', value: '8 Competition Stations' },
      { label: 'DURATION', value: '60 Minutes' },
      { label: 'INTENSITY', value: 'High Lactate' },
    ],
    schedule: 'Tuesday · Thursday · Saturday · 06:30 & 18:00',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'pilates',
    index: '03',
    name: 'Pilates',
    headline: 'Spinal decompression.',
    subheadline: 'Classical reformer sequences cultivating rotational tone and deep core stability.',
    paragraphs: [
      'Set in a serene studio filled with soft natural light, our reformer practice emphasizes postural alignment and pelvic stabilization under progressive spring tension.',
      'Using Balanced Body Allegro II reformers with integrated tower resistance, sequences stretch and strengthen simultaneously, decompressing spinal discs.',
      'Class sizes are strictly capped at eight guests to ensure each member receives hands-on anatomical guidance from certified classical instructors.',
    ],
    pillars: [
      'Allegro II custom spring carriage tension',
      'Spinal articulation and deep transversus focus',
      'Strict 8-guest intimate cohort cap',
    ],
    specs: [
      { label: 'EQUIPMENT', value: 'Allegro II Reformers' },
      { label: 'DURATION', value: '50 Minutes' },
      { label: 'CAPACITY', value: 'Max 8 Guests' },
    ],
    schedule: 'Daily Sessions · 07:30, 09:00 & 18:30',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'zumba',
    index: '04',
    name: 'Zumba',
    headline: 'Rhythmic flow.',
    subheadline: 'Acoustic cardiovascular movement in an uplifting, shock-absorbed hall.',
    paragraphs: [
      'A joyful cardiovascular journey combining polyrhythmic choreographies with dynamic agility drills on sprung Canadian maple timber flooring.',
      'Our studio features acoustic timber dampening, allowing the music to resonate cleanly without sensory harshness or auditory fatigue.',
      'Designed to elevate heart rate, improve dynamic balance, and leave you mentally revitalized through effortless aerobic expression.',
    ],
    pillars: [
      'Sprung hardwood shock-absorbing floor',
      'Custom acoustic baffle soundstage',
      'Cardiovascular endurance and joy',
    ],
    specs: [
      { label: 'FLOORING', value: 'Sprung Hardwood' },
      { label: 'DURATION', value: '55 Minutes' },
      { label: 'INTENSITY', value: 'Aerobic Cardio' },
    ],
    schedule: 'Monday · Wednesday · Friday · 19:15',
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?auto=format&fit=crop&w=1920&q=85',
  },
  {
    id: 'wellness',
    index: '05',
    name: 'Wellness',
    headline: 'Cellular stillness.',
    subheadline: 'Himalayan salt halotherapy, Nordic cedar heat, and contrast cold plunge pools.',
    paragraphs: [
      'Recovery is the counterpart to effort. Our wellness sanctuary integrates clinical halotherapy with contrast temperature hydrotherapy for deep autonomic balance.',
      'Breathe micronized saline aerosol inside the Himalayan salt room, warming soft tissue before entering the 65°C Nordic cedar sauna.',
      'Conclude with cold plunge vasoconstriction at 6°C to flush inflammatory metabolites and trigger profound parasympathetic nervous system restoration.',
    ],
    pillars: [
      'Himalayan salt micronized aerosol',
      '65°C Finnish cedar dry sauna suite',
      '6°C chilled contrast hydrotherapy basin',
    ],
    specs: [
      { label: 'HALOTHERAPY', value: 'Pink Himalayan Salt' },
      { label: 'HYDROTHERAPY', value: '6°C Chilled Plunge' },
      { label: 'HEAT', value: 'Full-Spectrum Sauna' },
    ],
    schedule: 'Open Daily · 05:30 — 22:30 IST',
    image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1920&q=85',
  },
];

export default function StudioPage() {
  const [activeId, setActiveId] = useState('fitness');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      for (const section of SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top - windowHeight * 0.4 && scrollY < top + height - windowHeight * 0.4) {
            setActiveId(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative w-full bg-[var(--ink)] text-[var(--bone)] selection:bg-[var(--champagne)] selection:text-[var(--ink)]">
      {/* Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[72px] px-[var(--pad-x)] flex items-center justify-between pointer-events-none">
        {/* Vyomi Logo in Top Left */}
        <Link
          href="/"
          className="pointer-events-auto flex items-center space-x-3 group"
          aria-label="Return to Vyomi Home"
        >
          <div className="relative w-[110px] h-[36px]">
            <Image
              src="/logo.png"
              alt="Vyomi Fitness Club"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>

        {/* Return to Sanctuary Glass Capsule */}
        <Link
          href="/"
          className="pointer-events-auto liquid-glass px-4 py-2 rounded-full text-label text-[0.68rem] text-[var(--bone-dim)] hover:text-[var(--bone)] transition-all inline-flex items-center space-x-1.5"
        >
          <span>←</span>
          <span>Return to sanctuary</span>
        </Link>
      </header>

      {/* Floating Liquid Glass Navigation Capsule on Left:
          Ultra-short, compact (~220px high), minimalist, multi-layer liquid glass */}
      <aside
        className="hidden md:flex fixed left-8 top-1/2 -translate-y-1/2 z-40 flex-col w-[184px] p-3 rounded-2xl liquid-glass"
        style={{
          boxShadow:
            '0 24px 48px -12px rgba(0,0,0,0.65), inset 0 1px 1px 0 rgba(255,255,255,0.38), inset 0 -1px 1px 0 rgba(0,0,0,0.25)',
        }}
      >
        {/* Minimal header */}
        <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-[var(--hairline)]">
          <span className="type-label text-[0.62rem] text-[var(--bone-dim)] tracking-[0.22em]">
            STUDIO
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--champagne)]" />
        </div>

        {/* 5 Minimalist rows */}
        <div className="flex flex-col space-y-1">
          {SECTIONS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className={`group flex items-center justify-between py-1.5 px-2.5 rounded-md text-left transition-all duration-300 ${
                  isActive
                    ? 'bg-white/[0.08] text-[var(--bone)]'
                    : 'text-[var(--bone-dim)] hover:text-[var(--bone)] hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-[0.60rem] text-[var(--bone-dim)] opacity-45">
                    {item.index}
                  </span>
                  <span className="font-display text-[0.88rem] font-light">
                    {item.name}
                  </span>
                </div>

                {isActive && (
                  <span className="h-1 w-1 rounded-full bg-[var(--champagne)] shadow-[0_0_6px_var(--champagne)]" />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Mobile Floating Liquid Glass Capsule Bar */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-4 px-5 py-2.5 rounded-full liquid-glass max-w-[92vw] overflow-x-auto whitespace-nowrap shadow-2xl">
        {SECTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className={`font-display text-[0.82rem] font-light transition-colors ${
              activeId === item.id
                ? 'text-[var(--bone)] underline underline-offset-4'
                : 'text-[var(--bone-dim)] opacity-60'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Scrollable Discipline Sections */}
      {SECTIONS.map((section, idx) => (
        <section
          key={section.id}
          id={section.id}
          className="relative min-h-screen w-full flex flex-col justify-center py-28 md:py-36 px-[var(--pad-x)] border-b border-[var(--hairline)] overflow-hidden"
        >
          {/* Section Background Image with soft lifted grade */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <Image
              src={section.image}
              alt={section.name}
              fill
              priority={section.id === 'fitness'}
              sizes="100vw"
              className="object-cover"
              style={{
                filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
              }}
            />
            {/* Ambient gradients for quiet luxury reading clarity */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-[var(--ink)]/95 via-[var(--ink)]/85 to-[var(--ink)]/50"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-[var(--ink)]/70"
            />
          </div>

          {/* Section Content */}
          <div className="relative z-10 max-w-4xl mx-auto md:ml-[240px] flex flex-col items-start">
            <span className="type-label text-[var(--champagne)] mb-3 tracking-[0.22em] font-mono">
              DISCIPLINE {section.index} · {section.name.toUpperCase()}
            </span>

            <h2 className="font-display text-4 font-light text-[var(--bone)] leading-tight mb-2">
              {section.headline}
            </h2>

            <p className="font-display text-1 italic text-[var(--bone-dim)] font-light mb-8 max-w-2xl">
              &ldquo;{section.subheadline}&rdquo;
            </p>

            {/* Paragraphs making section rich and scrollable */}
            <div className="flex flex-col space-y-4 mb-8 max-w-2xl">
              {section.paragraphs.map((p, pIdx) => (
                <p key={pIdx} className="type-body text-0 text-[var(--bone-dim)] font-light leading-relaxed">
                  {p}
                </p>
              ))}
            </div>

            {/* Core Pillars / Method chips */}
            <div className="flex flex-wrap gap-2.5 mb-8 max-w-2xl">
              {section.pillars.map((pillar, pilIdx) => (
                <span
                  key={pilIdx}
                  className="liquid-glass text-label text-[0.62rem] text-[var(--bone-dim)] px-3.5 py-1.5 rounded-full"
                >
                  {pillar}
                </span>
              ))}
            </div>

            {/* Spec Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-t border-b border-[var(--hairline)] w-full max-w-2xl mb-8">
              {section.specs.map((spec, sIdx) => (
                <div key={sIdx} className="flex flex-col">
                  <span className="type-label text-[0.62rem] text-[var(--bone-dim)] mb-1">
                    {spec.label}
                  </span>
                  <span className="font-display text-0 font-light text-[var(--bone)]">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Timings & Booking Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full max-w-2xl gap-5">
              <div>
                <span className="type-label text-[0.62rem] text-[var(--bone-dim)] block mb-1">
                  WEEKLY SCHEDULE
                </span>
                <span className="font-mono text-[0.82rem] text-[var(--bone)]">
                  {section.schedule}
                </span>
              </div>

              <a
                href={`https://wa.me/919999999999?text=Hi%20Vyomi%20%E2%80%94%20I'd%20like%20to%20reserve%20a%20spot%20in%20the%20${encodeURIComponent(
                  section.name
                )}%20session.`}
                target="_blank"
                rel="noopener noreferrer"
                className="liquid-glass px-5 py-2.5 rounded-[2px] text-label text-[0.68rem] text-[var(--bone)] hover:border-[var(--champagne)] hover:text-[var(--champagne)] transition-all inline-flex items-center space-x-2 self-start sm:self-auto"
              >
                <span>Reserve {section.name}</span>
                <span>↗</span>
              </a>
            </div>

            {/* Gentle scroll indicator to next section if not last */}
            {idx < SECTIONS.length - 1 && (
              <button
                type="button"
                onClick={() => scrollToSection(SECTIONS[idx + 1].id)}
                className="mt-12 text-label text-[0.62rem] text-[var(--bone-dim)] hover:text-[var(--bone)] flex items-center space-x-2 transition-colors opacity-60 hover:opacity-100"
              >
                <span>Explore {SECTIONS[idx + 1].name}</span>
                <span>↓</span>
              </button>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
