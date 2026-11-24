'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardStats {
  newToday: number;
  newMonth: number;
  revenueTodayPaise: number;
  revenueMonthPaise: number;
  activeMembers: number;
  pendingCount: number;
  expiringSoon: number;
  packageBreakdown: Array<{ name: string; count: number; revenuePaise: number }>;
  methodBreakdown: Record<string, number>;
  recent: Array<{
    id: string;
    reference: string;
    totalPaise: number;
    status: string;
    createdAt: string;
    client?: { fullName: string; phone: string; memberCode: string | null };
    package?: { name: string; durationDays: number };
    payment?: { method: string; status: string };
  }>;
}

function formatINR(paise: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/admin/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <span className="text-xs text-[var(--text-faint)]">Loading operational analytics...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-12 text-center text-xs text-[var(--burgundy)]">
        Could not load dashboard statistics.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <span className="t-label text-[var(--bronze-text)] uppercase tracking-wider font-semibold">
            Operational Telemetry
          </span>
          <h1 className="t-h2 text-[var(--text-strong)] font-semibold mt-1">
            Club Performance Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/v1/admin/registrations/export"
            download
            className="btn-line-light !h-9 !px-3.5 !text-xs"
          >
            📥 Export CSV
          </a>
          <Link
            href="/admin/registrations/new"
            className="btn-solid-light !h-9 !px-4 !text-xs"
          >
            + New Walk-in Member
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Revenue Month */}
        <div className="bg-[var(--surface)] border border-[var(--line)] p-5 rounded-[2px] shadow-[var(--shadow-card)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="t-label text-[var(--text-faint)] uppercase tracking-wider">
              Monthly Revenue
            </span>
            <span className="text-xs text-[var(--success)] font-medium">Verified Paid</span>
          </div>
          <div className="nums text-2xl sm:text-3xl font-bold text-[var(--text-strong)]">
            {formatINR(stats.revenueMonthPaise)}
          </div>
          <span className="text-[0.6875rem] text-[var(--text-faint)] block">
            Today: <strong className="text-[var(--text-strong)]">{formatINR(stats.revenueTodayPaise)}</strong>
          </span>
        </div>

        {/* Card 2: Active Members */}
        <div className="bg-[var(--surface)] border border-[var(--line)] p-5 rounded-[2px] shadow-[var(--shadow-card)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="t-label text-[var(--text-faint)] uppercase tracking-wider">
              Active Memberships
            </span>
            <span className="w-2 h-2 rounded-full bg-[var(--live)]" />
          </div>
          <div className="nums text-2xl sm:text-3xl font-bold text-[var(--text-strong)]">
            {stats.activeMembers}
          </div>
          <span className="text-[0.6875rem] text-[var(--text-faint)] block">
            Currently valid & within term
          </span>
        </div>

        {/* Card 3: New Registrations */}
        <div className="bg-[var(--surface)] border border-[var(--line)] p-5 rounded-[2px] shadow-[var(--shadow-card)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="t-label text-[var(--text-faint)] uppercase tracking-wider">
              New Registrations
            </span>
            <span className="text-xs text-[var(--bronze-text)] font-semibold">MTD</span>
          </div>
          <div className="nums text-2xl sm:text-3xl font-bold text-[var(--text-strong)]">
            {stats.newMonth}
          </div>
          <span className="text-[0.6875rem] text-[var(--text-faint)] block">
            Today&apos;s intake: <strong className="text-[var(--text-strong)]">+{stats.newToday}</strong>
          </span>
        </div>

        {/* Card 4: Expiring & Pending Attention */}
        <div className="bg-[var(--surface)] border border-[var(--line)] p-5 rounded-[2px] shadow-[var(--shadow-card)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="t-label text-[var(--text-faint)] uppercase tracking-wider">
              Expiring in 7 Days
            </span>
            <span className="text-xs text-[var(--burgundy)] font-medium">Renewal Ops</span>
          </div>
          <div className="nums text-2xl sm:text-3xl font-bold text-[var(--text-strong)]">
            {stats.expiringSoon}
          </div>
          <span className="text-[0.6875rem] text-[var(--text-faint)] block">
            Pending checkouts: <strong className="text-[var(--text-strong)]">{stats.pendingCount}</strong>
          </span>
        </div>
      </div>

      {/* Breakdown Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Package Distribution */}
        <div className="lg:col-span-2 bg-[var(--surface)] border border-[var(--line)] p-6 rounded-[2px] shadow-[var(--shadow-card)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h3 className="t-h3 text-[var(--text-strong)] font-medium">Package Performance</h3>
            <span className="text-xs text-[var(--text-faint)]">By Enrolled Members</span>
          </div>

          <div className="space-y-4 pt-2">
            {stats.packageBreakdown.length === 0 ? (
              <span className="text-xs text-[var(--text-faint)]">No confirmed memberships yet.</span>
            ) : (
              stats.packageBreakdown.map((pkg) => (
                <div key={pkg.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-[var(--text-strong)]">{pkg.name} Tier</span>
                    <span className="nums text-[var(--text)]">
                      {pkg.count} members · {formatINR(pkg.revenuePaise)}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-2)] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[var(--bronze)] to-[var(--live)] h-full"
                      style={{
                        width: `${Math.min(100, Math.max(15, (pkg.count / (stats.activeMembers || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment Channels Split */}
        <div className="bg-[var(--surface)] border border-[var(--line)] p-6 rounded-[2px] shadow-[var(--shadow-card)] space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
            <h3 className="t-h3 text-[var(--text-strong)] font-medium">Payment Channels</h3>
            <span className="text-xs text-[var(--text-faint)]">Settled</span>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            {Object.entries(stats.methodBreakdown).map(([method, count]) => (
              <div key={method} className="flex items-center justify-between p-2.5 bg-[var(--surface-2)] rounded">
                <span className="font-semibold text-[var(--text-strong)] uppercase">
                  {method === 'POS' ? 'POS Terminal / Machine' : method}
                </span>
                <span className="nums font-bold text-[var(--text-strong)]">{count} txns</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Registrations Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[2px] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 border-b border-[var(--line)] flex items-center justify-between">
          <div>
            <h3 className="t-h3 text-[var(--text-strong)] font-medium">Recent Enrollments</h3>
            <span className="text-xs text-[var(--text-faint)]">Latest 10 registrations recorded</span>
          </div>
          <Link
            href="/admin/registrations"
            className="text-xs font-semibold text-[var(--text-strong)] hover:text-[var(--bronze-text)] underline"
          >
            View All Registrations →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--surface-2)] border-b border-[var(--line)] text-[var(--text-faint)] uppercase tracking-wider text-[0.6875rem]">
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold">Member Code</th>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Tier</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {stats.recent.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-[var(--text-strong)]">
                    {r.reference}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[var(--bronze-text)]">
                    {r.client?.memberCode || '—'}
                  </td>
                  <td className="py-3 px-4 text-[var(--text-strong)] font-medium">
                    {r.client?.fullName || 'Walk-in'}
                  </td>
                  <td className="py-3 px-4">{r.package?.name || 'Standard'}</td>
                  <td className="py-3 px-4 nums font-semibold text-[var(--text-strong)]">
                    {formatINR(r.totalPaise)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[0.625rem] font-bold uppercase tracking-wider border ${
                        r.status === 'CONFIRMED'
                          ? 'border-[var(--success)] text-[var(--success)] bg-[var(--surface)]'
                          : r.status === 'PENDING'
                          ? 'border-[var(--bronze)] text-[var(--bronze-text)] bg-[var(--surface)]'
                          : 'border-[var(--burgundy)] text-[var(--burgundy)] bg-[var(--surface)]'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/registrations/${r.reference}`}
                      className="text-xs font-semibold text-[var(--text-strong)] hover:underline"
                    >
                      Inspect →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
