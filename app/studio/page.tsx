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
const GUTTER = 'px-pad-x lg:pl-[12rem]';

/** Vertical rhythm between chapters, increased by ~25% from standard section-y. */
const CHAPTER_PAD_Y = 'py-[clamp(5.625rem,11.25vh,10rem)]';
const CHAPTER_PT = 'pt-[clamp(5.625rem,11.25vh,10rem)]';

function GhostNumeral({ numeral, className = '' }: { numeral: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute select-none font-medium leading-none ${className}`}
      style={{
        fontSize: 'clamp(6.5rem, 18vw, 15rem)',
        color: 'transparent',
        WebkitTextStroke: '1px var(--hairline)',
        opacity: 0.5,
      }}
    >
      {numeral}
    </span>
  );
}

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
            src="/video/tour-club-v2.mp4"
            poster="/video/tour-club-poster.jpg"
            label="Walkthrough of Vyomi Fitness Club: reception, the stone corridor, the lounge, and the cardio hall."
            caption="Render — not club photography"
            bleed
            sizes="100vw"
            captionClassName="px-pad-x pb-3 lg:pl-[12rem]"
            className="aspect-[16/9] w-full md:aspect-[2/1]"
          />
        </section>

        {/* ---------- 01 · Fitness — sticky column, images scroll past ---------- */}
        <section
          id={fitness.id}
          className={`scroll-mt-0 border-b border-hairline bg-ink pt-6 pb-[clamp(3.5rem,7vh,6rem)] lg:pt-8 ${GUTTER}`}
          aria-labelledby="fitness-heading"
        >
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
            {/*
              The text column pins while the three plates travel past it.
              `self-start` is what lets `sticky` work inside a grid row —
              a stretched item has nothing to stick within.
            */}
            <div className="relative lg:col-span-5 lg:sticky lg:top-28 lg:self-start">
              <GhostNumeral numeral="01" className="-left-4 -top-6 lg:-top-10" />
              <div className="relative z-10">
                <ChapterLabel index={1} label={fitness.label} />
                <SectionHeading
                  id="fitness-heading"
                  className="t-h2 uppercase text-heading"
                >
                  {fitness.title}
                </SectionHeading>

                <Reveal stagger className="mt-6">
                  <p className="t-small text-muted">{fitness.blurb}</p>

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
                </Reveal>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:col-span-7">
              <Reveal>
                <ChapterVideo
                  src="/video/fitness.mp4"
                  poster="/video/fitness-poster.jpg"
                  ratio="16 / 9"
                  label="The Vyomi training floor: Panatta machines and athletic gym training"
                  caption="Render — not club photography"
                  sizes="(max-width: 1023px) 100vw, 55vw"
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

        {/* ---------- 02 · HYROX — full-bleed video plate, heading overlaid ---------- */}
        <section
          id={hyrox.id}
          className="scroll-mt-0 border-b border-hairline bg-ink"
          aria-labelledby="hyrox-heading"
        >
          <div className="relative">
            <ChapterVideo
              src="/video/hyrox.mp4"
              poster="/video/hyrox-poster.jpg"
              ratio="21 / 9"
              label="HYROX race conditioning lane at Vyomi Fitness Club"
              sizes="100vw"
              className="w-full"
            />

            {/* Legibility wash under the overlaid type */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-10"
              style={{
                background:
                  'linear-gradient(to top, rgba(8,8,8,0.88) 0%, rgba(8,8,8,0.45) 38%, rgba(8,8,8,0.08) 72%)',
              }}
            />

            <div
              className={`absolute inset-x-0 bottom-0 pb-[clamp(1.5rem,4vw,3.5rem)] ${GUTTER} z-20`}
            >
              <div className="relative">
                <GhostNumeral numeral="02" className="-left-3 -top-10 md:-top-14" />
                <div className="relative z-10">
                  <ChapterLabel index={2} label={hyrox.label} />
                  <SectionHeading
                    id="hyrox-heading"
                    className="t-h2 uppercase text-heading"
                  >
                    {hyrox.title}
                  </SectionHeading>
                </div>
              </div>
            </div>
          </div>

          <div className={`grid grid-cols-1 gap-10 ${CHAPTER_PAD_Y} md:grid-cols-12 ${GUTTER}`}>
            <Reveal className="md:col-span-6">
              <AssetSlot
                slot={STUDIO_IMAGES.hyroxDetail}
                sizes="(max-width: 767px) 100vw, 48vw"
                className="w-full"
              />
            </Reveal>
            <Reveal stagger className="md:col-span-5 md:col-start-8 md:pt-8">
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
          className={`relative scroll-mt-0 overflow-hidden border-b border-hairline bg-ink pt-6 pb-[clamp(3.5rem,7vh,6rem)] lg:pt-8 ${GUTTER}`}
          aria-labelledby="zumba-heading"
        >
          <div className="relative">
            <GhostNumeral numeral="03" className="-left-4 -top-6 md:-top-10" />
            <div className="relative z-10">
              <ChapterLabel index={3} label={zumba.label} />
              <SectionHeading id="zumba-heading" className="t-h2 uppercase text-heading">
                {zumba.title}
              </SectionHeading>
            </div>

            <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-6 sm:grid-cols-12">
              <Reveal className="sm:col-span-7">
                <ChapterVideo
                  src="/video/zumba.mp4"
                  poster="/video/zumba-poster.jpg"
                  ratio="16 / 9"
                  label="Zumba dance fitness class mid-movement in the main studio"
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

              <Reveal stagger className="sm:col-span-4 sm:col-start-8 sm:mt-6 sm:self-end">
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
          className={`scroll-mt-0 border-b border-hairline bg-ink pt-6 pb-[clamp(3.5rem,7vh,6rem)] lg:pt-8 ${GUTTER}`}
          aria-labelledby="wellness-heading"
        >
          <div className="relative mx-auto max-w-4xl text-center">
            <GhostNumeral numeral="04" className="left-1/2 -top-6 -translate-x-1/2 md:-top-10" />
            <div className="relative z-10">
              <div className="flex justify-center">
                <ChapterLabel index={4} label={wellness.label} />
              </div>
              <SectionHeading
                id="wellness-heading"
                className="t-h2 mx-auto uppercase text-heading"
              >
                {wellness.title}
              </SectionHeading>
              <Reveal className="mx-auto mt-3 max-w-[46ch]">
                <p className="t-small text-muted">{wellness.blurb}</p>
              </Reveal>

              <Reveal className="mt-6 sm:mt-8">
                <AssetSlot
                  slot={STUDIO_IMAGES.wellness}
                  sizes="(max-width: 1023px) 100vw, 56rem"
                  className="w-full"
                />
              </Reveal>

              <Reveal
                stagger
                as="ul"
                className="mx-auto mt-10 grid max-w-2xl grid-cols-2 gap-x-10 border-t border-hairline sm:grid-cols-3"
              >
                {AMENITIES.map((a) => (
                  <li
                    key={a}
                    className="t-small border-b border-hairline py-3 text-left text-heading"
                  >
                    {a}
                  </li>
                ))}
              </Reveal>

              <div className="mt-8 flex justify-center">
                <Pending label={wellness.pending} />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- 05 · Pilates — the showpiece ---------- */}
        <section
          id={pilates.id}
          className="scroll-mt-0 border-b border-hairline bg-ink"
          aria-labelledby="pilates-heading"
        >
          <div className={`relative pt-6 pb-6 lg:pt-8 ${GUTTER}`}>
            <GhostNumeral numeral="05" className="-left-4 -top-6 md:-top-10" />
            <div className="relative z-10">
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
              <Reveal stagger className="mt-3 max-w-measure">
                <p className="t-body text-muted">{pilates.blurb}</p>
                <div className="mt-6 max-w-shell">
                  <AccentRule />
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal className="mt-4 sm:mt-6 block">
            <ChapterVideo
              src="/video/pilates.mp4"
              poster="/video/pilates-poster.jpg"
              ratio="21 / 9"
              label="Dedicated reformer Pilates studio with carriages, footbars and spring resistance at Vyomi Fitness Club"
              sizes="100vw"
              className="w-full"
            />
          </Reveal>

          <div className={`grid grid-cols-1 gap-10 ${CHAPTER_PAD_Y} md:grid-cols-12 ${GUTTER}`}>
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
            <Reveal stagger className="md:col-span-4 md:col-start-9 md:pt-8">
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
