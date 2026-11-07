'use client';

import { useState, useEffect } from 'react';
import Magnetic from '@/components/Magnetic';
import { MenuIcon, CloseIcon } from '@/components/Icons';

interface NavbarProps {
  onOpenInquiry: () => void;
}

export default function Navbar({ onOpenInquiry }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'ARCHITECTURE', href: '#architecture' },
    { label: 'THE FLOOR', href: '#floor' },
    { label: 'SANCTUARY', href: '#sanctuary' },
    { label: 'SPECIALISTS', href: '#specialists' },
    { label: 'CURATION', href: '#membership' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isScrolled
            ? 'bg-[var(--ink)]/90 backdrop-blur-md border-b border-[var(--hairline)] py-3'
            : 'bg-transparent border-b border-[var(--hairline)]/60 py-5'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-12">
          {/* Brand Mark */}
          <a
            href="#"
            className="group flex flex-col items-start focus:outline-none"
            aria-label="V CLUB Home"
          >
            <span className="font-display text-1 md:text-2 font-medium tracking-tight text-[var(--bone)] transition-colors group-hover:text-[var(--champagne)]">
              V CLUB
            </span>
            <span className="type-label -mt-1 hidden text-[0.65rem] tracking-[0.2em] md:block">
              ATHLETIC SANCTUARY
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center space-x-8 lg:flex">
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="type-label text-[var(--bone-dim)] transition-colors hover:text-[var(--bone)]"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right Action & Coordinates */}
          <div className="flex items-center space-x-6">
            <span className="type-label hidden font-mono text-[0.65rem] text-[var(--bone-dim)] xl:inline-block">
              51°30&apos;36&quot;N 0°08&apos;40&quot;W
            </span>

            <Magnetic>
              <button
                type="button"
                onClick={onOpenInquiry}
                className="border border-[var(--hairline)] bg-[var(--surface)] px-5 py-2.5 text-label text-[var(--bone)] transition-all hover:border-[var(--champagne)] hover:text-[var(--champagne)] active:bg-[var(--surface-2)]"
              >
                INQUIRE
              </button>
            </Magnetic>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[var(--bone)] focus:outline-none lg:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col justify-between bg-[var(--ink)] px-6 pt-24 pb-12 lg:hidden">
          <div className="flex flex-col space-y-6">
            <span className="type-label text-[var(--bone-dim)]">INDEX</span>
            {navLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="font-display text-3 font-medium text-[var(--bone)] transition-colors hover:text-[var(--champagne)]"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="border-t border-[var(--hairline)] pt-8">
            <p className="type-label mb-4 text-[var(--bone-dim)]">ADMISSION</p>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInquiry();
              }}
              className="w-full border border-[var(--hairline)] bg-[var(--surface)] py-4 text-center text-label text-[var(--bone)] hover:border-[var(--champagne)] hover:text-[var(--champagne)]"
            >
              REQUEST APPLICATION
            </button>
            <p className="type-label mt-6 text-center text-[0.65rem] text-[var(--bone-dim)]">
              LIMITED TO 450 GLOBAL MEMBERS
            </p>
          </div>
        </div>
      )}
    </>
  );
}

