'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Pending from '@/components/Pending';
import { SUPPLIED } from '@/config/assets';
import { site, whatsappLink, presaleDisplay } from '@/config/site';

interface DeveloperProfile {
  name: string;
  role: string;
  github: string;
  handle: string;
}

const DEVELOPERS: DeveloperProfile[] = [
  {
    name: 'Priyachandana Devireddy',
    role: 'UI/UX & Design Systems',
    github: 'https://github.com/Priyachandana16',
    handle: '@Priyachandana16',
  },
  {
    name: 'Yaswanth Kumar Katari',
    role: 'Lead Full-Stack Engineer',
    github: 'https://github.com/yashkatari',
    handle: '@yashkatari',
  },
  {
    name: 'Chan Basha Shaik',
    role: 'Creative Motion Engineer',
    github: 'https://github.com/Chan-Basha',
    handle: '@Chan-Basha',
  },
  {
    name: 'Srihari Cherukumalli',
    role: 'Frontend & Systems Engineer',
    github: 'https://github.com/srihari628',
    handle: '@srihari628',
  },
];

/**
 * Footer — the existing classic structure, kept.
 *
 * Preserved: the pre-sale line with an enquiry action, four link columns, the
 * oversized clipped wordmark, and the fine subline. Refinements are limited to
 * spacing, rules and type scale.
 *
 * Includes an inline, minimal "About Dev" toggle that reveals developer details
 * without navigating away from the page.
 */
export default function Footer() {
  const [showDev, setShowDev] = useState(false);
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
            <button
              type="button"
              onClick={() => {
                setShowDev(true);
                setTimeout(() => {
                  document.getElementById('about-dev')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }}
              className="t-small text-left text-heading hover:text-muted cursor-pointer transition-colors"
            >
              About Dev
            </button>
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

        {/* Developer Details Panel — minimal, inline, quiet luxury (no new page) */}
        {showDev && (
          <div
            id="about-dev"
            className="mb-12 border border-hairline bg-charcoal/40 p-6 sm:p-8 transition-all duration-500 ease-editorial animate-in fade-in"
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
              <div>
                <span className="t-label text-bronze flex items-center gap-2 text-xs">
                  <span className="accent-tick inline-block" />
                  Engineering & Design
                </span>
                <h4 className="t-h3 mt-1 uppercase text-heading">About Developers</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowDev(false)}
                className="t-label text-faint hover:text-heading cursor-pointer border border-hairline px-3 py-1.5 text-xs transition-colors hover:border-hairline-2"
                aria-label="Close developer details"
              >
                Close ✕
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DEVELOPERS.map((dev, idx) => (
                <div
                  key={dev.name}
                  className="flex flex-col justify-between border border-hairline/80 bg-ink/70 p-4 sm:p-5 transition-colors hover:border-bronze/40"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="nums t-label text-bronze text-xs">
                        0{idx + 1}
                      </span>
                      <span className="t-label text-faint text-[0.625rem] uppercase tracking-wider">
                        Core Dev
                      </span>
                    </div>

                    <h5 className="t-body mt-3 font-medium text-heading">
                      {dev.name}
                    </h5>
                    <p className="t-label mt-1 text-bronze text-[0.6875rem]">
                      {dev.role}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-hairline/60 pt-3">
                    <a
                      href={dev.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="t-label text-faint hover:text-heading inline-flex items-center gap-1 text-[0.6875rem] transition-colors"
                    >
                      <span>{dev.handle}</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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

          <div className="flex flex-wrap items-center justify-center gap-5 text-center sm:justify-end">
            <button
              type="button"
              onClick={() => setShowDev((prev) => !prev)}
              className="t-label text-faint hover:text-heading transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <span className="accent-tick inline-block" />
              <span>About Dev</span>
              <span className="nums text-[0.6875rem] text-muted">{showDev ? '✕' : '(4)'}</span>
            </button>

            <span className="text-hairline" aria-hidden="true">·</span>

            <p className="t-label text-center text-faint sm:text-right">
              {site.name} · {site.city} · Est. 2026
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
