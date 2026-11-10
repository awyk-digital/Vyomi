'use client';

import React, { useState, useId } from 'react';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import CinematicWorkoutPlayer, { Hotspot } from '@/components/CinematicWorkoutPlayer';

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
  masteryPrinciple: string;
  accentColor: string;
  imageSrc: string;
  hotspots: Hotspot[];
}

export const EXERCISE_GUIDES: ExerciseGuide[] = [
  {
    id: 'barbell-squat',
    discipline: 'Fitness',
    disciplineId: 'fitness',
    name: 'Barbell Back Squat',
    subtitle: 'Compound Knee Extensor & Gluteal Biomechanics',
    equipment: 'Olympic Competition Barbell & Solid Steel Power Rack',
    tempo: '3 · 1 · X (Controlled Descent · Depth Pause · Explosive Drive)',
    primaryMuscles: ['Quadriceps (Vastus Lateralis & Medialis)', 'Gluteus Maximus'],
    secondaryMuscles: ['Hamstrings', 'Erector Spinae', 'Transverse Abdominis'],
    cues: [
      'Position barbell across upper trapezius; pull elbows back to create a rigid muscular shelf',
      'Break simultaneously at hips and knees, actively pushing knees outward in line with toes',
      'Descend smoothly until hip crease breaks below the top of the patella, then drive through midfoot',
    ],
    masteryPrinciple:
      'Prioritize thoracic extension and diaphragmatic bracing to ensure force transfers through the midfoot without anterior knee drift.',
    accentColor: '#8C2230',
    imageSrc: '/img/workouts/barbell-squat.jpg',
    hotspots: [
      {
        id: 'traps',
        x: 50,
        y: 35,
        label: 'Upper Trapezius Shelf',
        detail: 'Barbell rests firmly across rear deltoids and traps with wrists neutral and elbows pulled back.',
      },
      {
        id: 'depth',
        x: 50,
        y: 68,
        label: 'Parallel Depth Threshold',
        detail: 'Hip crease breaks below the superior surface of the patella with spine fully neutral.',
      },
      {
        id: 'feet',
        x: 50,
        y: 92,
        label: 'Tripod Foot Contact',
        detail: 'Even pressure through heel, first metatarsal, and fifth metatarsal rooted into the floor.',
      },
    ],
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
    masteryPrinciple:
      'Treat the initial pull as a leg press into the earth; once past the knees, engage the glutes fully to achieve an effortless, tall vertical posture.',
    accentColor: '#8C2230',
    imageSrc: '/img/workouts/deadlift.jpg',
    hotspots: [
      {
        id: 'lats',
        x: 50,
        y: 22,
        label: 'Scapular Lat Lock',
        detail: 'Latissimus dorsi engaged and shoulder blades packed down like bent steel prior to liftoff.',
      },
      {
        id: 'grip',
        x: 50,
        y: 58,
        label: 'Chalked Precision Grip',
        detail: 'Firm double-overhand grip directly outside legs to minimize moment arm distance.',
      },
      {
        id: 'posture',
        x: 50,
        y: 76,
        label: 'Vertical Alignment',
        detail: 'Pelvis neutral with glutes fully clamped, avoiding excessive lumbar hyperextension.',
      },
    ],
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
    masteryPrinciple:
      'Maintain continuous leg drive and a tight retracted upper back to establish an immovable platform for maximum power and shoulder longevity.',
    accentColor: '#8C2230',
    imageSrc: '/img/workouts/bench-press.jpg',
    hotspots: [
      {
        id: 'scapulae',
        x: 42,
        y: 45,
        label: 'Scapular Anchor',
        detail: 'Shoulder blades pinched together and driven downward into the bench pad.',
      },
      {
        id: 'touch',
        x: 53,
        y: 35,
        label: 'Sternum Touch Plane',
        detail: 'Bar contacts lower chest gently with forearms strictly vertical beneath the load.',
      },
      {
        id: 'elbows',
        x: 68,
        y: 42,
        label: '45° Elbow Tuck',
        detail: 'Elbows tracked at an anatomical 45-degree angle protecting the rotator cuff.',
      },
    ],
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
    masteryPrinciple:
      'Emphasize strict scapular depression at the start of every rep to recruit the entire back musculature without momentum or swinging.',
    accentColor: '#B08D57',
    imageSrc: '/img/workouts/pull-up.jpg',
    hotspots: [
      {
        id: 'bar',
        x: 50,
        y: 26,
        label: 'Pronated Wide Grip',
        detail: 'Full hand wrap with knuckles stacked directly over the high-tensile steel bar.',
      },
      {
        id: 'lats',
        x: 50,
        y: 48,
        label: 'Latissimus Flare',
        detail: 'Elbows pulled downward toward back pockets for complete latissimus shortening.',
      },
      {
        id: 'core',
        x: 50,
        y: 92,
        label: 'Hollow Body Tension',
        detail: 'Anterior core braced with legs straight to prevent lower-body sway or kip.',
      },
    ],
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
    masteryPrinciple:
      'A true military press is a whole-body compound movement: clamp your glutes and brace the abdominal cylinder to provide a rock-solid foundation.',
    accentColor: '#B08D57',
    imageSrc: '/img/workouts/overhead-press.jpg',
    hotspots: [
      {
        id: 'lockout',
        x: 50,
        y: 15,
        label: 'Overhead Lockout Apex',
        detail: 'Bar stacked over glenohumeral joint, cervical spine, and midfoot in a plumb line.',
      },
      {
        id: 'deltoids',
        x: 50,
        y: 36,
        label: 'Shoulder Engagement',
        detail: 'Deltoids and upper traps contract to stabilize the heavy load overhead.',
      },
      {
        id: 'foundation',
        x: 50,
        y: 62,
        label: 'Gluteal Foundation',
        detail: 'Posterior chain locked tight to prevent compensatory lumbar hyperextension.',
      },
    ],
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
    masteryPrinciple:
      'Anchor into the hamstrings and maintain a rigid 45-degree spine; row with the elbows rather than biceps to fully recruit the rhomboids and mid-traps.',
    accentColor: '#8C2230',
    imageSrc: '/img/workouts/bent-over-row.jpg',
    hotspots: [
      {
        id: 'hinge',
        x: 52,
        y: 36,
        label: '45° Neutral Spine Hinge',
        detail: 'Torso remains steady at 45 degrees without rocking or swinging with the barbell.',
      },
      {
        id: 'row',
        x: 48,
        y: 58,
        label: 'Elbow Pull Vector',
        detail: 'Bar drawn smoothly toward the junction of the lower ribcage and abdomen.',
      },
      {
        id: 'hamstrings',
        x: 48,
        y: 84,
        label: 'Posterior Anchor',
        detail: 'Ischial tuberosities pushed back with hamstring tension counterbalancing bar weight.',
      },
    ],
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
    masteryPrinciple:
      'Control the eccentric descent so the back knee lightly kisses the turf margin rather than impacting, maximizing unilateral tension and hip stability.',
    accentColor: '#B08D57',
    imageSrc: '/img/workouts/lunge.jpg',
    hotspots: [
      {
        id: 'torso',
        x: 52,
        y: 32,
        label: 'Vertical Torso Carriage',
        detail: 'Spine perpendicular to floor with core clamped to absorb vertical compression.',
      },
      {
        id: 'knee',
        x: 58,
        y: 64,
        label: '90° Front Knee Angle',
        detail: 'Front patella tracking directly in line with second toe, avoiding medial valgus.',
      },
      {
        id: 'depth',
        x: 36,
        y: 80,
        label: 'Decelerated Depth Hover',
        detail: 'Back knee hovers 1 inch above turf to keep constant tension on working musculature.',
      },
    ],
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
    masteryPrinciple:
      'Envision pulling your elbows toward your toes and toes toward elbows to activate the high-threshold motor units of the deep abdominal cylinder.',
    accentColor: '#D6F55B',
    imageSrc: '/img/workouts/plank.jpg',
    hotspots: [
      {
        id: 'shoulders',
        x: 25,
        y: 58,
        label: 'Glenohumeral Stack',
        detail: 'Elbows perpendicular directly beneath shoulders; serratus pushing ribcage high.',
      },
      {
        id: 'core',
        x: 52,
        y: 52,
        label: 'Pelvic Anti-Extension',
        detail: 'Slight posterior pelvic tilt locks transverse abdominis without lumbar sagging.',
      },
      {
        id: 'ankles',
        x: 82,
        y: 68,
        label: 'Dorsiflexed Kinetic Lock',
        detail: 'Heels driven backward with quadriceps locked tight to preserve full body tension.',
      },
    ],
  },
];

