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
                {/* Sculpted Luxury Bezel Outer Rim — Smooth 22px Chamfer */}
                <div className="group relative aspect-[3/4] w-full p-[1.5px] rounded-[1.35rem] bg-gradient-to-b from-hairline-2/90 via-hairline/60 to-transparent shadow-[0_15px_40px_rgba(0,0,0,0.85)] transition-all duration-500 hover:from-bronze/70 hover:via-hairline-2 hover:to-bronze/30 hover:shadow-[0_25px_60px_-10px_rgba(0,0,0,0.95),0_0_30px_rgba(176,141,87,0.18)]">
                  <div className="relative h-full w-full overflow-hidden rounded-[calc(1.35rem-1.5px)] bg-charcoal">
                    <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                      <AssetSlot
                        slot={t.portrait}
                        ratio="3 / 4"
                        sizes="(max-width: 639px) 100vw, (max-width: 1023px) 46vw, 30vw"
                        className="h-full w-full"
                      />
                    </div>

                    {/* Top brushed-gold rim highlight */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute top-0 inset-x-8 h-[1.5px] bg-gradient-to-r from-transparent via-bronze to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-85 z-10"
                    />

                    {/* Soft inner photographic vignette */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 rounded-[calc(1.35rem-1.5px)] shadow-[inset_0_0_24px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                </div>

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
