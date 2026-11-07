'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface HeaderProps {
  onOpenInquiry: () => void;
}

export default function Header({ onOpenInquiry }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Facilities', href: '/#floor' },
    { label: 'The Studio', href: '/studio' },
    { label: 'Wellness', href: '/#wellness' },
    { label: 'The Coaches', href: '/#specialists' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 h-[72px] px-[var(--pad-x)] flex items-center justify-between transition-all duration-500 ${
          scrolled
            ? 'bg-[#0B0A09]/80 backdrop-blur-[24px] border-b border-[var(--hairline)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        {/* Placeholder spacer for traveling logo */}
        <Link href="/" className="w-[120px] h-[36px]" aria-label="Vyomi Sanctuary" />

        {/* Desktop Links (weight 400, label style) */}
        <nav className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="type-label text-[0.68rem] tracking-[0.22em] text-[var(--bone-dim)] hover:text-[var(--bone)] transition-colors duration-300"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Action: Inquire button */}
        <div className="flex items-center space-x-6">
          <button
            type="button"
            onClick={onOpenInquiry}
            className="border border-[var(--hairline)] rounded-[2px] px-5 py-2 text-label text-[0.68rem] tracking-[0.22em] text-[var(--bone-dim)] hover:text-[var(--bone)] hover:bg-[rgba(244,240,234,0.06)] hover:border-[var(--bone-dim)] transition-all duration-300"
          >
            Inquire
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-[var(--bone-dim)] hover:text-[var(--bone)]"
            aria-label="Open menu"
          >
            <svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M0 2H18M0 10H18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--ink)] px-[var(--pad-x)] pt-12 pb-10 flex flex-col justify-between md:hidden">
          <div className="flex items-center justify-between border-b border-[var(--hairline)] pb-6">
            <span className="font-display text-1 font-light text-[var(--bone)]">
              Vyomi
            </span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="p-2 text-[var(--bone-dim)] hover:text-[var(--bone)]"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col space-y-6 my-auto">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-display text-2 font-light text-[var(--bone-dim)] hover:text-[var(--bone)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-[var(--hairline)] pt-6">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenInquiry();
              }}
              className="w-full border border-[var(--hairline)] py-3 text-center text-label text-[var(--bone)]"
            >
              Request Access
            </button>
          </div>
        </div>
      )}
    </>
  );
}
