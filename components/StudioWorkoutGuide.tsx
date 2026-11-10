'use client';

import React, { useState, useId } from 'react';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import Reveal from '@/components/Reveal';
import GymVectorAnimation from '@/components/GymVectorAnimation';
import { playMechanicalClick, toggleAudioMute, getAudioMuted } from '@/lib/haptics';

export interface ExerciseGuide {
  id: string;
  discipline: 'Fitness' | 'HYROX' | 'Pilates';
  disciplineId: 'fitness' | 'hyrox' | 'pilates';
  name: string;
  subtitle: string;
  equipment: string;
  tempo: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  cues: [string, string, string];
  fault: string;
  accentColor: string;
}

export const EXERCISE_GUIDES: ExerciseGuide[] = [
  {
    id: 'barbell-squat',
    discipline: 'Fitness',
    disciplineId: 'fitness',
    name: 'Barbell Back Squat',
    subtitle: 'Compound Knee Extensor & Gluteal Biomechanics',
    equipment: 'Olympic Barbell & Solid Steel Power Rack',
    tempo: '3 · 1 · X (Controlled Descent · Depth Pause · Explosive Drive)',
    primaryMuscles: ['Quadriceps (Vastus Lateralis & Medialis)', 'Gluteus Maximus'],
    secondaryMuscles: ['Hamstrings', 'Erector Spinae', 'Transverse Abdominis'],
    cues: [
      'Position barbell across upper trapezius; pull elbows back to create a rigid muscular shelf',
      'Break simultaneously at hips and knees, actively pushing knees outward in line with toes',
      'Descend smoothly until hip crease breaks below the top of the patella, then drive through midfoot',
    ],
    fault: 'Allowing knees to cave inward (valgus collapse) or letting lower back round at bottom depth.',
    accentColor: '#8C2230',
  },
  {
    id: 'deadlift',
    discipline: 'Fitness',
    disciplineId: 'fitness',
    name: 'Conventional Barbell Deadlift',
    subtitle: 'Posterior Chain Kinetic Recruitment & Hip Hinge',
    equipment: 'Olympic Competition Barbell & Urethane Bumper Plates',
    tempo: '1 · 1 · 2 (Explosive Pull · Lockout · Controlled Hinge)',
    primaryMuscles: ['Gluteus Maximus', 'Hamstrings (Biceps Femoris)', 'Spinal Erectors'],
    secondaryMuscles: ['Latissimus Dorsi', 'Trapezius', 'Forearm Grip Flexors'],
    cues: [
      'Address the barbell directly over midfoot (~1 inch from shins) with shoulder-width stance',
      'Hinge hips, grip bar firmly outside knees, and pull the slack out while wedging lats tight',
      'Drive the floor away with the legs until bar clears knees, then thrust hips through to a tall lockout',
    ],
    fault: 'Permitting lumbar spine flexion (rounding) off the floor or hyperextending lower back at top.',
    accentColor: '#8C2230',
  },
  {
    id: 'bench-press',
    discipline: 'Fitness',
    disciplineId: 'fitness',
    name: 'Barbell Flat Bench Press',
    subtitle: 'Horizontal Pectoral Drive & Humeral Adduction',
    equipment: 'Competition Olympic Bench & Eleiko Barbell',
    tempo: '3 · 1 · 1 (Controlled Negative · Sternum Touch · Powerful Press)',
    primaryMuscles: ['Pectoralis Major (Sternal & Clavicular)', 'Anterior Deltoids'],
    secondaryMuscles: ['Triceps Brachii', 'Serratus Anterior', 'Latissimus Dorsi'],
    cues: [
      'Retract and depress scapulae firmly into the bench; maintain active 5-point body contact',
      'Unrack smoothly and lower the bar under control along a gentle diagonal arc to lower sternum',
      'Tuck elbows at ~45-70° from torso, drive feet into the turf, and press explosively up and back',
    ],
    fault: 'Flaring elbows outward at 90° or bouncing the bar violently off the sternum.',
    accentColor: '#8C2230',
  },
  {
    id: 'pull-up',
    discipline: 'HYROX',
    disciplineId: 'hyrox',
    name: 'Strict Bodyweight Pull-Up',
    subtitle: 'Vertical Latissimus Dorsi & Humeral Depression',
    equipment: 'Multi-Grip Ceiling Rig Pull-Up Bar',
    tempo: '1 · 1 · 2 (Powerful Ascent · Apex Hold · Full Hang Return)',
    primaryMuscles: ['Latissimus Dorsi', 'Teres Major', 'Biceps Brachii'],
    secondaryMuscles: ['Rhomboids', 'Lower Trapezius', 'Brachioradialis', 'Abdominal Core'],
    cues: [
      'Grip the bar slightly wider than shoulder width with a secure overhand pronated grip',
      'Initiate pull by aggressively packing shoulder blades down and back before bending elbows',
      'Drive elbows toward hips until clavicle approaches bar height; lower with control to dead hang',
    ],
    fault: 'Kicking legs or utilizing momentum kipping rather than strict latissimus engagement.',
    accentColor: '#B08D57',
  },
  {
    id: 'overhead-press',
    discipline: 'HYROX',
    disciplineId: 'hyrox',
    name: 'Standing Barbell Overhead Press',
    subtitle: 'Vertical Deltoid Power & Full-Body Kinetic Transfer',
    equipment: 'Olympic Barbell & Squat Stand',
    tempo: '1 · 1 · 2 (Vertical Drive · Overhead Stabilization · Controlled Lower)',
    primaryMuscles: ['Anterior & Lateral Deltoids', 'Upper Trapezius'],
    secondaryMuscles: ['Triceps Brachii', 'Core Abdominals', 'Gluteal Complex'],
    cues: [
      'Rest bar across anterior clavicle with vertical forearms and tight neutral wrists',
      'Actively squeeze glutes and brace core to establish an immovable pelvic foundation',
      'Pull chin back slightly, press bar directly overhead in a straight line, and push head through at top',
    ],
    fault: 'Arching lower back excessively (backward lean) to compensate for insufficient shoulder mobility.',
    accentColor: '#B08D57',
  },
  {
    id: 'bent-over-row',
    discipline: 'Fitness',
    disciplineId: 'fitness',
    name: 'Barbell Bent-Over Row',
    subtitle: 'Scapular Retraction & Mid-Back Posterior Density',
    equipment: 'Olympic Barbell & Textured Iron Plates',
    tempo: '2 · 1 · 2 (Controlled Pull · Peak Squeeze · Deep Stretch)',
    primaryMuscles: ['Latissimus Dorsi', 'Rhomboids', 'Middle & Lower Trapezius'],
    secondaryMuscles: ['Posterior Deltoids', 'Biceps Brachii', 'Spinal Erectors'],
    cues: [
      'Hinge back into a stable 45° torso angle with flat neutral spine and soft knees',
      'Grip bar shoulder-width; pull through elbows directly toward the lower ribcage / belly button',
      'Pause and firmly pinch shoulder blades together at top without heaving torso upright',
    ],
    fault: 'Jerking with leg and hip momentum to swing the barbell up instead of rowing with back muscles.',
    accentColor: '#8C2230',
  },
  {
    id: 'lunge',
    discipline: 'HYROX',
    disciplineId: 'hyrox',
    name: 'Barbell Walking Lunge',
    subtitle: 'Unilateral Pelvic Stability & Quadriceps/Glute Drive',
    equipment: 'Olympic Barbell across Trapezius',
    tempo: '2 · 1 · 1 (Controlled Step · Depth Pause · Forward Drive)',
    primaryMuscles: ['Quadriceps (Rectus Femoris & VMO)', 'Gluteus Maximus'],
    secondaryMuscles: ['Hamstrings', 'Adductor Magnus', 'Soleus & Gastrocnemius', 'Core'],
    cues: [
      'Step forward decisively; lower hips vertically until back knee hovers 1 inch above turf',
      'Keep front knee stacked directly over the midfoot, avoiding medial drift or collapse',
      'Drive powerfully through the front heel to stand tall and immediately transition into the next stride',
    ],
    fault: 'Slamming the rear knee into the floor or allowing the torso to pitch forward.',
    accentColor: '#B08D57',
  },
  {
    id: 'plank',
    discipline: 'Pilates',
    disciplineId: 'pilates',
    name: 'Isometric Front Forearm Plank',
    subtitle: 'Transverse Abdominis & Deep Cylinder Anti-Extension',
    equipment: 'Vyomi High-Density Studio Mat',
    tempo: 'Isometric Maximum Tension Hold (45–60 Seconds)',
    primaryMuscles: ['Transverse Abdominis', 'Rectus Abdominis (Anterior Core)'],
    secondaryMuscles: ['Internal & External Obliques', 'Serratus Anterior', 'Gluteus Complex'],
    cues: [
      'Position forearms parallel on mat with elbows situated directly under glenohumeral shoulder joints',
      'Tuck pelvis into slight posterior tilt; actively lock kneecaps and clamp glutes with maximum tension',
      'Push floor away with forearms to prevent shoulder blades from winging; keep gaze just ahead of hands',
    ],
    fault: 'Allowing hips to sag down into lumbar hyperextension or hiking glutes upward into a pike.',
    accentColor: '#D6F55B',
  },
];

