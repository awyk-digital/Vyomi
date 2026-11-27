'use client';

import { useEffect, useRef } from 'react';

export function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100);
}

export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

export function paymentLabel(method?: string | null): string {
  const m = (method || '').toUpperCase();
  if (m === 'CASH' || m === 'OFFLINE' || m === 'POS') return 'Cash';
  if (m === 'REFUND') return 'Refund';
  return 'UPI';
}

type Tone = 'active' | 'due' | 'cancelled' | 'neutral';
const TONES: Record<Tone, string> = {
  active: 'bg-[#EEF2FF] text-[#1E3A8A] ring-[#C7D4F5]',
  due: 'bg-amber-50 text-amber-800 ring-amber-200',
  cancelled: 'bg-red-50 text-red-700 ring-red-200',
  neutral: 'bg-slate-50 text-slate-600 ring-slate-200',
};
const DOTS: Record<Tone, string> = {
  active: 'bg-[#1E3A8A]',
  due: 'bg-amber-500',
  cancelled: 'bg-red-500',
  neutral: 'bg-slate-400',
};

/** One consistent status badge for registrations and payments. */
export function statusInfo(status?: string | null): { label: string; tone: Tone } {
  const s = (status || '').toUpperCase();
  if (s === 'CONFIRMED' || s === 'PAID') return { label: 'Paid', tone: 'active' };
  if (s === 'PENDING_CASH_COLLECTION' || s === 'PENDING_COLLECTION' || s === 'PENDING' || s === 'CREATED')
    return { label: 'Cash due', tone: 'due' };
  if (s === 'CANCELLED' || s === 'REFUNDED' || s === 'PARTIALLY_REFUNDED') return { label: 'Cancelled', tone: 'cancelled' };
  if (s === 'EXPIRED') return { label: 'Expired', tone: 'neutral' };
  if (s === 'FAILED') return { label: 'Failed', tone: 'cancelled' };
  return { label: s ? s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ') : '—', tone: 'neutral' };
}

export function StatusBadge({ status }: { status?: string | null }) {
  const { label, tone } = statusInfo(status);
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${TONES[tone]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOTS[tone]}`} />
      {label}
    </span>
  );
}

export function isCashDue(status?: string | null): boolean {
  return statusInfo(status).tone === 'due';
}

/** Re-run `load` every `ms` while the tab is visible, and when it regains focus. */
export function useAutoRefresh(load: () => void, ms = 20000) {
  const ref = useRef(load);
  ref.current = load;
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === 'visible') ref.current();
    };
    const t = setInterval(tick, ms);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ms]);
}

/**
 * Mark a registration's cash as collected. Returns an error message, or null
 * on success. Shows a clear confirmation first.
 */
export async function markCashPaid(reference: string, memberName?: string, amount?: string): Promise<string | null> {
  const who = memberName ? ` for ${memberName}` : '';
  const amt = amount ? ` (${amount})` : '';
  if (!window.confirm(`Mark cash as received${who}${amt}?\n\nThis activates the membership and emails the receipt.`)) {
    return 'cancelled';
  }
  try {
    const res = await fetch(`/api/v1/admin/registrations/${encodeURIComponent(reference)}/mark-paid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'CASH' }),
    });
    if (res.status === 401 || res.status === 403) {
      return 'Your session has ended or you do not have permission. Please sign in again.';
    }
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      return d.error?.message || 'Could not mark as paid. Please try again.';
    }
    return null;
  } catch {
    return 'Network error. Please check the connection and try again.';
  }
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#0F172A]">{title}</h1>
        {subtitle && <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Toast({ message, tone = 'ok', onClose }: { message: string; tone?: 'ok' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [message, onClose]);
  return (
    <div
      role="status"
      className={`fixed bottom-20 md:bottom-6 right-4 left-4 sm:left-auto sm:max-w-sm z-[60] rounded-xl px-4 py-3 text-sm shadow-lg ring-1 ${
        tone === 'ok' ? 'bg-white text-[#0F172A] ring-[#C7D4F5]' : 'bg-red-50 text-red-800 ring-red-200'
      }`}
    >
      {message}
    </div>
  );
}
