'use client';

import { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AccentRule from '@/components/AccentRule';
import { prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

const LINES = ['Built for strength.', 'Designed around you.'] as const;
const PLAIN = LINES.join(' ');

/**
 * The one scroll-linked text treatment on the site.
 *
 * Characters move from muted charcoal to crisp ivory as the section passes
 * through the viewport, so the sentence reads as light travelling along it.
 * Colour only — no glow, no text-shadow, no distortion; letterforms stay sharp.
 *
 * Layout: the statement holds the left two-thirds and a short supporting note
 * sits bottom-right on wide screens. Set as a single full-width block it left
 * a large dead area to the right of the second line, which made the biggest
 * type on the page look stranded rather than deliberate.
 *
 * Normal scrolling, keyboard paging and touch are untouched: this is a
 * scrubbed ScrollTrigger reading scroll position, never driving it.
 *
 * Accessibility: the DOM keeps the real heading text for crawlers, while the
 * split spans are hidden from assistive tech in favour of a clean `aria-label`.
 */
export default function EditorialStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Split once; char spans are stable across renders.
  const lines = useMemo(
    () =>
      LINES.map((line) =>
        line.split(' ').map((word) => ({ word, chars: Array.from(word) }))
      ),
    []
  );

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;
    if (!section || !heading) return;

    const chars = Array.from(heading.querySelectorAll<HTMLSpanElement>('[data-char]'));
    if (chars.length === 0) return;

    // Reduced motion: the statement is simply already readable.
    if (prefersReducedMotion()) {
      gsap.set(chars, { color: 'var(--stmt-on)' });
      return;
    }

    gsap.set(chars, { color: 'var(--stmt-off)' });

    const tween = gsap.to(chars, {
      color: 'var(--stmt-on)',
      ease: 'none',
      stagger: { each: 0.5, from: 'start' },
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        end: 'bottom 62%',
        scrub: 0.4,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-ink px-pad-x py-section-y"
    >
      <div className="mx-auto max-w-shell">
        <p className="t-label mb-8 flex items-center gap-2.5 text-faint">
          <span className="accent-tick" aria-hidden="true" />
          The approach
        </p>

        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <h2
            ref={headingRef}
            className="t-h2 lg:max-w-[64%]"
            aria-label={PLAIN}
          >
            <span aria-hidden="true" className="block">
              {lines.map((words, li) => (
                <span key={li} className="block">
                  {words.map(({ word, chars }, wi) => (
                    <span key={wi} className="inline-block whitespace-nowrap">
                      {chars.map((ch, ci) => (
                        <span
                          key={ci}
                          data-char
                          className="inline-block"
                          style={{ color: 'var(--stmt-off)' }}
                        >
                          {ch}
                        </span>
                      ))}
                      {wi < words.length - 1 && (
                        <span className="inline-block">&nbsp;</span>
                      )}
                    </span>
                  ))}
                </span>
              ))}
            </span>
          </h2>

          {/*
            Fills the space beside the second line and gives the statement
            something to sit against, rather than trailing off into the gutter.
          */}
          <p className="t-small max-w-[34ch] text-muted lg:pb-2 lg:text-right">
            Panatta plate- and pin-loaded ranges, a dedicated conditioning
            floor, reformer Pilates and a full recovery suite — laid out so
            each discipline has room of its own.
          </p>
        </div>

        <div className="mt-12">
          <AccentRule />
        </div>
      </div>
    </section>
  );
}
