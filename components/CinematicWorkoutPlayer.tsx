'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

export interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
  detail: string;
}

interface CinematicWorkoutPlayerProps {
  exerciseId: string;
  name: string;
  discipline: string;
  accentColor: string;
  imageSrc: string;
  tempo: string;
  hotspots?: Hotspot[];
  className?: string;
}

/**
 * 4K Ultra-HD Cinematic Workout Player.
 * Features a single consistent human athlete performing each exercise in a dark luxury studio.
 * Zero clutter, zero warning boxes, zero audio toggles. Pure Quiet Luxury.
 */
export default function CinematicWorkoutPlayer({
  exerciseId,
  name,
  discipline,
  accentColor,
  imageSrc,
  tempo,
  hotspots = [],
  className = '',
}: CinematicWorkoutPlayerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [isCadenceActive, setIsCadenceActive] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  // Toggle active hotspot on tap
  const handleHotspotClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveHotspot(activeHotspot === id ? null : id);
  };

  return (
    <div
      ref={containerRef}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-sm border border-hairline bg-[#080808] transition-all duration-700 ${className}`}
      onClick={() => setActiveHotspot(null)}
    >
      {/* 4K Image Viewport */}
      <div className="relative flex-1 w-full h-full min-h-[380px] sm:min-h-[440px] md:min-h-[500px] overflow-hidden">
        <Image
          src={imageSrc}
          alt={`4K demonstration of ${name} by elite athlete`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 65vw"
          className={`object-cover object-center transition-transform duration-1000 ease-out ${
            isZoomed
              ? 'scale-125 cursor-zoom-out'
              : isCadenceActive
              ? 'scale-100 animate-slow-breathe cursor-zoom-in'
              : 'scale-100 cursor-zoom-in'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
        />

        {/* Quiet Luxury Ambient Masking (blends smoothly into page background) */}
        <div
          className="pointer-events-none absolute inset-0 bg-radial-vignette opacity-80"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/40 opacity-70"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#080808]/40 via-transparent to-[#080808]/40 opacity-50"
          aria-hidden="true"
        />

        {/* Top Badges Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-2.5 rounded-full border border-hairline bg-[#080808]/80 backdrop-blur-md px-3.5 py-1">
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor || '#D6F55B' }}
              aria-hidden="true"
            />
            <span className="nums text-[10px] font-mono uppercase tracking-[0.2em] text-[#F5F5F2]">
              4K Ultra-HD
            </span>
            <span className="text-hairline-2" aria-hidden="true">·</span>
            <span className="nums text-[10px] font-mono uppercase tracking-wider text-muted">
              Master Series
            </span>
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {/* Hotspots Toggle */}
            {hotspots.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHotspots(!showHotspots);
                }}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-mono transition-all backdrop-blur-md ${
                  showHotspots
                    ? 'border-hairline-2 bg-[#080808]/90 text-heading shadow'
                    : 'border-hairline/60 bg-[#080808]/50 text-faint hover:text-muted'
                }`}
                title="Toggle Biomechanical Focus Points"
              >
                <span>⌖</span>
                <span className="hidden sm:inline">Kinetic Markers</span>
              </button>
            )}

            {/* Cadence Pulse Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsCadenceActive(!isCadenceActive);
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-mono transition-all backdrop-blur-md ${
                isCadenceActive
                  ? 'border-hairline-2 bg-[#080808]/90 text-heading shadow'
                  : 'border-hairline/60 bg-[#080808]/50 text-faint hover:text-muted'
              }`}
              title="Toggle Cadence Motion Rhythm"
            >
              <span>{isCadenceActive ? '●' : '○'}</span>
              <span className="hidden sm:inline">Tempo Motion</span>
            </button>

            {/* Zoom Inspection Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              className="flex items-center justify-center rounded-full border border-hairline bg-[#080808]/80 backdrop-blur-md h-7 w-7 text-xs text-muted hover:text-heading transition-colors"
              title={isZoomed ? 'Reset zoom' : 'Inspect 4K details'}
              aria-label={isZoomed ? 'Reset zoom' : 'Inspect 4K details'}
            >
              {isZoomed ? '−' : '+'}
            </button>
          </div>
        </div>

        {/* Biomechanical Anatomy Hotspots */}
        {showHotspots &&
          hotspots.map((spot) => {
            const isActive = activeHotspot === spot.id;
            return (
              <div
                key={spot.id}
                className="absolute z-20 transition-all duration-300"
                style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              >
                {/* Hotspot Target Button */}
                <button
                  type="button"
                  onClick={(e) => handleHotspotClick(spot.id, e)}
                  className="group relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center p-2 focus:outline-none"
                  aria-label={`Inspect ${spot.label}`}
                >
                  <span
                    className="absolute h-6 w-6 rounded-full opacity-60 animate-ping"
                    style={{ backgroundColor: accentColor || '#B08D57' }}
                  />
                  <span
                    className="relative flex h-3.5 w-3.5 items-center justify-center rounded-full border border-white/80 shadow-md transition-transform group-hover:scale-125"
                    style={{ backgroundColor: accentColor || '#B08D57' }}
                  >
                    <span className="h-1 w-1 rounded-full bg-white" />
                  </span>
                </button>

                {/* Hotspot Details Card */}
                {isActive && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 max-w-[85vw] rounded-sm border border-hairline-2 bg-[#0c0c0c]/95 p-3.5 text-left shadow-2xl backdrop-blur-lg z-30 transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-1.5 border-b border-hairline pb-1.5">
                      <span className="nums text-[10px] font-mono uppercase tracking-widest text-[#B08D57]">
                        BIOMECHANICAL FOCUS
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveHotspot(null)}
                        className="text-xs text-muted hover:text-white"
                        aria-label="Close tooltip"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="text-xs font-medium text-heading mb-1">{spot.label}</div>
                    <p className="text-[11px] leading-relaxed text-muted">{spot.detail}</p>
                  </div>
                )}
              </div>
            );
          })}

        {/* Lower Studio Atmosphere Info */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none z-10">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-faint">
              {discipline} · ATHLETE KINEMATICS
            </div>
            <div className="text-sm font-medium text-heading tracking-wide mt-0.5">
              {name}
            </div>
          </div>

          <div className="text-right">
            <span className="nums text-[10px] font-mono text-muted tracking-wider">
              CADENCE // {tempo.split('(')[0].trim()}
            </span>
          </div>
        </div>

        {/* Bottom Cadence Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-hairline">
          <div
            className={`h-full transition-all duration-300 ${
              isCadenceActive ? 'animate-cadence-line' : 'w-full'
            }`}
            style={{
              background: `linear-gradient(90deg, transparent, ${accentColor || '#B08D57'}, #F5F5F2)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
