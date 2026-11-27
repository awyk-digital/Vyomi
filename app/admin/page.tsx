'use client';

import { useCallback, useEffect, useState } from 'react';
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

interface RecentReg {
  id: string;
  reference: string;
  totalPaise: number;
  status: string;
  createdAt: string;
  client?: { fullName: string; phone: string; memberCode: string | null };
  package?: { name: string; durationDays: number };
  payment?: { method: string; status: string };
}

interface DashboardStats {
  newToday: number;
  newMonth: number;
  revenueTodayPaise: number;
  revenueMonthPaise: number;
  activeMembers: number;
  pendingCount: number;
  expiringSoon: number;
  recent: RecentReg[];
}

function Stat({ label, value, hint, tone }: { label: string; value: string | number; hint?: string; tone?: 'due' }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] p-5">
      <p className="text-sm text-[#64748B]">{label}</p>
      <p className={`mt-2 text-[28px] leading-none font-semibold tracking-tight ${tone === 'due' ? 'text-amber-700' : 'text-[#0F172A]'}`}>
        {value}
      </p>
      {hint && <p className="mt-2 text-xs text-[#94A3B8]">{hint}</p>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'error' } | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  const fetchStats = useCallback(() => {
    fetch('/api/v1/admin/dashboard/stats', { cache: 'no-store' })
      .then((res) => {
        if (res.status === 401) {
          window.location.replace('/admin/login?next=/admin');
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data?.stats) {
          setStats(data.stats);
          setFailed(false);
          setUpdatedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }));
        } else if (data !== null) {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  useAutoRefresh(fetchStats, 20000);

  const handleMarkPaid = async (r: RecentReg) => {
    setBusyRef(r.reference);
    const err = await markCashPaid(r.reference, r.client?.fullName, formatINR(r.totalPaise));
    setBusyRef(null);
    if (err === 'cancelled') return;
    if (err) setToast({ msg: err, tone: 'error' });
    else {
      setToast({ msg: `Marked as paid. Receipt emailed to ${r.client?.fullName || 'the member'}.`, tone: 'ok' });
      fetchStats();
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-sm text-[#64748B]">Loading dashboard…</div>;
  }
  if (!stats) {
    return (
      <div className="py-16 text-center space-y-3">
        <p className="text-sm text-red-700">Could not load the dashboard.</p>
        <button onClick={fetchStats} className="text-sm text-[#1E3A8A] underline">Try again</button>
      </div>
    );
  }

  const cashDue = stats.recent.filter((r) => isCashDue(r.status));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle={updatedAt ? `Updates automatically · last updated ${updatedAt}` : undefined}
        action={
          <div className="flex gap-2">
            <a
              href="/api/v1/admin/registrations/export"
              className="h-10 px-4 inline-flex items-center rounded-xl text-sm font-medium text-[#1E3A8A] bg-white ring-1 ring-[#C7D4F5] hover:ring-[#1E3A8A] transition"
            >
              Download CSV
            </a>
            <Link
              href="/admin/registrations/new"
              className="h-10 px-4 inline-flex items-center rounded-xl text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] transition"
            >
              + New walk-in
            </Link>
          </div>
        }
      />

      {failed && (
        <div className="rounded-xl bg-amber-50 ring-1 ring-amber-200 px-4 py-2.5 text-sm text-amber-800">
          Couldn&apos;t refresh just now. Showing the last loaded numbers.
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="Revenue this month" value={formatINR(stats.revenueMonthPaise)} hint={`Today: ${formatINR(stats.revenueTodayPaise)}`} />
        <Stat label="Active members" value={stats.activeMembers} hint={stats.expiringSoon ? `${stats.expiringSoon} expiring in 7 days` : 'None expiring this week'} />
        <Stat label="New this month" value={stats.newMonth} hint={`Today: ${stats.newToday}`} />
        <Stat label="Cash to collect" value={stats.pendingCount} hint="Waiting at front desk" tone={stats.pendingCount ? 'due' : undefined} />
      </div>

      {cashDue.length > 0 && (
        <section className="rounded-2xl bg-white ring-1 ring-amber-200 overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between border-b border-amber-100 bg-amber-50/50">
            <div>
              <h2 className="text-base font-semibold text-[#0F172A]">Cash to collect</h2>
              <p className="text-sm text-[#64748B]">Take the cash, then mark it paid to activate the membership.</p>
            </div>
            <Link href="/admin/registrations?status=PENDING_CASH_COLLECTION" className="text-sm text-[#1E3A8A] hover:underline whitespace-nowrap">
              See all →
            </Link>
          </div>
          <ul className="divide-y divide-[#EEF1F6]">
            {cashDue.map((r) => (
              <li key={r.id} className="px-5 py-3.5 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[#0F172A] truncate">{r.client?.fullName || 'Member'}</p>
                  <p className="text-xs text-[#64748B]">{r.package?.name} · {r.client?.memberCode || r.reference}</p>
                </div>
                <p className="text-sm font-semibold text-[#0F172A] w-24 text-right">{formatINR(r.totalPaise)}</p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/registrations/${r.reference}`}
                    className="h-9 px-3 inline-flex items-center rounded-lg text-sm text-[#334155] ring-1 ring-[#E2E8F0] hover:ring-[#94A3B8] transition"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    disabled={busyRef === r.reference}
                    onClick={() => handleMarkPaid(r)}
                    className="h-9 px-3.5 inline-flex items-center rounded-lg text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] disabled:opacity-60 transition"
                  >
                    {busyRef === r.reference ? 'Saving…' : 'Mark paid'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#EEF1F6]">
          <h2 className="text-base font-semibold text-[#0F172A]">Recent members</h2>
          <Link href="/admin/registrations" className="text-sm text-[#1E3A8A] hover:underline">
            All members →
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-[#64748B]">No registrations yet.</p>
        ) : (
          <>
            {/* Desktop table: fits without sideways scrolling */}
            <table className="hidden md:table w-full text-sm table-fixed">
              <thead>
                <tr className="text-left text-xs text-[#64748B] border-b border-[#EEF1F6]">
                  <th className="py-3 pl-5 pr-3 font-medium w-[30%]">Member</th>
                  <th className="py-3 px-3 font-medium">Plan</th>
                  <th className="py-3 px-3 font-medium w-[12%]">Amount</th>
                  <th className="py-3 px-3 font-medium w-[10%]">Payment</th>
                  <th className="py-3 px-3 font-medium w-[13%]">Status</th>
                  <th className="py-3 pl-3 pr-5 font-medium w-[12%] text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F6]">
                {stats.recent.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFE] transition-colors">
                    <td className="py-3 pl-5 pr-3">
                      <Link href={`/admin/registrations/${r.reference}`} className="block min-w-0 group">
                        <span className="block font-medium text-[#0F172A] truncate group-hover:text-[#1E3A8A]">{r.client?.fullName || 'Member'}</span>
                        <span className="block text-xs text-[#64748B] truncate">
                          {r.client?.memberCode || r.reference} · +91 {r.client?.phone}
                        </span>
                      </Link>
                    </td>
                    <td className="py-3 px-3 text-[#334155] truncate">{r.package?.name || '—'}</td>
                    <td className="py-3 px-3 font-medium text-[#0F172A]">{formatINR(r.totalPaise)}</td>
                    <td className="py-3 px-3 text-[#334155]">{paymentLabel(r.payment?.method)}</td>
                    <td className="py-3 px-3"><StatusBadge status={r.status} /></td>
                    <td className="py-3 pl-3 pr-5 text-right text-[#64748B] whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="md:hidden divide-y divide-[#EEF1F6]">
              {stats.recent.map((r) => (
                <li key={r.id}>
                  <Link href={`/admin/registrations/${r.reference}`} className="px-4 py-3 flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{r.client?.fullName || 'Member'}</p>
                      <p className="text-xs text-[#64748B] truncate">{r.package?.name} · {formatINR(r.totalPaise)} · {paymentLabel(r.payment?.method)}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
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
