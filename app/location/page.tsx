import type { Metadata } from 'next';
import Link from 'next/link';
import LocationSection from '@/components/LocationSection';
import SectionHeading from '@/components/SectionHeading';
import Footer from '@/components/Footer';
import { site, directionsLink } from '@/config/site';

export const metadata: Metadata = {
  title: 'Club Location & Directions',
  description:
    'Find Vyomi Fitness Club at Sonovision Durgaplaza, 4th Floor, Patamata, Benz Circle, Vijayawada. Dedicated lift, valet parking, and direct map navigation.',
  alternates: {
    canonical: 'https://www.vyomifitness.in/location',
  },
  openGraph: {
    title: 'Club Location & Directions · Vyomi Fitness Club',
    description:
      'Find Vyomi Fitness Club at Sonovision Durgaplaza, 4th Floor, Patamata, Benz Circle, Vijayawada. Dedicated lift, valet parking, and direct map navigation.',
    url: 'https://www.vyomifitness.in/location',
  },
};

export default function LocationPage() {
  const directions = directionsLink();

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
              <span className="text-[#B08D57]">Location & Directions</span>
            </div>
          </div>
        </div>

        {/* Header Block */}
        <section className="border-b border-hairline px-pad-x py-12 md:py-16">
          <div className="mx-auto max-w-shell">
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#B08D57]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B08D57]" />
              Patamata · Vijayawada
            </div>
            <SectionHeading as="h1" immediate className="t-hero uppercase text-heading">
              Visit The Club.
            </SectionHeading>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted">
              Sonovision Durgaplaza, 4th Floor, Patamata, Benz Circle, Vijayawada — 520010.
              Featuring a dedicated private elevator and on-site valet parking.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              {directions && (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-solid shine"
                >
                  Open in Google Maps ↗
                </a>
              )}
              <Link href="/register" className="btn-line shine">
                VIP Membership Pre-Sale
              </Link>
            </div>
          </div>
        </section>

        {/* Location Section with Midnight Map and Address Card */}
        <LocationSection />
      </main>

      <Footer />
    </>
  );
}
