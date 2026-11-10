'use client';

import React, { useEffect, useRef, useState } from 'react';

interface GymAnimationPlayerProps {
  animationPath: string;
  name: string;
  discipline: string;
  accentColor?: string;
  isPlaying: boolean;
  speed: number;
  className?: string;
}

export default function GymAnimationPlayer({
  animationPath,
  name,
  discipline,
  accentColor = '#8C2230',
  isPlaying,
  speed,
  className = '',
}: GymAnimationPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [frozenFrame, setFrozenFrame] = useState<string | null>(null);

  useEffect(() => {
    setIsLoaded(false);
    setFrozenFrame(null);
  }, [animationPath]);

  // When paused, capture the current frame onto the canvas to truly freeze the motion
  useEffect(() => {
    if (!isPlaying && imgRef.current && canvasRef.current) {
      try {
        const img = imgRef.current;
        const canvas = canvasRef.current;
        canvas.width = img.naturalWidth || 360;
        canvas.height = img.naturalHeight || 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setFrozenFrame(canvas.toDataURL());
        }
      } catch {
        // Fallback to overlay if canvas read is restricted
        setFrozenFrame(null);
      }
    } else if (isPlaying) {
      setFrozenFrame(null);
    }
  }, [isPlaying]);

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-sm bg-gradient-to-b from-[#141414] to-[#090909] border border-hairline ${className}`}
    >
      {/* Hidden canvas for capturing freeze-frames */}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />

      {/* Atmospheric radial backlight */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full opacity-25 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full opacity-15 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />

      {/* Center Studio Viewing Aperture */}
      <div className="relative z-10 flex h-[88%] w-[90%] max-w-[440px] max-h-[440px] items-center justify-center overflow-hidden rounded-md border border-hairline bg-[#FAFAFA] p-3 shadow-2xl transition-all duration-300">
        {/* Loading state indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[#FAFAFA] z-10">
            <span
              className="h-2 w-2 rounded-full animate-ping"
              style={{ backgroundColor: accentColor }}
            />
            <span className="font-mono text-xs uppercase tracking-wider text-[#666]">
              Loading Kinematic Motion ...
            </span>
          </div>
        )}

        {/* Display frozen snapshot when paused */}
        {frozenFrame ? (
          <img
            src={frozenFrame}
            alt={`${name} frozen form analysis`}
            className="h-full w-full object-contain filter contrast-105"
          />
        ) : (
          <img
            ref={imgRef}
            src={animationPath}
            alt={`${name} biomechanical movement guide`}
            onLoad={() => setIsLoaded(true)}
            className={`h-full w-full object-contain transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Top Left: Discipline & Badge */}
      <div className="pointer-events-none absolute top-3 left-4 flex items-center gap-2 rounded bg-ink/80 px-2.5 py-1 text-[11px] backdrop-blur-sm border border-hairline">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="font-mono text-muted uppercase tracking-wider">{discipline} // 3D KINEMATICS</span>
      </div>

      {/* Top Right: Muscle Activation Legend */}
      <div className="pointer-events-none absolute top-3 right-4 hidden sm:flex items-center gap-2 rounded bg-ink/80 px-2.5 py-1 text-[10px] font-mono text-faint uppercase backdrop-blur-sm border border-hairline">
        <span className="inline-block h-2 w-2 rounded-full bg-[#D0715E]" />
        <span>Active Muscle Target</span>
        <span className="text-hairline-2">|</span>
        <span className="inline-block h-2 w-2 rounded-full bg-[#8C8C8C]" />
        <span>Stabilizers</span>
      </div>

      {/* Bottom Left: Exercise Name Tag */}
      <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 rounded bg-ink/90 px-3 py-1.5 text-xs backdrop-blur-sm border border-hairline">
        <span className="font-mono font-medium text-heading uppercase tracking-wide">{name}</span>
        <span className="font-mono text-[10px] text-faint">· 60 FPS</span>
      </div>

      {/* Bottom Right: Playback Speed indicator */}
      {speed !== 1 && (
        <div className="pointer-events-none absolute bottom-3 right-4 rounded bg-ink/90 px-2 py-1 text-[11px] font-mono text-accent-sage border border-hairline">
          {speed}x SPEED
        </div>
      )}

      {/* Pause Indicator Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[1px] transition-opacity">
          <div className="flex items-center gap-2 rounded-full bg-ink/95 border border-hairline px-4 py-2 font-mono text-xs uppercase tracking-wider text-heading shadow-2xl">
            <span className="h-2 w-2 rounded-full bg-accent-sage animate-pulse" />
            <span>Form Analysis Paused</span>
          </div>
        </div>
      )}
    </div>
  );
}
