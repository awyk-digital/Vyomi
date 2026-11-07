import type { Metadata, Viewport } from 'next';
import './globals.css';
import BrandLogo from '@/components/BrandLogo';
import StatusMark from '@/components/StatusMark';
import FilmGrain from '@/components/FilmGrain';
import RouteRipple from '@/components/RouteRipple';
import SmoothScroll from '@/components/SmoothScroll';
import { site, addressLine } from '@/config/site';

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL to the production origin so Open Graph image
  // URLs resolve absolutely instead of falling back to localhost.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  title: {
    default: 'Vyomi Fitness Club — Vijayawada',
    template: '%s · Vyomi Fitness Club',
  },
  description:
    'Vyomi Fitness Club, Vijayawada. Panatta equipment, HYROX conditioning, reformer Pilates, and a full wellness and recovery suite.',
  applicationName: site.name,
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: [{ url: '/logo.png' }],
  },
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: 'Vyomi Fitness Club — Vijayawada',
    description:
      'Panatta equipment, HYROX conditioning, reformer Pilates, and a full wellness and recovery suite.',
    images: [{ url: '/video/hero-poster.jpg', width: 1920, height: 1280 }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

/**
 * LocalBusiness structured data.
 *
 * Only emitted once the verified address is confirmed in config/site.ts —
 * publishing an invented address as structured data would be worse than
 * publishing none at all.
 */
function LocalBusinessSchema() {
  const line = addressLine();
  if (!line || !site.address) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: site.name,
    description:
      'Fitness club in Vijayawada with Panatta equipment, HYROX conditioning, reformer Pilates and a wellness and recovery suite.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: [site.address.line1, site.address.line2].filter(Boolean).join(', '),
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    ...(site.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: site.coordinates.lat,
        longitude: site.coordinates.lng,
      },
    }),
    ...(site.phone && { telephone: site.phone }),
    ...(site.email && { email: site.email }),
    ...(site.instagramUrl && { sameAs: [site.instagramUrl] }),
    ...(site.openingHours && {
      openingHoursSpecification: site.openingHours.map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.days,
        opens: h.opens,
        closes: h.closes,
      })),
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="anonymous" />
        {/*
          General Sans Regular (400) + Medium (500) covers every heading, label,
          button and body style on the site.

          Boska is NOT requested. The brief reserves it for "only the single
          editorial quote", and no client-approved quote has been supplied — and
          inventing a member testimonial is explicitly out of bounds. Shipping an
          unused display family would cost a request for nothing.

          To enable it when the quote arrives: append `&f[]=boska@500` below.
          The `--font-quote` token and `.t-quote` class are already in place.
        */}
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500&display=swap"
        />
      </head>
      <body className="bg-ink text-muted antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:border focus:border-hairline-2 focus:bg-ink focus:px-4 focus:py-2 focus:text-heading"
        >
          Skip to content
        </a>

        <BrandLogo />
        <StatusMark />
        <SmoothScroll>{children}</SmoothScroll>
        <RouteRipple />
        <FilmGrain />
        <LocalBusinessSchema />
      </body>
    </html>
  );
}
