'use client';

import React, { useState } from 'react';

interface Realistic3DGymPlayerProps {
  modelUid: string;
  name: string;
  discipline: string;
  accentColor?: string;
  className?: string;
}

/**
 * Realistic 3D Gym Motion Player.
 * Delivers full 360° interactive orbit, zoom, and real-time kinetic motion for core gym lifts.
 * Zero clutter, zero audio toggles, zero warning boxes.
 */
export default function Realistic3DGymPlayer({
  modelUid,
  name,
  discipline,
  accentColor = '#8C2230',
  className = '',
}: Realistic3DGymPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Sketchfab 3D embed URL with transparent dark luxury parameters
  const embedUrl = `https://sketchfab.com/models/${modelUid}/embed?autostart=1&transparent=1&ui_theme=dark&ui_infos=0&ui_controls=1&ui_stop=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=0&ui_annotations=0&dnt=1`;

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-sm bg-[#080808] border border-hairline select-none ${className}`}
    >
      {/* Ambient Luxury Atmospheric Backlight */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-80 w-80 rounded-full opacity-25 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-80 w-80 rounded-full opacity-15 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />

      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080808]/95 z-10 backdrop-blur-sm">
          <div className="relative flex items-center justify-center">
            <span
              className="h-9 w-9 rounded-full border border-hairline animate-spin"
              style={{ borderTopColor: accentColor || '#F5F5F2' }}
            />
          </div>
          <span className="nums text-[11px] font-mono uppercase tracking-[0.2em] text-muted">
            Loading 3D Motion Scene ...
          </span>
          <span className="text-[10px] font-mono text-faint">
            Initializing WebGL 3D Kinematics
          </span>
        </div>
      )}

      {/* 3D WebGL Interactive Canvas Frame */}
      <iframe
        key={modelUid}
        title={`${name} 3D Kinetic Biomechanics`}
        src={embedUrl}
        className="relative z-10 h-full w-full border-0 bg-transparent transition-opacity duration-500"
        style={{ opacity: isLoaded ? 1 : 0 }}
        onLoad={() => setIsLoaded(true)}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />

      {/* Top Left: Discipline & Badge */}
      <div className="pointer-events-none absolute top-3 left-4 z-20 flex items-center gap-2 rounded-full bg-[#080808]/85 px-3 py-1 text-[11px] backdrop-blur-md border border-hairline">
        <span
          className="h-1.5 w-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
        <span className="nums font-mono text-[10px] uppercase tracking-wider text-[#F5F5F2]">
          {discipline} · 3D KINEMATICS
        </span>
      </div>

      {/* Top Right: 360° Interaction Hint */}
      <div className="pointer-events-none absolute top-3 right-4 z-20 hidden sm:flex items-center gap-2 rounded-full bg-[#080808]/85 px-3 py-1 text-[10px] font-mono text-muted uppercase backdrop-blur-md border border-hairline">
        <span>⟳ 360° DRAG TO ORBIT</span>
        <span className="text-hairline-2">·</span>
        <span>SCROLL TO ZOOM</span>
      </div>

      {/* Bottom Left: Exercise Name Tag */}
      <div className="pointer-events-none absolute bottom-3 left-4 z-20 flex items-center gap-2 rounded bg-[#080808]/90 px-3 py-1.5 text-xs backdrop-blur-md border border-hairline">
        <span className="font-mono font-medium text-heading uppercase tracking-wide">{name}</span>
        <span className="nums font-mono text-[10px] text-faint">· 3D MOTION</span>
      </div>
    </div>
  );
}
