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
  const tierUpper = (packageName || 'VIP').toUpperCase();

  return (
    <div
      className={`relative w-full aspect-[1.586] rounded-2xl overflow-hidden p-5 sm:p-6 text-white flex flex-col justify-between border border-[#D4AF37]/50 shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-all duration-300 group ${className}`}
      style={{
        background: 'radial-gradient(circle at 85% 15%, rgba(212, 175, 55, 0.18) 0%, rgba(24, 24, 27, 0.98) 45%, #080808 100%)',
      }}
    >
      {/* Background Decorative Guilloche / Waves */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-50,80 Q100,20 250,120 T500,60"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
        />
        <path
          d="M-50,110 Q120,40 270,140 T520,80"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
        />
        <path
          d="M-50,140 Q140,60 290,160 T540,100"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1"
        />
      </svg>

      {/* Top Row: Brand & Contactless Icon */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-lg border border-[#D4AF37]/60 overflow-hidden bg-black/90 p-0.5 shadow-inner flex items-center justify-center flex-shrink-0">
            <Image
              src="/img/vyomi-brand-logo.png"
              alt="Vyomi"
              width={26}
              height={30}
              className="object-contain"
              unoptimized
            />
          </div>
          <div>
            <span className="block text-xs font-black tracking-[0.25em] text-[#E5C158] uppercase leading-none">
              Vyomi
            </span>
            <span className="block text-[8px] font-bold tracking-[0.3em] text-[#94A3B8] uppercase mt-0.5 leading-none">
              Fitness Club
            </span>
          </div>
        </div>

        {/* Contactless Waves SVG & Tier Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-[#E5C158] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/15 uppercase font-black shadow-sm">
            {tierUpper} TIER
          </span>
          <svg className="w-4 h-4 text-[#D4AF37]/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8.5 16.5C9.5 15.5 10 14 10 12C10 10 9.5 8.5 8.5 7.5" strokeLinecap="round" />
            <path d="M12 19C13.5 17.5 14.5 15 14.5 12C14.5 9 13.5 6.5 12 5" strokeLinecap="round" />
            <path d="M15.5 21.5C17.5 19.5 19 16 19 12C19 8 17.5 4.5 15.5 2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Middle: Smart Chip & Hologram */}
      <div className="relative z-10 my-auto pt-1 flex items-center justify-between">
        {/* EMV Chip SVG */}
        <svg className="w-11 h-8 rounded border border-[#D4AF37]/50 shadow-sm" viewBox="0 0 44 32" fill="none">
          <rect width="44" height="32" rx="4" fill="url(#chipGrad)" />
          <defs>
            <linearGradient id="chipGrad" x1="0" y1="0" x2="44" y2="32">
              <stop offset="0%" stopColor="#FDE68A" />
              <stop offset="45%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#92400E" />
            </linearGradient>
          </defs>
          <path d="M0 16H14M30 16H44M14 0V32M30 0V32M14 10H30M14 22H30" stroke="#7A5610" strokeWidth="0.8" />
          <rect x="18" y="12" width="8" height="8" rx="1.5" stroke="#7A5610" strokeWidth="0.8" fill="none" />
        </svg>

        {/* Dynamic Tier Emblem */}
        <div className="opacity-95 filter drop-shadow-[0_2px_6px_rgba(212,175,55,0.4)]">
          {tierUpper.includes('FOUNDING') && <SilverTierBadge className="w-8 h-8" />}
          {tierUpper.includes('SILVER') && <SilverTierBadge className="w-8 h-8" />}
          {tierUpper.includes('VIP') && !tierUpper.includes('VVIP') && <GoldTierBadge className="w-8 h-8" />}
          {tierUpper.includes('VVIP') && <DiamondTierBadge className="w-8 h-8" />}
        </div>
      </div>

      {/* Bottom Row: Member Name, Unique Code, Plan & End Date */}
      <div className="relative z-10 pt-2.5 border-t border-white/15 space-y-1">
        <div className="flex items-end justify-between">
          <div className="flex-1 mr-2">
            <span className="block text-[9px] font-extrabold uppercase tracking-[0.25em] text-[#E5C158]">
              MEMBER NAME
            </span>
            <span className="block text-base sm:text-lg font-black tracking-wider text-white font-mono uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] truncate">
              {displayName}
            </span>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">
              UNIQUE MEMBER ID
            </span>
            <span className="block text-xs sm:text-sm font-mono font-black tracking-wider text-[#E5C158] drop-shadow-sm">
              {memberCode}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] pt-1 text-white/70 border-t border-white/5">
          <span className="font-semibold text-[#E2E8F0] tracking-wide">
            Plan: <strong className="text-white font-black">{tierUpper}</strong> (365 Days)
          </span>
          <span className="font-mono text-[#FDE68A] tracking-wider font-bold">
            VALID THRU: <strong className="text-[#FFB100]">{endDate || '1 YEAR FROM INTAKE'}</strong>
          </span>
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
