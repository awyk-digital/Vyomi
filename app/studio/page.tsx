import type { Metadata } from 'next';
import Link from 'next/link';
import AssetSlot from '@/components/AssetSlot';
import Reveal from '@/components/Reveal';
import Pending from '@/components/Pending';
import Footer from '@/components/Footer';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import StudioNav from '@/components/StudioNav';
import ChapterVideo from '@/components/ChapterVideo';
import { STUDIO_IMAGES } from '@/config/assets';
import { EQUIPMENT_CATEGORIES, AMENITIES, DISCIPLINES } from '@/data/club';

export const metadata: Metadata = {
  title: 'Studio',
  description:
    'Fitness and equipment, HYROX, Zumba, wellness and recovery, and reformer Pilates at Vyomi Fitness Club, Vijayawada.',
};

/**
 * The Studio page — five disciplines, five compositions.
 *
 * The brief for this page was that no two chapters should share a layout, so
 * each one is built differently rather than being the same grid with
 * different content poured into it:
 *
 *   01 Fitness   — sticky text column, images scrolling past it
 *   02 HYROX     — full-bleed cinematic plate, heading overlaid
 *   03 Zumba     — offset collage against an oversized chapter numeral
 *   04 Wellness  — calm, centred, symmetrical
 *   05 Pilates   — the showpiece: full-bleed, oversized type, detail pair
 *
 * Content discipline is unchanged from the rest of the site: only what the
 * brief confirms is written as copy. Everything else — timetables, instructor
 * names, reformer counts, station lists — renders as a visible pending marker
 * instead of plausible-looking invented detail.
 *
 * A server component. The chapter rail and the headings are the only client
 * pieces, and both are additive.
 */

/** Left clearance for the fixed rail on large screens. */
const GUTTER = 'px-pad-x lg:pl-[9.5rem]';

function ChapterLabel({ index, label }: { index: number; label: string }) {
  return (
    <span className="t-label mb-4 flex items-center gap-2.5 text-faint">
      <span className="accent-tick" aria-hidden="true" />
      <span className="nums">{String(index).padStart(2, '0')}</span>
      <span aria-hidden="true">·</span>
      <span>{label}</span>
    </span>
  );
}

