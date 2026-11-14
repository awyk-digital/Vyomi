'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AssetSlot from '@/components/AssetSlot';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import { WELLNESS, AMENITY_DETAILS } from '@/data/club';

/**
 * Recover well — interactive editorial composition.
 *
 * One wide landscape plate leads the upper area. Below it, an interactive
 * tripartite layout pairs an amenities directory with synchronized left & right
 * luxury visual plates that crossfade smoothly on hover or tap.
 */
export default function WellnessSection() {
  const [main] = WELLNESS;
  const [activeId, setActiveId] = useState<string>('steam');

  const activeAmenity =
    AMENITY_DETAILS.find((a) => a.id === activeId) ?? AMENITY_DETAILS[0];

  return (
    <section
      id="wellness"
      className="border-t border-hairline bg-ink px-pad-x py-section-y"
      aria-labelledby="wellness-heading"
    >
      <div className="mb-10 md:mb-14">
        <SectionHeading
          id="wellness-heading"
          className="t-h2 uppercase text-heading"
        >
          Recover well.
        </SectionHeading>
        <div className="mt-7 max-w-shell">
          <AccentRule />
        </div>
      </div>

      {/* Medium landscape plate, inset from the right edge */}
      <Reveal className="lg:pr-[14%]">
        <figure>
          <AssetSlot
            slot={main.slot}
            sizes="(max-width: 1023px) 100vw, 76vw"
            className="w-full"
          />
          <figcaption className="t-small mt-3 text-faint">
            {main.caption}
          </figcaption>
        </figure>
      </Reveal>

      {/* Interactive Details + Amenities Grid */}
      <div className="mt-12 grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-8 lg:gap-10">
        {/* Left Synchronized Plate — 4:5 vertical portrait */}
        <Reveal className="md:col-span-4 md:mt-6">
          <figure className="group">
            {/* Sculpted Luxury Bezel Outer Rim — Smooth 22px Chamfer */}
            <div className="relative aspect-[4/5] w-full p-[1.5px] rounded-[1.35rem] bg-gradient-to-b from-hairline-2/90 via-hairline/60 to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-500 hover:from-bronze/70 hover:via-hairline-2 hover:to-bronze/30">
              <div className="relative h-full w-full overflow-hidden rounded-[calc(1.35rem-1.5px)] bg-charcoal">
                {AMENITY_DETAILS.map((amenity) => {
                  const isActive = amenity.id === activeId;
                  return (
                    <div
                      key={amenity.id}
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        isActive
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-[1.04] z-0 pointer-events-none'
                      }`}
                    >
                      {amenity.left.slot.src && (
                        <Image
                          src={amenity.left.slot.src}
                          alt={amenity.left.slot.alt}
                          fill
                          priority
                          sizes="(max-width: 767px) 100vw, 33vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Top brushed-gold rim highlight */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-bronze to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-85 z-20"
                />

                {/* Soft inner photographic vignette */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[calc(1.35rem-1.5px)] shadow-[inset_0_0_28px_rgba(0,0,0,0.55)] z-20"
                />
              </div>
            </div>

            <figcaption className="t-small mt-3.5 flex items-center justify-between text-muted transition-colors duration-300">
              <span className="font-medium text-heading">
                {activeAmenity.left.caption}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-bronze">
                Primary
              </span>
            </figcaption>
          </figure>
        </Reveal>

        {/* Center Interactive Amenities List */}
        <Reveal className="md:col-span-4">
          <div className="flex items-center justify-between mb-4">
            <span className="t-label block text-muted">Amenities</span>
            <span className="t-micro uppercase tracking-widest text-faint">
              Hover to preview
            </span>
          </div>

          <ul
            className="border-t border-hairline"
            role="tablist"
            aria-label="Club amenities"
          >
            {AMENITY_DETAILS.map((amenity) => {
              const isActive = amenity.id === activeId;
              return (
                <li key={amenity.id} className="border-b border-hairline">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onMouseEnter={() => setActiveId(amenity.id)}
                    onFocus={() => setActiveId(amenity.id)}
                    onClick={() => setActiveId(amenity.id)}
                    className={`group relative flex w-full items-center justify-between py-3.5 text-left transition-all duration-300 ${
                      isActive
                        ? 'text-heading pl-3.5 font-medium'
                        : 'text-muted hover:text-heading hover:pl-2'
                    }`}
                  >
                    {/* Left glowing bronze indicator */}
                    <span
                      aria-hidden="true"
                      className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-gradient-to-b from-bronze via-amber-200 to-bronze shadow-[0_0_10px_rgba(176,141,87,0.8)] transition-all duration-300 ${
                        isActive
                          ? 'h-5 opacity-100'
                          : 'h-0 opacity-0 group-hover:h-2.5 group-hover:opacity-40'
                      }`}
                    />

                    <span className="t-small tracking-wide select-none">
                      {amenity.name}
                    </span>

                    {/* Right active indicator pill */}
                    <span
                      aria-hidden="true"
                      className={`inline-flex items-center gap-1 text-[11px] uppercase tracking-wider transition-all duration-300 ${
                        isActive
                          ? 'text-bronze translate-x-0 opacity-100 font-mono'
                          : 'text-hairline-2 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-60'
                      }`}
                    >
                      View
                      <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                        →
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <Link
            href="/studio#wellness"
            className="t-ui group mt-7 inline-flex items-center gap-1.5 border-b border-hairline-2 pb-1 text-heading transition-colors duration-300 hover:border-heading"
          >
            Wellness in full
            <span
              aria-hidden="true"
              className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            >
              ↗
            </span>
          </Link>
        </Reveal>

        {/* Right Synchronized Plate — 1:1 square detail */}
        <Reveal className="md:col-span-4 md:mt-16">
          <figure className="group">
            {/* Sculpted Luxury Bezel Outer Rim — Smooth 22px Chamfer */}
            <div className="relative aspect-[1/1] w-full p-[1.5px] rounded-[1.35rem] bg-gradient-to-b from-hairline-2/90 via-hairline/60 to-transparent shadow-[0_20px_50px_rgba(0,0,0,0.85)] transition-all duration-500 hover:from-bronze/70 hover:via-hairline-2 hover:to-bronze/30">
              <div className="relative h-full w-full overflow-hidden rounded-[calc(1.35rem-1.5px)] bg-charcoal">
                {AMENITY_DETAILS.map((amenity) => {
                  const isActive = amenity.id === activeId;
                  return (
                    <div
                      key={amenity.id}
                      className={`absolute inset-0 transition-all duration-700 ease-out ${
                        isActive
                          ? 'opacity-100 scale-100 z-10'
                          : 'opacity-0 scale-[1.04] z-0 pointer-events-none'
                      }`}
                    >
                      {amenity.right.slot.src && (
                        <Image
                          src={amenity.right.slot.src}
                          alt={amenity.right.slot.alt}
                          fill
                          priority
                          sizes="(max-width: 767px) 100vw, 33vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                  );
                })}

                {/* Top brushed-gold rim highlight */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-bronze to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-85 z-20"
                />

                {/* Soft inner photographic vignette */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[calc(1.35rem-1.5px)] shadow-[inset_0_0_28px_rgba(0,0,0,0.55)] z-20"
                />
              </div>
            </div>

            <figcaption className="t-small mt-3.5 flex items-center justify-between text-muted transition-colors duration-300">
              <span className="font-medium text-heading">
                {activeAmenity.right.caption}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-bronze">
                Detail
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
