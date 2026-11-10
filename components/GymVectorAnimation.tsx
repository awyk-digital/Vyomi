'use client';

import React, { useEffect, useRef, useState } from 'react';

export interface GymVectorAnimationProps {
  exerciseId: string;
  name: string;
  accentColor: string;
  isPlaying: boolean;
  speed: number;
  manualPhase?: number;
  isScrubbing?: boolean;
  className?: string;
}

export default function GymVectorAnimation({
  exerciseId,
  name,
  accentColor = '#8C2230',
  isPlaying,
  speed,
  manualPhase = 0,
  isScrubbing = false,
  className = '',
}: GymVectorAnimationProps) {
  const [phase, setPhase] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const currentPhaseRef = useRef<number>(0);

  // Sync manual scrub phase
  useEffect(() => {
    if (isScrubbing) {
      currentPhaseRef.current = manualPhase;
      setPhase(manualPhase);
    }
  }, [isScrubbing, manualPhase]);

  // Main 60 FPS animation loop
  useEffect(() => {
    if (isScrubbing) return;

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (isPlaying) {
        // Standard rep duration: 3.2 seconds at 1.0x speed
        const cycleDuration = 3.2 / speed;
        currentPhaseRef.current = (currentPhaseRef.current + dt / cycleDuration) % 1;
        setPhase(currentPhaseRef.current);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, speed, isScrubbing]);

  // Smooth sinusoidal harmonic cycle: 0 -> 1 -> 0
  const cycle = (1 - Math.cos(phase * Math.PI * 2)) / 2;

  // Phase state descriptor
  const repPhaseText =
    phase < 0.45 ? 'ECCENTRIC DESCENT' : phase < 0.55 ? 'INFLECTION POINT' : 'CONCENTRIC DRIVE';

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-sm bg-[#080808] border border-hairline select-none ${className}`}
    >
      {/* Ambient Luxury Atmospheric Glow */}
      <div
        className="pointer-events-none absolute h-72 w-72 rounded-full opacity-20 blur-3xl transition-colors duration-700"
        style={{ backgroundColor: accentColor }}
        aria-hidden="true"
      />

      {/* SVG Canvas Stage */}
      <svg
        viewBox="0 0 500 440"
        className="relative z-10 h-full w-full max-h-[460px] max-w-[500px]"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`${name} vector animation`}
      >
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={accentColor} floodOpacity="0.6" />
          </filter>
          <linearGradient id="muscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8C2230" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#D0715E" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="barbellGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B08D57" />
            <stop offset="50%" stopColor="#E2C997" />
            <stop offset="100%" stopColor="#B08D57" />
          </linearGradient>
          <linearGradient id="ironPlate" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3A3A3A" />
            <stop offset="50%" stopColor="#1E1E1E" />
            <stop offset="100%" stopColor="#111111" />
          </linearGradient>
        </defs>

        {/* Minimalist Floor Grid */}
        <line x1="50" y1="380" x2="450" y2="380" stroke="rgba(245,245,242,0.18)" strokeWidth="1.5" />
        {Array.from({ length: 9 }).map((_, i) => {
          const x = 70 + i * 45;
          return (
            <line
              key={i}
              x1={x}
              y1="380"
              x2={x}
              y2="386"
              stroke="rgba(245,245,242,0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Dynamic Exercise Rendering Switch */}
        {renderExercise(exerciseId, cycle, phase)}

        {/* Subtle Watermark HUD */}
        <text
          x="30"
          y="35"
          fill="rgba(245,245,242,0.3)"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="0.18em"
        >
          KINEMATIC BLUEPRINT // {repPhaseText}
        </text>
        <text
          x="470"
          y="35"
          textAnchor="end"
          fill="rgba(245,245,242,0.3)"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="0.18em"
        >
          {Math.round(phase * 100)}% REP
        </text>
      </svg>
    </div>
  );
}

function renderExercise(id: string, cycle: number, phase: number) {
  switch (id) {
    case 'barbell-squat':
      return renderBarbellSquat(cycle);
    case 'deadlift':
      return renderDeadlift(cycle);
    case 'bench-press':
      return renderBenchPress(cycle);
    case 'pull-up':
      return renderPullUp(cycle);
    case 'overhead-press':
      return renderOverheadPress(cycle);
    case 'bent-over-row':
      return renderBentOverRow(cycle);
    case 'lunge':
      return renderLunge(cycle);
    case 'plank':
      return renderPlank(cycle, phase);
    default:
      return renderBarbellSquat(cycle);
  }
}

function renderBarbellSquat(c: number) {
  const hipX = 230 - c * 45;
  const hipY = 220 + c * 82;
  const kneeX = 250 + c * 24;
  const kneeY = 300 + c * 8;
  const ankleX = 240;
  const ankleY = 370;
  const shoulderX = 240 - c * 28;
  const shoulderY = 135 + c * 98;
  const headX = shoulderX + 8;
  const headY = shoulderY - 24;
  const barX = shoulderX;
  const barY = shoulderY - 2;
  const elbowX = shoulderX - 16;
  const elbowY = shoulderY + 28;

  return (
    <g>
      <line x1="240" y1="90" x2="240" y2="380" stroke="#B08D57" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
      <text x="248" y="105" fill="#B08D57" fontSize="9" fontFamily="monospace" opacity="0.6">
        BAR PATH // MIDFOOT
      </text>
      <path
        d={`M ${hipX} ${hipY} Q ${hipX + 15} ${(hipY + kneeY) / 2} ${kneeX} ${kneeY} L ${kneeX - 12} ${kneeY - 4} Q ${hipX - 8} ${(hipY + kneeY) / 2} ${hipX} ${hipY}`}
        fill="url(#muscleGrad)"
        filter="url(#glow)"
        opacity={0.35 + c * 0.55}
      />
      <circle cx={hipX - 10} cy={hipY + 5} r={14 + c * 4} fill="#8C2230" opacity={0.3 + c * 0.4} filter="url(#glow)" />
      <path d={`M ${ankleX - 12} ${ankleY + 10} L ${ankleX + 28} ${ankleY + 10}`} stroke="#F5F5F2" strokeWidth="4" strokeLinecap="round" />
      <line x1={ankleX} y1={ankleY} x2={kneeX} y2={kneeY} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <line x1={kneeX} y1={kneeY} x2={hipX} y2={hipY} stroke="#F5F5F2" strokeWidth="5.5" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shoulderX} y2={shoulderY} stroke="#F5F5F2" strokeWidth="6" strokeLinecap="round" />
      <circle cx={headX} cy={headY} r="14" fill="#F5F5F2" />
      <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#E5E5E0" strokeWidth="3.5" strokeLinecap="round" />
      <line x1={elbowX} y1={elbowY} x2={barX + 6} y2={barY + 6} stroke="#E5E5E0" strokeWidth="3" strokeLinecap="round" />
      <rect x={barX - 70} y={barY - 3} width="140" height="6" fill="url(#barbellGold)" rx="2" />
      <rect x={barX + 45} y={barY - 38} width="16" height="76" fill="url(#ironPlate)" stroke="#B08D57" strokeWidth="1.5" rx="3" />
      <rect x={barX + 38} y={barY - 30} width="6" height="60" fill="url(#ironPlate)" stroke="#B08D57" strokeWidth="1" rx="2" />
      {c > 0.7 && (
        <g opacity={c}>
          <text x={kneeX + 14} y={kneeY - 10} fill="#D6F55B" fontSize="10" fontFamily="monospace">
            85° PARALLEL DEPTH
          </text>
          <circle cx={kneeX} cy={kneeY} r="18" fill="none" stroke="#D6F55B" strokeWidth="1" strokeDasharray="2 2" />
        </g>
      )}
    </g>
  );
}

function renderDeadlift(c: number) {
  const barY = 340 - c * 115;
  const barX = 265 - c * 15;
  const ankleX = 235;
  const ankleY = 370;
  const kneeX = 252 - c * 16;
  const kneeY = 305 - c * 15;
  const hipX = 180 + c * 52;
  const hipY = 245 - c * 40;
  const shoulderX = 265 - c * 28;
  const shoulderY = 165 - c * 50;
  const headX = shoulderX + 10;
  const headY = shoulderY - 22;

  return (
    <g>
      <line x1="265" y1="200" x2="265" y2="380" stroke="#B08D57" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="url(#muscleGrad)" strokeWidth="14" strokeLinecap="round" opacity={0.4 + (1 - c) * 0.45} filter="url(#glow)" />
      <circle cx={hipX} cy={hipY} r={16} fill="#8C2230" opacity={0.35 + c * 0.35} filter="url(#glow)" />
      <path d={`M ${ankleX - 10} ${ankleY + 10} L ${ankleX + 28} ${ankleY + 10}`} stroke="#F5F5F2" strokeWidth="4" strokeLinecap="round" />
      <line x1={ankleX} y1={ankleY} x2={kneeX} y2={kneeY} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <line x1={kneeX} y1={kneeY} x2={hipX} y2={hipY} stroke="#F5F5F2" strokeWidth="5.5" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shoulderX} y2={shoulderY} stroke="#F5F5F2" strokeWidth="6" strokeLinecap="round" />
      <circle cx={headX} cy={headY} r="14" fill="#F5F5F2" />
      <line x1={shoulderX} y1={shoulderY} x2={barX} y2={barY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <rect x={barX - 60} y={barY - 3} width="120" height="6" fill="url(#barbellGold)" rx="2" />
      <rect x={barX + 35} y={barY - 40} width="18" height="80" fill="url(#ironPlate)" stroke="#B08D57" strokeWidth="1.5" rx="3" />
      <circle cx={barX + 44} cy={barY} r="7" fill="#B08D57" />
      {c > 0.85 && (
        <text x="285" y={shoulderY + 10} fill="#D6F55B" fontSize="10" fontFamily="monospace">
          ✓ ERECT LOCKOUT
        </text>
      )}
    </g>
  );
}

function renderBenchPress(c: number) {
  const benchPadY = 280;
  const barX = 205 + c * 26;
  const barY = 145 + c * 96;
  const shoulderX = 200;
  const shoulderY = benchPadY - 10;
  const hipX = 280;
  const hipY = benchPadY - 10;
  const kneeX = 330;
  const kneeY = benchPadY + 15;
  const footX = 345;
  const footY = 380;
  const elbowX = shoulderX + c * 12;
  const elbowY = shoulderY + c * 25;

  return (
    <g>
      <rect x="110" y={benchPadY} width="220" height="14" fill="#1A1A1A" stroke="rgba(245,245,242,0.2)" strokeWidth="1" rx="2" />
      <line x1="140" y1={benchPadY + 14} x2="140" y2="380" stroke="rgba(245,245,242,0.25)" strokeWidth="3" />
      <line x1="290" y1={benchPadY + 14} x2="290" y2="380" stroke="rgba(245,245,242,0.25)" strokeWidth="3" />
      <line x1="150" y1="130" x2="150" y2={benchPadY} stroke="#B08D57" strokeWidth="2.5" opacity="0.4" />
      <circle cx={shoulderX + 28} cy={shoulderY - 5} r={16 + c * 6} fill="url(#muscleGrad)" opacity={0.3 + c * 0.55} filter="url(#glow)" />
      <circle cx="150" cy={benchPadY - 12} r="13" fill="#F5F5F2" />
      <line x1={shoulderX - 10} y1={shoulderY} x2={hipX} y2={hipY} stroke="#F5F5F2" strokeWidth="7" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={kneeX} y2={kneeY} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <line x1={kneeX} y1={kneeY} x2={footX} y2={footY} stroke="#F5F5F2" strokeWidth="4.5" strokeLinecap="round" />
      <line x1={footX - 10} y1={footY} x2={footX + 15} y2={footY} stroke="#F5F5F2" strokeWidth="4" strokeLinecap="round" />
      <line x1={shoulderX} y1={shoulderY - 8} x2={elbowX} y2={elbowY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <line x1={elbowX} y1={elbowY} x2={barX} y2={barY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <rect x={barX - 70} y={barY - 3} width="140" height="6" fill="url(#barbellGold)" rx="2" />
      <rect x={barX + 45} y={barY - 38} width="16" height="76" fill="url(#ironPlate)" stroke="#B08D57" strokeWidth="1.5" rx="3" />
      <path d="M 205 145 Q 212 195 231 241" fill="none" stroke="#B08D57" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <text x="240" y="170" fill="#B08D57" fontSize="9" fontFamily="monospace" opacity="0.6">
        J-CURVE ARC
      </text>
    </g>
  );
}

function renderPullUp(c: number) {
  const barY = 70;
  const shoulderY = 175 - c * 82;
  const shoulderX = 250;
  const hipY = 265 - c * 82;
  const hipX = 250;
  const kneeY = 325 - c * 80;
  const kneeX = 245 + c * 8;
  const footY = 370 - c * 75;
  const footX = 240 + c * 12;
  const leftElbowX = 210 - c * 15;
  const leftElbowY = 120 + c * 10;
  const rightElbowX = 290 + c * 15;
  const rightElbowY = 120 + c * 10;

  return (
    <g>
      <line x1="80" y1={barY} x2="420" y2={barY} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <line x1="120" y1="30" x2="120" y2="380" stroke="rgba(245,245,242,0.2)" strokeWidth="3" />
      <line x1="380" y1="30" x2="380" y2="380" stroke="rgba(245,245,242,0.2)" strokeWidth="3" />
      <rect x="195" y={barY - 3} width="30" height="6" fill="#B08D57" rx="1" />
      <rect x="275" y={barY - 3} width="30" height="6" fill="#B08D57" rx="1" />
      <path
        d={`M ${shoulderX - 25} ${shoulderY} Q ${shoulderX - 35 - c * 12} ${shoulderY + 35} ${hipX - 10} ${hipY - 20} L ${hipX + 10} ${hipY - 20} Q ${shoulderX + 35 + c * 12} ${shoulderY + 35} ${shoulderX + 25} ${shoulderY} Z`}
        fill="url(#muscleGrad)"
        filter="url(#glow)"
        opacity={0.35 + c * 0.55}
      />
      <circle cx={shoulderX} cy={shoulderY - 22} r="14" fill="#F5F5F2" />
      <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke="#F5F5F2" strokeWidth="6.5" strokeLinecap="round" />
      <line x1={shoulderX - 18} y1={shoulderY + 4} x2={leftElbowX} y2={leftElbowY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <line x1={leftElbowX} y1={leftElbowY} x2="210" y2={barY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <line x1={shoulderX + 18} y1={shoulderY + 4} x2={rightElbowX} y2={rightElbowY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <line x1={rightElbowX} y1={rightElbowY} x2="290" y2={barY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <line x1={hipX - 4} y1={hipY} x2={kneeX - 4} y2={kneeY} stroke="#F5F5F2" strokeWidth="4.5" strokeLinecap="round" />
      <line x1={kneeX - 4} y1={kneeY} x2={footX - 4} y2={footY} stroke="#F5F5F2" strokeWidth="4" strokeLinecap="round" />
      {c > 0.85 && (
        <g>
          <line x1="200" y1={barY - 8} x2="300" y2={barY - 8} stroke="#D6F55B" strokeWidth="1" strokeDasharray="3 3" />
          <text x="310" y={barY - 5} fill="#D6F55B" fontSize="10" fontFamily="monospace">
            ✓ CHIN OVER BAR
          </text>
        </g>
      )}
    </g>
  );
}

function renderOverheadPress(c: number) {
  const barY = 145 - c * 105;
  const barX = 250;
  const ankleX = 240;
  const ankleY = 370;
  const kneeX = 240;
  const kneeY = 295;
  const hipX = 240;
  const hipY = 215;
  const shoulderX = 240;
  const shoulderY = 140;
  const headX = c > 0.15 && c < 0.65 ? 232 : 240;
  const headY = shoulderY - 24;
  const elbowX = 248 - c * 5;
  const elbowY = 175 - c * 60;

  return (
    <g>
      <line x1="250" y1="30" x2="250" y2="380" stroke="#B08D57" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      <circle cx={shoulderX} cy={shoulderY} r={18 + c * 4} fill="url(#muscleGrad)" opacity={0.35 + c * 0.55} filter="url(#glow)" />
      <path d={`M ${ankleX - 10} ${ankleY + 10} L ${ankleX + 25} ${ankleY + 10}`} stroke="#F5F5F2" strokeWidth="4" strokeLinecap="round" />
      <line x1={ankleX} y1={ankleY} x2={kneeX} y2={kneeY} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <line x1={kneeX} y1={kneeY} x2={hipX} y2={hipY} stroke="#F5F5F2" strokeWidth="5.5" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shoulderX} y2={shoulderY} stroke="#F5F5F2" strokeWidth="6" strokeLinecap="round" />
      <circle cx={headX} cy={headY} r="14" fill="#F5F5F2" />
      <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <line x1={elbowX} y1={elbowY} x2={barX} y2={barY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <rect x={barX - 70} y={barY - 3} width="140" height="6" fill="url(#barbellGold)" rx="2" />
      <rect x={barX + 45} y={barY - 35} width="15" height="70" fill="url(#ironPlate)" stroke="#B08D57" strokeWidth="1.5" rx="3" />
      {c > 0.85 && (
        <text x="270" y={barY + 5} fill="#D6F55B" fontSize="10" fontFamily="monospace">
          ✓ FULL OVERHEAD LOCKOUT
        </text>
      )}
    </g>
  );
}

function renderBentOverRow(c: number) {
  const hipX = 180;
  const hipY = 240;
  const kneeX = 225;
  const kneeY = 310;
  const ankleX = 215;
  const ankleY = 370;
  const shoulderX = 280;
  const shoulderY = 175;
  const headX = shoulderX + 16;
  const headY = shoulderY - 14;
  const barX = 270 - c * 25;
  const barY = 285 - c * 75;
  const elbowX = 270 - c * 75;
  const elbowY = 230 - c * 60;

  return (
    <g>
      <line x1="150" y1="260" x2="310" y2="150" stroke="#B08D57" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      <text x="140" y="275" fill="#B08D57" fontSize="9" fontFamily="monospace" opacity="0.6">
        45° TORSO PLANE
      </text>
      <line x1={hipX + 25} y1={hipY - 20} x2={shoulderX - 10} y2={shoulderY + 10} stroke="url(#muscleGrad)" strokeWidth="14" strokeLinecap="round" opacity={0.35 + c * 0.55} filter="url(#glow)" />
      <path d={`M ${ankleX - 10} ${ankleY + 10} L ${ankleX + 25} ${ankleY + 10}`} stroke="#F5F5F2" strokeWidth="4" strokeLinecap="round" />
      <line x1={ankleX} y1={ankleY} x2={kneeX} y2={kneeY} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <line x1={kneeX} y1={kneeY} x2={hipX} y2={hipY} stroke="#F5F5F2" strokeWidth="5.5" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shoulderX} y2={shoulderY} stroke="#F5F5F2" strokeWidth="6" strokeLinecap="round" />
      <circle cx={headX} cy={headY} r="14" fill="#F5F5F2" />
      <line x1={shoulderX} y1={shoulderY} x2={elbowX} y2={elbowY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <line x1={elbowX} y1={elbowY} x2={barX} y2={barY} stroke="#E5E5E0" strokeWidth="4" strokeLinecap="round" />
      <rect x={barX - 60} y={barY - 3} width="120" height="6" fill="url(#barbellGold)" rx="2" />
      <rect x={barX + 35} y={barY - 35} width="16" height="70" fill="url(#ironPlate)" stroke="#B08D57" strokeWidth="1.5" rx="3" />
      {c > 0.85 && (
        <text x={elbowX - 25} y={elbowY - 10} fill="#D6F55B" fontSize="10" fontFamily="monospace">
          ✓ SCAPULAR SQUEEZE
        </text>
      )}
    </g>
  );
}

function renderLunge(c: number) {
  const hipX = 230;
  const hipY = 220 + c * 70;
  const shoulderX = 230;
  const shoulderY = 135 + c * 70;
  const headX = shoulderX + 4;
  const headY = shoulderY - 24;
  const barX = shoulderX;
  const barY = shoulderY - 2;
  const frontAnkleX = 240 + c * 65;
  const frontAnkleY = 370;
  const frontKneeX = 240 + c * 65;
  const frontKneeY = 295 + c * 10;
  const rearAnkleX = 240 - c * 80;
  const rearAnkleY = 370;
  const rearKneeX = 240 - c * 35;
  const rearKneeY = 295 + c * 65;

  return (
    <g>
      <line x1={hipX} y1={hipY} x2={frontKneeX} y2={frontKneeY} stroke="url(#muscleGrad)" strokeWidth="14" strokeLinecap="round" opacity={0.35 + c * 0.55} filter="url(#glow)" />
      <line x1={hipX} y1={hipY} x2={rearKneeX} y2={rearKneeY} stroke="#D5D5D0" strokeWidth="4.5" strokeLinecap="round" opacity="0.8" />
      <line x1={rearKneeX} y1={rearKneeY} x2={rearAnkleX} y2={rearAnkleY} stroke="#D5D5D0" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <path d={`M ${rearAnkleX - 8} ${rearAnkleY + 10} L ${rearAnkleX + 16} ${rearAnkleY + 10}`} stroke="#D5D5D0" strokeWidth="3" opacity="0.8" />
      <path d={`M ${frontAnkleX - 10} ${frontAnkleY + 10} L ${frontAnkleX + 25} ${frontAnkleY + 10}`} stroke="#F5F5F2" strokeWidth="4" strokeLinecap="round" />
      <line x1={frontAnkleX} y1={frontAnkleY} x2={frontKneeX} y2={frontKneeY} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <line x1={frontKneeX} y1={frontKneeY} x2={hipX} y2={hipY} stroke="#F5F5F2" strokeWidth="5.5" strokeLinecap="round" />
      <line x1={hipX} y1={hipY} x2={shoulderX} y2={shoulderY} stroke="#F5F5F2" strokeWidth="6" strokeLinecap="round" />
      <circle cx={headX} cy={headY} r="14" fill="#F5F5F2" />
      <rect x={barX - 70} y={barY - 3} width="140" height="6" fill="url(#barbellGold)" rx="2" />
      <rect x={barX + 45} y={barY - 35} width="15" height="70" fill="url(#ironPlate)" stroke="#B08D57" strokeWidth="1.5" rx="3" />
      {c > 0.8 && (
        <text x={frontKneeX + 14} y={frontKneeY - 10} fill="#D6F55B" fontSize="10" fontFamily="monospace">
          90° KNEE STACK
        </text>
      )}
    </g>
  );
}

function renderPlank(c: number, phase: number) {
  const matY = 370;
  const elbowX = 145;
  const elbowY = matY;
  const shoulderX = 145;
  const shoulderY = 270;
  const headX = 115;
  const headY = 260;
  const hipX = 265;
  const hipY = 278;
  const kneeX = 350;
  const kneeY = 285;
  const ankleX = 415;
  const ankleY = 295;
  const breath = Math.sin(phase * Math.PI * 4) * 2;

  return (
    <g>
      <rect x="70" y={matY} width="360" height="10" fill="#141414" stroke="rgba(245,245,242,0.2)" strokeWidth="1" rx="2" />
      <line
        x1={headX}
        y1={headY + 10}
        x2={ankleX}
        y2={ankleY + 10}
        stroke="#D6F55B"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.4"
      />
      <text x="210" y="240" fill="#D6F55B" fontSize="10" fontFamily="monospace">
        ✓ 180° RIGID ANTI-EXTENSION
      </text>
      <line
        x1={shoulderX + 30}
        y1={shoulderY + 12 + breath}
        x2={hipX - 10}
        y2={hipY + 8 + breath}
        stroke="url(#muscleGrad)"
        strokeWidth="16"
        strokeLinecap="round"
        opacity={0.5 + Math.sin(phase * Math.PI * 2) * 0.25}
        filter="url(#glow)"
      />
      <path d={`M ${elbowX} ${elbowY} L ${elbowX + 45} ${elbowY}`} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <line x1={elbowX} y1={elbowY} x2={shoulderX} y2={shoulderY} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <circle cx={headX} cy={headY} r="14" fill="#F5F5F2" />
      <line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY + breath} stroke="#F5F5F2" strokeWidth="6.5" strokeLinecap="round" />
      <line x1={hipX} y1={hipY + breath} x2={kneeX} y2={kneeY} stroke="#F5F5F2" strokeWidth="5.5" strokeLinecap="round" />
      <line x1={kneeX} y1={kneeY} x2={ankleX} y2={ankleY} stroke="#F5F5F2" strokeWidth="5" strokeLinecap="round" />
      <line x1={ankleX} y1={ankleY} x2={ankleX} y2={matY} stroke="#F5F5F2" strokeWidth="4.5" strokeLinecap="round" />
    </g>
  );
}
