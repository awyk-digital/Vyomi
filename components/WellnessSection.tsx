'use client';

import Link from 'next/link';
import AssetSlot from '@/components/AssetSlot';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import { WELLNESS, AMENITIES } from '@/data/club';

/**
 * Recover well — asymmetric editorial composition.
 *
 * One medium landscape plate spans the upper area, with two smaller details
 * offset beneath it against the amenities list. The page stays dark while the
 * imagery keeps its own natural material colour.
 */
export default function WellnessSection() {
  const [main, salt, detail] = WELLNESS;

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
          <figcaption className="t-small mt-3 text-faint">{main.caption}</figcaption>
        </figure>
      </Reveal>

      {/* Details + amenities */}
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-8">
        {/* Salt bath — offset down, narrower */}
        <Reveal className="md:col-span-4 md:mt-10">
          <figure>
            <AssetSlot
              slot={salt.slot}
              sizes="(max-width: 767px) 100vw, 30vw"
              className="w-full"
            />
            <figcaption className="t-small mt-3 text-faint">{salt.caption}</figcaption>
          </figure>
        </Reveal>

        {/* Amenities list */}
        <Reveal className="md:col-span-4">
          <span className="t-label mb-4 block text-muted">Amenities</span>
          <ul className="border-t border-hairline">
            {AMENITIES.map((a) => (
              <li
                key={a}
                className="t-small border-b border-hairline py-3 text-heading"
              >
                {a}
              </li>
            ))}
          </ul>

          <Link
            href="/studio#wellness"
            className="t-ui group mt-6 inline-flex items-center gap-1.5 border-b border-hairline-2 pb-1 text-heading transition-colors duration-300 hover:border-heading"
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

        {/* Square detail — offset further down */}
        <Reveal className="md:col-span-4 md:mt-20">
          <figure>
            <AssetSlot
              slot={detail.slot}
              sizes="(max-width: 767px) 100vw, 30vw"
              className="w-full"
            />
            <figcaption className="t-small mt-3 text-faint">{detail.caption}</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
