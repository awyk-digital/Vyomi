'use client';

import React, { useState } from 'react';

interface Realistic3DGymPlayerProps {
  modelUid: string;
  name: string;
  discipline: string;
  accentColor?: string;
  className?: string;
}

export default function Realistic3DGymPlayer({
  modelUid,
  name,
  discipline,
  accentColor = '#8C2230',
  className = '',
}: Realistic3DGymPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Sketchfab 3D embed URL with transparent dark luxury parameters
  const embedUrl = `https://sketchfab.com/models/${modelUid}/embed?autostart=1&transparent=1&ui_theme=dark&ui_infos=0&ui_controls=1&ui_stop=0&ui_watermark=0&ui_help=0&ui_settings=0&ui_inspector=0&ui_annotations=0`;

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

      {/* Loading Skeleton */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#080808]/90 z-10 backdrop-blur-sm">
          <div className="relative flex items-center justify-center">
            <span
              className="h-10 w-10 rounded-full border-2 border-hairline border-t-accent-sage animate-spin"
              style={{ borderTopColor: accentColor }}
            />
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-muted">
            Initializing 3D Anatomical Mesh ...
          </span>
          <span className="text-[11px] font-mono text-faint">
            Loading textured musculoskeletal geometry
          </span>
        </div>
      )}

      {/* 3D WebGL Interactive Canvas Frame */}
      <iframe
        key={modelUid}
        title={`${name} 3D Realistic Biomechanics`}
        src={embedUrl}
        className="relative z-10 h-full w-full border-0 bg-transparent transition-opacity duration-500"
        style={{ opacity: isLoaded ? 1 : 0 }}
        onLoad={() => setIsLoaded(true)}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        allowFullScreen
      />

      {/* Top Left: Discipline & Badge */}
      <div className="pointer-events-none absolute top-3 left-4 z-20 flex items-center gap-2 rounded bg-ink/80 px-2.5 py-1 text-[11px] backdrop-blur-sm border border-hairline">
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
        <span className="font-mono text-muted uppercase tracking-wider">
          {discipline} // REALISTIC 3D CHARACTER
        </span>
      </div>

      {/* Top Right: 360° Interaction Hint */}
      <div className="pointer-events-none absolute top-3 right-4 z-20 hidden sm:flex items-center gap-1.5 rounded bg-ink/80 px-2.5 py-1 text-[10px] font-mono text-muted uppercase backdrop-blur-sm border border-hairline">
        <span>⟳ DRAG TO ROTATE 360°</span>
        <span className="text-hairline-2">•</span>
        <span>SCROLL TO ZOOM</span>
      </div>

      {/* Bottom Left: Exercise Name Tag */}
      <div className="pointer-events-none absolute bottom-3 left-4 z-20 flex items-center gap-2 rounded bg-ink/90 px-3 py-1.5 text-xs backdrop-blur-sm border border-hairline">
        <span className="font-mono font-medium text-heading uppercase tracking-wide">{name}</span>
        <span className="font-mono text-[10px] text-faint">· 3D TEXTURED MESH</span>
      </div>
    </div>
  );
}
