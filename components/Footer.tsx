'use client';

import Image from 'next/image';
import Link from 'next/link';
import Pending from '@/components/Pending';
import { SUPPLIED } from '@/config/assets';
import { site, whatsappLink, presaleDisplay } from '@/config/site';

/**
 * Footer — the existing classic structure, kept.
 *
 * Preserved: the pre-sale line with an enquiry action, four link columns, the
 * oversized clipped wordmark, and the fine subline. Refinements are limited to
 * spacing, rules and type scale.
 *
 * One deliberate change: the oversized wordmark now sets in General Sans Medium
 * rather than the old serif display face, because the brief reserves Boska for
 * the single editorial quote. The treatment — oversized, low-contrast, clipped
 * at the bottom edge — is unchanged.
 *
 * The old sticky mobile bar is gone: it pointed at a hardcoded placeholder
 * number and overlapped the hero's Studio capsule on small screens.
 */
export default function Footer() {
  const presale = presaleDisplay();
  const wa = whatsappLink('Hello Vyomi — I would like to enquire about membership.');

  return (
    <footer className="relative overflow-hidden border-t border-hairline bg-ink pt-16">
      <div className="mx-auto max-w-shell px-pad-x">
        {/* Pre-sale line + enquiry action */}
        <div className="flex flex-col gap-5 pb-10 md:flex-row md:items-center md:justify-between">
          {presale ? (
            <p className="t-h3 text-heading">
              Pre-sale opens <time dateTime={site.presaleDate ?? undefined}>{presale}</time>.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-3">
              <p className="t-h3 text-heading">Pre-sale opening soon.</p>
              <Pending label="Launch date" />
            </div>
          )}

          <a href="#enquire" className="btn-line w-fit">
            Enquire
          </a>
        </div>

        <div className="h-px w-full bg-hairline" />

        {/* Link columns */}
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4">
          <div className="flex flex-col gap-3">
            <span className="t-label text-faint">Club</span>
            <Link href="/#explore" className="t-small text-heading hover:text-muted">
              Explore Vyomi
            </Link>
            <Link href="/#equipment" className="t-small text-heading hover:text-muted">
              Equipment
            </Link>
            <Link href="/#trainers" className="t-small text-heading hover:text-muted">
              Trainers
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="t-label text-faint">Studio</span>
            <Link href="/studio#fitness" className="t-small text-heading hover:text-muted">
              Fitness
            </Link>
            <Link href="/studio#hyrox" className="t-small text-heading hover:text-muted">
              HYROX
            </Link>
            <Link href="/studio#zumba" className="t-small text-heading hover:text-muted">
              Zumba
            </Link>
            <Link href="/studio#pilates" className="t-small text-heading hover:text-muted">
              Pilates
            </Link>
            <Link href="/studio#wellness" className="t-small text-heading hover:text-muted">
              Wellness
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="t-label text-faint">Visit</span>
            <Link href="/#wellness" className="t-small text-heading hover:text-muted">
              Wellness
            </Link>
            <Link href="/#trial" className="t-small text-heading hover:text-muted">
              Two-day experience
            </Link>
            <Link href="/#location" className="t-small text-heading hover:text-muted">
              Location
            </Link>
          </div>

          <div className="flex flex-col items-start gap-3">
            <span className="t-label text-faint">Contact</span>

            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="t-small text-heading hover:text-muted"
              >
                WhatsApp ↗
              </a>
            ) : (
              <Pending label="WhatsApp number" />
            )}

            {site.instagramUrl ? (
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="t-small text-heading hover:text-muted"
              >
                Instagram ↗
              </a>
            ) : (
              <Pending label="Instagram profile" />
            )}

            {site.phone ? (
              <a
                href={`tel:${site.phone.replace(/\s/g, '')}`}
                className="t-small nums text-heading hover:text-muted"
              >
                {site.phone}
              </a>
            ) : (
              <Pending label="Phone number" />
            )}

            {site.email ? (
              <a href={`mailto:${site.email}`} className="t-small text-heading hover:text-muted">
                {site.email}
              </a>
            ) : (
              <Pending label="Email address" />
            )}
          </div>
        </nav>
      </div>

      {/* Oversized wordmark, clipped at the bottom edge */}
      <div
        aria-hidden="true"
        className="w-full select-none overflow-hidden px-pad-x"
        style={{ marginBottom: 'clamp(-1.5rem, -2vw, -0.75rem)' }}
      >
        <span
          className="block whitespace-nowrap text-center font-medium leading-none text-heading opacity-[0.07]"
          style={{ fontSize: '19vw', letterSpacing: '-0.04em' }}
        >
          Vyomi
        </span>
      </div>

      {/* Subline */}
      <div className="mx-auto max-w-shell px-pad-x">
        <div className="flex flex-col items-center gap-4 border-t border-hairline py-6 sm:flex-row sm:justify-between">
          <Link href="/" aria-label="Vyomi Fitness Club — home" className="shrink-0">
            <Image
              src={SUPPLIED.logo.src}
              alt="Vyomi Fitness Club"
              width={SUPPLIED.logo.width}
              height={SUPPLIED.logo.height}
              sizes="44px"
              className="h-11 w-auto opacity-70 transition-opacity duration-300 hover:opacity-100"
            />
          </Link>

          <p className="t-label text-center text-faint sm:text-right">
            {site.name} · {site.city} · Est. 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
