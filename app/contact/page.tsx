import type { Metadata } from 'next';
import Link from 'next/link';
import WhatsAppEnquiry from '@/components/WhatsAppEnquiry';
import SectionHeading from '@/components/SectionHeading';
import Footer from '@/components/Footer';
import { site, whatsappLink, directionsLink } from '@/config/site';

export const metadata: Metadata = {
  title: 'Contact Concierge Desk',
  description:
    'Connect with Vyomi Fitness Club concierge in Vijayawada. Official WhatsApp desk, direct phone line (+91 99481 80333), location address, and membership support.',
  alternates: {
    canonical: 'https://www.vyomifitness.in/contact',
  },
  openGraph: {
    title: 'Contact Concierge Desk · Vyomi Fitness Club',
    description:
      'Connect with Vyomi Fitness Club concierge in Vijayawada. Official WhatsApp desk, direct phone line (+91 99481 80333), location address, and membership support.',
    url: 'https://www.vyomifitness.in/contact',
  },
};

export default function ContactPage() {
  const whatsapp = whatsappLink('Hello Vyomi Concierge — I would like to enquire.');
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
              <span className="text-[#B08D57]">Contact Concierge</span>
            </div>
          </div>
        </div>

        {/* Header Block */}
        <section className="border-b border-hairline px-pad-x py-12 md:py-16">
          <div className="mx-auto max-w-shell">
            <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-[#B08D57]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B08D57]" />
              Concierge & Desk Support
            </div>
            <SectionHeading as="h1" immediate className="t-hero uppercase text-heading">
              Get in Touch.
            </SectionHeading>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-muted">
              Speak directly with our club concierge desk for membership tiers, private reformer bookings,
              or location guidance in Patamata, Vijayawada.
            </p>

            {/* Quick Contact Cards */}
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-lg border border-hairline bg-surface p-6">
                <div className="font-mono text-xs text-faint uppercase">Direct Hotline</div>
                <div className="mt-2 text-lg font-medium text-heading">
                  <a href={`tel:${site.phone}`} className="hover:text-[#B08D57] transition-colors">
                    {site.phone}
                  </a>
                </div>
                <div className="mt-1 text-xs text-muted">Call desk directly</div>
              </div>

              <div className="rounded-lg border border-hairline bg-surface p-6">
                <div className="font-mono text-xs text-faint uppercase">WhatsApp Concierge</div>
                <div className="mt-2 text-lg font-medium text-[#B08D57]">
                  {whatsapp ? (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Chat on WhatsApp ↗
                    </a>
                  ) : (
                    <span>{site.phone}</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted">Instant response</div>
              </div>

              <div className="rounded-lg border border-hairline bg-surface p-6">
                <div className="font-mono text-xs text-faint uppercase">Direct Email</div>
                <div className="mt-2 text-lg font-medium text-heading">
                  <a href={`mailto:${site.email}`} className="hover:text-[#B08D57] transition-colors">
                    {site.email}
                  </a>
                </div>
                <div className="mt-1 text-xs text-muted">Official correspondence</div>
              </div>
            </div>
          </div>
        </section>

        {/* WhatsApp Enquiry Form Interactive Component */}
        <WhatsAppEnquiry />

        {/* Location & Navigation Link */}
        <section className="border-t border-hairline px-pad-x py-12 md:py-16 bg-surface">
          <div className="mx-auto max-w-shell flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="font-mono text-xs text-faint uppercase">Physical Address</div>
              <div className="mt-2 text-base font-medium text-heading">
                Sonovision Durgaplaza, 4th Floor, Patamata, Benz Circle, Vijayawada — 520010
              </div>
              <div className="mt-1 text-xs text-muted">Dedicated Lift & Valet Parking available</div>
            </div>

            <div className="flex flex-wrap gap-4">
              {directions && (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-solid shine"
                >
                  Directions on Maps ↗
                </a>
              )}
              <Link href="/register" className="btn-line shine">
                VIP Pre-Sale Portal
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
