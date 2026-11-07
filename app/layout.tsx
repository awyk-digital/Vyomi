import type { Metadata, Viewport } from 'next';
import './globals.css';
import FilmGrain from '@/components/FilmGrain';
import SmoothScroll from '@/components/SmoothScroll';

export const metadata: Metadata = {
  title: 'Vyomi — Quiet Luxury Wellness & Athletic Sanctuary · Vijayawada',
  description:
    'Vyomi is Vijayawada’s quiet luxury athletic sanctuary. Bespoke Italian Panatta mechanics, cold plunge hydrotherapy, and reformer kinetics.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#0B0A09',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[var(--ink)] text-[var(--bone)]">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=boska@300,400&f[]=satoshi@300,400&display=swap"
        />
      </head>
      <body className="bg-[var(--ink)] text-[var(--bone)] antialiased min-h-screen selection:bg-[var(--champagne)] selection:text-[var(--ink)]">
        <FilmGrain />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
