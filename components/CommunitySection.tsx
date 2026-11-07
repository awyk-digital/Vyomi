'use client';

import Image from 'next/image';
import Reveal from '@/components/Reveal';

interface MemberQuote {
  id: string;
  quote: string;
  name: string;
  widthClass: string;
}

const QUOTES: MemberQuote[] = [
  {
    id: 'q1',
    quote:
      'The silence on the Panatta floor is unlike any gym. No loudspeaker music, no recording tripods. Just calm focus.',
    name: 'Priya R. · Member',
    widthClass: 'md:col-span-7',
  },
  {
    id: 'q2',
    quote:
      'The reformer studio corrected years of lumbar tension within weeks. The instructors teach true anatomy.',
    name: 'Dev K. · Member',
    widthClass: 'md:col-span-5',
  },
  {
    id: 'q3',
    quote:
      'Coming from London, I was prepared to compromise in Vijayawada. Vyomi created a genuine resort-level sanctuary.',
    name: 'Arjun M. · Member',
    widthClass: 'md:col-span-5',
  },
  {
    id: 'q4',
    quote:
      'The cold plunge and Himalayan salt room turned recovery from an obligation into a daily peaceful ritual.',
    name: 'Sarah T. · Member',
    widthClass: 'md:col-span-7',
  },
];

const INSTAGRAM_SHOTS = [
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=600&q=85',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=600&q=85',
];

export default function CommunitySection() {
  return (
    <section className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)] py-20">
      {/* Testimonials */}
      <div className="px-[var(--pad-x)] max-w-6xl mx-auto mb-20">
        <div className="border-b border-[var(--hairline)] pb-6 mb-12 flex items-end justify-between">
          <h2 className="font-display text-3 font-light text-[var(--bone)]">
            The room.
          </h2>
          <span className="type-label text-[0.68rem] text-[var(--bone-dim)]">
            Atmosphere
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          {QUOTES.map((item, idx) => (
            <div
              key={item.id}
              className={`${item.widthClass} flex flex-col border-l border-[var(--hairline)] pl-6 py-2`}
            >
              <Reveal delay={idx * 0.1}>
                <blockquote className="font-display text-1 font-light text-[var(--bone)] leading-relaxed mb-4">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>
                <cite className="type-label text-[0.65rem] text-[var(--champagne)] not-italic block">
                  {item.name}
                </cite>
              </Reveal>
            </div>
          ))}
        </div>
      </div>

      {/* Instagram Strip */}
      <div className="border-t border-[var(--hairline)] pt-12 w-full">
        <div className="text-center mb-6 px-[var(--pad-x)]">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-display text-1 font-light text-[var(--bone)] hover:text-[var(--champagne)] transition-colors inline-flex items-center space-x-1"
          >
            <span>@vyomifitnessclub</span>
            <span>↗</span>
          </a>
        </div>

        <div className="w-full overflow-hidden select-none">
          <div className="flex w-max animate-[marqueeStrip_45s_linear_infinite] hover:[animation-play-state:paused]">
            {[...INSTAGRAM_SHOTS, ...INSTAGRAM_SHOTS].map((src, i) => (
              <div
                key={i}
                className="relative aspect-square w-[240px] md:w-[280px] border-r border-[var(--hairline)] overflow-hidden bg-[var(--surface)] group flex-shrink-0"
              >
                <Image
                  src={src}
                  alt="Vyomi sanctuary moments"
                  fill
                  sizes="280px"
                  className="object-cover transition-all duration-600 ease-out group-hover:scale-105"
                  style={{
                    filter: 'grayscale(0.25) contrast(0.92) brightness(1.04) saturate(0.85)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marqueeStrip {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
