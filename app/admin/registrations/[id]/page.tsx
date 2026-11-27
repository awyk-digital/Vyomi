'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RegistrationDetail {
  id: string;
  reference: string;
  pricePaise: number;
  totalPaise: number;
  status: string;
  startDate: string;
  endDate: string | null;
  preferredSlot: string | null;
  notes: string | null;
  createdAt: string;
  client?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    memberCode: string | null;
  };
  package?: {
    id: string;
    name: string;
    durationDays: number;
    pricePaise: number;
  };
  payment?: {
    id: string;
    method: string;
    status: string;
    amountPaise: number;
    paidAt: string | null;
    createdAt: string;
  };
}

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function formatPaymentMethod(method?: string): string {
  const m = (method || '').toUpperCase();
  if (m === 'CASH' || m === 'OFFLINE' || m === 'POS') {
    return 'Front Desk Settlement (Cash)';
  }
  return 'Instant UPI Settlement (QR)';
}

export default function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [reg, setReg] = useState<RegistrationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/admin/registrations/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.registration) {
          setReg(data.registration);
          setNotes(data.registration.notes || '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setNotesSaved(false);
    try {
      const res = await fetch(`/api/v1/admin/registrations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 3000);
      }
    } catch {
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!confirm('Mark offline cash collected and dispatch Digital VIP Card to member Gmail?')) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${id}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'CASH' }),
      });
      if (res.ok) {
        alert('Payment confirmed! Digital VIP Card and receipt sent to member Gmail.');
        router.refresh();
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleRefund = async () => {
    const reason = prompt('Enter refund justification reason:');
    if (!reason) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${reg?.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        alert('Refund processed.');
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error?.message || 'Refund failed');
      }
    } catch {
      alert('Failed to process refund');
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-xs text-[#64748B] font-semibold">Loading client record...</div>;
  }

  if (!reg) {
    return <div className="py-12 text-center text-xs text-red-600 font-bold">Registration record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/registrations"
              className="text-xs font-bold text-[#64748B] hover:text-[#0F172A]"
            >
              ← Registrations
            </Link>
            <span className="text-[#CBD5E1]">/</span>
            <span className="text-[11px] font-extrabold text-[#1E3A8A] uppercase tracking-wider">
              Client Dossier
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-1 tracking-tight">
            {reg.client?.fullName || 'Client'} · {reg.reference}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#1E3A8A] text-[#0F172A] rounded-lg text-xs font-bold transition shadow-sm"
          >
            🖨️ Print Invoice
          </button>
          {(reg.status === 'PENDING' || reg.status === 'PENDING_CASH_COLLECTION') && (
            <button
              type="button"
              onClick={handleMarkPaid}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
            >
              ✓ Mark Paid (Offline Cash)
            </button>
          )}
          {reg.status === 'CONFIRMED' && (
            <button
              type="button"
              onClick={handleRefund}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition"
            >
              Issue Refund
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Dossier Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client Identity & Health */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Client Profile */}
          <div className="bg-white border border-[#CBD5E1] p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-[#0F172A]">
                  Personal Particulars
                </h3>
                <span className="text-xs text-[#64748B] font-medium">
                  Registered {new Date(reg.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-extrabold text-[#64748B] uppercase block tracking-wider">
                  Member ID
                </span>
                <span className="font-mono text-base font-black text-[#1E3A8A]">
                  {reg.client?.memberCode || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[#64748B] font-bold block uppercase text-[11px]">Full Legal Name</span>
                <span className="font-bold text-[#0F172A]">{reg.client?.fullName}</span>
              </div>
              <div>
                <span className="text-[#64748B] font-bold block uppercase text-[11px]">Mobile Number</span>
                <a href={`tel:${reg.client?.phone}`} className="font-bold text-[#0F172A] hover:underline">
                  +91 {reg.client?.phone}
                </a>
              </div>
              <div>
                <span className="text-[#64748B] font-bold block uppercase text-[11px]">Email Address</span>
                <a href={`mailto:${reg.client?.email}`} className="font-bold text-[#0F172A] hover:underline">
                  {reg.client?.email}
                </a>
              </div>
              <div>
                <span className="text-[#64748B] font-bold block uppercase text-[11px]">Preferred Training Slot</span>
                <span className="font-bold text-[#0F172A]">{reg.preferredSlot || '06:00 – 09:00 AM'}</span>
              </div>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="bg-white border border-[#CBD5E1] p-5 rounded-xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-[#0F172A]">Internal Concierge Notes</h3>
              {notesSaved && <span className="text-xs text-emerald-600 font-bold">✓ Notes Saved</span>}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add concierge notes, locker allocation, trainer notes..."
              className="w-full bg-white border border-[#CBD5E1] rounded-lg p-2.5 text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#1E3A8A]"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="px-3.5 py-1.5 text-white bg-gradient-to-b from-[#2A4FC4] to-[#1E3A8A] hover:to-[#172F73] shadow-[0_8px_20px_-8px_rgba(30,58,138,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] active:translate-y-px rounded-xl text-xs font-medium transition"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Membership & Payment Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Membership Tier & Status */}
          <div className="bg-white border border-[#CBD5E1] p-5 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-sm font-extrabold text-[#0F172A]">Tier & Validity</h3>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-extrabold uppercase tracking-wider border ${
                  reg.status === 'CONFIRMED'
                    ? 'border-emerald-300 text-emerald-900 bg-emerald-100'
                    : 'border-amber-300 text-amber-900 bg-amber-100'
                }`}
              >
                {reg.status === 'CONFIRMED' ? 'PAID & ACTIVATED' : 'PENDING CASH'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B] font-medium">Package</span>
                <span className="font-bold text-[#0F172A]">{reg.package?.name} (1 Year)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] font-medium">Duration</span>
                <span className="font-bold text-[#0F172A]">365 Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] font-medium">Start Date</span>
                <span className="font-bold text-[#0F172A]">{reg.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] font-medium">Expiration Date</span>
                <span className="font-mono font-bold text-[#1E3A8A]">{reg.endDate || 'Pending Confirmation'}</span>
              </div>
            </div>
          </div>

          {/* Payment & Invoice Breakdown */}
          <div className="bg-white border border-[#CBD5E1] p-5 rounded-xl shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-3">
              Billing Ledger
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B] font-medium">Total Invoiced</span>
                <span className="font-black text-sm text-[#0F172A]">{formatINR(reg.totalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] font-medium">Payment Mode</span>
                <span className="font-bold text-[#0F172A]">{formatPaymentMethod(reg.payment?.method)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B] font-medium">Payment Status</span>
                <span className="font-bold text-[#0F172A]">{reg.payment?.status || 'CREATED'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
