'use client';

import AssetSlot from '@/components/AssetSlot';
import Reveal from '@/components/Reveal';
import Pending from '@/components/Pending';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import { TRAINERS } from '@/data/club';

/**
 * Meet the trainers — three portrait columns for Level 1, 2 and 3.
 *
 * Every piece of information is on the page at all times. Nothing is hidden
 * behind hover, so the mobile stack loses nothing, and the columns become a
 * simple vertical stack rather than a swipe that could trap content.
 *
 * Names, specialisations and the level definitions stay blank until the client
 * supplies real staff details — the brief forbids inventing people or
 * credentials, and a generated portrait must never stand in for a real person.
 */
export default function TrainersSection() {
  return (
    <section
      id="trainers"
      className="border-t border-hairline bg-ink px-pad-x py-section-y"
      aria-labelledby="trainers-heading"
    >
      <div className="mb-10 md:mb-14">
        <SectionHeading
          id="trainers-heading"
          className="t-h2 uppercase text-heading"
        >
          Expertise at every level.
        </SectionHeading>
        <div className="mt-7 max-w-shell">
          <AccentRule />
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {TRAINERS.map((t, i) => (
          <li key={t.id}>
            <Reveal delay={i * 0.06}>
              <article className="flex h-full flex-col">
                <AssetSlot
                  slot={t.portrait}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 46vw, 30vw"
                  className="w-full"
                />

                <div className="mt-5 flex flex-1 flex-col border-t border-hairline pt-4">
                  <span className="t-label mb-3 text-burgundy">{t.level}</span>

                  <h3 className="t-h3 text-heading">
                    {t.name ?? <Pending label={`${t.level} trainer name`} />}
                  </h3>

                  <p className="t-small mt-2 flex-1 text-muted">
                    {t.specialisation ?? (
                      <Pending label={`${t.level} specialisation`} />
                    )}
                  </p>

                  {t.levelNote ? (
                    <p className="t-small mt-3 text-faint">{t.levelNote}</p>
                  ) : (
                    <p className="mt-3">
                      <Pending label={`What ${t.level} covers`} />
                    </p>
                  )}

                  <a
                    href="#enquire"
                    className="t-ui group mt-5 inline-flex w-fit items-center gap-1.5 border-b border-hairline-2 pb-1 text-heading transition-colors duration-300 hover:border-heading"
                  >
                    Meet your coach
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    >
                      ↗
                    </span>
                  </a>
                </div>
              </article>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
