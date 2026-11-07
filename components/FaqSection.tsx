'use client';

import { useState } from 'react';
import { FAQ_ITEMS } from '@/data/faq';

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="relative w-full border-t border-[var(--hairline)] bg-[var(--ink)] py-20 px-[var(--pad-x)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border-b border-[var(--hairline)] pb-6 mb-12 flex items-end justify-between">
          <h2 className="font-display text-3 font-light text-[var(--bone)]">
            Frequently asked questions
          </h2>
          <span className="type-label text-[0.68rem] text-[var(--bone-dim)]">
            Information
          </span>
        </div>

        {/* Accordion */}
        <div className="divide-y divide-[var(--hairline)] border-t border-b border-[var(--hairline)]">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.id} className="py-6">
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full flex items-center justify-between text-left focus:outline-none group"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-1 font-light text-[var(--bone)] group-hover:text-[var(--champagne)] transition-colors pr-6">
                    {item.question}
                  </span>

                  <div className="relative h-3 w-3 flex-shrink-0 flex items-center justify-center">
                    <span className="absolute h-px w-3 bg-[var(--bone)]" />
                    <span
                      className={`absolute w-px h-3 bg-[var(--bone)] transition-transform duration-300 ${
                        isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                      }`}
                    />
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-400 ${
                    isOpen ? 'max-h-64 mt-4 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="type-body text-0 text-[var(--bone-dim)] font-light leading-relaxed max-w-[55ch]">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
