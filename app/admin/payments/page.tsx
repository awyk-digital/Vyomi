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
    return 'Offline Cash (Front Desk)';
  }
  return 'Online Payment (UPI QR)';
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
            Financial Ledger
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Payment Transactions ({payments.length})
          </h1>
        </div>
      </div>

      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-extrabold">Date</th>
                <th className="py-3 px-4 font-extrabold">Reg Reference</th>
                <th className="py-3 px-4 font-extrabold">Client</th>
                <th className="py-3 px-4 font-extrabold">Tier</th>
                <th className="py-3 px-4 font-extrabold">Payment Mode</th>
                <th className="py-3 px-4 font-extrabold">Amount</th>
                <th className="py-3 px-4 font-extrabold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#475569] font-medium">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#475569] font-medium">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3.5 px-4 font-semibold text-[#475569] whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                      {p.registration?.reference ? (
                        <Link href={`/admin/registrations/${p.registration.reference}`} className="hover:underline">
                          {p.registration.reference}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#0F172A] block">
                        {p.client?.fullName || 'N/A'}
                      </span>
                      {p.client?.memberCode && (
                        <span className="font-mono text-[11px] font-black text-[#D97706]">
                          {p.client.memberCode}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">{p.package?.name || '—'}</td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                      {formatPaymentMethod(p.method)}
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#0F172A]">
                      {formatINR(p.amountPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                          p.status === 'PAID'
                            ? 'border-emerald-300 text-emerald-900 bg-emerald-100'
                            : p.status === 'REFUNDED'
                            ? 'border-[#CBD5E1] text-[#0F172A] bg-[#F1F5F9]'
                            : p.status === 'FAILED'
                            ? 'border-red-300 text-red-900 bg-red-100'
                            : 'border-amber-300 text-amber-900 bg-amber-100'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
