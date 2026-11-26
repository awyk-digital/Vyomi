import type { Metadata } from 'next';
import Link from 'next/link';
import ChapterVideo from '@/components/ChapterVideo';
import AssetSlot from '@/components/AssetSlot';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import Footer from '@/components/Footer';
import { STUDIO_IMAGES } from '@/config/assets';

export const metadata: Metadata = {
  title: 'Reformer Pilates Studio',
  description:
    'Dedicated reformer Pilates studio with spring resistance carriages, posture diagnostics, and private 1-on-1 coaching at Vyomi Fitness Club, Vijayawada.',
  alternates: {
    canonical: 'https://www.vyomifitness.in/pilates',
  },
  openGraph: {
    title: 'Reformer Pilates Studio · Vyomi Fitness Club',
    description:
      'Dedicated reformer Pilates studio with spring resistance carriages, posture diagnostics, and private 1-on-1 coaching at Vyomi Fitness Club, Vijayawada.',
    url: 'https://www.vyomifitness.in/pilates',
  },
};

export default function PilatesPage() {
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
              <span className="text-[#B08D57]">Reformer Pilates</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="border-b border-hairline px-pad-x py-12 md:py-20">
          <div className="mx-auto max-w-shell">
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#B08D57]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B08D57]" />
              Discipline 05 · Carriage Training
            </div>
            <SectionHeading as="h1" immediate className="t-hero uppercase text-heading">
              Reformer Pilates.
            </SectionHeading>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted">
              Classical reformer carriage training engineered for spinal elongation, core stability,
              and postural restoration. Coached on precision spring resistance frames.
            </p>
          </div>
        </section>

        {/* Cinematic Video Plate */}
        <section className="border-b border-hairline bg-ink">
          <div className="mx-auto max-w-shell px-pad-x py-10 md:py-16">
            <Reveal>
              <div className="overflow-hidden rounded-lg border border-hairline bg-charcoal">
                <ChapterVideo
                  src="/video/pilates.mp4"
                  poster="/video/pilates-poster.jpg"
                  ratio="21 / 9"
                  label="Dedicated reformer Pilates studio at Vyomi Fitness Club"
                  sizes="100vw"
                  className="w-full"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Visual Details & Specifications */}
        <section className="border-b border-hairline px-pad-x py-16 md:py-24">
          <div className="mx-auto max-w-shell">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
              <Reveal className="md:col-span-5">
                <AssetSlot
                  slot={STUDIO_IMAGES.pilatesDetailA}
                  sizes="(max-width: 767px) 100vw, 40vw"
                  className="w-full rounded-lg border border-hairline"
                />
              </Reveal>

              <Reveal stagger className="flex flex-col justify-center md:col-span-7 md:pl-8">
                <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#B08D57]">
                  The Methodology
                </div>
                <h2 className="mt-2 text-2xl font-medium tracking-tight text-heading md:text-3xl">
                  Precision Carriage Resistance.
                </h2>
                <div className="mt-4 max-w-xl text-sm leading-relaxed text-muted space-y-4">
                  <p>
                    Unlike mat-based exercises, reformer training uses a sliding carriage rigged with calibrated
                    springs, adjustable footbars, and friction-less straps to provide progressive eccentric resistance.
                  </p>
                  <p>
                    Every movement isolates deep intrinsic stabilizers, corrects pelvic tilt, relieves spinal compression,
                    and builds athletic symmetry under constant tension.
                  </p>
                </div>

                <div className="mt-8 border-t border-hairline pt-6">
                  <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                    <div>
                      <div className="font-mono text-xs text-faint uppercase">Coaching Format</div>
                      <div className="mt-1 font-medium text-heading">Private & Semi-Private</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-faint uppercase">Focus</div>
                      <div className="mt-1 font-medium text-heading">Core & Posture Alignment</div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-faint uppercase">Access</div>
                      <div className="mt-1 font-medium text-[#B08D57]">VIP & VVIP Tier</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Booking & Call to Action */}
        <section className="px-pad-x py-16 md:py-24 bg-surface">
          <div className="mx-auto max-w-shell text-center">
            <SectionHeading className="t-h2 uppercase text-heading">
              {'Experience Reformer Pilates\nat Vyomi.'}
            </SectionHeading>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
              Book a private assessment or reserve your membership during the exclusive pre-sale phase.
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
