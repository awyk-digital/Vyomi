'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';

interface HeroProps {
  onOpenInquiry: () => void;
}

export default function Hero({ onOpenInquiry }: HeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const logo = logoRef.current;
    const content = contentRef.current;
    if (!logo || !content) return;

    if (prefersReducedMotion) {
      gsap.set(logo, {
        position: 'fixed',
        top: 24,
        left: 'var(--pad-x)',
        x: 0,
        y: 0,
        width: 130,
        opacity: 0.9,
      });
      gsap.set(content, { opacity: 1 });
      setAnimationComplete(true);
      return;
    }

    // Sequence under 4s:
    // 1. Logo fades up to 0.9 over 1.4s
    // 2. Logo eases down and left to header position over 1.3s expo.inOut
    // 3. Hero content fades in behind it
    const tl = gsap.timeline({
      onComplete: () => setAnimationComplete(true),
    });

    tl.fromTo(
      logo,
      {
        opacity: 0,
        scale: 1,
        xPercent: -50,
        yPercent: -50,
        left: '50%',
        top: '46%',
      },
      {
        opacity: 0.92,
        duration: 1.4,
        ease: 'power2.out',
      }
    );

    // FLIP to header position (top-left)
    tl.to(
      logo,
      {
        left: 'var(--pad-x)',
        top: '24px',
        xPercent: 0,
        yPercent: 0,
        width: '120px',
        duration: 1.3,
        ease: 'expo.inOut',
      },
      '+=0.4'
    );

    // Hero content fades in
    tl.fromTo(
      content,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
      '-=0.4'
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-[100svh] w-full overflow-hidden bg-[var(--ink)] flex items-center"
    >
      {/* Background Video — plays immediately on load, muted, full viewport */}
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
        <video
          poster="/video/hero-poster.jpg"
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
          style={{
            // Soft lifted grade
            filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
          }}
        >
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>

        {/* Gentle vignette + Left gradient from rgba(11,10,9,0.75) to transparent at 60% */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(11,10,9,0.75) 0%, rgba(11,10,9,0.4) 35%, transparent 60%), radial-gradient(circle at center, transparent 40%, rgba(11,10,9,0.6) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 65%, var(--ink) 100%)',
          }}
        />
      </div>

      {/* Traveling FLIP Logo (starts large centered ~38vw, travels to header) */}
      <div
        ref={logoRef}
        className="fixed z-50 pointer-events-none w-[clamp(240px,38vw,480px)] will-change-transform"
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/logo.png"
            alt="Vyomi Fitness Club"
            fill
            priority
            className="object-contain drop-shadow-none"
          />
        </div>
      </div>

      {/* Hero Content — Minimal, quiet luxury, max-width 16ch */}
      <div
        ref={contentRef}
        className="relative z-10 w-full px-[var(--pad-x)] flex flex-col items-start opacity-0"
      >
        <div className="max-w-[20ch] flex flex-col items-start">
          {/* Label */}
          <span className="type-label block text-[var(--bone-dim)] mb-4 tracking-[0.22em]">
            Vijayawada
          </span>

          {/* Headline: --font-display weight 300, sentence case, 2-4 words maximum */}
          <h1 className="font-display text-hero font-light text-[var(--bone)] leading-[1.08] tracking-tight mb-4">
            Quiet strength.
          </h1>

          {/* Single line beneath at --step-0, --bone-dim */}
          <p className="type-body text-0 text-[var(--bone-dim)] font-light leading-snug mb-8">
            An architectural sanctuary dedicated to physical calm and restorative balance.
          </p>

          {/* Single Quiet Button */}
          <button
            type="button"
            onClick={onOpenInquiry}
            className="border border-[var(--hairline)] rounded-[2px] px-7 py-3 text-label text-[var(--bone-dim)] hover:text-[var(--bone)] hover:bg-[rgba(244,240,234,0.06)] hover:border-[var(--bone-dim)] transition-all duration-300"
          >
            Explore the Sanctuary
          </button>
        </div>
      </div>
    </section>
  );
}