/**
 * Studio Workout Guide Section — 4K Single-Athlete Masterclass.
 * Delivers an ultra-premium, quiet luxury fitness experience with zero clutter.
 */
export default function StudioWorkoutGuide() {
  const [activeTab, setActiveTab] = useState(0);
  const baseId = useId();
  const current = EXERCISE_GUIDES[activeTab];

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
            Biomechanics & Masterclass
          </span>
          <span className="h-3 w-px bg-hairline-2" aria-hidden="true" />
          <span className="nums text-xs tracking-wider text-muted">
            4K ATHLETE SERIES
          </span>
        </div>

        <SectionHeading id="workout-guide-heading" className="t-h2 uppercase text-heading">
          Foundational Kinematics in 4K.
        </SectionHeading>
        <p className="t-body mt-4 max-w-measure text-muted">
          Study textbook execution across the eight cornerstone compound movements. Photorealistic
          4K resolution, kinetic muscle recruitment analysis, and elite biomechanical cues featuring
          our master athlete.
        </p>
        <div className="mt-8 max-w-shell">
          <AccentRule />
        </div>
      </div>

      {/* Exercise Navigation Tabs (8 Exercises) */}
      <div className="mb-8 flex flex-wrap gap-2 pb-2" role="tablist">
        {EXERCISE_GUIDES.map((ex, idx) => {
          const isSelected = activeTab === idx;
          return (
            <button
              key={ex.id}
              id={`${baseId}-tab-${idx}`}
              role="tab"
              aria-selected={isSelected}
              aria-controls={`${baseId}-panel-${idx}`}
              onClick={() => setActiveTab(idx)}
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

      {/* Main Interactive Stage */}
      <div
        id={`${baseId}-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeTab}`}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12"
      >
        {/* Left Column: 4K Ultra-HD Cinematic Player */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <CinematicWorkoutPlayer
            exerciseId={current.id}
            name={current.name}
            discipline={current.discipline}
            accentColor={current.accentColor}
            imageSrc={current.imageSrc}
            tempo={current.tempo}
            hotspots={current.hotspots}
            className="w-full shadow-2xl"
          />

          <div className="flex items-center justify-between px-1 py-1 text-xs text-faint font-mono">
            <span>TAP IMAGE TO INSPECT 4K MUSCLE CONTRACTION</span>
            <span>SINGLE ATHLETE PROTOCOL</span>
          </div>
        </div>

        {/* Right Column: Biomechanical Analysis & Coaching Protocol */}
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

            <div className="mt-3 pt-3 border-t border-hairline/60">
              <span className="t-label text-[10px] uppercase tracking-wider text-faint">Equipment:</span>
              <span className="text-xs text-heading ml-2 font-mono">{current.equipment}</span>
            </div>

            {/* Muscle Recruitment Matrix */}
            <div className="mt-5 border-t border-hairline pt-4">
              <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-faint flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: current.accentColor }}
                />
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

          {/* Execution Mastery Principle */}
          <div className="border border-hairline bg-charcoal/30 p-4 rounded-sm">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono uppercase tracking-wider text-muted">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: current.accentColor }}
                aria-hidden="true"
              />
              Execution Mastery Principle
            </div>
            <p className="t-small text-muted text-xs leading-relaxed">{current.masteryPrinciple}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
