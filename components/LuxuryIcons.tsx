import React from 'react';

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
  durationDays: number;
  memberCode?: string;
  className?: string;
}

export function VipMembershipCard({
  clientName,
  packageName,
  durationDays,
  memberCode = 'VYO · 2026 · VIP',
  className = '',
}: VipCardProps) {
  const displayName = clientName.trim() ? clientName.toUpperCase() : 'VALUED CLIENT';
  const tierUpper = (packageName || 'GOLD').toUpperCase();

  return (
    <div
      className={`relative w-full aspect-[1.586] rounded-xl overflow-hidden p-5 sm:p-6 text-white flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 transition-all duration-500 group ${className}`}
      style={{
        background: 'linear-gradient(135deg, #18181B 0%, #0F0F11 50%, #080808 100%)',
      }}
    >
      {/* Background Decorative Guilloche / Waves */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="cardGlow" cx="80%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#080808" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#cardGlow)" />
        <path
          d="M-50,80 Q100,20 250,120 T500,60"
          fill="none"
          stroke="rgba(212,175,55,0.3)"
          strokeWidth="0.8"
        />
        <path
          d="M-50,110 Q120,40 270,140 T520,80"
          fill="none"
          stroke="rgba(212,175,55,0.2)"
          strokeWidth="0.8"
        />
        <path
          d="M-50,140 Q140,60 290,160 T540,100"
          fill="none"
          stroke="rgba(212,175,55,0.15)"
          strokeWidth="0.8"
        />
      </svg>

      {/* Top Row: Brand & Contactless Icon */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded border border-[#D4AF37]/40 flex items-center justify-center bg-black/60">
            <span className="font-serif italic font-bold text-xs text-[#D4AF37]">V</span>
          </div>
          <div>
            <span className="block text-[0.625rem] font-bold tracking-[0.25em] text-[#D4AF37] uppercase">
              Vyomi
            </span>
            <span className="block text-[0.5rem] tracking-[0.3em] text-white/50 uppercase">
              Fitness Club
            </span>
          </div>
        </div>

        {/* Contactless Waves SVG */}
        <div className="flex items-center gap-2">
          <span className="text-[0.5625rem] font-mono tracking-widest text-[#D4AF37]/90 px-2 py-0.5 rounded border border-[#D4AF37]/30 bg-[#D4AF37]/10 uppercase">
            {tierUpper} TIER
          </span>
          <svg className="w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8.5 16.5C9.5 15.5 10 14 10 12C10 10 9.5 8.5 8.5 7.5" strokeLinecap="round" />
            <path d="M12 19C13.5 17.5 14.5 15 14.5 12C14.5 9 13.5 6.5 12 5" strokeLinecap="round" />
            <path d="M15.5 21.5C17.5 19.5 19 16 19 12C19 8 17.5 4.5 15.5 2.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Middle: Smart Chip & Hologram */}
      <div className="relative z-10 my-auto pt-3 flex items-center justify-between">
        {/* EMV Chip SVG */}
        <svg className="w-11 h-8 rounded border border-[#D4AF37]/30" viewBox="0 0 44 32" fill="none">
          <rect width="44" height="32" rx="4" fill="url(#chipGrad)" />
          <defs>
            <linearGradient id="chipGrad" x1="0" y1="0" x2="44" y2="32">
              <stop offset="0%" stopColor="#F5D061" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#AA822A" />
            </linearGradient>
          </defs>
          <path d="M0 16H14M30 16H44M14 0V32M30 0V32M14 10H30M14 22H30" stroke="#7A5610" strokeWidth="0.8" />
          <rect x="18" y="12" width="8" height="8" rx="1.5" stroke="#7A5610" strokeWidth="0.8" fill="none" />
        </svg>

        {/* Dynamic Tier Emblem */}
        <div className="opacity-80">
          {tierUpper.includes('SILVER') && <SilverTierBadge className="w-8 h-8" />}
          {tierUpper.includes('GOLD') && <GoldTierBadge className="w-8 h-8" />}
          {tierUpper.includes('PLATINUM') && <PlatinumTierBadge className="w-8 h-8" />}
          {tierUpper.includes('DIAMOND') && <DiamondTierBadge className="w-8 h-8" />}
        </div>
      </div>

      {/* Bottom Row: Member Name, Code & Duration */}
      <div className="relative z-10 flex items-end justify-between pt-3 border-t border-white/10">
        <div>
          <span className="block text-[0.5625rem] uppercase tracking-widest text-white/40 mb-0.5">
            Member Name
          </span>
          <span className="block text-xs sm:text-sm font-semibold tracking-wider text-[#F5F5F2] font-mono truncate max-w-[190px]">
            {displayName}
          </span>
        </div>

        <div className="text-right">
          <span className="block text-[0.5625rem] uppercase tracking-widest text-white/40 mb-0.5">
            Member ID
          </span>
          <span className="block text-xs font-mono font-semibold tracking-widest text-[#D4AF37]">
            {memberCode}
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
