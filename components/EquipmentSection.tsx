'use client';

import { useId, useState } from 'react';
import AssetSlot from '@/components/AssetSlot';
import Pending from '@/components/Pending';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import { EQUIPMENT_CATEGORIES } from '@/data/club';
import { playMechanicalClick, toggleAudioMute } from '@/lib/haptics';

interface Hotspot {
  id: string;
  x: string;
  y: string;
  title: string;
  desc: string;
  spec: string;
}

const CATEGORY_HOTSPOTS: Record<string, Hotspot[]> = {
  'plate-loaded': [
    {
      id: 'cam',
      x: '38%',
      y: '38%',
      title: 'Isolateral Converging Axis',
      desc: 'Independent movement arms ensure uniform unilateral recruitment with zero musculoskeletal compensation.',
      spec: 'Axis: Convergent Biomechanical Arc',
    },
    {
      id: 'leather',
      x: '52%',
      y: '68%',
      title: 'Maranello Upholstery',
      desc: 'Multi-layer high density core encased in flame-retardant automotive leather with double burgundy stitching.',
      spec: 'Finish: Hand-Stitched Burgundy Welt',
    },
    {
      id: 'lever',
      x: '72%',
      y: '52%',
      title: 'Pre-Start Engagement Lever',
      desc: 'Mechanical foot-assist allows safe entry into the deepest eccentric stretch without joint strain.',
      spec: 'Safety: Zero-Impingement Geometry',
    },
  ],
  'pin-loaded': [
    {
      id: 'cam',
      x: '32%',
      y: '28%',
      title: 'Physiological Eccentric Cam',
      desc: 'Variable radius cam mirrors the natural length-tension curve of contracting muscle fibers.',
      spec: 'Profile: Anatomical Variable Resistance',
    },
    {
      id: 'pin',
      x: '58%',
      y: '56%',
      title: 'Magnetic Stack Selector',
      desc: 'Precision machined counter-balanced steel plates with neodymium magnetic indexing pin.',
      spec: 'Tolerance: ±0.5% Load Precision',
    },
    {
      id: 'bushings',
      x: '68%',
      y: '78%',
      title: 'Hardened Ground Guide Rods',
      desc: 'Low-friction polymer sleeve bearings glide silently along micro-polished solid steel rods.',
      spec: 'Acoustics: Dampened Sub-30dB',
    },
  ],
  conditioning: [
    {
      id: 'flywheel',
      x: '36%',
      y: '42%',
      title: 'Dynamic Air-Magnetic Inertia',
      desc: 'Dual resistance engine delivering smooth baseline resistance with explosive top-end wattage capacity.',
      spec: 'Capacity: 0 – 3,500W Dynamic Peak',
    },
    {
      id: 'frame',
      x: '64%',
      y: '68%',
      title: 'Monolithic Heavy Gauge Chassis',
      desc: 'Robotic welded steel structure coated in high-impact matte powder coat for absolute stability.',
      spec: 'Chassis: 4mm Italian Structural Steel',
    },
  ],
};

/**
 * Facilities & Equipment — Italian Biomechanics Showcase.
 *
 * Elevates the Panatta presentation into a high-prestige engineering exhibition:
 * - Interactive HUD Hotspots with live engineering telemetry
 * - Interactive Biomechanical Torque Curve analysis
 * - Multi-angle view selector (Full Silhouette, Mechanics, Craftsmanship)
 * - Subtle luxury mechanical haptic clicks via Web Audio API
 */
