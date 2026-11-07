'use client';

import { useEffect, useRef, useState } from 'react';
import Reveal from '@/components/Reveal';
import Pending from '@/components/Pending';
import SectionHeading from '@/components/SectionHeading';
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
 * Visit Vyomi — a wide, moderately tall map above a neat contact strip.
 *
 * The map iframe is only mounted once the section approaches the viewport, so
 * it costs nothing on initial load, and it is skipped entirely until the
 * verified location is confirmed in config. No address is invented.
 */
export default function LocationSection() {
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const [mapVisible, setMapVisible] = useState(false);

  const address = addressLine();
  const directions = directionsLink();
  const embed = mapEmbedUrl();

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
          <SectionHeading id="location-heading" className="t-h2 uppercase text-heading">
            Visit Vyomi.
          </SectionHeading>
        </Reveal>

        {/* Map — wide, moderately tall */}
        <div
          ref={mapWrapRef}
          className="relative h-[clamp(240px,34vw,400px)] w-full overflow-hidden border border-hairline bg-charcoal"
        >
          {embed ? (
            mapVisible && (
              <iframe
                title={`Map showing ${site.name}`}
                src={embed}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
                style={{
                  border: 0,
                  filter: 'grayscale(1) invert(0.92) contrast(1.05) brightness(0.8)',
                }}
              />
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
              <span className="t-label relative text-burgundy">Map pending</span>
              <p className="t-small relative max-w-measure text-muted">
                The embed is wired and will render here as soon as the verified club
                location is confirmed.
              </p>
            </div>
          )}
        </div>

        {/* Contact strip */}
        <div className="mt-8 grid grid-cols-1 gap-8 border-t border-hairline pt-8 sm:grid-cols-2 lg:grid-cols-4">
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
                {site.address.locality}, {site.address.region} {site.address.postalCode}
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
            <ul className="t-small text-heading">
              {site.access.dedicatedLift && <li>Dedicated lift to the club</li>}
              {site.access.parking && <li>On-site parking</li>}
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
                  className="transition-transform duration-500 ease-editorial group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
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
              <a href={`mailto:${site.email}`} className="t-small mt-1 block text-heading">
                {site.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
