'use client';

import { useEffect, useState } from 'react';
import { DISCIPLINES } from '@/data/club';

/**
 * The Studio chapter rail.
 *
 * Desktop: a fixed vertical rail on the left edge whose items sit along a
 * convex arc. The horizontal offset of each item is `sin(π · t)` across the
 * list, so the middle entries push furthest right and the ends tuck back —
 * the curve is computed, not hand-placed, so it stays correct if a discipline
 * is added or removed.
 *
 * Mobile: the arc collapses to a horizontal scrolling bar pinned to the
 * bottom, where a left rail would cover content on a narrow screen.
 *
 * The active chapter is tracked with an IntersectionObserver reading a band
 * across the middle of the viewport, so the highlight changes when a chapter
 * actually occupies the screen rather than the moment its top edge appears.
 *
 * Navigation is plain `<a href="#id">`. SmoothScroll already intercepts
 * same-page anchors and routes them through Lenis, so these inherit smooth
 * travel, history and focus handling without duplicating any of it — and they
 * still work as ordinary jump links if JS never runs.
 */
export default function StudioNav() {
  const [active, setActive] = useState<string>(DISCIPLINES[0].id);

  useEffect(() => {
    const sections = DISCIPLINES.map((d) => document.getElementById(d.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    // Ratios are kept per-id so the winner is whichever chapter currently
    // fills most of the reading band, not merely the last one to cross it.
    const ratios = new Map<string, number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = '';
        let bestRatio = 0;
        for (const [id, r] of ratios) {
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      {
        // A band across the middle of the viewport.
        rootMargin: '-35% 0px -35% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    for (const s of sections) io.observe(s);
    return () => io.disconnect();
  }, []);


  return (
    <>
      {/* ---------- Desktop: left-edge scrim behind the rail over media ---------- */}
      <span
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-0 z-30 hidden w-[220px] lg:block"
        style={{
          background: 'linear-gradient(90deg, rgba(8,8,8,0.55) 0%, transparent 100%)',
        }}
      />

      {/* ---------- Desktop: aligned left rail ---------- */}
      <nav
        aria-label="Studio chapters"
        className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
        style={{
          paddingLeft: 'calc(var(--pad-x) * 0.42)',
          /*
           * The full-bleed HYROX and Pilates plates pass underneath the rail,
           * so the labels have to stay readable against photography as well
           * as against flat ink. A shadow does that without putting a panel
           * on the page — same approach as the brand mark.
           */
          textShadow: '0 1px 3px rgba(0,0,0,0.75), 0 0 14px rgba(0,0,0,0.5)',
        }}
      >
        <div className="relative">
          {/* 1px vertical hairline spine connecting the five chapters into one instrument */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-3 top-3 w-px"
            style={{
              left: 0,
              background: 'var(--hairline)',
            }}
          />

          <ul className="flex flex-col gap-7">
            {DISCIPLINES.map((d) => {
              const isActive = active === d.id;

              return (
                <li key={d.id}>
                  <a
                    href={`#${d.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className="group flex items-center gap-3 py-1"
                  >
                    {/* Fixed 30px track: inner tick animates width without shifting the label */}
                    <span
                      aria-hidden="true"
                      className="relative flex h-px w-[30px] shrink-0 items-center"
                    >
                      <span
                        className="block h-px transition-all duration-500 ease-editorial"
                        style={{
                          width: isActive ? 30 : 12,
                          background: isActive
                            ? 'linear-gradient(90deg, var(--bronze), var(--lime))'
                            : 'var(--hairline-2)',
                        }}
                      />
                    </span>
                    <span
                      className="t-label transition-colors duration-400"
                      style={{ color: isActive ? 'var(--heading)' : 'var(--faint)' }}
                    >
                      {d.label}
                    </span>
                  </a>
                </li>
              );
            })}

            <li className="pt-2 mt-1 border-t border-hairline">
              <a
                href="/catalogue"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 py-1 cursor-pointer"
                aria-label="Open Fitness Catalogue in a new tab"
              >
                <span
                  aria-hidden="true"
                  className="relative flex h-px w-[30px] shrink-0 items-center"
                >
                  <span
                    className="block h-px w-[16px] group-hover:w-[30px] transition-all duration-300 ease-editorial"
                    style={{
                      background: 'linear-gradient(90deg, var(--bronze), var(--lime))',
                    }}
                  />
                </span>
                <span className="t-label text-[#B08D57] group-hover:text-heading transition-colors duration-300 inline-flex items-center gap-1.5">
                  <span>Fitness Catalogue</span>
                  <span aria-hidden="true">↗</span>
                </span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ---------- Mobile: bottom bar ---------- */}
      <nav
        aria-label="Studio chapters"
        className="rail fixed inset-x-0 bottom-0 z-40 flex gap-2 overflow-x-auto border-t border-hairline bg-ink/92 px-4 py-3 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
      >
        {DISCIPLINES.map((d) => {
          const isActive = active === d.id;
          return (
            <a
              key={d.id}
              href={`#${d.id}`}
              aria-current={isActive ? 'true' : undefined}
              className="t-label shrink-0 rounded-full border px-3.5 py-2 transition-colors duration-300"
              style={{
                borderColor: isActive ? 'var(--bronze)' : 'var(--hairline)',
                color: isActive ? 'var(--heading)' : 'var(--faint)',
              }}
            >
              {d.label}
            </a>
          );
        })}
        <a
          href="/catalogue"
          target="_blank"
          rel="noopener noreferrer"
          className="t-label shrink-0 rounded-full border px-3.5 py-2 transition-colors duration-300 inline-flex items-center gap-1.5"
          style={{
            borderColor: 'var(--bronze-lo)',
            color: 'var(--bronze)',
          }}
        >
          <span>Fitness Catalogue</span>
          <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </>
  );
}
