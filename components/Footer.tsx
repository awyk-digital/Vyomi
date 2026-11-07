'use client';

import { useState, useEffect } from 'react';

interface FooterProps {
  onOpenInquiry: () => void;
}

export default function Footer({ onOpenInquiry }: FooterProps) {
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > window.innerHeight * 0.6);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <footer className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)] pt-20 pb-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-[var(--pad-x)] flex flex-col justify-between">
          {/* Top Row: Left line + Right Inquire CTA */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-10 gap-6">
            <h2 className="font-display text-2 font-light text-[var(--bone)]">
              Pre-sale opens 12 November.
            </h2>

            <button
              type="button"
              onClick={onOpenInquiry}
              className="border border-[var(--hairline)] rounded-[2px] px-7 py-3 text-label text-[var(--bone-dim)] hover:text-[var(--bone)] hover:bg-[rgba(244,240,234,0.06)] hover:border-[var(--bone-dim)] transition-all duration-300 w-fit"
            >
              Inquire for access
            </button>
          </div>

          <div className="h-px w-full bg-[var(--hairline)] mb-14" />

          {/* Middle Links (no membership!) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 text-label text-[0.68rem]">
            <div className="flex flex-col space-y-3">
              <span className="text-[var(--bone-dim)] opacity-40">Sanctuary</span>
              <a href="/#floor" className="text-[var(--bone)] hover:text-[var(--champagne)]">The floor</a>
              <a href="/#floor" className="text-[var(--bone)] hover:text-[var(--champagne)]">Panatta apparatus</a>
              <a href="/#specialists" className="text-[var(--bone)] hover:text-[var(--champagne)]">The coaches</a>
            </div>

            <div className="flex flex-col space-y-3">
              <span className="text-[var(--bone-dim)] opacity-40">Disciplines</span>
              <a href="/studio" className="text-[var(--bone)] hover:text-[var(--champagne)]">The Studio</a>
              <a href="/studio" className="text-[var(--bone)] hover:text-[var(--champagne)]">Reformer pilates</a>
              <a href="/studio" className="text-[var(--bone)] hover:text-[var(--champagne)]">Hyrox racing</a>
            </div>

            <div className="flex flex-col space-y-3">
              <span className="text-[var(--bone-dim)] opacity-40">Recovery</span>
              <a href="/#wellness" className="text-[var(--bone)] hover:text-[var(--champagne)]">Salt therapy</a>
              <a href="/#wellness" className="text-[var(--bone)] hover:text-[var(--champagne)]">Cold plunge</a>
              <a href="/#wellness" className="text-[var(--bone)] hover:text-[var(--champagne)]">Cedar sauna</a>
            </div>

            <div className="flex flex-col space-y-3">
              <span className="text-[var(--bone-dim)] opacity-40">Contact</span>
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="text-[var(--bone)] hover:text-[var(--champagne)]">
                WhatsApp concierge ↗
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[var(--bone)] hover:text-[var(--champagne)]">
                Instagram ↗
              </a>
            </div>
          </div>
        </div>

        {/* Oversized VYOMI Wordmark — font-display Boska Light 300, clipped at bottom edge */}
        <div className="w-full overflow-hidden select-none -mb-6 md:-mb-12">
          <div className="font-display text-[20vw] font-light tracking-[-0.03em] text-[var(--bone)] opacity-[0.06] hover:opacity-[0.12] transition-opacity duration-700 leading-none whitespace-nowrap text-center">
            Vyomi
          </div>
        </div>

        {/* Footer Subline */}
        <div className="max-w-6xl mx-auto px-[var(--pad-x)] pt-6 border-t border-[var(--hairline)] flex flex-col sm:flex-row items-center justify-between gap-4 text-label text-[0.65rem] text-[var(--bone-dim)]">
          <span>Vyomi Fitness Club · Vijayawada · Est. 2026</span>
          <span>Quiet luxury wellness</span>
        </div>
      </footer>

      {/* Sticky Mobile Bar below 768px */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] bg-[#0B0A09]/90 backdrop-blur-md border-t border-[var(--hairline)] flex items-center transition-transform duration-500 pb-[env(safe-area-inset-bottom)] ${
          showStickyBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <a
          href="https://wa.me/919999999999?text=Hi%20Vyomi%20%E2%80%94%20I'd%20like%20to%20inquire%20about%20the%20pre-sale."
          target="_blank"
          rel="noopener noreferrer"
          className="w-1/2 h-full flex items-center justify-center border-r border-[var(--hairline)] text-label text-[0.68rem] text-[var(--bone)]"
        >
          WhatsApp
        </a>
        <button
          type="button"
          onClick={onOpenInquiry}
          className="w-1/2 h-full text-label text-[0.68rem] text-[var(--bone)] hover:text-[var(--champagne)]"
        >
          Inquire
        </button>
      </div>
    </>
  );
}
