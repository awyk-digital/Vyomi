import type { Metadata } from 'next';
import Link from 'next/link';
import StudioCatalogue from '@/components/StudioCatalogue';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Fitness Equipment Catalogue',
  description:
    'Complete equipment showroom at Vyomi Fitness Club, Vijayawada. Italian Panatta FreeWeight, Plate-Loaded, and Selectorized stations.',
  alternates: {
    canonical: 'https://www.vyomifitness.in/catalogue',
  },
  openGraph: {
    title: 'Fitness Equipment Catalogue · Vyomi Fitness Club',
    description:
      'Complete equipment showroom at Vyomi Fitness Club, Vijayawada. Italian Panatta FreeWeight, Plate-Loaded, and Selectorized stations.',
    url: 'https://www.vyomifitness.in/catalogue',
  },
};

export default function CataloguePage() {
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
              <span className="text-[#B08D57]">Catalogue</span>
            </div>
          </div>
        </div>

        {/* Full Equipment Floor & Interactive Inspection Showroom */}
        <StudioCatalogue />
      </main>

      <Footer />
    </>
  );
}