export default function EquipmentSection() {
  const [active, setActive] = useState(0);
  const [activeView, setActiveView] = useState<0 | 1 | 2>(0);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [showCurveAnalysis, setShowCurveAnalysis] = useState(false);
  const [muted, setMuted] = useState(false);

  const baseId = useId();
  const category = EQUIPMENT_CATEGORIES[active];
  const images = category.images;
  const currentImage = images[activeView] || images[0];
  const hotspots = CATEGORY_HOTSPOTS[category.id] || [];

  const handleTabChange = (index: number) => {
    setActive(index);
    setActiveView(0);
    setSelectedHotspot(null);
    playMechanicalClick(1400, 0.03);
  };

  const handleViewChange = (view: 0 | 1 | 2) => {
    setActiveView(view);
    setSelectedHotspot(null);
    playMechanicalClick(900, 0.03);
  };

  const toggleSound = () => {
    const next = toggleAudioMute();
    setMuted(next);
    if (!next) playMechanicalClick(1600, 0.02);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const dir = e.key === 'ArrowRight' ? 1 : -1;
    const next =
      (active + dir + EQUIPMENT_CATEGORIES.length) % EQUIPMENT_CATEGORIES.length;
    handleTabChange(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  };

  return (
    <section
      id="equipment"
      className="relative border-t border-hairline bg-ink px-pad-x py-section-y overflow-hidden"
      aria-labelledby="equipment-heading"
    >
      {/* Upper Architectural Header */}
      <div className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="accent-tick" aria-hidden="true" />
            <span className="t-label tracking-[0.22em] uppercase text-muted">
              Engineering & Biomechanics
            </span>
            <span className="h-3 w-px bg-hairline-2" aria-hidden="true" />
            <span className="text-[11px] font-mono tracking-wider text-champagne/80">
              APIRO · MARCHE · ITALY
            </span>
          </div>

          <SectionHeading
            id="equipment-heading"
            className="t-h2 uppercase text-heading tracking-tight"
          >
            {'Premium equipment.\nSerious training.'}
          </SectionHeading>
        </div>

        {/* Audio telemetry toggle */}
        <button
          type="button"
          onClick={toggleSound}
          className="group inline-flex items-center gap-2.5 rounded-full border border-hairline px-3.5 py-1.5 text-[11px] text-muted hover:text-heading hover:border-hairline-2 transition-colors duration-200 self-start md:self-auto"
          aria-label={muted ? 'Unmute haptic feedback' : 'Mute haptic feedback'}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              muted ? 'bg-faint' : 'bg-champagne animate-pulse'
            }`}
          />
          <span className="tracking-wider uppercase font-mono">
            {muted ? 'Haptics: Off' : 'Haptics: Active'}
          </span>
        </button>
      </div>

      <div className="mb-10 max-w-shell">
        <AccentRule />
      </div>

      {/* Category selector tablist */}
      <div
        role="tablist"
        aria-label="Equipment category"
        onKeyDown={onKeyDown}
        className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4"
      >
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_CATEGORIES.map((c, i) => {
            const selected = i === active;
            return (
              <button
                key={c.id}
                id={`${baseId}-tab-${i}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => handleTabChange(i)}
                className={`t-ui relative border px-4 py-2.5 transition-all duration-300 ${
                  selected
                    ? 'border-heading bg-heading text-ink shadow-[0_0_24px_rgba(255,255,255,0.08)]'
                    : 'border-hairline-2 text-muted hover:border-heading/40 hover:text-heading'
                }`}
              >
                <span>{c.label}</span>
                {selected && (
                  <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-champagne" />
                )}
              </button>
            );
          })}
        </div>

        {/* Torque Curve Switcher Button */}
        <button
          type="button"
          onClick={() => {
            setShowCurveAnalysis(!showCurveAnalysis);
            playMechanicalClick(1100, 0.03);
          }}
          className={`text-[11px] font-mono uppercase tracking-widest px-3 py-1.5 border transition-colors ${
            showCurveAnalysis
              ? 'border-burgundy text-burgundy bg-burgundy/10'
              : 'border-hairline text-faint hover:text-muted hover:border-hairline-2'
          }`}
        >
          {showCurveAnalysis ? '✕ Close Telemetry' : '∿ Biomechanics Torque Curve'}
        </button>
      </div>

      {/* Interactive Biomechanics Torque Curve Instrument (Collapsible) */}
      {showCurveAnalysis && (
        <div className="mb-8 rounded-none border border-hairline-2 bg-black/60 p-5 backdrop-blur-md transition-all duration-500 animate-in fade-in slide-in-from-top-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-hairline pb-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-heading font-medium">
                Musculoskeletal Torque Efficiency: Panatta Cam vs Traditional Pulley
              </p>
              <p className="text-[11px] text-faint mt-0.5">
                Dynamic resistance matching joint torque curve (180° range of motion)
              </p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-mono">
              <span className="inline-flex items-center gap-1.5 text-champagne">
                <span className="h-2 w-2 rounded-full bg-champagne" />
                Panatta Cam (Optimal)
              </span>
              <span className="inline-flex items-center gap-1.5 text-faint">
                <span className="h-2 w-2 rounded-full bg-white/20" />
                Standard Linear Pulley
              </span>
            </div>
          </div>

          <div className="h-28 w-full">
            <svg
              viewBox="0 0 600 100"
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
              aria-label="Biomechanics torque graph"
            >
              {/* Grid Lines */}
              <line x1="0" y1="20" x2="600" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
              <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />
              <line x1="0" y1="80" x2="600" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />

              {/* Linear Pulley Curve (Flat with dead spots) */}
              <path
                d="M 20 70 Q 300 68 580 70"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Panatta Bell Curve (Parabolic muscle leverage match) */}
              <path
                d="M 20 85 C 160 85 240 18 300 18 C 360 18 440 85 580 85"
                fill="none"
                stroke="#c5a880"
                strokeWidth="2.5"
              />

              {/* Peak Tension Indicator */}
              <circle cx="300" cy="18" r="4" fill="#c5a880" />
              <text x="300" y="10" textAnchor="middle" fill="#c5a880" fontSize="9" fontFamily="monospace">
                PEAK CONTRACTION (90°)
              </text>
            </svg>
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-mono text-faint">
            <span>0° Full Stretch</span>
            <span>90° Maximum Leverage</span>
            <span>180° Peak Contraction</span>
          </div>
        </div>
      )}

      {/* Main Exhibition Layout */}
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${active}`}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10"
      >
        {/* Left: Featured Viewport with Hotspots & View Angle Selector */}
        <div className="lg:col-span-8 flex flex-col">
          {/* Machine Viewport Canvas Wrapper */}
          <div className="group relative border border-hairline bg-black/40 overflow-hidden">
            {/* Viewport Frame HUD */}
            <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-2 text-[10px] font-mono tracking-wider text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
              <span>INSPECTION HUD · VIEW 0{activeView + 1}</span>
            </div>

            <div className="pointer-events-none absolute right-3 top-3 z-20 text-[10px] font-mono tracking-wider text-faint">
              PANATTA® MONOLITH
            </div>

            {/* Asset Plate */}
            <div className="relative w-full transition-opacity duration-300">
              <AssetSlot
                key={`${currentImage.id}-${activeView}`}
                slot={currentImage}
                sizes="(max-width: 1023px) 100vw, 66vw"
                className="w-full"
              />

              {/* Interactive Tactical Hotspots (Rendered only on main view) */}
              {activeView === 0 &&
                hotspots.map((h, idx) => {
                  const isSelected = selectedHotspot?.id === h.id;
                  return (
                    <div
                      key={h.id}
                      style={{ left: h.x, top: h.y }}
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedHotspot(isSelected ? null : h);
                          playMechanicalClick(1800, 0.025);
                        }}
                        onMouseEnter={() => playMechanicalClick(2200, 0.015)}
                        className={`group relative flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                          isSelected
                            ? 'scale-110 bg-champagne text-ink ring-4 ring-champagne/30'
                            : 'bg-ink/80 text-champagne border border-champagne/60 hover:scale-110 hover:bg-champagne hover:text-ink'
                        }`}
                        aria-label={`Inspect ${h.title}`}
                      >
                        <span className="text-[10px] font-mono font-bold">
                          0{idx + 1}
                        </span>
                        {/* Ripple aura */}
                        <span className="absolute inset-0 rounded-full border border-champagne/40 animate-ping pointer-events-none" />
                      </button>

                      {/* Hotspot Glass Tooltip / Caliper */}
                      {isSelected && (
                        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 w-64 border border-champagne/40 bg-ink/95 p-3.5 backdrop-blur-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                          <div className="flex items-center justify-between border-b border-hairline pb-1.5 mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-champagne">
                              0{idx + 1} // Specification
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedHotspot(null)}
                              className="text-xs text-muted hover:text-heading"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-xs font-medium text-heading mb-1">
                            {h.title}
                          </p>
                          <p className="text-[11px] text-muted leading-relaxed mb-2">
                            {h.desc}
                          </p>
                          <div className="text-[10px] font-mono text-champagne/90 bg-champagne/10 px-2 py-1">
                            {h.spec}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Bottom HUD Bar */}
            <div className="flex items-center justify-between border-t border-hairline bg-ink/70 px-4 py-2.5 backdrop-blur-sm">
              <span className="text-[11px] text-muted">
                {activeView === 0 && 'Click numbered calipers [01, 02, 03] to inspect mechanical tolerances.'}
                {activeView === 1 && 'Detail View: Precision cam geometry & weight guide mechanism.'}
                {activeView === 2 && 'Detail View: Italian upholstery craftsmanship & ergonomic cushioning.'}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-champagne/90">
                Calibrated 1:1
              </span>
            </div>
          </div>

          {/* Viewpoint Angle Switcher Strip */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { idx: 0 as const, label: '01 Full Machine', sub: 'Silhouette & Biomechanics' },
              { idx: 1 as const, label: '02 Cam & Linkage', sub: 'Internal Mechanism' },
              { idx: 2 as const, label: '03 Craftsmanship', sub: 'Leather & Ergo Foam' },
            ].map((v) => {
              const selected = activeView === v.idx;
              return (
                <button
                  key={v.idx}
                  type="button"
                  onClick={() => handleViewChange(v.idx)}
                  className={`border p-3 text-left transition-all duration-200 ${
                    selected
                      ? 'border-champagne bg-champagne/5'
                      : 'border-hairline bg-transparent hover:border-hairline-2'
                  }`}
                >
                  <p
                    className={`text-[11px] font-mono uppercase tracking-wider ${
                      selected ? 'text-champagne font-medium' : 'text-muted'
                    }`}
                  >
                    {v.label}
                  </p>
                  <p className="text-[10px] text-faint truncate mt-0.5">{v.sub}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Engineering Specs & Atelier Certification */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-8">
          <div>
            <div className="border-b border-hairline pb-4 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-champagne block mb-1">
                Category Dossier
              </span>
              <h3 className="text-xl font-medium uppercase tracking-tight text-heading">
                {category.label}
              </h3>
              <p className="t-small mt-2 text-muted leading-relaxed">
                {category.blurb}
              </p>
            </div>

            {/* Specifications list */}
            <dl className="space-y-0 divide-y divide-hairline">
              {category.specs.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <dt className="t-label text-faint">{s.label}</dt>
                  <dd className="t-small text-right text-heading font-mono">
                    {s.value ?? (
                      <Pending
                        label={`${category.label} ${s.label.toLowerCase()}`}
                      />
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Panatta Italian Atelier Heritage Plaque */}
          <div className="border border-hairline-2 bg-gradient-to-b from-white/[0.03] to-transparent p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-none bg-burgundy" />
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted">
                Officina Panatta · 1982
              </span>
            </div>
            <p className="text-xs text-heading font-medium leading-relaxed">
              Every station is hand-assembled in Apiro, Italy with custom burgundy structural steel and bespoke anatomical padding.
            </p>
            <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-[10px] font-mono text-faint">
              <span>CERTIFICATION: ISO 9001 / TÜV</span>
              <span className="text-champagne">100% MADE IN ITALY</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
