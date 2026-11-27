import React from 'react';
import Image from 'next/image';

/**
 * Bespoke luxury SVG vectors and components for Vyomi Fitness Club.
 * Styled with metallic gradients, geometric precision, and quiet luxury aesthetics.
 */

// 1. Tier Emblems
export function SilverTierBadge({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="silverGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#E2E8F0" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="silverInner" x1="12" y1="12" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1E293B" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <polygon points="24,2 45,14 45,34 24,46 3,34 3,14" stroke="url(#silverGrad)" strokeWidth="1.5" fill="url(#silverInner)" />
      <polygon points="24,8 39,17 39,31 24,40 9,31 9,17" stroke="url(#silverGrad)" strokeWidth="0.8" strokeDasharray="2 2" fill="none" />
      <circle cx="24" cy="24" r="5" stroke="url(#silverGrad)" strokeWidth="1.2" fill="none" />
      <path d="M24 15V19M24 29V33M15 24H19M29 24H33" stroke="url(#silverGrad)" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

export function GoldTierBadge({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="goldGrad" x1="2" y1="2" x2="46" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="25%" stopColor="#F5D061" />
          <stop offset="60%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#8C6D23" />
        </linearGradient>
        <radialGradient id="goldGlow" cx="24" cy="24" r="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5D061" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#080808" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#goldGlow)" />
      <polygon points="24,3 30,17 45,17 33,26 38,41 24,32 10,41 15,26 3,17 18,17" stroke="url(#goldGrad)" strokeWidth="1.5" fill="rgba(212,175,55,0.08)" />
      <polygon points="24,10 28,19 38,19 30,25 33,35 24,29 15,35 18,25 10,19 20,19" stroke="url(#goldGrad)" strokeWidth="0.8" fill="none" />
      <circle cx="24" cy="24" r="3" fill="url(#goldGrad)" />
    </svg>
  );
}

export function PlatinumTierBadge({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="platGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#E2E8F0" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="21" stroke="url(#platGrad)" strokeWidth="1.5" fill="rgba(255,255,255,0.03)" />
      <circle cx="24" cy="24" r="17" stroke="url(#platGrad)" strokeWidth="0.75" strokeDasharray="3 3" fill="none" />
      <polygon points="24,6 40,24 24,42 8,24" stroke="url(#platGrad)" strokeWidth="1.2" fill="rgba(255,255,255,0.05)" />
      <polygon points="24,12 34,24 24,36 14,24" stroke="url(#platGrad)" strokeWidth="0.8" fill="none" />
      <circle cx="24" cy="24" r="2" fill="url(#platGrad)" />
    </svg>
  );
}

export function DiamondTierBadge({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="diaGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="30%" stopColor="#BAE6FD" />
          <stop offset="70%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
      </defs>
      <polygon points="14,4 34,4 46,16 24,44 2,16" stroke="url(#diaGrad)" strokeWidth="1.5" fill="rgba(212,175,55,0.08)" />
      <line x1="2" y1="16" x2="46" y2="16" stroke="url(#diaGrad)" strokeWidth="1" />
      <line x1="14" y1="4" x2="24" y2="44" stroke="url(#diaGrad)" strokeWidth="0.8" />
      <line x1="34" y1="4" x2="24" y2="44" stroke="url(#diaGrad)" strokeWidth="0.8" />
      <line x1="2" y1="16" x2="24" y2="4" stroke="url(#diaGrad)" strokeWidth="0.8" />
      <line x1="46" y1="16" x2="24" y2="4" stroke="url(#diaGrad)" strokeWidth="0.8" />
      <line x1="14" y1="4" x2="24" y2="16" stroke="url(#diaGrad)" strokeWidth="0.8" />
      <line x1="34" y1="4" x2="24" y2="16" stroke="url(#diaGrad)" strokeWidth="0.8" />
    </svg>
  );
}

// 2. Interactive VIP Digital Membership Card
interface VipCardProps {
  clientName: string;
  packageName: string;
  durationDays?: number;
  memberCode?: string;
  endDate?: string;
  className?: string;
}

export function VipMembershipCard({
  clientName,
  packageName,
  durationDays = 365,
  memberCode = 'VYO · 2026 · VIP',
  endDate,
  className = '',
}: VipCardProps) {
  const displayName = clientName.trim() ? clientName.toUpperCase() : 'VALUED MEMBER';
  const tierUpper = (packageName || 'VIP').toUpperCase().replace(/\s*MEMBERSHIP\s*/, '').trim() || 'VIP';

  /* Glossy sapphire card in the logo's blue + gold. The gloss is static
     light (gradients), never an animated sweep or glow. */
  return (
    <div
      className={`relative w-full aspect-[1.586] rounded-2xl overflow-hidden p-5 sm:p-6 text-white flex flex-col justify-between shadow-[0_24px_48px_-20px_rgba(15,35,95,0.65),0_2px_6px_rgba(15,35,95,0.15)] ${className}`}
      style={{
        background:
          'radial-gradient(120% 90% at 0% 0%, #3A63D8 0%, rgba(58,99,216,0) 55%),' +
          'radial-gradient(90% 80% at 100% 100%, #0A1B4D 0%, rgba(10,27,77,0) 60%),' +
          'linear-gradient(135deg, #2347B5 0%, #1A3690 45%, #0F2462 100%)',
      }}
    >
      {/* Gloss: soft diagonal highlight across the upper half */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(155deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 32%, rgba(255,255,255,0) 33%, rgba(255,255,255,0) 100%)',
        }}
      />
      {/* Fine engraved lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: 'repeating-linear-gradient(115deg, #fff 0 1px, transparent 1px 7px)' }}
      />
      {/* Edge light */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />

      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/95 shadow-sm">
            <Image
              src="/img/vyomi-brand-logo.png"
              alt="Vyomi"
              width={28}
              height={32}
              className="h-7 w-auto object-contain"
              unoptimized
            />
          </span>
          <div className="leading-none">
            <span className="block text-[13px] font-semibold tracking-[0.28em] text-white">VYOMI</span>
            <span className="block text-[9px] font-medium tracking-[0.32em] text-white/60 mt-1">FITNESS CLUB</span>
          </div>
        </div>
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#1A1405] px-2.5 py-1 rounded-full bg-gradient-to-b from-[#F3D77A] to-[#C99A2E] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          {tierUpper}
        </span>
      </div>

      <div className="relative space-y-3">
        <div>
          <span className="block text-[9px] font-medium uppercase tracking-[0.24em] text-white/60">Member</span>
          <span className="block text-base sm:text-xl font-semibold tracking-[0.05em] text-white uppercase truncate mt-0.5 [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]">
            {displayName}
          </span>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-[#F3D77A]/70 via-white/20 to-transparent" />
        <div className="flex items-end justify-between gap-3 text-[11px]">
          <div>
            <span className="block text-[9px] font-medium uppercase tracking-[0.24em] text-white/60">Member ID</span>
            <span className="block font-mono tracking-wider text-white mt-0.5">{memberCode}</span>
          </div>
          <div className="text-right">
            <span className="block text-[9px] font-medium uppercase tracking-[0.24em] text-white/60">Valid thru</span>
            <span className="block font-mono tracking-wider text-[#F3D77A] mt-0.5">
              {endDate || `${durationDays} days`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Step Navigation Icons
export function StepTierIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 19h20M5 19l2-12 5 7 5-7 2 12" />
      <circle cx="12" cy="5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function StepIdIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2.5" />
      <path d="M15 8h2M15 12h2M7 16h10" />
    </svg>
  );
}

export function StepPulseIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

export function StepPaymentIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="6" cy="15" r="1" fill="currentColor" />
    </svg>
  );
}

// 4. Security & Payment Badges
export function SecurityLockBadge({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      <circle cx="12" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function UpiIconSvg({ className = 'w-10 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 4L22 12L14 20" stroke="#00B074" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 4L30 12L22 20" stroke="#0070BA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="32" y="16" fill="#F5F5F2" fontSize="9" fontWeight="bold" fontFamily="sans-serif">UPI</text>
    </svg>
  );
}

export function PanattaEmblemSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" stroke="#8C2230" strokeWidth="1.5" />
      <path d="M8 12L11 15L16 9" stroke="#8C2230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
