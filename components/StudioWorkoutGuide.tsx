'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import SectionHeading from '@/components/SectionHeading';
import AccentRule from '@/components/AccentRule';
import Reveal from '@/components/Reveal';
import LottieWorkoutPlayer from '@/components/LottieWorkoutPlayer';
import { playMechanicalClick, toggleAudioMute, getAudioMuted } from '@/lib/haptics';

export interface ExerciseGuide {
  id: string;
  discipline: 'Fitness' | 'HYROX' | 'Pilates';
  disciplineId: 'fitness' | 'hyrox' | 'pilates';
  name: string;
  subtitle: string;
  machine: string;
  tempo: string; // e.g., "3 · 1 · 1"
  primaryMuscles: string[];
  secondaryMuscles: string[];
  cues: [string, string, string];
  fault: string;
  lottiePath: string;
  // Kinematic render parameters
  renderType: 'incline-press' | 'hack-squat' | 'sled-push' | 'skierg' | 'reformer-footwork' | 'reformer-stretch';
  accentColor: string;
}

export const EXERCISE_GUIDES: ExerciseGuide[] = [
  {
    id: 'incline-press',
    discipline: 'Fitness',
    disciplineId: 'fitness',
    name: 'Converging Incline Chest Press',
    subtitle: 'Upper Pectoral Arc & Humeral Adduction',
    machine: 'Panatta Monolith Series',
    tempo: '3 · 1 · 1 (Eccentric · Pause · Concentric)',
    primaryMuscles: ['Clavicular Pectoralis Major', 'Anterior Deltoid'],
    secondaryMuscles: ['Triceps Brachii', 'Serratus Anterior'],
    cues: [
      'Pin scapulae into the 30° backrest; maintain a proud thoracic cage',
      'Track elbows at ~45° from the torso, avoiding perpendicular 90° shoulder flares',
      'Drive upward along the natural converging arc without unlocking shoulder blades',
    ],
    fault: 'Flaring elbows outward at 90° impinges the rotator cuff tendons.',
    lottiePath: '/lottie/incline-press.json',
    renderType: 'incline-press',
    accentColor: '#8C2230',
  },
  {
    id: 'hack-squat',
    discipline: 'Fitness',
    disciplineId: 'fitness',
    name: 'Pendulum Hack Squat',
    subtitle: 'Vastus Medialis & Gluteal Biomechanics',
    machine: 'Panatta Plate-Loaded Arc',
    tempo: '3 · 1 · 1 (Controlled Descent · Depth · Drive)',
    primaryMuscles: ['Quadriceps (Rectus Femoris & VMO)', 'Gluteus Maximus'],
    secondaryMuscles: ['Adductor Magnus', 'Soleus'],
    cues: [
      'Firmly anchor lumbar spine and upper back against the high-density bolster',
      'Descend smoothly until femur breaks parallel (90° knee angle), tracking over midfoot',
      'Drive through the heels and mid-foot; avoid hyperextending knees at top lockout',
    ],
    fault: 'Allowing lower back to peel off the bolster causes excessive lumbar shear.',
    lottiePath: '/lottie/hack-squat.json',
    renderType: 'hack-squat',
    accentColor: '#8C2230',
  },
  {
    id: 'sled-push',
    discipline: 'HYROX',
    disciplineId: 'hyrox',
    name: 'Power Sled Drive',
    subtitle: '45° Rigid Torso Force Vector & Triple Extension',
    machine: 'Vyomi Sprint Turf & Heavy Plate Sled',
    tempo: 'Continuous Piston Drive (High Cadence)',
    primaryMuscles: ['Gluteus Complex', 'Quadriceps', 'Calves (Gastrocnemius)'],
    secondaryMuscles: ['Core Stabilizers', 'Anterior Deltoids'],
    cues: [
      'Maintain an unbroken 45° angle from ears through hips to back heels',
      'Keep arms extended with elbows soft; transfer force through stiff locked torso',
      'Short, explosive piston strides driving off the balls of the feet into the turf',
    ],
    fault: 'Arching or rounding the lumbar spine dissipates forward momentum.',
    lottiePath: '/lottie/sled-push.json',
    renderType: 'sled-push',
    accentColor: '#B08D57',
  },
  {
    id: 'skierg',
    discipline: 'HYROX',
    disciplineId: 'hyrox',
    name: 'SkiErg Triple Extension',
    subtitle: 'Latissimus Dorsi & Posterior Chain Velocity',
    machine: 'Performance Air-Resistance Ergometer',
    tempo: '1 · 0 · 2 (Explosive Pull · Instant Pivot · Smooth Return)',
    primaryMuscles: ['Latissimus Dorsi', 'Rectus Abdominis', 'Triceps'],
    secondaryMuscles: ['Hamstrings', 'Glutes', 'Hip Flexors'],
    cues: [
      'Start tall on balls of feet with high elbows and hands near eye level',
      'Initiate pull by dropping bodyweight into a deep hip hinge, driving handles down',
      'Finish stroke past knees with straight wrists, then smoothly rise tall to reset',
    ],
    fault: 'Squatting with vertical torso rather than hinging hips wastes posterior recruitment.',
    lottiePath: '/lottie/skierg.json',
    renderType: 'skierg',
    accentColor: '#B08D57',
  },
  {
    id: 'reformer-footwork',
    discipline: 'Pilates',
    disciplineId: 'pilates',
    name: 'Reformer Footwork & Glide',
    subtitle: 'Plantar Articulation & Controlled Carriage Glide',
    machine: 'Balanced Body Studio Reformer (3 Springs)',
    tempo: '3 · 1 · 3 (Eccentric Return · Pause · Smooth Press)',
    primaryMuscles: ['Transverse Abdominis', 'Quadriceps', 'Deep Pelvic Floor'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Adductors'],
    cues: [
      'Keep pelvis neutral with natural lumbar arch; headrest flat and shoulders quiet',
      'Connect heels or balls of feet to the footbar with equal bilateral pressure',
      'Extend legs to smooth long carriage glide, then resist springs on the return',
    ],
    fault: 'Tucking pelvis and flattening back against carriage compromises spinal shock absorption.',
    lottiePath: '/lottie/reformer.json',
    renderType: 'reformer-footwork',
    accentColor: '#D6F55B',
  },
  {
    id: 'reformer-stretch',
    discipline: 'Pilates',
    disciplineId: 'pilates',
    name: 'Reformer Long Stretch',
    subtitle: 'Scapular Depression & Core Anti-Extension',
    machine: 'Balanced Body Studio Reformer (2 Springs)',
    tempo: '2 · 1 · 2 (Outward Glide · Hold · Pull Return)',
    primaryMuscles: ['Transverse Abdominis', 'Serratus Anterior', 'Latissimus Dorsi'],
    secondaryMuscles: ['Gluteus Maximus', 'Pectoralis Major', 'Triceps'],
    cues: [
      'Establish a rigid high plank with hands resting on footbar and heels at shoulder blocks',
      'Maintain an unbroken head-to-heel diagonal line as shoulders hinge carriage outward',
      'Engage lower abdominals and serratus to glide carriage back under control',
    ],
    fault: 'Sagging hips or hyperextending neck collapses the lumbar stability cylinder.',
    lottiePath: '/lottie/reformer.json',
    renderType: 'reformer-stretch',
    accentColor: '#D6F55B',
  },
];

/**
 * High-Precision Vector Micro-Animation Canvas.
 * Renders smooth 60fps kinetic motion of human anatomy and gym machinery.
 */
function WorkoutCanvas({
  exercise,
  isPlaying,
  playbackSpeed,
  manualPhase,
  isScrubbing,
}: {
  exercise: ExerciseGuide;
  isPlaying: boolean;
  playbackSpeed: number;
  manualPhase: number;
  isScrubbing: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    if (isScrubbing) {
      phaseRef.current = manualPhase;
    }
  }, [manualPhase, isScrubbing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = (now: number) => {
      const dt = (now - lastTime) * 0.001;
      lastTime = now;

      if (isPlaying && !isScrubbing) {
        // Full rep cycle is ~3.5 seconds at 1.0x
        phaseRef.current = (phaseRef.current + (dt * playbackSpeed) / 3.5) % 1.0;
      }

      const t = phaseRef.current; // 0..1
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.scale(dpr, dpr);

      const renderW = w / dpr;
      const renderH = h / dpr;

      // Subtle architectural grid background
      ctx.strokeStyle = 'rgba(245, 245, 242, 0.035)';
      ctx.lineWidth = 1;
      const gridStep = 40;
      for (let x = 0; x < renderW; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, renderH);
        ctx.stroke();
      }
      for (let y = 0; y < renderH; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(renderW, y);
        ctx.stroke();
      }

      // Smooth kinematic easing calculation (0 -> 1 -> 0 cyclic motion)
      // Cycle: 0 -> 0.4 (eccentric stretch), 0.4 -> 0.5 (isometric pause), 0.5 -> 0.9 (concentric push), 0.9 -> 1.0 (lockout)
      let cycleProgress = 0;
      let phaseLabel = 'ECCENTRIC';
      let phaseSub = 'Lengthening Phase (3s Controlled)';
      let forceAlpha = 0.2;

      if (t < 0.45) {
        // Eccentric phase
        const subT = t / 0.45;
        cycleProgress = Math.cos(subT * Math.PI) * 0.5 + 0.5; // 1 down to 0
        phaseLabel = 'ECCENTRIC (STRETCH)';
        phaseSub = 'Controlled 3s Muscle Elongation';
        forceAlpha = 0.25 + (1 - subT) * 0.2;
      } else if (t < 0.55) {
        // Isometric transition pause
        cycleProgress = 0;
        phaseLabel = 'ISOMETRIC HOLD';
        phaseSub = 'Peak Stretch & Zero Momentum Turn';
        forceAlpha = 0.6;
      } else if (t < 0.9) {
        // Concentric drive phase
        const subT = (t - 0.55) / 0.35;
        // Smooth sine ease in-out
        cycleProgress = Math.sin((subT * Math.PI) / 2); // 0 up to 1
        phaseLabel = 'CONCENTRIC (DRIVE)';
        phaseSub = 'Explosive Neural Recruitment';
        forceAlpha = 0.9;
      } else {
        // Top lockout / transition
        cycleProgress = 1;
        phaseLabel = 'LOCKOUT / RESET';
        phaseSub = 'Scapular Stability & Breathing Reset';
        forceAlpha = 0.4;
      }

      // Render Kinematics according to exercise type
      const cx = renderW * 0.5;
      const cy = renderH * 0.55;

      switch (exercise.renderType) {
        case 'incline-press':
          drawInclinePress(ctx, cx, cy, cycleProgress, forceAlpha);
          break;
        case 'hack-squat':
          drawHackSquat(ctx, cx, cy, cycleProgress, forceAlpha);
          break;
        case 'sled-push':
          drawSledPush(ctx, cx, cy, t, forceAlpha);
          break;
        case 'skierg':
          drawSkiErg(ctx, cx, cy, cycleProgress, forceAlpha);
          break;
        case 'reformer-footwork':
          drawReformerFootwork(ctx, cx, cy, cycleProgress, forceAlpha);
          break;
        case 'reformer-stretch':
          drawReformerStretch(ctx, cx, cy, cycleProgress, forceAlpha);
          break;
      }

      // Telemetry HUD overlay in canvas corner
      drawTelemetryHUD(ctx, renderW, renderH, t, phaseLabel, phaseSub, cycleProgress);

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [exercise, isPlaying, playbackSpeed, isScrubbing]);

  // --- KINEMATIC DRAWING ROUTINES ---

  function drawInclinePress(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    forceAlpha: number
  ) {
    // 30 degree incline bench
    const benchAngle = (30 * Math.PI) / 180;
    const benchLength = 220;

    ctx.save();
    ctx.translate(cx - 40, cy + 30);

    // Bench frame
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.22)';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-benchLength * 0.3 * Math.cos(benchAngle), benchLength * 0.3 * Math.sin(benchAngle));
    ctx.lineTo(benchLength * 0.7 * Math.cos(benchAngle), -benchLength * 0.7 * Math.sin(benchAngle));
    ctx.stroke();

    // Bench support strut
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.12)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 110);
    ctx.lineTo(-70, 110);
    ctx.stroke();

    // Human torso resting on bench (inclined)
    const hipX = -20 * Math.cos(benchAngle);
    const hipY = 20 * Math.sin(benchAngle);
    const shoulderX = 110 * Math.cos(benchAngle);
    const shoulderY = -110 * Math.sin(benchAngle);

    // Torso line
    ctx.strokeStyle = '#F5F5F2';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(shoulderX, shoulderY);
    ctx.stroke();

    // Head
    const headX = shoulderX + 28 * Math.cos(benchAngle);
    const headY = shoulderY - 28 * Math.sin(benchAngle);
    ctx.fillStyle = '#F5F5F2';
    ctx.beginPath();
    ctx.arc(headX, headY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Legs on floor
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.5)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(hipX - 30, hipY + 60);
    ctx.lineTo(hipX - 30, hipY + 110);
    ctx.stroke();

    // Arms & Press Movement Kinematics
    // At progress = 0 (bottom of press), elbows bent, hands close to chest
    // At progress = 1 (top of press), arms extended along converging angle
    const pressArmLength = 80;
    const pressAngle = benchAngle + Math.PI / 2 + 0.15 - progress * 0.1;

    // Hand position travels from (shoulder + 35) to (shoulder + 95)
    const reach = 40 + progress * 65;
    const handX = shoulderX + reach * Math.cos(pressAngle);
    const handY = shoulderY - reach * Math.sin(pressAngle);

    // Elbow calculates via 2-bone IK
    const upperArm = 48;
    const forearm = 48;
    const elbowAngle = Math.PI * 0.45 - progress * 0.85;
    const elbowX = shoulderX + upperArm * Math.cos(benchAngle + elbowAngle);
    const elbowY = shoulderY - upperArm * Math.sin(benchAngle + elbowAngle);

    // Draw arm bones
    ctx.strokeStyle = '#E0DFDB';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Barbell / Machine Handle & Converging Axis Bar
    ctx.strokeStyle = '#8C2230';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(handX - 25, handY - 10);
    ctx.lineTo(handX + 25, handY + 10);
    ctx.stroke();

    // Motion Trajectory Phosphor Arc
    ctx.strokeStyle = 'rgba(140, 34, 48, 0.45)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(shoulderX + 40 * Math.cos(pressAngle), shoulderY - 40 * Math.sin(pressAngle));
    ctx.lineTo(shoulderX + 105 * Math.cos(pressAngle), shoulderY - 105 * Math.sin(pressAngle));
    ctx.stroke();
    ctx.setLineDash([]);

    // Dynamic Force Vector
    if (progress > 0.1) {
      ctx.strokeStyle = `rgba(214, 245, 91, ${forceAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.lineTo(handX + 35 * Math.cos(pressAngle), handY - 35 * Math.sin(pressAngle));
      ctx.stroke();
      // Arrowhead
      const ahX = handX + 35 * Math.cos(pressAngle);
      const ahY = handY - 35 * Math.sin(pressAngle);
      ctx.fillStyle = `rgba(214, 245, 91, ${forceAlpha})`;
      ctx.beginPath();
      ctx.arc(ahX, ahY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Active Pectoral Muscle Heatmap Glow
    const pecGlow = ctx.createRadialGradient(
      shoulderX - 10,
      shoulderY + 15,
      2,
      shoulderX - 10,
      shoulderY + 15,
      28
    );
    pecGlow.addColorStop(0, `rgba(140, 34, 48, ${0.4 + forceAlpha * 0.5})`);
    pecGlow.addColorStop(1, 'rgba(140, 34, 48, 0)');
    ctx.fillStyle = pecGlow;
    ctx.beginPath();
    ctx.arc(shoulderX - 10, shoulderY + 15, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawHackSquat(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    forceAlpha: number
  ) {
    // 45 degree hack rail
    const railAngle = (45 * Math.PI) / 180;
    const railLength = 260;

    ctx.save();
    ctx.translate(cx, cy + 20);

    // Guide Rails
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.15)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-railLength * 0.5 * Math.cos(railAngle), -railLength * 0.5 * Math.sin(railAngle));
    ctx.lineTo(railLength * 0.5 * Math.cos(railAngle), railLength * 0.5 * Math.sin(railAngle));
    ctx.stroke();

    // Footplate at base
    const footplateX = railLength * 0.45 * Math.cos(railAngle);
    const footplateY = railLength * 0.45 * Math.sin(railAngle);
    ctx.strokeStyle = '#8C2230';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(footplateX - 30 * Math.sin(railAngle), footplateY + 30 * Math.cos(railAngle));
    ctx.lineTo(footplateX + 30 * Math.sin(railAngle), footplateY - 30 * Math.cos(railAngle));
    ctx.stroke();

    // Sled displacement along rail (progress = 0 is deep bottom, progress = 1 is standing)
    const sledDist = (progress * 0.4 - 0.2) * railLength;
    const sledX = sledDist * Math.cos(railAngle);
    const sledY = sledDist * Math.sin(railAngle);

    // Sled backrest
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.4)';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(sledX - 45 * Math.cos(railAngle), sledY - 45 * Math.sin(railAngle));
    ctx.lineTo(sledX + 30 * Math.cos(railAngle), sledY + 30 * Math.sin(railAngle));
    ctx.stroke();

    // Shoulder pads
    ctx.fillStyle = '#8C2230';
    ctx.fillRect(
      sledX - 45 * Math.cos(railAngle) - 8,
      sledY - 45 * Math.sin(railAngle) - 14,
      18,
      28
    );

    // Lifter torso against sled
    const shoulderX = sledX - 35 * Math.cos(railAngle);
    const shoulderY = sledY - 35 * Math.sin(railAngle);
    const hipX = sledX + 25 * Math.cos(railAngle);
    const hipY = sledY + 25 * Math.sin(railAngle);

    ctx.strokeStyle = '#F5F5F2';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(hipX, hipY);
    ctx.stroke();

    // Head
    const headX = shoulderX - 16 * Math.cos(railAngle);
    const headY = shoulderY - 16 * Math.sin(railAngle);
    ctx.fillStyle = '#F5F5F2';
    ctx.beginPath();
    ctx.arc(headX, headY, 13, 0, Math.PI * 2);
    ctx.fill();

    // Feet fixed on footplate
    const footX = footplateX - 8 * Math.sin(railAngle);
    const footY = footplateY + 8 * Math.cos(railAngle);

    // Knee joint kinematics
    // When progress = 0 (bottom squat), knee flexes outward to side
    const kneeOffset = (1 - progress) * 45;
    const kneeX = (hipX + footX) * 0.5 - kneeOffset;
    const kneeY = (hipY + footY) * 0.5 + kneeOffset * 0.7;

    // Femur & Tibia
    ctx.strokeStyle = '#E0DFDB';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    // VMO / Quad muscle engagement glow
    const quadGlow = ctx.createRadialGradient(
      (hipX + kneeX) * 0.5,
      (hipY + kneeY) * 0.5,
      2,
      (hipX + kneeX) * 0.5,
      (hipY + kneeY) * 0.5,
      32
    );
    quadGlow.addColorStop(0, `rgba(140, 34, 48, ${0.35 + forceAlpha * 0.5})`);
    quadGlow.addColorStop(1, 'rgba(140, 34, 48, 0)');
    ctx.fillStyle = quadGlow;
    ctx.beginPath();
    ctx.arc((hipX + kneeX) * 0.5, (hipY + kneeY) * 0.5, 32, 0, Math.PI * 2);
    ctx.fill();

    // Force vector through heels
    if (progress > 0.05) {
      ctx.strokeStyle = `rgba(214, 245, 91, ${forceAlpha})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(footX, footY);
      ctx.lineTo(footX - 45 * Math.cos(railAngle), footY - 45 * Math.sin(railAngle));
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSledPush(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    t: number,
    forceAlpha: number
  ) {
    ctx.save();
    ctx.translate(cx - 70, cy + 30);

    // Turf floor track
    ctx.strokeStyle = 'rgba(176, 141, 87, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-160, 90);
    ctx.lineTo(240, 90);
    ctx.stroke();

    // Sled base & vertical push uprights
    const sledX = 120;
    const sledY = 90;
    ctx.strokeStyle = '#B08D57';
    ctx.lineWidth = 6;
    // Skids
    ctx.beginPath();
    ctx.moveTo(sledX - 30, sledY);
    ctx.lineTo(sledX + 50, sledY);
    ctx.lineTo(sledX + 60, sledY - 15);
    ctx.stroke();

    // Upright push bars
    ctx.strokeStyle = '#F5F5F2';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sledX, sledY);
    ctx.lineTo(sledX, sledY - 110);
    ctx.moveTo(sledX + 25, sledY);
    ctx.lineTo(sledX + 25, sledY - 110);
    ctx.stroke();

    // Heavy weight plates on sled
    ctx.fillStyle = '#1C1C1C';
    ctx.strokeStyle = '#8C2230';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(sledX + 5, sledY - 70, 16, 70, 2);
    ctx.fill();
    ctx.stroke();

    // Athlete in continuous 45° forward drive
    // Cyclic leg piston stride based on t * 4
    const stride = (t * 6) % 1; // 6 strides per full cycle
    const leg1Phase = Math.sin(stride * Math.PI * 2);
    const leg2Phase = Math.sin((stride + 0.5) * Math.PI * 2);

    const handX = sledX;
    const handY = sledY - 75;

    // Athlete torso (constant 45 deg angle)
    const torsoAngle = (42 * Math.PI) / 180;
    const shoulderX = handX - 55;
    const shoulderY = handY + 12;
    const hipX = shoulderX - 70 * Math.cos(torsoAngle);
    const hipY = shoulderY + 70 * Math.sin(torsoAngle);

    // Head
    ctx.fillStyle = '#F5F5F2';
    ctx.beginPath();
    ctx.arc(shoulderX + 10, shoulderY - 10, 13, 0, Math.PI * 2);
    ctx.fill();

    // Torso spine
    ctx.strokeStyle = '#F5F5F2';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(hipX, hipY);
    ctx.stroke();

    // Arms locked to poles
    ctx.strokeStyle = '#E0DFDB';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Leg 1 (Front drive)
    const knee1X = hipX + 30 * Math.cos(torsoAngle) + leg1Phase * 20;
    const knee1Y = hipY + 30 * Math.sin(torsoAngle) - leg1Phase * 15;
    const foot1X = hipX + 15 + leg1Phase * 35;
    const foot1Y = 90;

    // Leg 2 (Rear push off)
    const knee2X = hipX - 25 - leg2Phase * 18;
    const knee2Y = hipY + 35 - leg2Phase * 10;
    const foot2X = hipX - 55 - leg2Phase * 25;
    const foot2Y = 90;

    ctx.strokeStyle = '#B8B8B8';
    ctx.lineWidth = 5;
    // Leg 2
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(knee2X, knee2Y);
    ctx.lineTo(foot2X, foot2Y);
    ctx.stroke();

    // Leg 1
    ctx.strokeStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(knee1X, knee1Y);
    ctx.lineTo(foot1X, foot1Y);
    ctx.stroke();

    // Forward kinetic propulsion arrows
    ctx.strokeStyle = `rgba(176, 141, 87, ${forceAlpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(handX + 15, handY);
    ctx.lineTo(handX + 65, handY);
    ctx.stroke();

    ctx.restore();
  }

  function drawSkiErg(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    forceAlpha: number
  ) {
    ctx.save();
    ctx.translate(cx, cy + 20);

    // Ergometer column
    const colX = -90;
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.18)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(colX, 110);
    ctx.lineTo(colX, -140);
    ctx.stroke();

    // Top flywheel & pulleys
    ctx.fillStyle = '#1C1C1C';
    ctx.strokeStyle = '#B08D57';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(colX, 60, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Athlete standing / hinging
    // progress = 0 is bottom finished hinge pull; progress = 1 is top reach
    const hinge = 1 - progress; // 1 at deep pull, 0 at top reach
    const hipX = 20 + hinge * 40;
    const hipY = 20 + hinge * 15;
    const shoulderX = hipX - 40 * Math.sin(hinge * 0.9);
    const shoulderY = -60 + hinge * 40;

    // Head
    ctx.fillStyle = '#F5F5F2';
    ctx.beginPath();
    ctx.arc(shoulderX + 5, shoulderY - 18, 13, 0, Math.PI * 2);
    ctx.fill();

    // Spine
    ctx.strokeStyle = '#F5F5F2';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(hipX, hipY);
    ctx.stroke();

    // Legs (soft knee hinge)
    const footX = 15;
    const footY = 110;
    const kneeX = 25 - hinge * 15;
    const kneeY = 65;

    ctx.strokeStyle = '#B8B8B8';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    // Drive arms pulling cables from top pulley
    const cableTopX = colX + 15;
    const cableTopY = -135;

    const handX = shoulderX - 10 - hinge * 30;
    const handY = shoulderY + 40 + hinge * 45;

    // Drive cords
    ctx.strokeStyle = 'rgba(176, 141, 87, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cableTopX, cableTopY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Arms
    ctx.strokeStyle = '#E0DFDB';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(shoulderX + 15 - hinge * 20, shoulderY + 25);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Core / Lat activation glow
    const coreGlow = ctx.createRadialGradient(
      (shoulderX + hipX) * 0.5,
      (shoulderY + hipY) * 0.5,
      2,
      (shoulderX + hipX) * 0.5,
      (shoulderY + hipY) * 0.5,
      35
    );
    coreGlow.addColorStop(0, `rgba(176, 141, 87, ${0.25 + forceAlpha * 0.5})`);
    coreGlow.addColorStop(1, 'rgba(176, 141, 87, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc((shoulderX + hipX) * 0.5, (shoulderY + hipY) * 0.5, 35, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawReformerFootwork(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    forceAlpha: number
  ) {
    ctx.save();
    ctx.translate(cx, cy + 30);

    // Reformer wooden frame & rails
    const frameLength = 340;
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-frameLength * 0.5, 50);
    ctx.lineTo(frameLength * 0.5, 50);
    ctx.stroke();

    // Footbar on the left
    const footbarX = -frameLength * 0.46;
    ctx.strokeStyle = '#D6F55B';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(footbarX, 50);
    ctx.lineTo(footbarX + 15, -25);
    ctx.lineTo(footbarX + 25, -25);
    ctx.stroke();

    // Carriage displacement (progress = 0 is home position, progress = 1 is fully extended out)
    const carriageTravel = progress * 95;
    const carriageX = -60 + carriageTravel;
    const carriageY = 40;
    const carriageW = 160;

    // Carriage bed & shoulder blocks
    ctx.fillStyle = '#141414';
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(carriageX - carriageW * 0.5, carriageY - 14, carriageW, 14, 2);
    ctx.fill();
    ctx.stroke();

    // Shoulder block & headrest
    ctx.fillStyle = '#D6F55B';
    ctx.fillRect(carriageX + carriageW * 0.5 - 35, carriageY - 26, 8, 14);

    // Reformer Springs underneath carriage
    ctx.strokeStyle = 'rgba(214, 245, 91, 0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const springStartX = footbarX + 35;
    const springEndX = carriageX - carriageW * 0.5;
    ctx.moveTo(springStartX, 44);
    // Spring coiled look
    for (let sx = springStartX; sx < springEndX; sx += 6) {
      ctx.lineTo(sx + 3, 40);
      ctx.lineTo(sx + 6, 48);
    }
    ctx.stroke();

    // Athlete supine lying on carriage
    const shoulderX = carriageX + carriageW * 0.5 - 40;
    const shoulderY = carriageY - 22;
    const hipX = carriageX - 15;
    const hipY = carriageY - 22;

    // Head on headrest
    ctx.fillStyle = '#F5F5F2';
    ctx.beginPath();
    ctx.arc(shoulderX + 18, shoulderY - 4, 12, 0, Math.PI * 2);
    ctx.fill();

    // Torso (neutral spine)
    ctx.strokeStyle = '#F5F5F2';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(hipX, hipY);
    ctx.stroke();

    // Arms resting long by sides
    ctx.strokeStyle = '#A0A09C';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(shoulderX - 45, shoulderY);
    ctx.stroke();

    // Legs: feet planted on footbar, knees bending / extending
    const footX = footbarX + 22;
    const footY = -25;

    // Knee calculation based on leg extension
    const kneeX = (hipX + footX) * 0.5 + (1 - progress) * 20;
    const kneeY = Math.min(hipY, footY) - 30 - (1 - progress) * 35;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    // Pelvic neutral & deep core highlight
    const coreGlow = ctx.createRadialGradient(hipX + 10, hipY, 2, hipX + 10, hipY, 24);
    coreGlow.addColorStop(0, `rgba(214, 245, 91, ${0.4 + forceAlpha * 0.4})`);
    coreGlow.addColorStop(1, 'rgba(214, 245, 91, 0)');
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(hipX + 10, hipY, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawReformerStretch(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    progress: number,
    forceAlpha: number
  ) {
    ctx.save();
    ctx.translate(cx, cy + 30);

    const frameLength = 340;
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-frameLength * 0.5, 50);
    ctx.lineTo(frameLength * 0.5, 50);
    ctx.stroke();

    const footbarX = -frameLength * 0.46;
    ctx.strokeStyle = '#D6F55B';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(footbarX, 50);
    ctx.lineTo(footbarX + 15, -25);
    ctx.lineTo(footbarX + 25, -25);
    ctx.stroke();

    // Carriage displacement in plank (carriage travels away as shoulders flex)
    const carriageTravel = progress * 65;
    const carriageX = 10 + carriageTravel;
    const carriageY = 40;
    const carriageW = 160;

    ctx.fillStyle = '#141414';
    ctx.strokeStyle = 'rgba(245, 245, 242, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(carriageX - carriageW * 0.5, carriageY - 14, carriageW, 14, 2);
    ctx.fill();
    ctx.stroke();

    // High plank posture: hands on footbar, feet braced against shoulder blocks
    const handX = footbarX + 20;
    const handY = -25;
    const footX = carriageX + carriageW * 0.5 - 35;
    const footY = carriageY - 20;

    // Shoulder articulates back as carriage moves
    const shoulderX = handX + 45 + progress * 25;
    const shoulderY = handY - 45 + progress * 15;

    // Head
    ctx.fillStyle = '#F5F5F2';
    ctx.beginPath();
    ctx.arc(shoulderX - 14, shoulderY - 8, 12, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    ctx.strokeStyle = '#E0DFDB';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.lineTo(shoulderX, shoulderY);
    ctx.stroke();

    // Hip maintained in rigid plank diagonal
    const hipX = (shoulderX + footX) * 0.52;
    const hipY = (shoulderY + footY) * 0.5;

    // Torso & Legs rigid plank
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(hipX, hipY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    // Serratus & core anti-extension line
    ctx.strokeStyle = `rgba(214, 245, 91, ${0.4 + forceAlpha * 0.5})`;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY + 8);
    ctx.lineTo(hipX, hipY + 8);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  function drawTelemetryHUD(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    phaseLabel: string,
    phaseSub: string,
    cycleProgress: number
  ) {
    // Top-left live phase indicator
    ctx.font = '500 11px monospace';
    ctx.fillStyle = 'rgba(245, 245, 242, 0.4)';
    ctx.fillText('BIOMECHANICAL KINETICS // 60 FPS', 24, 30);

    ctx.font = '600 13px monospace';
    ctx.fillStyle = '#F5F5F2';
    ctx.fillText(phaseLabel, 24, 48);

    ctx.font = '400 10.5px "General Sans", sans-serif';
    ctx.fillStyle = 'rgba(245, 245, 242, 0.6)';
    ctx.fillText(phaseSub, 24, 65);

    // Top-right cadence dial ring
    const rx = w - 45;
    const ry = 42;
    const radius = 18;

    ctx.strokeStyle = 'rgba(245, 245, 242, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(rx, ry, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Active progress arc
    ctx.strokeStyle = exercise.accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(rx, ry, radius, -Math.PI / 2, -Math.PI / 2 + t * Math.PI * 2);
    ctx.stroke();

    // Percent readout in center
    ctx.font = '500 9.5px monospace';
    ctx.fillStyle = '#F5F5F2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(t * 100)}%`, rx, ry);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    // Bottom telemetry strip
    const barW = w - 48;
    const barY = h - 24;

    ctx.fillStyle = 'rgba(245, 245, 242, 0.08)';
    ctx.fillRect(24, barY, barW, 4);

    ctx.fillStyle = exercise.accentColor;
    ctx.fillRect(24, barY, barW * cycleProgress, 4);
  }

  return (
    <canvas
      ref={canvasRef}
      className="h-[360px] w-full rounded-sm bg-[#0A0A0A] sm:h-[420px] md:h-[460px]"
    />
  );
}

