'use client';

import { useCallback, useEffect, useMemo, useRef, type ElementType } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE_OUT, TRIGGER_START, prefersReducedMotion } from '@/lib/motion';

gsap.registerPlugin(ScrollTrigger);

interface SectionHeadingProps {
  /** Plain text. Use `\n` to force a line break. */
  children: string;
  as?: ElementType;
  className?: string;
  id?: string;
  delay?: number;
  immediate?: boolean;
  stagger?: number;
  /** Disables the cursor-tracked colour pass, keeping only the rise. */
  plain?: boolean;
}

/**
 * The display heading used across the site. Two effects on one split.
 *
 * 1. Rise — each word sits in its own `overflow: hidden` box and wipes up
 *    into place when the heading scrolls in. Transform only.
 *
 * 2. Iridescence — each word carries three extra paint layers (an oil-slick
 *    gradient plus red and cyan copies offset by ~1.5px, screened back in for
 *    the chromatic fringe). They are revealed by a radial spotlight that
 *    follows the cursor.
 *
 * The spotlight has to read as ONE light crossing the whole heading, but a
 * CSS mask is per-element and every word is its own element. So rather than
 * one mask, each word gets the pointer position expressed in *its own* local
 * coordinates: words under the cursor receive a centred spotlight, words
 * further away receive one whose centre lies outside their box and are
 * therefore masked out. The result is a single continuous pool of colour
 * travelling across the line.
 *
 * Both effects are additive. The base glyphs are always painted, fully
 * opaque, at the normal heading colour — so if GSAP never loads, the pointer
 * never moves, masks are unsupported, or the visitor asks for reduced motion,
 * the heading is exactly as readable as plain text.
 *
 * Accessibility: the real sentence is the host element's `aria-label` and
 * every split span is `aria-hidden`, so screen readers get one clean string
 * instead of a word-by-word stutter.
 */
export default function SectionHeading({
  children,
  as: Tag = 'h2',
  className = '',
  id,
  delay = 0,
  immediate = false,
  stagger = 0.075,
  plain = false,
}: SectionHeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const raf = useRef(0);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const lines = useMemo(
    () => children.split('\n').map((line) => line.split(' ').filter(Boolean)),
    [children]
  );

  /* ---------------- rise ---------------- */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-w]'));
    if (words.length === 0) return;

    gsap.set(words, { yPercent: 115 });

    const tween = gsap.to(words, {
      yPercent: 0,
      duration: 0.95,
      ease: EASE_OUT,
      delay,
      stagger,
      ...(immediate
        ? {}
        : { scrollTrigger: { trigger: el, start: TRIGGER_START, once: true } }),
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(words, { clearProps: 'transform' });
    };
  }, [delay, immediate, stagger]);

  /* ---------------- iridescence ---------------- */
  const flush = useCallback(() => {
    raf.current = 0;
    const el = ref.current;
    const p = pointer.current;
    if (!el || !p) return;

    for (const word of Array.from(
      el.querySelectorAll<HTMLElement>('[data-irid-word]')
    )) {
      const box = word.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) continue;
      word.style.setProperty('--mx', `${((p.x - box.left) / box.width) * 100}%`);
      word.style.setProperty('--my', `${((p.y - box.top) / box.height) * 100}%`);
    }
  }, []);

  useEffect(() => {
    if (plain) return;
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const setReveal = (v: string) => {
      for (const word of Array.from(
        el.querySelectorAll<HTMLElement>('[data-irid-word]')
      )) {
        word.style.setProperty('--irid', v);
      }
    };

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
      if (!raf.current) raf.current = requestAnimationFrame(flush);
    };

    const onEnter = (e: PointerEvent) => {
      onMove(e);
      flush();
      setReveal('1');
    };

    const onLeave = () => setReveal('0');

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [flush, plain]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      aria-label={children.replace(/\n/g, ' ')}
    >
      <span aria-hidden="true">
        {lines.map((words, li) => (
          <span key={li} className="block">
            {words.map((word, wi) => (
              <span key={wi}>
                <span className="rv-word">
                  <span data-w>
                    {plain ? (
                      word
                    ) : (
                      <span data-irid-word className="irid-word">
                        <span className="irid__base">{word}</span>
                        <span className="irid__layer irid__r">{word}</span>
                        <span className="irid__layer irid__c">{word}</span>
                        <span className="irid__layer irid__fill">{word}</span>
                      </span>
                    )}
                  </span>
                </span>
                {wi < words.length - 1 ? ' ' : null}
              </span>
            ))}
          </span>
        ))}
      </span>
    </Tag>
  );
}
