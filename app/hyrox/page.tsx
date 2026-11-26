import type { Metadata } from 'next';
import Link from 'next/link';
import ChapterVideo from '@/components/ChapterVideo';
import AssetSlot from '@/components/AssetSlot';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import Footer from '@/components/Footer';
import { STUDIO_IMAGES } from '@/config/assets';

export const metadata: Metadata = {
  title: 'Official HYROX Training Floor',
  description:
    'High-performance HYROX conditioning floor in Vijayawada. Official sled lane, Concept2 ergs, wall balls, and race-readiness training at Vyomi Fitness Club.',
  alternates: {
    canonical: 'https://www.vyomifitness.in/hyrox',
  },
  openGraph: {
    title: 'Official HYROX Training Floor · Vyomi Fitness Club',
    description:
      'High-performance HYROX conditioning floor in Vijayawada. Official sled lane, Concept2 ergs, wall balls, and race-readiness training at Vyomi Fitness Club.',
    url: 'https://www.vyomifitness.in/hyrox',
  },
};

export default function HyroxPage() {
  return (
    <>
      <main id="main" className="min-h-screen bg-ink">
        {/* Navigation Breadcrumb Bar */}
        <div className="border-b border-hairline bg-ink px-pad-x py-4">
          <div className="mx-auto flex max-w-shell items-center justify-between">
            <Link
              href="/"
              className="t-ui inline-flex items-center gap-2 text-muted transition-colors hover:text-heading"
            >
              <span>←</span>
              <span className="text-xs uppercase tracking-widest">Home</span>
            </Link>
            <div className="flex items-center gap-4 text-xs font-mono uppercase tracking-wider text-faint">
              <Link href="/studio" className="hover:text-heading transition-colors">
                The Studio
              </Link>
              <span>/</span>
              <span className="text-[#B08D57]">HYROX</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="border-b border-hairline px-pad-x py-12 md:py-20">
          <div className="mx-auto max-w-shell">
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#B08D57]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B08D57]" />
              Discipline 02 · Functional Race Conditioning
            </div>
            <SectionHeading as="h1" immediate className="t-hero uppercase text-heading">
              Race Conditioning.
            </SectionHeading>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted">
              Dedicated competition-grade HYROX conditioning zone. Continuous 30m sprint turf,
              weighted sled push/pull lanes, Concept2 SkiErgs, rowers, and obstacle endurance protocols.
            </p>
          </div>
        </section>

        {/* Cinematic Video Showcase */}
        <section className="border-b border-hairline bg-ink">
          <div className="mx-auto max-w-shell px-pad-x py-10 md:py-16">
            <Reveal>
              <div className="overflow-hidden rounded-lg border border-hairline bg-charcoal">
                <ChapterVideo
                  src="/video/hyrox.mp4"
                  poster="/video/hyrox-poster.jpg"
                  ratio="21 / 9"
                  label="HYROX conditioning lane at Vyomi Fitness Club"
                  sizes="100vw"
                  className="w-full"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Station Breakdown */}
        <section className="border-b border-hairline px-pad-x py-16 md:py-24">
          <div className="mx-auto max-w-shell">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
              <Reveal className="md:col-span-5">
                <AssetSlot
                  slot={STUDIO_IMAGES.hyroxDetail}
                  sizes="(max-width: 767px) 100vw, 40vw"
                  className="w-full rounded-lg border border-hairline"
                />
              </Reveal>

              <Reveal stagger className="flex flex-col justify-center md:col-span-7 md:pl-8">
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#B08D57]">
                  The Standards
                </div>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-heading md:text-3xl">
                  Built for the Global Race.
                </h2>
                <div className="mt-4 max-w-xl text-sm leading-relaxed text-muted space-y-4">
                  <p>
                    HYROX bridges the gap between traditional functional fitness and pure aerobic endurance.
                    At Vyomi, our dedicated track replicates global competition parameters exactly.
                  </p>
                  <p>
                    From high-output SkiErg pacing to the metabolic burden of heavy sled drives, you train on the
                    exact surface, weight allocations, and ergometers used in championship races worldwide.
                  </p>
                </div>

                <div className="mt-8 border-t border-hairline pt-6">
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                    <div>
                      <div className="font-mono text-xs text-faint uppercase">Track</div>
                      <div className="mt-1 font-medium text-heading">30m High-Traction Turf</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-faint uppercase">Ergs</div>
                      <div className="mt-1 font-medium text-heading">Concept2 Ski & Rower</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-faint uppercase">Coaching</div>
                      <div className="mt-1 font-medium text-[#B08D57]">Race Cadence & Splits</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-pad-x py-16 md:py-24 bg-surface">
          <div className="mx-auto max-w-shell text-center">
            <SectionHeading className="t-h2 uppercase text-heading">
              {'Test Your Limits\non the HYROX Floor.'}
            </SectionHeading>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
              Prepare for your next race or elevate your athletic conditioning to competitive standards.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/register" className="btn-solid shine">
                Join VIP Pre-Sale →
              </Link>
              <Link href="/#trial" className="btn-line shine">
                Request Two-Day Trial
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
