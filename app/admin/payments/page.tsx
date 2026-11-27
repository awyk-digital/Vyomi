'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  formatINR,
  formatDate,
  paymentLabel,
  StatusBadge,
  isCashDue,
  markCashPaid,
  useAutoRefresh,
  PageHeader,
  Toast,
} from '@/components/admin/ui';

interface PaymentItem {
  id: string;
  method: string;
  amountPaise: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  registration?: { reference: string; totalPaise: number; status: string };
  client?: { fullName: string; phone: string; memberCode: string | null };
  package?: { name: string };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'error' } | null>(null);

  const load = useCallback(() => {
    fetch('/api/v1/admin/payments', { cache: 'no-store' })
      .then((res) => {
        if (res.status === 401) {
          window.location.replace('/admin/login?next=/admin/payments');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.payments) setPayments(data.payments);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useAutoRefresh(load, 20000);

  const totals = useMemo(() => {
    let paid = 0;
    let due = 0;
    for (const p of payments) {
      if (p.status?.toUpperCase() === 'PAID') paid += p.amountPaise;
      else if (isCashDue(p.status)) due += p.amountPaise;
    }
    return { paid, due };
  }, [payments]);

  const handleMarkPaid = async (p: PaymentItem) => {
    const ref = p.registration?.reference;
    if (!ref) return;
    setBusyRef(ref);
    const err = await markCashPaid(ref, p.client?.fullName, formatINR(p.amountPaise));
    setBusyRef(null);
    if (err === 'cancelled') return;
    if (err) setToast({ msg: err, tone: 'error' });
    else {
      setToast({ msg: `Marked as paid. Receipt emailed to ${p.client?.fullName || 'the member'}.`, tone: 'ok' });
      load();
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Payments" subtitle="Every membership payment, newest first. Updates automatically." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-xl">
        <div className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] p-5">
          <p className="text-sm text-[#64748B]">Received</p>
          <p className="mt-2 text-2xl font-semibold text-[#0F172A]">{formatINR(totals.paid)}</p>
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-amber-200 p-5">
          <p className="text-sm text-[#64748B]">Cash still to collect</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">{formatINR(totals.due)}</p>
        </div>
      </div>

      <section className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] overflow-hidden">
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-[#64748B]">Loading payments…</p>
        ) : payments.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-[#64748B]">No payments yet.</p>
        ) : (
          <>
            <table className="hidden md:table w-full text-sm table-fixed">
              <thead>
                <tr className="text-left text-xs text-[#64748B] border-b border-[#EEF1F6]">
                  <th className="py-3 pl-5 pr-3 font-medium w-[12%]">Date</th>
                  <th className="py-3 px-3 font-medium w-[27%]">Member</th>
                  <th className="py-3 px-3 font-medium">Plan</th>
                  <th className="py-3 px-3 font-medium w-[9%]">Method</th>
                  <th className="py-3 px-3 font-medium w-[11%]">Amount</th>
                  <th className="py-3 px-3 font-medium w-[12%]">Status</th>
                  <th className="py-3 pl-3 pr-5 font-medium w-[13%] text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F6]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFE] transition-colors">
                    <td className="py-3 pl-5 pr-3 text-[#64748B] whitespace-nowrap">{formatDate(p.paidAt || p.createdAt)}</td>
                    <td className="py-3 px-3">
                      <Link href={`/admin/registrations/${p.registration?.reference}`} className="block min-w-0 group">
                        <span className="block font-medium text-[#0F172A] truncate group-hover:text-[#1E3A8A]">{p.client?.fullName || 'Member'}</span>
                        <span className="block text-xs text-[#64748B] truncate">{p.client?.memberCode || p.registration?.reference}</span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-[#334155] truncate">{p.package?.name || '—'}</td>
                    <td className="py-3 px-3 text-[#334155]">{paymentLabel(p.method)}</td>
                    <td className="py-3 px-3 font-medium text-[#0F172A]">{formatINR(p.amountPaise)}</td>
                    <td className="py-3 px-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 pl-3 pr-5 text-right">
                      {isCashDue(p.status) && p.registration?.reference && (
                        <button
                          type="button"
                          disabled={busyRef === p.registration.reference}
                          onClick={() => handleMarkPaid(p)}
                          className="h-8 px-3 inline-flex items-center rounded-lg text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] disabled:opacity-60 transition whitespace-nowrap"
                        >
                          {busyRef === p.registration.reference ? 'Saving…' : 'Mark paid'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-[#EEF1F6]">
              {payments.map((p) => (
                <li key={p.id} className="px-4 py-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{p.client?.fullName || 'Member'}</p>
                      <p className="text-xs text-[#64748B]">{formatDate(p.paidAt || p.createdAt)} · {paymentLabel(p.method)} · {formatINR(p.amountPaise)}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  {isCashDue(p.status) && p.registration?.reference && (
                    <button
                      type="button"
                      disabled={busyRef === p.registration.reference}
                      onClick={() => handleMarkPaid(p)}
                      className="w-full h-9 rounded-lg text-sm font-medium text-white bg-[#1E3A8A] disabled:opacity-60"
                    >
                      {busyRef === p.registration.reference ? 'Saving…' : 'Mark paid'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {toast && <Toast message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
