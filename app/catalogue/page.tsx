import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '@/components/Footer';
import StudioCatalogue from '@/components/StudioCatalogue';

export const metadata: Metadata = {
  title: 'Fitness Catalogue',
  description:
    'Complete equipment showroom at Vyomi Fitness Club, Vijayawada — Panatta Italian Series, Plate-Loaded heavy iron, and SHUA cardio & selectorized floor.',
};

const GUTTER = 'px-[clamp(1.25rem,5vw,5.5rem)]';

export default function CataloguePage() {
  return (
    <>
      {/* Slim top bar matching Studio & Home editorial chrome */}
      <header className="border-b border-hairline bg-ink">
        <div
          className={`flex flex-wrap items-center gap-x-6 gap-y-3 pb-5 ${GUTTER}`}
          style={{ paddingTop: 'clamp(5rem, 11vw, 7.5rem)' }}
        >
          <Link href="/studio" className="t-ui text-muted transition-colors hover:text-heading">
            ← Studio
          </Link>
          <Link href="/" className="t-ui text-faint transition-colors hover:text-heading">
            Home
          </Link>
          <div className="ms-auto">
            <Link href="/#trial" className="btn-line shine !py-2">
              Two-day request
            </Link>
          </div>
        </div>
      </header>

      <main id="main" className="bg-ink text-muted">
        <StudioCatalogue />
      </main>

      <Footer />
    </>
  );
}
