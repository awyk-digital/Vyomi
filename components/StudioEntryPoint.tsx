'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function StudioEntryPoint() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="relative w-full h-[60vh] overflow-hidden border-t border-b border-[var(--hairline)] flex items-center justify-center">
      {/* Background Media with new soft grade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1920&q=85"
          alt="The Studio at Vyomi"
          fill
          sizes="100vw"
          className="object-cover"
          style={{
            filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/80 via-[var(--ink)]/40 to-[var(--ink)]/80"
        />
      </div>

      {/* Centred Glass Bar:
          width: clamp(280px, 42vw, 520px), height: 96px,
          background: var(--glass), backdrop-filter: blur(34px) saturate(1.2),
          border: 1px solid rgba(244,240,234,0.1), border-radius: 3px,
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.14) */}
      <Link
        href="/studio"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative z-10 flex items-center justify-between px-8 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none"
        style={{
          width: isHovered
            ? 'calc(clamp(280px, 42vw, 520px) + 24px)'
            : 'clamp(280px, 42vw, 520px)',
          height: '96px',
          background: 'var(--glass)',
          backdropFilter: isHovered ? 'blur(44px) saturate(1.25)' : 'blur(34px) saturate(1.2)',
          WebkitBackdropFilter: isHovered ? 'blur(44px) saturate(1.25)' : 'blur(34px) saturate(1.2)',
          border: '1px solid rgba(244,240,234,0.1)',
          borderRadius: '3px',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
        }}
      >
        <span
          className={`font-display text-2 font-light tracking-tight transition-all duration-500 ${
            isHovered ? 'text-[var(--bone)] light-sweep' : 'text-[var(--bone-dim)]'
          }`}
        >
          The Studio
        </span>

        <div className="h-6 w-px bg-[var(--hairline)] mx-6" />

        <span className="text-[1.2rem] text-[var(--bone-dim)] group-hover:text-[var(--bone)] transition-colors transform group-hover:translate-x-1 group-hover:-translate-y-0.5 duration-400">
          ↗
        </span>
      </Link>
    </section>
  );
}

