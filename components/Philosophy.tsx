'use client';

import Image from 'next/image';
import SplitText from '@/components/SplitText';
import Reveal from '@/components/Reveal';

export default function Philosophy() {
  return (
    <section id="architecture" className="relative w-full border-t border-[var(--hairline)] bg-[var(--surface)] py-24 md:py-36">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col items-start md:flex-row md:items-end md:justify-between border-b border-[var(--hairline)] pb-8 mb-16">
          <div>
            <span className="type-label block mb-2 text-[var(--bone-dim)]">CHAPTER 01</span>
            <SplitText as="h2" className="font-display text-4 font-semibold uppercase text-[var(--bone)]">
              THE PHILOSOPHY
            </SplitText>
          </div>
          <span className="type-label mt-4 md:mt-0 font-mono text-[var(--bone-dim)]">
            AESTHETIC & MUSCULOSKELETAL PURITY
          </span>
        </div>

        {/* Editorial Quote in Zodiak Serif */}
        <Reveal delay={0.2} className="mb-20">
          <blockquote className="font-serif text-2 md:text-3 italic font-normal text-[var(--bone)] leading-relaxed max-w-4xl">
            &ldquo;Physical power is not an accumulation of noise or kinetic excess; it is the deliberate elimination of structural compromise.&rdquo;
          </blockquote>
          <cite className="type-label mt-4 block text-[var(--champagne)] not-italic tracking-[0.2em]">
            — DR. VALERIO CORSO, DIRECTOR OF HUMAN PERFORMANCE
          </cite>
        </Reveal>

        {/* Asymmetrical 2-Column Storytelling Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-center">
          {/* Architectural Image */}
          <div className="lg:col-span-6">
            <Reveal delay={0.25}>
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-[var(--hairline)] bg-[var(--surface-2)]">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
                  alt="Minimalist brutalist architecture with dark honed stone and dramatic natural light"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover opacity-90 transition-transform duration-1000 ease-out hover:scale-105"
                />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-label text-[var(--bone-dim)]">
                  <span>BRUTALIST MONOLITH</span>
                  <span className="font-mono">MAYFAIR VAULT</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Text Principles */}
          <div className="flex flex-col space-y-12 lg:col-span-6">
            <Reveal delay={0.3}>
              <div className="border-l border-[var(--hairline)] pl-6">
                <span className="type-label text-[var(--bone-dim)] mb-2 block">PRINCIPLE I</span>
                <h3 className="font-display text-2 font-medium text-[var(--bone)] mb-3">
                  ACOUSTIC ISOLATION & FOCUS
                </h3>
                <p className="type-body text-bone-dim text-0">
                  Every chamber is clad in acoustic timber baffles and basalt stone, tuned to absorb reverberation. No loudspeaker music. No commercial clutter. An environment calibrated purely for neuromuscular concentration.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div className="border-l border-[var(--hairline)] pl-6">
                <span className="type-label text-[var(--bone-dim)] mb-2 block">PRINCIPLE II</span>
                <h3 className="font-display text-2 font-medium text-[var(--bone)] mb-3">
                  BIOMECHANICAL SUPREMACY
                </h3>
                <p className="type-body text-bone-dim text-0">
                  We reject arbitrary exercise trends. Our floor is arranged into calculated neuromuscular trajectories, guided by precise Italian leverage mechanics and real-time kinetic telemetry.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.5}>
              <div className="border-l border-[var(--hairline)] pl-6">
                <span className="type-label text-[var(--bone-dim)] mb-2 block">PRINCIPLE III</span>
                <h3 className="font-display text-2 font-medium text-[var(--bone)] mb-3">
                  CIRCADIAN RESTORATION
                </h3>
                <p className="type-body text-bone-dim text-0">
                  Intense physical stimulus requires an equal architectural devotion to cellular recovery. Our hydrothermal vaults and sub-zero cryotherapy chambers restore systemic equilibrium within minutes.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
