'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Reveal from '@/components/Reveal';
import Pending from '@/components/Pending';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import { site, addressLine, directionsLink, mapEmbedUrl } from '@/config/site';

const DAY_LABEL: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

/**
 * Visit Vyomi — a sculpted luxury map experience with custom Midnight and
 * Cinematic Satellite themes, animated club beacon, and frosted glass navigation cards.
 */
export default function LocationSection() {
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapMode, setMapMode] = useState<'midnight' | 'satellite'>('midnight');

  const address = addressLine();
  const directions = directionsLink();
  const embed = mapEmbedUrl(mapMode === 'satellite' ? 'k' : 'm');

  useEffect(() => {
    const el = mapWrapRef.current;
    if (!el || !embed) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMapVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [embed]);

  return (
    <section
      id="location"
      className="border-t border-hairline bg-ink px-pad-x py-section-y"
      aria-labelledby="location-heading"
    >
      <div className="mx-auto max-w-shell">
        <Reveal className="mb-10">
          <SectionHeading
            id="location-heading"
            className="t-h2 uppercase text-heading"
          >
            Visit Vyomi.
          </SectionHeading>
          <div className="mt-7 max-w-shell">
            <AccentRule />
          </div>
        </Reveal>

        {/* Sculpted Luxury Map Container */}
        <div
          ref={mapWrapRef}
          className="group relative h-[clamp(340px,42vw,500px)] w-full rounded-[1.75rem] p-[1.5px] bg-gradient-to-b from-hairline-2/90 via-hairline/60 to-bronze/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_rgba(176,141,87,0.08)] transition-all duration-500 hover:from-bronze/70 hover:via-hairline-2 hover:to-bronze/30 hover:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.98),0_0_50px_rgba(176,141,87,0.18)]"
        >
          <div className="relative h-full w-full overflow-hidden rounded-[calc(1.75rem-1.5px)] bg-charcoal">
            {embed ? (
              mapVisible && (
                <>
                  <iframe
                    title={`Map showing ${site.name}`}
                    src={embed}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full transition-all duration-700 ease-out"
                    style={{
                      border: 0,
                      filter:
                        mapMode === 'midnight'
                          ? 'invert(93%) hue-rotate(180deg) contrast(140%) brightness(88%) saturate(130%)'
                          : 'contrast(125%) brightness(85%) saturate(110%)',
                    }}
                  />

                  {/* Warm Bronze Architectural Color Tint */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-bronze/[0.08] via-transparent to-amber-500/[0.04] mix-blend-color-dodge z-10"
                  />

                  {/* Deep Perimeter Edge Vignette — blends edges smoothly into dark background */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-[calc(1.75rem-1.5px)] shadow-[inset_0_0_80px_25px_#090a0d] z-10"
                  />

                  {/* Top brushed-gold rim highlight */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0 inset-x-12 h-[1.5px] bg-gradient-to-r from-transparent via-bronze/80 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-30"
                  />

                  {/* Floating Glassmorphic Vyomi Club Badge Card (Top-Left) */}
                  <div className="pointer-events-auto absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex max-w-[280px] sm:max-w-xs items-center gap-3.5 rounded-2xl border border-hairline-2/90 bg-ink/90 p-3.5 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.85)]">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-charcoal to-ink border border-hairline p-1 shadow-inner">
                      <Image
                        src="/logo.png"
                        alt="Vyomi"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="t-label text-heading text-[11px] font-semibold tracking-wider uppercase">
                          VYOMI CLUB
                        </span>
                        <span
                          className="inline-block h-1.5 w-1.5 rounded-full bg-bronze animate-pulse"
                          title="Premises confirmed"
                        />
                      </div>
                      <p className="t-micro truncate text-muted mt-0.5">
                        Benz Circle · Patamata, Vijayawada
                      </p>
                      <span className="t-micro text-bronze block mt-0.5 font-medium">
                        Pre-Sale Launch Nov 12
                      </span>
                    </div>
                  </div>

                  {/* Floating Map Theme Switcher Pill (Top-Right) */}
                  <div className="pointer-events-auto absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center rounded-full border border-hairline-2/90 bg-ink/90 p-1 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
                    <button
                      type="button"
                      onClick={() => setMapMode('midnight')}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ${
                        mapMode === 'midnight'
                          ? 'bg-gradient-to-r from-bronze/30 to-amber-900/30 text-heading border border-bronze/50 shadow-[0_0_12px_rgba(176,141,87,0.3)]'
                          : 'text-muted hover:text-heading'
                      }`}
                    >
                      <span>🌙</span>
                      <span className="hidden sm:inline">Midnight</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapMode('satellite')}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ${
                        mapMode === 'satellite'
                          ? 'bg-gradient-to-r from-bronze/30 to-amber-900/30 text-heading border border-bronze/50 shadow-[0_0_12px_rgba(176,141,87,0.3)]'
                          : 'text-muted hover:text-heading'
                      }`}
                    >
                      <span>🛰️</span>
                      <span className="hidden sm:inline">Satellite</span>
                    </button>
                  </div>

                  {/* Pulsing Animated Luxury Beacon Pin (Center Overlay) */}
                  <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
                    {/* Outer Radar Ping Pulse */}
                    <div className="relative flex items-center justify-center">
                      <span className="absolute h-16 w-16 animate-ping rounded-full border border-bronze/60 bg-bronze/20 opacity-75" />
                      <span className="absolute h-10 w-10 animate-pulse rounded-full bg-bronze/30 shadow-[0_0_20px_rgba(176,141,87,0.8)]" />
                      {/* Core Pinpoint */}
                      <span className="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-bronze shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                        <span className="h-2 w-2 rounded-full bg-white" />
                      </span>
                    </div>

                    {/* Floating Pin Label */}
                    <span className="mt-2 rounded-md border border-hairline-2/90 bg-ink/90 px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-heading backdrop-blur-sm shadow-lg">
                      Vyomi Premise
                    </span>
                  </div>

                  {/* Floating Action Button (Bottom-Right) */}
                  {directions && (
                    <a
                      href={directions}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pointer-events-auto group absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20 flex items-center gap-2 rounded-full border border-bronze/60 bg-ink/90 px-4 py-2 text-xs font-medium text-heading backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.85)] transition-all duration-300 hover:border-bronze hover:bg-bronze/20 hover:shadow-[0_0_20px_rgba(176,141,87,0.35)]"
                    >
                      <span>Open in Maps</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-bronze"
                      >
                        ↗
                      </span>
                    </a>
                  )}

                  {/* Bottom-Left GPS Coordinates Pill */}
                  <div className="pointer-events-none absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 hidden sm:flex items-center gap-2 rounded-lg border border-hairline/80 bg-ink/80 px-2.5 py-1 text-[11px] font-mono text-faint backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>16.4975° N, 80.6580° E</span>
                  </div>
                </>
              )
            ) : (
              <div className="flex h-full w-full flex-col items-start justify-end gap-3 p-5">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.55]"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(135deg, rgba(245,245,242,0.035) 0px, rgba(245,245,242,0.035) 1px, transparent 1px, transparent 9px)',
                  }}
                />
                <span className="t-label relative text-burgundy">
                  Map pending
                </span>
                <p className="t-small relative max-w-measure text-muted">
                  The embed is wired and will render here as soon as the verified
                  club location is confirmed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact strip */}
        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-hairline pt-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Address */}
          <div>
            <span className="t-label mb-3 block text-muted">Address</span>
            {address && site.address ? (
              <address className="t-small not-italic text-heading">
                {site.address.line1}
                <br />
                {site.address.line2 && (
                  <>
                    {site.address.line2}
                    <br />
                  </>
                )}
                {site.address.locality}, {site.address.region}{' '}
                {site.address.postalCode}
              </address>
            ) : (
              <Pending label="Verified address" />
            )}
          </div>

          {/* Hours */}
          <div>
            <span className="t-label mb-3 block text-muted">Opening hours</span>
            {site.openingHours?.length ? (
              <ul>
                {site.openingHours.map((h) => (
                  <li
                    key={h.days}
                    className="t-small flex justify-between gap-4 text-heading"
                  >
                    <span>{DAY_LABEL[h.days] ?? h.days}</span>
                    <span className="nums">
                      {h.opens} — {h.closes}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <Pending label="Opening hours" />
            )}
          </div>

          {/* Getting here — confirmed by the brief */}
          <div>
            <span className="t-label mb-3 block text-muted">Getting here</span>
            <ul className="t-small text-heading space-y-1">
              {site.access.dedicatedLift && <li>Dedicated lift to the club</li>}
              {site.access.parking && <li>On-site valet parking</li>}
            </ul>
          </div>

          {/* Actions */}
          <div>
            <span className="t-label mb-3 block text-muted">Directions</span>
            {directions ? (
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="t-ui group inline-flex items-center gap-1.5 border-b border-hairline-2 pb-1 text-heading transition-colors duration-300 hover:border-heading"
              >
                Get directions
                <span
                  aria-hidden="true"
                  className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-bronze"
                >
                  ↗
                </span>
              </a>
            ) : (
              <Pending label="Maps location" />
            )}

            {site.phone && (
              <a
                href={`tel:${site.phone.replace(/\s/g, '')}`}
                className="t-small nums mt-4 block text-heading"
              >
                {site.phone}
              </a>
            )}
            {site.email && (
              <a
                href={`mailto:${site.email}`}
                className="t-small mt-1 block text-heading"
              >
                {site.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

