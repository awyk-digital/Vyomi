'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PaymentItem {
  id: string;
  registrationId: string;
  method: string;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  amountPaise: number;
  currency: string;
  status: string;
  failureReason: string | null;
  refundedPaise: number;
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <span className="t-label text-[var(--bronze-text)] uppercase tracking-wider font-semibold">
            Financial Ledger
          </span>
          <h1 className="t-h2 text-[var(--text-strong)] font-semibold mt-1">
            Payment Transactions ({payments.length})
          </h1>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[2px] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--surface-2)] border-b border-[var(--line)] text-[var(--text-faint)] uppercase tracking-wider text-[0.6875rem]">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Reg Reference</th>
                <th className="py-3 px-4 font-semibold">Client</th>
                <th className="py-3 px-4 font-semibold">Tier</th>
                <th className="py-3 px-4 font-semibold">Method</th>
                <th className="py-3 px-4 font-semibold">Payment ID / Order</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--text-faint)]">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--text-faint)]">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                    <td className="py-3.5 px-4 nums text-[var(--text-faint)] whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-[var(--text-strong)]">
                      {p.registration?.reference ? (
                        <Link href={`/admin/registrations/${p.registration.reference}`} className="hover:underline">
                          {p.registration.reference}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[var(--text-strong)] block">
                        {p.client?.fullName || 'N/A'}
                      </span>
                      {p.client?.memberCode && (
                        <span className="nums text-[0.625rem] text-[var(--bronze-text)]">
                          {p.client.memberCode}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{p.package?.name || '—'}</td>
                    <td className="py-3.5 px-4 uppercase font-medium text-[var(--text-strong)]">
                      {p.method}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[0.6875rem] text-[var(--text-faint)]">
                      <div>{p.razorpayPaymentId || '—'}</div>
                      <div className="text-[0.625rem] opacity-75">{p.razorpayOrderId || ''}</div>
                    </td>
                    <td className="py-3.5 px-4 nums font-semibold text-[var(--text-strong)]">
                      {formatINR(p.amountPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[0.625rem] font-bold uppercase tracking-wider border ${
                          p.status === 'PAID'
                            ? 'border-[var(--success)] text-[var(--success)] bg-[var(--surface)]'
                            : p.status === 'REFUNDED'
                            ? 'border-[var(--text-strong)] text-[var(--text-strong)] bg-[var(--surface-2)]'
                            : p.status === 'FAILED'
                            ? 'border-[var(--burgundy)] text-[var(--burgundy)] bg-[var(--surface)]'
                            : 'border-[var(--bronze)] text-[var(--bronze-text)] bg-[var(--surface)]'
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