/**
 * Studio Workout Micro-Animations Guide Section.
 * Comprehensive, interactive biomechanical laboratory across Fitness, HYROX, and Pilates.
 */
export default function StudioWorkoutGuide() {
  const [activeTab, setActiveTab] = useState(0);
  const [engineMode, setEngineMode] = useState<'lottie' | 'kinematic'>('lottie');
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<0.5 | 1.0 | 1.5>(1.0);
  const [manualPhase, setManualPhase] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [audioMuted, setAudioMuted] = useState(getAudioMuted());
  const [customLottieUrl, setCustomLottieUrl] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [lottieFrames, setLottieFrames] = useState({ current: 0, total: 120 });

  const baseId = useId();
  const current = EXERCISE_GUIDES[activeTab];

  const handleTabSelect = (idx: number) => {
    setActiveTab(idx);
    setManualPhase(0);
    setIsScrubbing(false);
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
            STUDIO KINETIC BLUEPRINTS
          </span>
        </div>

        <SectionHeading id="workout-guide-heading" className="t-h2 uppercase text-heading">
          Precision Workout Micro-Animations.
        </SectionHeading>
        <p className="t-body mt-4 max-w-measure text-muted">
          Interactive real-time biomechanical kinematics. Examine exact force vectors, joint angles,
          cadence tempos, and physiological muscle recruitment across Vyomi&apos;s primary studio
          disciplines.
        </p>
        <div className="mt-8 max-w-shell">
          <AccentRule />
        </div>
      </div>

      {/* Exercise Navigation Tabs */}
      <div className="mb-4 flex flex-wrap gap-2 pb-2" role="tablist">
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

      {/* Engine Switcher & Utility Toolbar */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-4">
        <div className="flex items-center gap-1.5 p-1 bg-charcoal/80 rounded-sm border border-hairline">
          <button
            type="button"
            onClick={() => {
              setEngineMode('lottie');
              playMechanicalClick(1300, 0.03);
            }}
            className={`px-3 py-1 text-xs font-mono rounded-sm transition-all ${
              engineMode === 'lottie'
                ? 'bg-hairline-2 text-heading shadow font-medium'
                : 'text-muted hover:text-heading'
            }`}
          >
            ✦ LottieFiles Vector Engine
          </button>
          <button
            type="button"
            onClick={() => {
              setEngineMode('kinematic');
              playMechanicalClick(1100, 0.03);
            }}
            className={`px-3 py-1 text-xs font-mono rounded-sm transition-all ${
              engineMode === 'kinematic'
                ? 'bg-hairline-2 text-heading shadow font-medium'
                : 'text-muted hover:text-heading'
            }`}
          >
            ⌖ Biomechanical HUD Engine
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-xs font-mono text-muted hover:text-heading transition-colors inline-flex items-center gap-1.5"
          >
            <span>{showCustomInput ? '✕ Close URL Input' : '+ Custom LottieFiles URL'}</span>
          </button>
          {engineMode === 'lottie' && (
            <span className="nums text-[11px] font-mono text-faint">
              FRAME {Math.round(lottieFrames.current)} / {Math.round(lottieFrames.total || 120)}
            </span>
          )}
        </div>
      </div>

      {showCustomInput && (
        <div className="mb-8 p-4 rounded-sm border border-hairline bg-charcoal/50 flex flex-col sm:flex-row gap-3 items-center">
          <span className="font-mono text-xs text-faint whitespace-nowrap">LottieFiles JSON URL:</span>
          <input
            type="url"
            placeholder="https://assets.lottiefiles.com/.../workout.json"
            value={customLottieUrl}
            onChange={(e) => setCustomLottieUrl(e.target.value)}
            className="w-full bg-[#080808] border border-hairline px-3 py-1.5 text-xs text-heading font-mono rounded-sm focus:outline-none focus:border-hairline-2"
          />
          {customLottieUrl && (
            <button
              type="button"
              onClick={() => setCustomLottieUrl('')}
              className="text-xs text-muted hover:text-heading whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      )}

      {/* Main Interactive Stage */}
      <div
        id={`${baseId}-panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${activeTab}`}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12"
      >
        {/* Left Column: Animation Player & Kinetic Controls */}
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="relative overflow-hidden rounded-sm border border-hairline bg-[#0A0A0A] shadow-2xl">
            {engineMode === 'lottie' ? (
              <LottieWorkoutPlayer
                animationPath={customLottieUrl || current.lottiePath}
                name={current.name}
                discipline={current.discipline}
                accentColor={current.accentColor}
                isPlaying={isPlaying}
                speed={playbackSpeed}
                onFrameUpdate={(c, t) => setLottieFrames({ current: c, total: t })}
                className="h-[360px] sm:h-[420px] md:h-[460px] w-full"
              />
            ) : (
              <WorkoutCanvas
                exercise={current}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                manualPhase={manualPhase}
                isScrubbing={isScrubbing}
              />
            )}

            {/* In-canvas Header Overlay */}
            <div className="pointer-events-none absolute left-4 bottom-14 flex items-center gap-2 rounded bg-ink/70 px-2.5 py-1 text-xs backdrop-blur-sm">
              <span
                className="h-2 w-2 rounded-full animate-pulse"
                style={{ backgroundColor: current.accentColor }}
                aria-hidden="true"
              />
              <span className="font-mono text-heading">{current.machine}</span>
            </div>
          </div>

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

            {/* Rep Phase Scrubber */}
            <div className="flex flex-1 items-center gap-2 min-w-[140px] max-w-[220px]">
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
              <div className="mb-2 text-[11px] font-mono uppercase tracking-wider text-faint">
                Primary Recruitment
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

              <div className="mb-2 mt-3 text-[11px] font-mono uppercase tracking-wider text-faint">
                Secondary Stabilizers
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
              Elite Execution Protocol
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
              <span aria-hidden="true">⚠</span> Biomechanical Fault to Avoid
            </div>
            <p className="t-small text-muted text-xs leading-relaxed">{current.fault}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

