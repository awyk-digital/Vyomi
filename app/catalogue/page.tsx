import type { Metadata } from 'next';
import Link from 'next/link';
import StudioCatalogue from '@/components/StudioCatalogue';
import { site, addressLine, whatsappLink, presaleDisplay } from '@/config/site';

export const metadata: Metadata = {
  title: 'Fitness Catalogue',
  description:
    'Complete equipment showroom at Vyomi Fitness Club, Vijayawada — Panatta Italian Series, Plate-Loaded heavy iron, and SHUA cardio & selectorized floor.',
};

const GUTTER = 'px-[clamp(1.25rem,5vw,5.5rem)]';

export default function CataloguePage() {
  const addr = addressLine();
  const presale = presaleDisplay();
  const wa = whatsappLink('Hello Vyomi — I would like to enquire about membership and the equipment floor.');

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#171513] selection:bg-[#8C2230] selection:text-white">
      {/* Illuminated Top Navigation Strip — matches light architectural theme */}
      <header className="border-b border-[#181614]/12 bg-[#FCFBF8]">
        <div
          className={`flex flex-wrap items-center gap-x-6 gap-y-3 pb-5 ${GUTTER}`}
          style={{ paddingTop: 'clamp(5rem, 11vw, 7.5rem)' }}
        >
          <Link
            href="/studio"
            className="t-ui text-[#565048] transition-colors hover:text-[#141210]"
          >
            ← Studio
          </Link>
          <Link
            href="/"
            className="t-ui text-[#787064] transition-colors hover:text-[#141210]"
          >
            Home
          </Link>
          <div className="ms-auto">
            <Link
              href="/#trial"
              className="px-4 py-2 border border-[#141210] text-[#141210] hover:bg-[#141210] hover:text-white t-ui transition-colors"
            >
              Two-day request
            </Link>
          </div>
        </div>
      </header>

      <main id="main">
        <StudioCatalogue />
      </main>

      {/* Cohesive Light Architectural Showroom Footer */}
      <footer className="border-t border-[#181614]/12 bg-[#ECE8DF] py-14 text-[#171513]">
        <div className={`mx-auto max-w-[1440px] ${GUTTER}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#181614]/12">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#8C2230]">
                {site.name} · {site.city}
              </p>
              <p className="mt-2 t-h3 text-[#141210]">
                {presale
                  ? `Pre-sale opens ${presale}.`
                  : 'Elevate Your Fitness.'}
              </p>
              {addr && <p className="mt-1 text-sm text-[#565048]">{addr}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#8C2230] hover:bg-[#6E1A25] text-white uppercase tracking-[0.16em] transition-colors"
                >
                  WhatsApp Enquiry ↗
                </a>
              )}
              {site.instagramUrl && (
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 border border-[#141210]/30 hover:border-[#141210] text-[#141210] uppercase tracking-[0.16em] transition-colors"
                >
                  Instagram ↗
                </a>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#6E675D]">
            <span>Patamata · Sonovision, 4th Floor · {site.phone}</span>
            <span>{site.email}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