/**
 * Studio Workout Micro-Animations Guide Section.
 * Comprehensive, interactive biomechanical laboratory across the 8 essential gym movements.
 */
export default function StudioWorkoutGuide() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1.0 | 1.5>(1.0);
  const [manualPhase, setManualPhase] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [audioMuted, setAudioMuted] = useState(getAudioMuted());

  const baseId = useId();
  const current = EXERCISE_GUIDES[activeTab];

  const handleTabSelect = (idx: number) => {
    setActiveTab(idx);
    setIsPlaying(true);
    setIsScrubbing(false);
    setManualPhase(0);
    playMechanicalClick(1400, 0.035);
  };

  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
    setIsScrubbing(false);
    playMechanicalClick(1100, 0.03);
  };

  const handleSpeedChange = (speed: 0.5 | 1.0 | 1.5) => {
    setPlaybackSpeed(speed);
    playMechanicalClick(950, 0.03);
  };

  const toggleSound = () => {
    const next = toggleAudioMute();
    setAudioMuted(next);
    if (!next) playMechanicalClick(1600, 0.02);
  };

  return (
    <section
      id="workout-guide"
      className="scroll-mt-0 border-b border-hairline bg-ink py-section-y px-pad-x lg:pl-[12rem]"
      aria-labelledby="workout-guide-heading"
    >
      {/* Section Header */}
      <div className="mb-10 max-w-shell">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="accent-tick" aria-hidden="true" />
          <span className="t-label tracking-[0.22em] uppercase text-muted">
            Biomechanics & Form Laboratory
          </span>
          <span className="h-3 w-px bg-hairline-2" aria-hidden="true" />
          <span className="nums text-xs tracking-wider text-muted">
            3D MOVEMENT BLUEPRINTS
          </span>
        </div>

        <SectionHeading id="workout-guide-heading" className="t-h2 uppercase text-heading">
          Precision Gym Micro-Animations.
        </SectionHeading>
        <p className="t-body mt-4 max-w-measure text-muted">
          High-definition anatomical motion kinematics. Study exact joint articulation, barbell
          pathways, cadence tempo, and physiological muscle fiber recruitment across the eight
          foundational compound lifts.
        </p>
        <div className="mt-8 max-w-shell">
          <AccentRule />
        </div>
      </div>

      {/* Exercise Navigation Tabs (8 Exercises) */}
      <div className="mb-6 flex flex-wrap gap-2 pb-2" role="tablist">
        {EXERCISE_GUIDES.map((ex, idx) => {
          const isSelected = activeTab === idx;
          return (
            <button
              key={ex.id}
              id={`${baseId}-tab-${idx}`}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${idx}`}
              onClick={() => handleTabSelect(idx)}
              className={`t-ui group relative inline-flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-300 ${
                isSelected
                  ? 'border border-hairline-2 bg-charcoal text-heading shadow-lg'
                  : 'border border-transparent text-muted hover:border-hairline hover:text-heading'
              }`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full transition-transform group-hover:scale-125"
                style={{ backgroundColor: ex.accentColor }}
                aria-hidden="true"
              />
              <span className="nums text-xs text-faint">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span>{ex.name}</span>
              <span className="t-label text-[10px] uppercase text-faint opacity-80">
                · {ex.discipline}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full animate-pulse"
            style={{ backgroundColor: current.accentColor }}
            aria-hidden="true"
          />
          <span className="font-mono text-xs text-heading uppercase tracking-wider">
            {current.equipment}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-sage animate-pulse" aria-hidden="true" />
            <span className="nums text-[11px] font-mono text-muted uppercase tracking-wider">
              100% Vector Kinetic Transparency
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        id={`${baseId}-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeTab}`}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12"
      >
        {/* Left Column: Animation Player & Kinetic Controls */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <GymVectorAnimation
            exerciseId={current.id}
            name={current.name}
            accentColor={current.accentColor}
            isPlaying={isPlaying}
            speed={playbackSpeed}
            manualPhase={manualPhase}
            isScrubbing={isScrubbing}
            className="h-[360px] sm:h-[420px] md:h-[460px] w-full shadow-2xl"
          />

          {/* Kinetic Playback Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-hairline bg-charcoal/60 px-4 py-3">
            <div className="flex items-center gap-2">
              {/* Play / Pause Toggle */}
              <button
                type="button"
                onClick={handlePlayToggle}
                className="btn-line !py-1 !px-3 font-mono text-xs uppercase text-heading hover:bg-hairline"
                aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>

              {/* Speed Controls */}
              <div className="flex items-center border border-hairline rounded-sm">
                {([0.5, 1.0, 1.5] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2.5 py-1 font-mono text-xs transition-colors ${
                      playbackSpeed === spd
                        ? 'bg-hairline-2 text-heading font-medium'
                        : 'text-muted hover:text-heading'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Rep Phase Interactive Scrubber */}
            <div className="flex flex-1 items-center gap-2 min-w-[130px] max-w-[200px]">
              <span className="t-label text-[10px] text-faint">SCRUB</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isScrubbing ? manualPhase : 0.5}
                onChange={(e) => {
                  setIsScrubbing(true);
                  setIsPlaying(false);
                  setManualPhase(parseFloat(e.target.value));
                }}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-hairline accent-[#8C2230]"
                aria-label="Rep cycle position scrubber"
              />
            </div>

            {/* Audio Feedback Button */}
            <button
              type="button"
              onClick={toggleSound}
              className="t-ui text-xs text-muted hover:text-heading transition-colors"
              title={audioMuted ? 'Unmute mechanical click sounds' : 'Mute mechanical click sounds'}
            >
              {audioMuted ? '🔇 Audio Off' : '🔊 Mechanical Audio'}
            </button>
          </div>
        </div>

        {/* Right Column: Biomechanical Analysis & Coaching Cues */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          {/* Header Info Card */}
          <div className="border border-hairline bg-charcoal/40 p-5 rounded-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="t-label text-xs uppercase tracking-widest text-faint">
                {current.discipline} // TECHNIQUE DOSSIER
              </span>
              <span className="font-mono text-xs text-muted">{current.tempo}</span>
            </div>
            <h3 className="t-h3 text-heading">{current.name}</h3>
            <p className="t-small mt-1 text-muted">{current.subtitle}</p>

            {/* Muscle Recruitment Matrix */}
            <div className="mt-5 border-t border-hairline pt-4">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-faint flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#8C2230]" />
                <span>Primary Target Activation</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {current.primaryMuscles.map((m) => (
                  <span
                    key={m}
                    className="rounded bg-hairline-2 px-2.5 py-0.5 text-xs text-heading"
                  >
                    {m}
                  </span>
                ))}
              </div>

              <div className="mb-2 mt-3 text-[11px] font-mono uppercase tracking-wider text-faint flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#8C8C8C]" />
                <span>Secondary Stabilizers</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {current.secondaryMuscles.map((m) => (
                  <span
                    key={m}
                    className="rounded border border-hairline px-2.5 py-0.5 text-xs text-muted"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Form Coaching Cues */}
          <div className="border border-hairline bg-charcoal/20 p-5 rounded-sm">
            <h4 className="t-label uppercase tracking-widest text-muted mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" />
              Elite Form Protocol
            </h4>
            <ol className="flex flex-col gap-3">
              {current.cues.map((cue, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-heading">
                  <span className="font-mono text-faint">0{i + 1}.</span>
                  <span>{cue}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Common Biomechanical Fault */}
          <div className="border border-burgundy/30 bg-burgundy/10 p-4 rounded-sm">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono uppercase tracking-wider text-[#FF8595]">
              <span aria-hidden="true">⚠</span> Critical Fault to Avoid
            </div>
            <p className="t-small text-muted text-xs leading-relaxed">{current.fault}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
