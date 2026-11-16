'use client';

import { useEffect, useRef, useState } from 'react';
import StudioCapsule from '@/components/StudioCapsule';
import Pending from '@/components/Pending';
import SectionHeading from '@/components/SectionHeading';
import { SUPPLIED } from '@/config/assets';
import { site, presaleDisplay } from '@/config/site';
import { useIntroDone, useIntroUnveil } from '@/lib/intro';

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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const introUnveiled = useIntroUnveil();
  const introDone = useIntroDone();
  const presale = presaleDisplay();

  // Ensure immediate video playback on mount and pause when offscreen to save GPU
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    video.defaultMuted = true;
    video.muted = true;

    const startPlayback = () => {
      video.play().then(() => {
        setIsVideoPlaying(true);
      }).catch(() => {
        /* autoplay fallback — poster handles the visual */
      });
    };

    startPlayback();

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startPlayback();
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(section);

    const onVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        startPlayback();
      }
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
      {/* Media container with slow cinematic scale-in */}
      <div
        className={`absolute inset-0 z-0 transition-transform duration-[1800ms] ease-editorial ${
          introUnveiled ? 'scale-100' : 'scale-[1.04]'
        }`}
      >
        <video
          ref={videoRef}
          poster={SUPPLIED.heroPoster}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          onPlaying={() => setIsVideoPlaying(true)}
          aria-hidden="true"
          tabIndex={-1}
          className={`h-full w-full object-cover object-center transition-opacity duration-700 ${
            isVideoPlaying ? 'opacity-100' : 'opacity-90'
          }`}
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
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-40"
          style={{
            background:
              'linear-gradient(to top, var(--ink) 0%, var(--ink) 22%, rgba(8,8,8,0) 100%)',
          }}
        />
      </div>

      {/* Obsidian Veil: hides frozen video / initial frame while the logo is presented in the center */}
      <div
        aria-hidden="true"
        className={`absolute inset-0 z-[5] bg-ink pointer-events-none transition-opacity duration-[1200ms] ease-editorial ${
          introUnveiled ? 'opacity-0' : 'opacity-100'
        }`}
      />

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
