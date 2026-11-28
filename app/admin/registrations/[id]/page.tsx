'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  formatINR,
  formatDate,
  paymentLabel,
  StatusBadge,
  isCashDue,
  markCashPaid,
  Toast,
} from '@/components/admin/ui';

interface RegistrationDetail {
  id: string;
  reference: string;
  totalPaise: number;
  status: string;
  startDate: string;
  endDate: string | null;
  preferredSlot: string | null;
  notes: string | null;
  createdAt: string;
  client?: { id: string; fullName: string; phone: string; email: string; gender?: string; memberCode: string | null; fitnessGoal?: string; photoUrl?: string | null };
  package?: { id: string; name: string; durationDays: number };
  payment?: { method: string; status: string; paidAt: string | null };
}

function Field({ label, value, mono }: { label: string; value?: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[#64748B]">{label}</dt>
      <dd className={`mt-0.5 text-sm text-[#0F172A] break-words ${mono ? 'font-mono tracking-wide' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

export default function RegistrationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [reg, setReg] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [busy, setBusy] = useState<'' | 'paid' | 'cancel' | 'receipt'>('');
  const [role, setRole] = useState('');
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'error' } | null>(null);

  const load = useCallback(() => {
    fetch(`/api/v1/admin/registrations/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then((res) => {
        if (res.status === 401) {
          window.location.replace(`/admin/login?next=/admin/registrations/${id}`);
          return null;
        }
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.registration) {
          setReg(data.registration);
          setNotes(data.registration.notes || '');
        }
      })
      .catch(() => setToast({ msg: 'Could not load this member. Check the connection.', tone: 'error' }))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
    fetch('/api/v1/admin/auth/me', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setRole(d?.admin?.role || ''))
      .catch(() => null);
  }, [load]);

  const saveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/v1/admin/registrations/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const d = await res.json().catch(() => ({}));
      setToast(res.ok ? { msg: 'Notes saved.', tone: 'ok' } : { msg: d.error?.message || 'Could not save notes.', tone: 'error' });
    } catch {
      setToast({ msg: 'Network error. Notes not saved.', tone: 'error' });
    } finally {
      setSavingNotes(false);
    }
  };

  const markPaid = async () => {
    if (!reg) return;
    setBusy('paid');
    const err = await markCashPaid(reg.reference, reg.client?.fullName, formatINR(reg.totalPaise));
    setBusy('');
    if (err === 'cancelled') return;
    if (err) setToast({ msg: err, tone: 'error' });
    else {
      setToast({ msg: 'Marked as paid. Membership is active and the receipt was emailed.', tone: 'ok' });
      load();
    }
  };

  const cancelMembership = async () => {
    if (!reg) return;
    const reason = window.prompt(`Cancel ${reg.client?.fullName || 'this'} membership?\n\nType the reason (required):`);
    if (!reason?.trim()) return;
    setBusy('cancel');
    try {
      const res = await fetch(`/api/v1/admin/registrations/${encodeURIComponent(reg.reference)}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setToast({ msg: 'Membership cancelled.', tone: 'ok' });
        load();
      } else setToast({ msg: d.error?.message || 'Could not cancel.', tone: 'error' });
    } catch {
      setToast({ msg: 'Network error. Nothing was changed.', tone: 'error' });
    } finally {
      setBusy('');
    }
  };

  const resendReceipt = async () => {
    if (!reg) return;
    setBusy('receipt');
    try {
      const res = await fetch(`/api/v1/registrations/${encodeURIComponent(reg.reference)}/send-receipt`, { method: 'POST' });
      const d = await res.json().catch(() => ({}));
      setToast(
        res.ok
          ? { msg: `Receipt emailed to ${d.emailedTo || reg.client?.email}.`, tone: 'ok' }
          : { msg: d.error?.message || 'Could not send the receipt.', tone: 'error' }
      );
    } catch {
      setToast({ msg: 'Network error. Receipt not sent.', tone: 'error' });
    } finally {
      setBusy('');
    }
  };

  if (loading) return <p className="py-16 text-center text-sm text-[#64748B]">Loading member…</p>;
  if (notFound || !reg) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-[#0F172A]">This registration could not be found.</p>
        <Link href="/admin/registrations" className="text-sm text-[#1E3A8A] underline">Back to members</Link>
      </div>
    );
  }

  const due = isCashDue(reg.status);
  const cancelled = reg.status === 'CANCELLED';

  return (
    <div className="space-y-5 max-w-4xl">
      <Link href="/admin/registrations" className="text-sm text-[#64748B] hover:text-[#1E3A8A]">← Members</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-[#0F172A]">{reg.client?.fullName || 'Member'}</h1>
            <StatusBadge status={reg.status} />
          </div>
          <p className="text-sm text-[#64748B] mt-1">
            {reg.client?.memberCode || 'No member ID yet'} · Registered {formatDate(reg.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {due && (
            <button
              type="button"
              onClick={markPaid}
              disabled={!!busy}
              className="h-10 px-4 rounded-xl text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] disabled:opacity-60 transition"
            >
              {busy === 'paid' ? 'Saving…' : `Mark paid · ${formatINR(reg.totalPaise)}`}
            </button>
          )}
          {!cancelled && (
            <button
              type="button"
              onClick={resendReceipt}
              disabled={!!busy}
              className="h-10 px-4 rounded-xl text-sm font-medium text-[#1E3A8A] bg-white ring-1 ring-[#C7D4F5] hover:ring-[#1E3A8A] disabled:opacity-60 transition"
            >
              {busy === 'receipt' ? 'Sending…' : 'Email receipt'}
            </button>
          )}
          <Link
            href={`/admin/registrations/${reg.reference}/edit`}
            className="h-10 px-4 inline-flex items-center rounded-xl text-sm font-medium text-[#334155] bg-white ring-1 ring-[#E2E8F0] hover:ring-[#94A3B8] transition"
          >
            Edit details
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <section className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0F172A]">Member Profile</h2>
            {reg.client?.photoUrl && (
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                ✓ Photo on record
              </span>
            )}
          </div>
          <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-[#F1F5F9]">
            {reg.client?.photoUrl ? (
              <img
                src={reg.client.photoUrl}
                alt={reg.client.fullName}
                className="w-14 h-14 rounded-xl object-cover ring-2 ring-[#1E3A8A] border border-[#CBD5E1] shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#EEF2FF] border border-[#C7D4F5] flex flex-col items-center justify-center text-[#1E3A8A] flex-shrink-0">
                <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-7 9a7 7 0 1 1 14 0H3z" />
                </svg>
                <span className="text-[8px] font-bold mt-0.5 uppercase tracking-wide">No Photo</span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-[#0F172A] truncate">{reg.client?.fullName}</h3>
              <p className="text-xs font-mono font-medium text-[#1E3A8A] mt-0.5">{reg.client?.memberCode || 'Member'}</p>
              <p className="text-xs text-[#64748B] mt-0.5 truncate">{reg.client?.fitnessGoal || 'General Fitness & Conditioning'}</p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Phone" value={reg.client?.phone ? `+91 ${reg.client.phone}` : undefined} />
            <Field label="Email" value={reg.client?.email} />
            <Field label="Member ID" value={reg.client?.memberCode} mono />
            <Field label="Gender" value={reg.client?.gender} />
          </dl>
        </section>

        <section className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] p-5">
          <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Membership</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <Field label="Plan" value={reg.package?.name} />
            <Field label="Amount" value={formatINR(reg.totalPaise)} />
            <Field label="Starts" value={formatDate(reg.startDate)} />
            <Field label="Ends" value={formatDate(reg.endDate)} />
            <Field label="Time slot" value={reg.preferredSlot} />
            <Field
              label="Payment"
              value={`${paymentLabel(reg.payment?.method)}${reg.payment?.paidAt ? ` · paid ${formatDate(reg.payment.paidAt)}` : ''}`}
            />
          </dl>
          <p className="mt-4 text-xs text-[#94A3B8] font-mono">{reg.reference}</p>
        </section>
      </div>

      <section className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#0F172A]">Desk notes</h2>
          <span className="text-xs text-[#94A3B8]">Only staff can see these</span>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Locker 14 assigned, trainer session booked for Monday"
          className="w-full rounded-xl bg-white ring-1 ring-[#E3E8F2] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={saveNotes}
            disabled={savingNotes || notes === (reg.notes || '')}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] disabled:opacity-40 transition"
          >
            {savingNotes ? 'Saving…' : 'Save notes'}
          </button>
        </div>
      </section>

      {role === 'SUPER_ADMIN' && !cancelled && (
        <section className="rounded-2xl bg-white ring-1 ring-red-200 p-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-red-800">Cancel membership</h2>
            <p className="text-sm text-[#64748B]">Marks the membership cancelled and the payment refunded. Super Admin only.</p>
          </div>
          <button
            type="button"
            onClick={cancelMembership}
            disabled={!!busy}
            className="h-9 px-4 rounded-lg text-sm font-medium text-red-700 bg-white ring-1 ring-red-300 hover:bg-red-50 disabled:opacity-60 transition"
          >
            {busy === 'cancel' ? 'Cancelling…' : 'Cancel membership'}
          </button>
        </section>
      )}

      {toast && <Toast message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
