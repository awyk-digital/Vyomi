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
  memberCode = 'VYO · 2026',
  endDate,
  className = '',
}: VipCardProps) {
  const name = clientName.trim() ? clientName.trim().toUpperCase() : 'VALUED MEMBER';
  const tier = (packageName || 'VIP').toUpperCase().replace(/\s*MEMBERSHIP\s*/, '').trim() || 'VIP';
  // "VYO-2026-709736" or "VYO · 2026 · VIP" -> parts, last part highlighted in gold
  const idParts = memberCode.split(/\s*[-·]\s*/).filter(Boolean);
  const idHead = idParts.slice(0, -1).join(' · ');
  const idTail = idParts[idParts.length - 1] || '';

  return (
    <div
      className={`relative w-full aspect-[1.586] rounded-2xl overflow-hidden text-white shadow-[0_24px_48px_-20px_rgba(10,25,80,0.7),0_2px_6px_rgba(10,25,80,0.2)] ${className}`}
      style={{
        background:
          'radial-gradient(90% 70% at 20% 30%, #2348B8 0%, rgba(35,72,184,0) 60%),' +
          'radial-gradient(80% 90% at 85% 80%, #0B1E55 0%, rgba(11,30,85,0) 65%),' +
          'linear-gradient(140deg, #1B3A9C 0%, #13307F 45%, #0A1D57 100%)',
      }}
    >
      {/* Faint logo watermark on the right */}
      <Image
        src="/img/vyomi-brand-logo.png"
        alt=""
        aria-hidden="true"
        width={300}
        height={330}
        unoptimized
        className="pointer-events-none absolute right-[3%] top-1/2 -translate-y-[46%] h-[78%] w-auto opacity-[0.13] mix-blend-luminosity"
      />

      {/* Gold swooshes: top-left and bottom-right */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 w-full h-full" viewBox="0 0 400 252" preserveAspectRatio="none">
        <defs>
          <linearGradient id="vy-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F6DD8A" />
            <stop offset="50%" stopColor="#D4A52E" />
            <stop offset="100%" stopColor="#9C7417" />
          </linearGradient>
          <linearGradient id="vy-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#5B8CFF" stopOpacity="0" />
            <stop offset="60%" stopColor="#7FA6FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#5B8CFF" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 0 H150 C95 6 40 26 0 62 Z" fill="url(#vy-gold)" opacity="0.95" />
        <path d="M0 70 C45 30 110 10 190 4" stroke="url(#vy-gold)" strokeWidth="1.4" fill="none" opacity="0.8" />
        <path d="M400 252 H230 C300 246 360 222 400 186 Z" fill="url(#vy-gold)" opacity="0.95" />
        <path d="M400 176 C355 220 290 242 200 249" stroke="url(#vy-gold)" strokeWidth="1.4" fill="none" opacity="0.8" />
        <path d="M120 252 C220 236 320 210 400 150" stroke="url(#vy-glow)" strokeWidth="3" fill="none" />
      </svg>

      {/* Soft gloss */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.03) 38%, rgba(255,255,255,0) 39%)' }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15" />

      <div className="relative h-full flex flex-col justify-between p-[6%]">
        {/* Top: logo tile | wordmark ......... tier pill */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-[52px] h-[52px] sm:w-14 sm:h-14 rounded-xl bg-white shadow-md">
              <Image src="/img/vyomi-brand-logo.png" alt="Vyomi" width={48} height={52} unoptimized className="h-[86%] w-auto object-contain" />
            </span>
            <span className="w-px self-stretch bg-gradient-to-b from-transparent via-[#E8C25A] to-transparent" />
            <div className="leading-none">
              <span className="block text-base sm:text-lg font-semibold tracking-[0.26em]">VYOMI</span>
              <span className="block text-[9px] sm:text-[10px] font-medium tracking-[0.3em] text-white/75 mt-1.5">FITNESS CLUB</span>
            </div>
          </div>
          <span className="shrink-0 text-[10px] sm:text-[11px] font-semibold tracking-[0.2em] uppercase text-[#1A1405] px-3 py-1.5 rounded-full bg-gradient-to-b from-[#F6DD8A] to-[#C99A2E] shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_4px_10px_-4px_rgba(0,0,0,0.5)]">
            {tier}
          </span>
        </div>

        {/* Member name: first letter in gold, like the club's "V" */}
        <div>
          <span className="block text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.28em] text-white/70">Member</span>
          <span className="block text-lg sm:text-2xl font-semibold tracking-[0.04em] truncate mt-1 [text-shadow:0_2px_6px_rgba(0,0,0,0.3)]">
            <span className="text-[#F2CF6A]">{name.charAt(0)}</span>
            {name.slice(1)}
          </span>
        </div>

        <div>
          <div className="h-px w-full bg-gradient-to-r from-[#E8C25A] via-[#E8C25A]/50 to-transparent mb-3" />
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.26em] text-white/70">Member ID</span>
              <span className="block text-xs sm:text-sm tracking-wider mt-1 truncate">
                {idHead && <>{idHead} · </>}
                <span className="text-[#F2CF6A] font-semibold">{idTail}</span>
              </span>
            </div>
            <span className="w-px h-8 bg-[#E8C25A]/60 shrink-0" />
            <div className="text-right shrink-0">
              <span className="block text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.26em] text-white/70">Valid thru</span>
              <span className="block text-xs sm:text-sm font-semibold text-[#F2CF6A] mt-1">{endDate || `${durationDays} days`}</span>
            </div>
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
