'use client';

import Link from 'next/link';
import AssetSlot from '@/components/AssetSlot';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import { CLASSES } from '@/data/club';

/**
 * Find your class — uniform, beautifully aligned luxury class cards.
 * Each tile opens the matching chapter of the Studio page.
 */
export default function ClassesSection() {
  return (
    <section
      id="classes"
      className="border-t border-hairline bg-ink px-pad-x py-section-y"
      aria-labelledby="classes-heading"
    >
      <div className="mb-12 text-center md:mb-16">
        <SectionHeading
          id="classes-heading"
          className="t-h2 mx-auto uppercase text-heading"
        >
          Find your class.
        </SectionHeading>
        <div className="mx-auto mt-7 max-w-[22rem]">
          <AccentRule />
        </div>
      </div>

      <ul className="mx-auto grid max-w-shell grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
        {CLASSES.map((c, i) => (
          <li key={c.id}>
            <Reveal delay={i * 0.08}>
              <Link href={c.href} className="group block">
                {/* Sculpted Luxury Bezel Outer Rim — Smooth 22px Chamfer */}
                <div className="relative aspect-[4/5] w-full p-[1.5px] rounded-[1.35rem] bg-gradient-to-b from-hairline-2/90 via-hairline/60 to-transparent shadow-[0_15px_40px_rgba(0,0,0,0.85)] transition-all duration-500 group-hover:from-bronze/70 group-hover:via-hairline-2 group-hover:to-bronze/30 group-hover:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95),0_0_30px_rgba(176,141,87,0.18)]">
                  {/* Inner Card Container with Smooth Sculpted Corners */}
                  <div className="relative h-full w-full overflow-hidden rounded-[calc(1.35rem-1.5px)] bg-charcoal">
                    <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]">
                      <AssetSlot
                        slot={c.slot}
                        ratio="4 / 5"
                        sizes="(max-width: 639px) 100vw, 31vw"
                        className="h-full w-full"
                      />
                    </div>

                    {/* Top brushed-gold rim highlight */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-bronze to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-85 z-10"
                    />

                    {/* Subtle photographic lens glare sheen */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08] opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                    />

                    {/* Soft inner photographic vignette */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[calc(1.35rem-1.5px)] shadow-[inset_0_0_24px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-hairline pt-3 px-1">
                  <h3 className="t-ui text-heading transition-colors duration-300 group-hover:text-bronze">
                    {c.label}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="t-small text-faint transition-all duration-500 ease-editorial group-hover:text-heading group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    ↗
                  </span>
                </div>
              </Link>
            </Reveal>
          </li>
        ))}
      </ul>

      <p className="t-small mt-12 text-center text-faint">
        The full timetable is published on the{' '}
        <Link href="/studio" className="text-heading underline underline-offset-4">
          Studio page
        </Link>
        .
      </p>
    </section>
  );
}
