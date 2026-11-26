import type { Metadata } from 'next';
import Link from 'next/link';
import AssetSlot from '@/components/AssetSlot';
import Reveal from '@/components/Reveal';
import SectionHeading from '@/components/SectionHeading';
import Footer from '@/components/Footer';
import { STUDIO_IMAGES } from '@/config/assets';
import { AMENITIES } from '@/data/club';

export const metadata: Metadata = {
  title: 'Executive Wellness & Recovery Suite',
  description:
    'Luxury wellness and recovery suite in Vijayawada. Finnish saunas, thermal steam rooms, sub-zero cold plunge ice baths, red light therapy, and contrast therapy at Vyomi Fitness Club.',
  alternates: {
    canonical: 'https://www.vyomifitness.in/wellness',
  },
  openGraph: {
    title: 'Executive Wellness & Recovery Suite · Vyomi Fitness Club',
    description:
      'Luxury wellness and recovery suite in Vijayawada. Finnish saunas, thermal steam rooms, sub-zero cold plunge ice baths, red light therapy, and contrast therapy at Vyomi Fitness Club.',
    url: 'https://www.vyomifitness.in/wellness',
  },
};

export default function WellnessPage() {
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
              <span className="text-[#B08D57]">Wellness & Recovery</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="border-b border-hairline px-pad-x py-12 md:py-20">
          <div className="mx-auto max-w-shell text-center">
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#B08D57]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B08D57]" />
              Discipline 04 · Thermal Contrast & Cellular Restoration
            </div>
            <SectionHeading as="h1" immediate className="t-hero mx-auto uppercase text-heading">
              Recovery.
            </SectionHeading>
            <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-muted">
              Thermal dry saunas, steam rooms, sub-zero cold plunge tubs, and red-light restoration lounges.
              Engineered to reset your nervous system and accelerate muscle tissue repair.
            </p>
          </div>
        </section>

        {/* Main Architectural Visual */}
        <section className="border-b border-hairline bg-ink">
          <div className="mx-auto max-w-shell px-pad-x py-10 md:py-16">
            <Reveal>
              <div className="overflow-hidden rounded-lg border border-hairline bg-charcoal">
                <AssetSlot
                  slot={STUDIO_IMAGES.wellness}
                  sizes="(max-width: 1023px) 100vw, 56rem"
                  className="w-full"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Amenity Matrix */}
        <section className="border-b border-hairline px-pad-x py-16 md:py-24">
          <div className="mx-auto max-w-shell">
            <div className="text-center">
              <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#B08D57]">
                Thermal Amenities
              </div>
              <h2 className="mt-2 text-2xl font-medium tracking-tight text-heading md:text-3xl">
                The Recovery Protocol
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {AMENITIES.map((amenity) => (
                <div
                  key={amenity}
                  className="rounded-lg border border-hairline bg-surface p-6 transition-colors hover:border-hairline-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-[#B08D57]" />
                    <span className="text-base font-medium text-heading">{amenity}</span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted">
                    Engineered for temperature contrast therapy, reducing DOMS inflammation and promoting deep physical rejuvenation.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-pad-x py-16 md:py-24 bg-surface">
          <div className="mx-auto max-w-shell text-center">
            <SectionHeading className="t-h2 uppercase text-heading">
              {'Reset Your Body\nat Vyomi.'}
            </SectionHeading>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted">
              Included with select VIP & VVIP membership tiers. Experience the thermal suites firsthand.
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
