import type { Metadata, Viewport } from 'next';
import './globals.css';
import BrandLogo from '@/components/BrandLogo';
import StatusMark from '@/components/StatusMark';
import FilmGrain from '@/components/FilmGrain';
import RouteRipple from '@/components/RouteRipple';
import SmoothScroll from '@/components/SmoothScroll';
import { site, addressLine } from '@/config/site';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.vyomifitness.in'
  ),
  title: {
    default: 'Vyomi Fitness Club — Luxury Gym in Vijayawada',
    template: '%s · Vyomi Fitness Club',
  },
  description:
    'Vyomi Fitness Club, Vijayawada. Elite Panatta equipment, HYROX official conditioning, reformer Pilates, and luxury wellness & recovery suite in Patamata.',
  applicationName: site.name,
  keywords: [
    'Vyomi',
    'Vyomi Fitness',
    'Vyomi Fitness Club',
    'Vyomi Gym',
    'Gym in Vijayawada',
    'Fitness Club Vijayawada',
    'Panatta Gym Vijayawada',
    'HYROX Vijayawada',
    'Reformer Pilates Vijayawada',
    'Luxury Gym Vijayawada',
    'Patamata Gym',
  ],
  alternates: {
    canonical: 'https://www.vyomifitness.in',
  },
  icons: {
    icon: [{ url: '/img/vyomi-brand-logo.png', type: 'image/png' }],
    apple: [{ url: '/img/vyomi-brand-logo.png' }],
  },
  openGraph: {
    type: 'website',
    url: 'https://www.vyomifitness.in',
    siteName: site.name,
    title: 'Vyomi Fitness Club — Luxury Gym in Vijayawada',
    description:
      'Elite Panatta equipment, HYROX official conditioning, reformer Pilates, and luxury wellness & recovery suite in Vijayawada.',
    images: [{ url: '/video/hero-poster.jpg', width: 1920, height: 1280, alt: 'Vyomi Fitness Club' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vyomi Fitness Club — Luxury Gym in Vijayawada',
    description:
      'Elite Panatta equipment, HYROX conditioning, reformer Pilates, and recovery suite.',
    images: ['/video/hero-poster.jpg'],
  },
  verification: {
    google: 'google72eeb563c4c02089',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
/**
 * Enhanced Google Structured Data Schema (@graph)
 * Injects LocalBusiness, WebSite, and SiteNavigationElement for Google Sitelinks & Knowledge Panel
 */
function LocalBusinessSchema() {
  const line = addressLine();
  if (!line || !site.address) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://www.vyomifitness.in/#website',
        url: 'https://www.vyomifitness.in',
        name: site.name,
        alternateName: ['Vyomi', 'Vyomi Fitness', 'Vyomi Gym'],
        description:
          'Vyomi Fitness Club, Vijayawada. Elite Panatta equipment, HYROX conditioning, reformer Pilates, and luxury recovery suite.',
        publisher: {
          '@id': 'https://www.vyomifitness.in/#organization',
        },
      },
      {
        '@type': ['ExerciseGym', 'SportsActivityLocation', 'HealthClub'],
        '@id': 'https://www.vyomifitness.in/#organization',
        name: site.name,
        alternateName: ['Vyomi', 'Vyomi Fitness', 'Vyomi Gym', 'Vyomi Fitness Club Vijayawada'],
        url: 'https://www.vyomifitness.in',
        logo: 'https://www.vyomifitness.in/img/vyomi-brand-logo.png',
        image: [
          'https://www.vyomifitness.in/video/hero-poster.jpg',
          'https://www.vyomifitness.in/img/area-reception.png',
          'https://www.vyomifitness.in/img/eq-pin-main-v2.jpg',
          'https://www.vyomifitness.in/img/wellness-main.jpg',
          'https://www.vyomifitness.in/img/studio-hyrox.png',
        ],
        description:
          'Vijayawada premier 15,000 sq. ft. luxury fitness club featuring Italian Panatta equipment, official HYROX training, reformer Pilates, and executive recovery suite.',
        priceRange: '₹₹₹₹',
        currenciesAccepted: 'INR',
        hasMap: 'https://maps.app.goo.gl/ocqSrodeTthzK3L78',
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
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'The Studio',
        url: 'https://www.vyomifitness.in/studio',
        description: 'Explore the five disciplines: Panatta Strength, HYROX, Pilates, Zumba, and Wellness.',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Panatta Strength Floor',
        url: 'https://www.vyomifitness.in/studio#fitness',
        description: 'Italian Panatta FreeWeight and pin-loaded selectorized equipment floor.',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Official HYROX Training',
        url: 'https://www.vyomifitness.in/studio#hyrox',
        description: 'High-performance HYROX conditioning, ergs, sleds, and functional training.',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Reformer Pilates Studio',
        url: 'https://www.vyomifitness.in/studio#pilates',
        description: 'Classical reformer Pilates carriage training with posture diagnostics.',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Executive Wellness & Recovery',
        url: 'https://www.vyomifitness.in/studio#wellness',
        description: 'Finnish saunas, steam rooms, red light therapy, and ice bath cold immersion.',
      },
      {
        '@type': 'SiteNavigationElement',
        name: 'Club Location & Directions',
        url: 'https://www.vyomifitness.in/#location',
        description: 'Near Sonovision, Patamata, Vijayawada with private lift and valet parking.',
      },
    ],
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
