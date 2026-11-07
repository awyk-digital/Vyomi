'use client';

import { useEffect, useRef } from 'react';
import StudioCapsule from '@/components/StudioCapsule';
import Pending from '@/components/Pending';
import SectionHeading from '@/components/SectionHeading';
import { SUPPLIED } from '@/config/assets';
import { site, presaleDisplay } from '@/config/site';
import { useIntroDone } from '@/lib/intro';

/**
 * Cinematic hero: the supplied gym video, one headline, the pre-sale line,
 * and a single Studio capsule. No conventional navbar — the persistent mark
 * in the corner is the only chrome.
 *
 * The video pauses whenever the hero scrolls out of view, and the poster
 * carries the composition if the video cannot play.
 */
export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introDone = useIntroDone();
  const presale = presaleDisplay();

  // Pause offscreen so the hero costs nothing once the visitor scrolls past.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {
            /* autoplay refused — the poster carries the frame */
          });
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(section);

    const onVisibility = () => {
      if (document.hidden) video.pause();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100svh] min-h-[560px] w-full flex-col justify-end overflow-hidden bg-ink"
    >
      {/* Media */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          poster={SUPPLIED.heroPoster}
          muted
          autoPlay
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          /*
           * The supplied footage is 720 × 1280 — portrait, and low resolution
           * for a full-bleed hero. Its natural ratio (0.5625) is close to a
           * phone viewport, so mobile crops barely at all; a wide desktop
           * viewport scales it up and crops top and bottom instead.
           *
           * Centre holds the composition in both cases. A landscape master at
           * 1080p or better is listed in the outstanding-asset report — on a
           * large display this source is being upscaled roughly 2x.
           */
          className="h-full w-full object-cover object-center"
        >
          <source src={SUPPLIED.heroVideo} type="video/mp4" />
        </video>

        {/* Restrained directional overlay: dark at the base and left for text */}
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(8,8,8,1) 0%, rgba(8,8,8,0.72) 18%, rgba(8,8,8,0.40) 40%, rgba(8,8,8,0.12) 62%, rgba(8,8,8,0.30) 100%)',
          }}
        />
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to right, rgba(8,8,8,0.72) 0%, rgba(8,8,8,0.28) 38%, transparent 66%)',
          }}
        />
        {/*
          Dedicated join band.

          The overlay above tops out at the hero's own edge, so whatever the
          video happens to be showing in its last few rows still tinted the
          boundary — which read as a second, slightly different black against
          the pure --ink section underneath. This band lands the hero on
          exactly --ink before the seam, so the two surfaces are one colour.
        */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              'linear-gradient(to top, var(--ink) 0%, var(--ink) 22%, rgba(8,8,8,0) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 px-pad-x pb-[clamp(6.5rem,14vh,9rem)] transition-[opacity,transform] duration-[700ms] ease-editorial"
        style={{
          opacity: introDone ? 1 : 0,
          transform: introDone ? 'translateY(0)' : 'translateY(14px)',
        }}
      >
        <p className="t-label mb-5 flex items-center gap-2.5 text-muted">
          <span className="accent-tick" aria-hidden="true" />
          Vijayawada
        </p>

        {/*
          Keyed on `introDone` so the word-rise plays the moment the opening
          sequence hands over, rather than running unseen behind it.
        */}
        <SectionHeading
          key={introDone ? 'settled' : 'waiting'}
          as="h1"
          immediate
          stagger={0.09}
          className="t-hero max-w-[16ch] uppercase text-heading"
        >
          A higher standard.
        </SectionHeading>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
          {presale ? (
            <p className="t-body text-muted">
              Pre-sale opens{' '}
              <time dateTime={site.presaleDate ?? undefined} className="text-heading">
                {presale}
              </time>
              .
            </p>
          ) : (
            <>
              <p className="t-body text-muted">Pre-sale opening soon.</p>
              <Pending label="Launch date" />
            </>
          )}
        </div>
      </div>

      {/* Studio capsule — bottom centre, clear of mobile safe areas */}
      <div
        className="absolute left-1/2 z-20 -translate-x-1/2 transition-opacity duration-[700ms] ease-editorial"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + clamp(1.75rem, 4vh, 2.75rem))',
          opacity: introDone ? 1 : 0,
        }}
      >
        <StudioCapsule />
      </div>
    </section>
  );
}
