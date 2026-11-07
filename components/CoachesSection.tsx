'use client';

import { useState } from 'react';
import Image from 'next/image';
import { COACHES_DATA, type Coach } from '@/data/coaches';

export default function CoachesSection() {
  const [activeCoach, setActiveCoach] = useState<Coach>(COACHES_DATA[0]);
  const [modalCoach, setModalCoach] = useState<Coach | null>(null);

  return (
    <section
      id="specialists"
      className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)] py-24 md:py-36 px-[var(--pad-x)]"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Heading: "The coaches" at --step-3 weight 300, sentence case. No filler council line. */}
        <div className="border-b border-[var(--hairline)] pb-6 mb-16 flex items-end justify-between">
          <h2 className="font-display text-3 font-light text-[var(--bone)]">
            The coaches
          </h2>
          <span className="type-label text-[0.68rem] text-[var(--bone-dim)]">
            Guidance
          </span>
        </div>

        {/* Desktop Layout: Left name list with generous 36px vertical air, Right 4/5 borderless portrait */}
        <div className="hidden lg:grid grid-cols-12 gap-16 items-start">
          {/* Left Column: Names */}
          <div className="col-span-7 divide-y divide-[var(--hairline)]">
            {COACHES_DATA.map((coach) => {
              const isActive = coach.id === activeCoach.id;
              return (
                <div
                  key={coach.id}
                  onMouseEnter={() => setActiveCoach(coach)}
                  onClick={() => setModalCoach(coach)}
                  className="group cursor-pointer py-9 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-display text-2 font-light transition-all duration-300 ${
                        isActive
                          ? 'text-[var(--bone)] translate-x-3'
                          : 'text-[var(--bone-dim)] group-hover:text-[var(--bone)] group-hover:translate-x-3'
                      }`}
                    >
                      {coach.name}
                    </h3>

                    {/* Tier: plain label-style text, right-aligned, --bone-dim, Master Coach in --champagne. NO BOXES. */}
                    <span
                      className={`type-label text-[0.68rem] transition-colors ${
                        coach.tier === 'MASTER COACH'
                          ? 'text-[var(--champagne)]'
                          : 'text-[var(--bone-dim)]'
                      }`}
                    >
                      {coach.tier}
                    </span>
                  </div>

                  {/* One descriptor only, in label style, only on active row */}
                  {isActive && (
                    <div className="mt-2.5 pl-3 transition-opacity duration-300">
                      <span className="type-label text-[0.65rem] text-[var(--bone-dim)] tracking-[0.2em]">
                        {coach.specialism}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: 4/5 Portrait, no border, no hard edge, soft grade, gentle gradient at bottom */}
          <div className="col-span-5 sticky top-28">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--surface)]">
              <Image
                key={activeCoach.id}
                src={activeCoach.portrait}
                alt={`${activeCoach.name} coach at Vyomi`}
                fill
                sizes="40vw"
                className="object-cover transition-all duration-700 ease-out"
                style={{
                  filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
                }}
              />

              {/* Gentle gradient at bottom so link sits on density */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-transparent to-transparent pointer-events-none"
              />

              {/* Only "View dossier ↗" in label style, no button box */}
              <div className="absolute bottom-6 right-6 z-10">
                <button
                  type="button"
                  onClick={() => setModalCoach(activeCoach)}
                  className="type-label text-[0.68rem] text-[var(--bone)] hover:text-[var(--champagne)] transition-colors inline-flex items-center space-x-1"
                >
                  <span>View dossier</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View: Clean list and swipeable carousel */}
        <div className="flex lg:hidden overflow-x-auto space-x-6 pb-6 snap-x snap-mandatory">
          {COACHES_DATA.map((coach) => (
            <div
              key={coach.id}
              onClick={() => setModalCoach(coach)}
              className="relative aspect-[4/5] min-w-[270px] snap-center overflow-hidden bg-[var(--surface)] p-6 flex flex-col justify-end"
            >
              <Image
                src={coach.portrait}
                alt={coach.name}
                fill
                sizes="80vw"
                className="object-cover"
                style={{
                  filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/90 via-transparent to-transparent pointer-events-none" />

              <div className="relative z-10">
                <span
                  className={`type-label text-[0.65rem] block mb-1 ${
                    coach.tier === 'MASTER COACH' ? 'text-[var(--champagne)]' : 'text-[var(--bone-dim)]'
                  }`}
                >
                  {coach.tier}
                </span>
                <p className="font-display text-2 font-light text-[var(--bone)]">
                  {coach.name}
                </p>
                <p className="type-label text-[0.65rem] text-[var(--bone-dim)] mt-1">
                  {coach.specialism}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coach Detail Dossier Modal */}
      {modalCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--ink)]/90 backdrop-blur-md p-6">
          <div className="relative w-full max-w-lg border border-[var(--hairline)] bg-[var(--surface)] p-8 rounded-[2px]">
            <div className="flex items-start justify-between border-b border-[var(--hairline)] pb-4 mb-6">
              <div>
                <span className="type-label text-[var(--champagne)] block mb-1">
                  {modalCoach.tier}
                </span>
                <h3 className="font-display text-2 font-light text-[var(--bone)]">
                  {modalCoach.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalCoach(null)}
                className="p-1 text-[var(--bone-dim)] hover:text-[var(--bone)] text-[0.9rem]"
                aria-label="Close dossier"
              >
                ✕
              </button>
            </div>

            <p className="type-body text-0 text-[var(--bone-dim)] font-light leading-relaxed mb-6">
              {modalCoach.bio}
            </p>

            <a
              href={`https://wa.me/919999999999?text=Hi%20Vyomi%20%E2%80%94%20I'd%20like%20to%20train%20with%20${encodeURIComponent(
                modalCoach.name
              )}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full border border-[var(--hairline)] py-3 text-center text-label text-[var(--bone)] hover:border-[var(--champagne)] hover:text-[var(--champagne)] transition-colors"
            >
              Train with {modalCoach.name} ↗
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
