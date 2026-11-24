'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface RegistrationDetail {
  id: string;
  reference: string;
  pricePaise: number;
  joiningFeePaise: number;
  discountPaise: number;
  gstPaise: number;
  totalPaise: number;
  status: string;
  startDate: string;
  endDate: string | null;
  preferredSlot: string | null;
  referralSource: string | null;
  acceptedTermsAt: string;
  acceptedIp: string;
  notes: string | null;
  createdAt: string;
  client?: {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    address: string;
    memberCode: string | null;
    idProofType?: string | null;
    idProofNumber?: string | null;
    fitnessGoal: string;
    medicalNotes: string | null;
    emergencyContactName: string;
    emergencyContactPhone: string;
    guardianName: string | null;
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
    razorpayOrderId: string | null;
    razorpayPaymentId: string | null;
    status: string;
    amountPaise: number;
    failureReason: string | null;
    refundedPaise: number;
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
    if (!confirm('Mark offline payment and confirm membership?')) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${id}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'POS' }),
      });
      if (res.ok) {
        alert('Payment confirmed.');
        router.refresh();
      }
    } catch {
      alert('Failed to mark paid');
    }
  };

  const handleRefund = async () => {
    const reason = prompt('Enter reason for issuing refund:');
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
    return <div className="py-12 text-center text-xs text-[var(--text-faint)]">Loading client record...</div>;
  }

  if (!reg) {
    return <div className="py-12 text-center text-xs text-[var(--burgundy)]">Registration record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/registrations"
              className="text-xs text-[var(--text-faint)] hover:text-[var(--text-strong)]"
            >
              ← Registrations
            </Link>
            <span className="text-[var(--line-2)]">/</span>
            <span className="t-label text-[var(--bronze-text)] uppercase font-semibold">
              Client Dossier
            </span>
          </div>
          <h1 className="t-h2 text-[var(--text-strong)] font-semibold mt-1">
            {reg.client?.fullName || 'Client'} · {reg.reference}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/registrations/${reg.reference}/edit`}
            className="btn-line-light !h-9 !px-3.5 !text-xs !border-[#D4AF37]/50 !text-[#D4AF37] hover:!bg-[#D4AF37]/10"
          >
            ✏️ Correct Details
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-line-light !h-9 !px-3.5 !text-xs"
          >
            🖨️ Print Invoice
          </button>
          {reg.status === 'PENDING' && (
            <button
              type="button"
              onClick={handleMarkPaid}
              className="btn-solid-light !h-9 !px-4 !text-xs !bg-[var(--success)]"
            >
              ✓ Mark Paid (Offline)
            </button>
          )}
          {reg.status === 'CONFIRMED' && (
            <button
              type="button"
              onClick={handleRefund}
              className="btn-line-light !h-9 !px-3.5 !text-xs !text-[var(--burgundy)] hover:!border-[var(--burgundy)]"
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
          <div className="bg-[var(--surface)] border border-[var(--line)] p-6 rounded-[2px] shadow-[var(--shadow-card)] space-y-5">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
              <div>
                <h3 className="t-h3 text-[var(--text-strong)] font-semibold">
                  Personal Information
                </h3>
                <span className="text-xs text-[var(--text-faint)]">
                  Registered {new Date(reg.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
              <div className="text-right">
                <span className="t-label text-[var(--text-faint)] uppercase block text-[0.625rem]">
                  Member ID
                </span>
                <span className="nums text-base font-bold text-[var(--bronze-text)]">
                  {reg.client?.memberCode || 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[var(--text-faint)] block uppercase">Full Legal Name</span>
                <span className="font-semibold text-[var(--text-strong)]">{reg.client?.fullName}</span>
              </div>
              <div>
                <span className="text-[var(--text-faint)] block uppercase">Mobile Number</span>
                <a href={`tel:${reg.client?.phone}`} className="font-semibold text-[var(--text-strong)] hover:underline">
                  +91 {reg.client?.phone}
                </a>
              </div>
              <div>
                <span className="text-[var(--text-faint)] block uppercase">Email Address</span>
                <a href={`mailto:${reg.client?.email}`} className="font-semibold text-[var(--text-strong)] hover:underline">
                  {reg.client?.email}
                </a>
              </div>
              <div>
                <span className="text-[var(--text-faint)] block uppercase">Date of Birth & Gender</span>
                <span className="font-semibold text-[var(--text-strong)]">
                  {reg.client?.dateOfBirth} ({reg.client?.gender})
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--text-faint)] block uppercase">Address</span>
                <span className="text-[var(--text)]">{reg.client?.address}</span>
              </div>
              {reg.client?.idProofNumber && (
                <div className="col-span-2">
                  <span className="text-[var(--text-faint)] block uppercase">Government ID</span>
                  <span className="font-mono text-[var(--text)]">
                    {reg.client.idProofType}: {reg.client.idProofNumber}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Card: Health, Fitness & Emergency */}
          <div className="bg-[var(--surface)] border border-[var(--line)] p-6 rounded-[2px] shadow-[var(--shadow-card)] space-y-4">
            <h3 className="t-h3 text-[var(--text-strong)] border-b border-[var(--line)] pb-3 font-semibold">
              Training & Emergency Protocol
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[var(--text-faint)] block uppercase">Primary Goal</span>
                <span className="font-semibold text-[var(--text-strong)]">{reg.client?.fitnessGoal}</span>
              </div>
              <div>
                <span className="text-[var(--text-faint)] block uppercase">Preferred Time Slot</span>
                <span className="font-semibold text-[var(--text-strong)] capitalize">{reg.preferredSlot || 'Any'}</span>
              </div>
              <div>
                <span className="text-[var(--text-faint)] block uppercase">Emergency Contact Person</span>
                <span className="font-semibold text-[var(--text-strong)]">{reg.client?.emergencyContactName}</span>
              </div>
              <div>
                <span className="text-[var(--text-faint)] block uppercase">Emergency Phone</span>
                <a href={`tel:${reg.client?.emergencyContactPhone}`} className="font-semibold text-[var(--text-strong)] hover:underline">
                  +91 {reg.client?.emergencyContactPhone}
                </a>
              </div>
              <div className="col-span-2">
                <span className="text-[var(--text-faint)] block uppercase">Medical Notes & Orthopedic History</span>
                <p className="p-3 bg-[var(--surface-2)] rounded text-[var(--text)] mt-1 font-mono text-[0.6875rem]">
                  {reg.client?.medicalNotes || 'No specific injuries or conditions noted during intake.'}
                </p>
              </div>
            </div>
          </div>

          {/* Internal Staff Notes */}
          <div className="bg-[var(--surface)] border border-[var(--line)] p-6 rounded-[2px] shadow-[var(--shadow-card)] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="t-h3 text-[var(--text-strong)] font-semibold">Internal Operations Notes</h3>
              {notesSaved && <span className="text-xs text-[var(--success)] font-medium">✓ Saved</span>}
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add concierge notes, trainer assignment, locker allocation..."
              className="light-input !h-auto py-2.5 resize-none text-xs"
            />
            <div className="flex justify-end">
              <button
                type="button"
                disabled={savingNotes}
                onClick={handleSaveNotes}
                className="btn-solid-light !h-8 !px-3 !text-xs"
              >
                {savingNotes ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Membership & Payment Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Membership Tier & Status */}
          <div className="bg-[var(--surface)] border border-[var(--line)] p-6 rounded-[2px] shadow-[var(--shadow-card)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <h3 className="t-h3 text-[var(--text-strong)] font-semibold">Tier & Validity</h3>
              <span
                className={`px-2 py-0.5 rounded text-[0.625rem] font-bold uppercase tracking-wider border ${
                  reg.status === 'CONFIRMED'
                    ? 'border-[var(--success)] text-[var(--success)] bg-[var(--surface)]'
                    : reg.status === 'PENDING'
                    ? 'border-[var(--bronze)] text-[var(--bronze-text)] bg-[var(--surface)]'
                    : 'border-[var(--burgundy)] text-[var(--burgundy)] bg-[var(--surface)]'
                }`}
              >
                {reg.status}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text-faint)]">Package</span>
                <span className="font-semibold text-[var(--text-strong)]">{reg.package?.name} Tier</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-faint)]">Duration</span>
                <span className="nums font-medium text-[var(--text-strong)]">{reg.package?.durationDays} Days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-faint)]">Start Date</span>
                <span className="nums font-medium text-[var(--text-strong)]">{reg.startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-faint)]">Expiration Date</span>
                <span className="nums font-bold text-[var(--text-strong)]">{reg.endDate || 'Pending Confirmation'}</span>
              </div>
            </div>
          </div>

          {/* Payment & Invoice Breakdown */}
          <div className="bg-[var(--surface)] border border-[var(--line)] p-6 rounded-[2px] shadow-[var(--shadow-card)] space-y-4">
            <h3 className="t-h3 text-[var(--text-strong)] border-b border-[var(--line)] pb-3 font-semibold">
              Billing Ledger
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[var(--text)]">Base Fee</span>
                <span className="nums font-medium text-[var(--text-strong)]">{formatINR(reg.pricePaise)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text)]">Admission Fee</span>
                <span className="nums text-[var(--text)]">{formatINR(reg.joiningFeePaise)}</span>
              </div>
              {reg.discountPaise > 0 && (
                <div className="flex justify-between text-[var(--success)] font-medium">
                  <span>Discount</span>
                  <span className="nums">−{formatINR(reg.discountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--text-faint)]">
                <span>GST (18%)</span>
                <span className="nums">{formatINR(reg.gstPaise)}</span>
              </div>
              <div className="h-px bg-[var(--line)] my-1" />
              <div className="flex justify-between text-sm font-bold text-[var(--text-strong)]">
                <span>Total Settled</span>
                <span className="nums">{formatINR(reg.totalPaise)}</span>
              </div>
            </div>

            {/* Payment Details */}
            <div className="mt-4 pt-4 border-t border-[var(--line)] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[var(--text-faint)]">Method</span>
                <span className="font-semibold text-[var(--text-strong)] uppercase">{reg.payment?.method || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-faint)]">Payment Status</span>
                <span className="font-semibold text-[var(--text-strong)]">{reg.payment?.status || 'CREATED'}</span>
              </div>
              {reg.payment?.razorpayPaymentId && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-faint)]">Payment ID</span>
                  <span className="font-mono text-[0.6875rem]">{reg.payment.razorpayPaymentId}</span>
                </div>
              )}
              {reg.payment?.paidAt && (
                <div className="flex justify-between">
                  <span className="text-[var(--text-faint)]">Paid Timestamp</span>
                  <span className="nums text-[var(--text-faint)]">
                    {new Date(reg.payment.paidAt).toLocaleString('en-GB')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