export default function StudioPage() {
  const [fitness, hyrox, zumba, wellness, pilates] = DISCIPLINES;

  return (
    <>
      <StudioNav />

      {/* Slim top bar — the rail carries chapter navigation, so this only
          needs the way back and the single booking action. */}
      <header className="border-b border-hairline bg-ink">
        <div
          className={`flex flex-wrap items-center gap-x-6 gap-y-3 pb-5 ${GUTTER}`}
          style={{ paddingTop: 'clamp(5rem, 11vw, 7.5rem)' }}
        >
          <Link href="/" className="t-ui text-muted transition-colors hover:text-heading">
            ← Home
          </Link>
          <div className="ms-auto">
            <Link href="/#trial" className="btn-line shine !py-2">
              Two-day request
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="pb-24 lg:pb-0">
        {/* ---------- Title ---------- */}
        <section className={`border-b border-hairline bg-ink py-section-y ${GUTTER}`}>
          <SectionHeading as="h1" immediate className="t-hero uppercase text-heading">
            The Studio.
          </SectionHeading>
          <p className="t-body mt-5 max-w-measure text-muted">
            Five disciplines under one roof.
          </p>
          <div className="mt-10 max-w-shell">
            <AccentRule />
          </div>
        </section>

        {/* ---------- Establishing walkthrough ----------
            The arrival sequence: reception, the stone corridor, the lounge
            with its water feature, then the cardio hall. It sits before the
            chapters because it is the only asset that shows how the rooms
            connect — something no single still can carry. ---------- */}
        <section
          className="border-b border-hairline bg-ink"
          aria-label="Walkthrough of the club"
        >
          <ChapterVideo
            src="/video/tour-club.mp4"
            poster="/video/tour-club-poster.jpg"
            label="Walkthrough of Vyomi Fitness Club: reception, the stone corridor, the lounge, and the cardio hall."
            caption="Render — not club photography"
            className="aspect-[16/9] w-full md:aspect-[2/1]"
          />
        </section>

        {/* ---------- 01 · Fitness — sticky column, images scroll past ---------- */}
        <section
          id={fitness.id}
          className={`scroll-mt-24 border-b border-hairline bg-ink py-section-y ${GUTTER}`}
          aria-labelledby="fitness-heading"
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            {/*
              The text column pins while the three plates travel past it.
              `self-start` is what lets `sticky` work inside a grid row —
              a stretched item has nothing to stick within.
            */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
              <ChapterLabel index={1} label={fitness.label} />
              <SectionHeading
                id="fitness-heading"
                className="t-h2 uppercase text-heading"
              >
                {fitness.title}
              </SectionHeading>

              <p className="t-small mt-6 text-muted">{fitness.blurb}</p>

              <dl className="mt-8 border-t border-hairline">
                {EQUIPMENT_CATEGORIES.map((c) => (
                  <div key={c.id} className="border-b border-hairline py-4">
                    <dt className="t-ui mb-1 text-heading">{c.label}</dt>
                    <dd className="t-small text-muted">{c.blurb}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6">
                <Pending label={fitness.pending} />
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-7">
              <Reveal>
                <ChapterVideo
                  src="/video/tour-fitness.mp4"
                  poster="/video/tour-fitness-poster.jpg"
                  ratio="16 / 9"
                  label="The Vyomi training floor: burgundy Panatta machines along the range, members training."
                  caption="Render — not club photography"
                  className="w-full"
                />
              </Reveal>
              <Reveal className="lg:ml-[18%]">
                <AssetSlot
                  slot={STUDIO_IMAGES.fitnessDetailA}
                  sizes="(max-width: 1023px) 100vw, 45vw"
                  className="w-full"
                />
              </Reveal>
              <Reveal className="lg:mr-[10%]">
                <AssetSlot
                  slot={STUDIO_IMAGES.fitnessDetailB}
                  sizes="(max-width: 1023px) 100vw, 50vw"
                  className="w-full"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- 02 · HYROX — full-bleed, heading overlaid ---------- */}
        <section
          id={hyrox.id}
          className="scroll-mt-24 border-b border-hairline bg-ink"
          aria-labelledby="hyrox-heading"
        >
          <div className="relative">
            <AssetSlot
              slot={STUDIO_IMAGES.hyrox}
              sizes="100vw"
              ratio="21 / 9"
              className="w-full"
            />

            {/* Legibility wash under the overlaid type */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.45) 38%, rgba(8,8,8,0.08) 72%)',
              }}
            />

            <div
              className={`absolute inset-x-0 bottom-0 pb-[clamp(1.5rem,4vw,3.5rem)] ${GUTTER}`}
            >
              <ChapterLabel index={2} label={hyrox.label} />
              <SectionHeading
                id="hyrox-heading"
                className="t-h2 uppercase text-heading"
              >
                {hyrox.title}
              </SectionHeading>
            </div>
          </div>

          <div className={`grid grid-cols-1 gap-10 py-section-y md:grid-cols-12 ${GUTTER}`}>
            <Reveal className="md:col-span-6">
              <AssetSlot
                slot={STUDIO_IMAGES.hyroxDetail}
                sizes="(max-width: 767px) 100vw, 48vw"
                className="w-full"
              />
            </Reveal>
            <Reveal className="md:col-span-5 md:col-start-8 md:pt-8">
              <p className="t-small text-muted">{hyrox.blurb}</p>
              <div className="mt-6">
                <AccentRule />
              </div>
              <div className="mt-6">
                <Pending label={hyrox.pending} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- 03 · Zumba — offset collage on an oversized numeral ---------- */}
        <section
          id={zumba.id}
          className={`relative scroll-mt-24 overflow-hidden border-b border-hairline bg-ink py-section-y ${GUTTER}`}
          aria-labelledby="zumba-heading"
        >
          {/*
            Outlined chapter numeral sitting behind the collage. Decorative
            only — the real chapter number is in the label above.
          */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 top-6 select-none font-medium leading-none"
            style={{
              fontSize: 'clamp(9rem, 26vw, 24rem)',
              color: 'transparent',
              WebkitTextStroke: '1px rgba(245,245,242,0.055)',
            }}
          >
            03
          </span>

          <div className="relative">
            <ChapterLabel index={3} label={zumba.label} />
            <SectionHeading id="zumba-heading" className="t-h2 uppercase text-heading">
              {zumba.title}
            </SectionHeading>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-12">
              <Reveal className="sm:col-span-7">
                <AssetSlot
                  slot={STUDIO_IMAGES.zumba}
                  sizes="(max-width: 639px) 100vw, 56vw"
                  className="w-full"
                />
              </Reveal>

              <Reveal className="sm:col-span-4 sm:col-start-9 sm:-mt-12">
                <AssetSlot
                  slot={STUDIO_IMAGES.zumbaDetailA}
                  sizes="(max-width: 639px) 100vw, 30vw"
                  className="w-full"
                />
              </Reveal>

              <Reveal className="sm:col-span-3 sm:col-start-4 sm:mt-6">
                <AssetSlot
                  slot={STUDIO_IMAGES.zumbaDetailB}
                  sizes="(max-width: 639px) 100vw, 24vw"
                  className="w-full"
                />
              </Reveal>

              <Reveal className="sm:col-span-4 sm:col-start-8 sm:mt-6 sm:self-end">
                <p className="t-small text-muted">{zumba.blurb}</p>
                <div className="mt-5">
                  <Pending label={zumba.pending} />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- 04 · Wellness — calm and centred ---------- */}
        <section
          id={wellness.id}
          className={`scroll-mt-24 border-b border-hairline bg-ink py-section-y ${GUTTER}`}
          aria-labelledby="wellness-heading"
        >
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center">
              <ChapterLabel index={4} label={wellness.label} />
            </div>
            <SectionHeading
              id="wellness-heading"
              className="t-h2 mx-auto uppercase text-heading"
            >
              {wellness.title}
            </SectionHeading>
            <p className="t-small mx-auto mt-6 max-w-[46ch] text-muted">
              {wellness.blurb}
            </p>

            <Reveal className="mt-12">
              <AssetSlot
                slot={STUDIO_IMAGES.wellness}
                sizes="(max-width: 1023px) 100vw, 56rem"
                className="w-full"
              />
            </Reveal>

            <ul className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-x-10 border-t border-hairline sm:grid-cols-3">
              {AMENITIES.map((a) => (
                <li
                  key={a}
                  className="t-small border-b border-hairline py-3 text-left text-heading"
                >
                  {a}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex justify-center">
              <Pending label={wellness.pending} />
            </div>
          </div>
        </section>

        {/* ---------- 05 · Pilates — the showpiece ---------- */}
        <section
          id={pilates.id}
          className="scroll-mt-24 border-b border-hairline bg-ink"
          aria-labelledby="pilates-heading"
        >
          <div className={`pt-section-y ${GUTTER}`}>
            <ChapterLabel index={5} label={pilates.label} />
            {/*
              Set at hero scale rather than h2: this is the chapter the client
              asked to lead the Studio, and it is the last thing read before
              the booking call to action.
            */}
            <SectionHeading
              id="pilates-heading"
              className="t-hero uppercase text-heading"
            >
              {pilates.title}
            </SectionHeading>
            <p className="t-body mt-6 max-w-measure text-muted">{pilates.blurb}</p>
            <div className="mt-10 max-w-shell">
              <AccentRule />
            </div>
          </div>

          <Reveal className="mt-14 block">
            <AssetSlot
              slot={STUDIO_IMAGES.pilates}
              sizes="100vw"
              ratio="21 / 9"
              className="w-full"
            />
          </Reveal>

          <div className={`grid grid-cols-1 gap-10 py-section-y md:grid-cols-12 ${GUTTER}`}>
            <Reveal className="md:col-span-4">
              <AssetSlot
                slot={STUDIO_IMAGES.pilatesDetailA}
                sizes="(max-width: 767px) 100vw, 32vw"
                className="w-full"
              />
            </Reveal>
            <Reveal className="md:col-span-3 md:pt-16">
              <AssetSlot
                slot={STUDIO_IMAGES.pilatesDetailB}
                sizes="(max-width: 767px) 100vw, 24vw"
                className="w-full"
              />
            </Reveal>
            <Reveal className="md:col-span-4 md:col-start-9 md:pt-8">
              <p className="t-small text-muted">
                Reformer work is coached on the carriage itself — spring
                resistance, footbar and straps — rather than as mat Pilates.
              </p>
              <div className="mt-6">
                <Pending label={pilates.pending} />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- Booking ---------- */}
        <section className={`bg-ink py-section-y ${GUTTER}`}>
          <div className="max-w-shell">
            <SectionHeading className="t-h2 uppercase text-heading">
              {'Two days.\nExperience Vyomi.'}
            </SectionHeading>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/#trial" className="btn-solid shine">
                Request your two days
              </Link>
              <Link href="/#enquire" className="btn-line shine">
                Enquire on WhatsApp ↗
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
