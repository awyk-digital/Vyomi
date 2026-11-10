'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { AnimationItem } from 'lottie-web';

interface LottieWorkoutPlayerProps {
  animationPath: string;
  name: string;
  discipline: string;
  accentColor?: string;
  isPlaying: boolean;
  speed: number;
  onFrameUpdate?: (currentFrame: number, totalFrames: number) => void;
  className?: string;
}

export default function LottieWorkoutPlayer({
  animationPath,
  name,
  discipline,
  accentColor = '#8C2230',
  isPlaying,
  speed,
  onFrameUpdate,
  className = '',
}: LottieWorkoutPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animRef = useRef<AnimationItem | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoaded(false);
    setLoadError(false);

    // Dynamically import lottie-web on client to ensure zero SSR issues
    import('lottie-web').then((lottieModule) => {
      if (!isMounted || !containerRef.current) return;

      const lottie = lottieModule.default || lottieModule;

      // Destroy any prior instance in this container
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }

      try {
        const anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: isPlaying,
          path: animationPath,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: true,
          },
        });

        anim.setSpeed(speed);

        const handleReady = () => {
          if (isMounted) setIsLoaded(true);
        };

        anim.addEventListener('DOMLoaded', handleReady);
        anim.addEventListener('data_ready', handleReady);

        anim.addEventListener('enterFrame', () => {
          if (isMounted) setIsLoaded(true);
          if (onFrameUpdate && anim.totalFrames) {
            onFrameUpdate(anim.currentFrame, anim.totalFrames);
          }
        });

        anim.addEventListener('data_failed', () => {
          if (isMounted) setLoadError(true);
        });

        animRef.current = anim;
      } catch (err) {
        console.warn('Lottie player failed to load animation:', err);
        if (isMounted) setLoadError(true);
      }
    });

    return () => {
      isMounted = false;
      if (animRef.current) {
        animRef.current.destroy();
        animRef.current = null;
      }
    };
  }, [animationPath]);

  // Handle play / pause state changes
  useEffect(() => {
    if (!animRef.current) return;
    if (isPlaying) {
      animRef.current.play();
    } else {
      animRef.current.pause();
    }
  }, [isPlaying]);

  // Handle playback speed changes
  useEffect(() => {
    if (!animRef.current) return;
    animRef.current.setSpeed(speed);
  }, [speed]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-sm bg-[#080808] border border-hairline ${className}`}
    >
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full opacity-20 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />

      {/* Lottie Container */}
      <div
        ref={containerRef}
        className="h-full w-full max-w-[500px] max-h-[460px] flex items-center justify-center p-4 transition-opacity duration-300 [&_svg]:max-h-full [&_svg]:max-w-full [&_svg]:w-auto [&_svg]:h-auto [&_svg]:object-contain"
        style={{ opacity: isLoaded ? 1 : 0 }}
      />

      {/* Loading state indicator */}
      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/50 backdrop-blur-sm">
          <span
            className="h-2 w-2 rounded-full animate-ping"
            style={{ backgroundColor: accentColor }}
          />
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            Streaming Lottie Vector ...
          </span>
        </div>
      )}

      {/* Fallback if external link fails */}
      {loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-ink/90">
          <span className="font-mono text-xs text-muted mb-2">LOTTIE RENDER FALLBACK</span>
          <p className="text-xs text-faint max-w-xs">
            Direct network stream for this asset was restricted. Switching back to the internal
            kinematic renderer.
          </p>
        </div>
      )}

      {/* Watermark / Badge */}
      <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 rounded bg-ink/70 px-2 py-1 text-[11px] backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="font-mono text-muted uppercase tracking-wider">
          LOTTIEFILES // {name}
        </span>
      </div>
    </div>
  );
}

