'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { SUPPLIED } from '@/config/assets';
import { VipMembershipCard } from '@/components/LuxuryIcons';

interface RegDetail {
  reference: string;
  status: string;
  memberCode: string | null;
  clientName: string;
  packageName: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  totalPaise: number;
}

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || undefined;
  const [detail, setDetail] = useState<RegDetail | null>(null);

  useEffect(() => {
    if (!ref) return;
    fetch(`/api/v1/registrations/${ref}/status`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setDetail(data);
      })
      .catch((err) => console.error('Failed to load status:', err));
  }, [ref]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-[2px] p-8 sm:p-12 shadow-[var(--shadow-card)]">
      {/* Header Branding */}
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-6 mb-8">
        <Link href="/register">
          <Image
            src={SUPPLIED.logo.src}
            alt="Vyomi Fitness Club"
            width={72}
            height={36}
            unoptimized
            className="h-10 w-auto"
          />
        </Link>
        <span className="t-label text-[var(--success)] font-semibold tracking-wider flex items-center gap-1.5 uppercase">
          <span className="w-2 h-2 rounded-full bg-[var(--success)] inline-block" />
          Enrollment Confirmed
        </span>
      </div>

      {/* Editorial Welcome Quote in Boska */}
      <div className="text-center my-6">
        <p
          className="text-2xl sm:text-3xl text-[var(--text-strong)] font-serif italic mb-3"
          style={{ fontFamily: 'var(--font-quote)' }}
        >
          “Welcome to Vyomi.”
        </p>
        <p className="t-small text-[var(--text-faint)]">
          Your elite fitness club membership has been activated and registered with the concierge.
        </p>
      </div>

      {/* VIP Digital Membership Card Display */}
      <div className="my-8 max-w-md mx-auto">
        <VipMembershipCard
          clientName={detail?.clientName || 'Club Member'}
          packageName={detail?.packageName || 'Gold'}
          durationDays={detail?.durationDays || 90}
          memberCode={detail?.memberCode || 'VYO · 2026 · VIP'}
        />
      </div>

      {/* Member ID spotlight */}
      <div className="my-8 p-6 bg-[#161619] border border-white/10 rounded-lg text-center">
        <span className="t-label text-[#D4AF37] uppercase tracking-widest text-[0.6875rem] font-bold block mb-1">
          Official Member Identification Code
        </span>
        <span className="nums text-2xl sm:text-3xl font-bold tracking-wider text-[#F5F5F2]">
          {detail?.memberCode || 'VYO-2026-ACTIVE'}
        </span>
        <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-3" />
      </div>

      {/* Membership Details */}
      <div className="space-y-3.5 text-xs border-y border-[var(--line)] py-6 my-6">
        <div className="flex justify-between">
          <span className="text-[var(--text-faint)] uppercase">Member Name</span>
          <span className="font-semibold text-[var(--text-strong)]">{detail?.clientName || 'Club Member'}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--text-faint)] uppercase">Tier & Duration</span>
          <span className="font-semibold text-[var(--text-strong)]">
            {detail?.packageName || 'Gold Tier'} ({detail?.durationDays || 90} Days)
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--text-faint)] uppercase">Active Date Range</span>
          <span className="font-semibold text-[var(--text-strong)]">
            {detail?.startDate || 'Today'} → {detail?.endDate || 'End of Term'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--text-faint)] uppercase">Amount Paid</span>
          <span className="nums font-bold text-[var(--text-strong)]">
            {detail?.totalPaise ? formatINR(detail.totalPaise) : 'Confirmed'} (Incl. 18% GST)
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-[var(--text-faint)] uppercase">Registration Reference</span>
          <span className="nums font-mono text-[var(--text-strong)]">{detail?.reference || ref || 'REG-CONFIRMED'}</span>
        </div>
      </div>

      {/* Concierge Instructions */}
      <div className="p-4 bg-[var(--bg)] border border-[var(--line)] rounded text-xs text-[var(--text)] mb-8 space-y-1">
        <p className="font-semibold text-[var(--text-strong)]">Next Steps Upon First Visit:</p>
        <p>
          Please present your Member Code at the front desk concierge to collect your biometric access wristband and private locker keycard.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          type="button"
          onClick={handlePrint}
          className="btn-solid-light w-full sm:w-1/2"
        >
          Download / Print Receipt
        </button>
        <Link
          href="/register"
          className="btn-line-light w-full sm:w-1/2 text-center"
        >
          Back to Membership Registration
        </Link>
      </div>
    </div>
  );
}

export default function RegisterSuccessPage() {
  return (
    <div data-theme="light" className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased py-12 px-4 sm:px-6">
      <Suspense fallback={<div className="max-w-2xl mx-auto p-12 text-center text-xs text-neutral-500">Loading receipt...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
