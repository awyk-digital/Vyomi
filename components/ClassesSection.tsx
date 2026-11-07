'use client';

import Link from 'next/link';
import AssetSlot from '@/components/AssetSlot';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import { CLASSES } from '@/data/club';

/**
 * Find your class — a large centred title over a staggered strip of class tiles.
 *
 * Composition is deliberately unlike the trainer grid: centred display type,
 * then tiles that sit at different vertical offsets across a single row on
 * desktop and stack on mobile.
 *
 * Only classes the brief confirms appear here. Each tile opens the matching
 * chapter of the Studio page.
 */
/**
 * Vertical offsets for the staggered strip. Flat on mobile, where the tiles
 * stack and an offset would just read as uneven spacing.
 */
const STAGGER_CLASS = ['sm:mt-0', 'sm:mt-10', 'sm:mt-4'] as const;

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
          <li key={c.id} className={STAGGER_CLASS[i % STAGGER_CLASS.length]}>
            <Reveal delay={i * 0.08}>
              <Link href={c.href} className="group block">
                <div className="overflow-hidden">
                  <div className="transition-transform duration-[900ms] ease-editorial group-hover:scale-[1.03]">
                    <AssetSlot
                      slot={c.slot}
                      sizes="(max-width: 639px) 100vw, 31vw"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-hairline pt-3">
                  <h3 className="t-ui text-heading">{c.label}</h3>
                  <span
                    aria-hidden="true"
                    className="t-small text-faint transition-all duration-500 ease-editorial group-hover:text-heading"
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
