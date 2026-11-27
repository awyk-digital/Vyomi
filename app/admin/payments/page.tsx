'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PaymentItem {
  id: string;
  registrationId: string;
  method: string;
  amountPaise: number;
  currency: string;
  status: string;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  registration?: {
    reference: string;
    totalPaise: number;
    status: string;
  };
  client?: {
    fullName: string;
    phone: string;
    memberCode: string | null;
  };
  package?: {
    name: string;
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

function formatPaymentStatus(status: string): { label: string; className: string } {
  const s = status.toUpperCase();
  if (s === 'PAID') {
    return {
      label: 'Settled & Cleared',
      className: 'border-emerald-300 text-emerald-900 bg-emerald-100',
    };
  }
  if (s === 'PENDING_COLLECTION' || s === 'PENDING') {
    return {
      label: 'Awaiting Counter Clearance',
      className: 'border-amber-300 text-amber-900 bg-amber-100',
    };
  }
  if (s === 'REFUNDED') {
    return {
      label: 'Settlement Refunded',
      className: 'border-[#CBD5E1] text-[#0F172A] bg-[#F1F5F9]',
    };
  }
  return {
    label: s,
    className: 'border-red-300 text-red-900 bg-red-100',
  };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/admin/payments')
      .then((res) => res.json())
      .then((data) => {
        if (data.payments) setPayments(data.payments);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
            Financial Ledger & Reconciliation
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Membership Settlement Journal ({payments.length})
          </h1>
        </div>
      </div>

      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-xs">
                <th className="py-3 px-4 font-black w-36 whitespace-nowrap">Settlement Date</th>
                <th className="py-3 px-4 font-black w-36 whitespace-nowrap">Reference ID</th>
                <th className="py-3 px-4 font-black min-w-[150px]">Enrolled Member</th>
                <th className="py-3 px-4 font-black w-40 whitespace-nowrap">Membership Tier</th>
                <th className="py-3 px-4 font-black min-w-[180px]">Settlement Channel</th>
                <th className="py-3 px-4 font-black w-32 whitespace-nowrap">Settlement Amount</th>
                <th className="py-3 px-4 font-black min-w-[160px]">Clearance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#0F172A] font-bold">
                    Loading live financial records from Supabase...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#0F172A] font-bold">
                    No financial settlement records recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const statusInfo = formatPaymentStatus(p.status);
                  return (
                    <tr key={p.id} className="hover:bg-[#F8FAFC] transition">
                      <td className="py-3.5 px-4 font-bold text-[#0F172A] w-36 whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A] w-36 whitespace-nowrap">
                        {p.registration?.reference ? (
                          <Link href={`/admin/registrations/${p.registration.reference}`} className="hover:underline text-[#0F172A]">
                            {p.registration.reference}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <span className="font-extrabold text-[#0F172A] block">
                          {p.client?.fullName || 'Valued Member'}
                        </span>
                        {p.client?.memberCode && (
                          <span className="font-mono text-xs font-black text-[#D97706]">
                            {p.client.memberCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#0F172A] w-40 whitespace-nowrap">{p.package?.name || '—'}</td>
                      <td className="py-3.5 px-4 font-extrabold text-[#0F172A] min-w-[180px]">
                        {formatPaymentMethod(p.method)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#0F172A] w-32 whitespace-nowrap">
                        {formatINR(p.amountPaise)}
                      </td>
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
