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
  recent: Array<{
    id: string;
    reference: string;
    totalPaise: number;
    status: string;
    createdAt: string;
    preferredSlot?: string;
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

function formatPaymentMethod(method?: string): string {
  const m = (method || '').toUpperCase();
  if (m === 'CASH' || m === 'OFFLINE' || m === 'POS') {
    return 'Front Desk Settlement (Cash)';
  }
  return 'Instant UPI Settlement (QR)';
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    fetch('/api/v1/admin/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
      })
      .catch((err) => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleMarkPaid = async (ref: string) => {
    if (!confirm(`Confirm front desk cash clearance for registration ${ref}? This will activate membership and dispatch the official Digital VIP Card to member's Gmail.`)) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${ref}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'CASH' }),
      });
      if (res.ok) {
        alert('Front desk payment settled, membership activated, and Digital VIP Card sent to member Gmail!');
        fetchStats();
      }
    } catch {
      alert('Error updating payment');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <span className="text-xs text-[#64748B] font-semibold">Loading live operational telemetry from Supabase...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="py-12 text-center text-xs text-red-600 font-bold">
        Could not load dashboard telemetry.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header - Refined Font Size */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold tracking-widest text-[#D97706] uppercase block">
            Executive Operations Telemetry
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Club Performance & Member Intake
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/v1/admin/registrations/export"
            download
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded-lg text-xs font-bold text-[#0F172A] transition shadow-sm"
          >
            📥 Export Registry CSV
          </a>
          <Link
            href="/register"
            target="_blank"
            className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            + New Member Enrollment
          </Link>
        </div>
      </div>

      {/* 4 Essential KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Verified Monthly Revenue */}
        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider">
              Monthly Settled Revenue
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A]">
            {formatINR(stats.revenueMonthPaise)}
          </div>
          <span className="text-xs font-medium text-[#475569] block">
            Today: <strong className="text-[#0F172A] font-bold">{formatINR(stats.revenueTodayPaise)}</strong>
          </span>
        </div>

        {/* Card 2: Active Memberships */}
        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider">
              Active Memberships
            </span>
            <span className="text-[10px] bg-sky-100 text-sky-900 border border-sky-300 font-extrabold px-1.5 py-0.5 rounded">
              Valid
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A]">
            {stats.activeMembers}
          </div>
          <span className="text-xs font-medium text-[#475569] block">
            Certified active access privileges
          </span>
        </div>

        {/* Card 3: New Enrollees */}
        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider">
              New Enrollees
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded">
              MTD
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A]">
            {stats.newMonth}
          </div>
          <span className="text-xs font-medium text-[#475569] block">
            Today: <strong className="text-[#0F172A] font-bold">+{stats.newToday}</strong> enrollees
          </span>
        </div>

        {/* Card 4: Action Required */}
        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider">
              Front Desk Settlements
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded">
              Action
            </span>
          </div>
          <div className="text-2xl font-black text-[#D97706]">
            {stats.pendingCount}
          </div>
          <span className="text-xs font-medium text-[#475569] block">
            Awaiting desk cash clearance
          </span>
        </div>
      </div>

      {/* Quick Action Bar for Staff */}
      <div className="bg-white border-2 border-[#CBD5E1] p-3.5 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-[#0F172A]">Reception Terminal Active</span>
          <span className="text-[#64748B]">· Sonovision Plaza, Patamata</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/registrations?status=PENDING_CASH_COLLECTION"
            className="px-3 py-1.5 bg-[#FFFBEB] border border-[#FDE68A] text-[#D97706] font-bold rounded-lg hover:bg-[#FEF3C7] transition"
          >
            Review Pending Cash ({stats.pendingCount}) →
          </Link>
          <Link
            href="/admin/payments"
            className="px-3 py-1.5 bg-[#F8FAFC] border border-[#CBD5E1] text-[#334155] font-bold rounded-lg hover:bg-[#F1F5F9] transition"
          >
            Settlement Ledger →
          </Link>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div>
            <h2 className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
              Recent Member Intakes
            </h2>
            <p className="text-xs text-[#475569] font-medium mt-0.5">
              Live registration records synced from Supabase
            </p>
          </div>
          <Link
            href="/admin/registrations"
            className="text-xs font-bold text-[#D97706] hover:underline"
          >
            View Full Registry →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-xs">
                <th className="py-3 px-4 font-black w-32 whitespace-nowrap">Reference ID</th>
                <th className="py-3 px-4 font-black w-36 whitespace-nowrap">Member Code</th>
                <th className="py-3 px-4 font-black min-w-[140px]">Member Name</th>
                <th className="py-3 px-4 font-black w-36 whitespace-nowrap">Contact</th>
                <th className="py-3 px-4 font-black w-40 whitespace-nowrap">Membership Tier</th>
                <th className="py-3 px-4 font-black w-32 whitespace-nowrap">Amount</th>
                <th className="py-3 px-4 font-black min-w-[180px]">Settlement Channel</th>
                <th className="py-3 px-4 font-black min-w-[160px]">Clearance Status</th>
                <th className="py-3 px-4 font-black w-44 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {stats.recent.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#0F172A] font-bold">
                    No client records yet.
                  </td>
                </tr>
              ) : (
                stats.recent.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F172A] w-32 whitespace-nowrap">
                      <Link href={`/admin/registrations/${r.reference}`} className="hover:underline text-[#0F172A]">
                        {r.reference}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-[#D97706] w-36 whitespace-nowrap">
                      {r.client?.memberCode || (
                        <span className="text-[#334155] font-semibold">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#0F172A] min-w-[140px]">
                      {r.client?.fullName || 'Valued Member'}
                    </td>
                    <td className="py-3 px-4 text-[#0F172A] font-bold w-36 whitespace-nowrap">
                      +91 {r.client?.phone}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-[#0F172A] w-40 whitespace-nowrap">
                      {r.package?.name || 'Membership'}
                    </td>
                    <td className="py-3 px-4 font-black text-[#0F172A] w-32 whitespace-nowrap">
                      {formatINR(r.totalPaise)}
                    </td>
                    <td className="py-3 px-4 min-w-[180px]">
                      <span className="font-extrabold text-[#0F172A] block">
                        {formatPaymentMethod(r.payment?.method)}
                      </span>
                    </td>
                    <td className="py-3 px-4 min-w-[160px]">
                      <span
                        className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border ${
                          r.status === 'CONFIRMED'
                            ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                            : 'border-amber-300 bg-amber-100 text-amber-900'
                        }`}
                      >
                        {r.status === 'CONFIRMED' ? 'SETTLED & ACTIVE' : 'AWAITING CASH'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center w-44 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/registrations/${r.reference}`}
                          className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded text-xs font-extrabold text-[#0F172A] shadow-sm transition"
                        >
                          Dossier
                        </Link>
                        {r.status !== 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(r.reference)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-extrabold shadow-sm whitespace-nowrap transition"
                          >
                            Clear Cash ✓
                          </button>
                        )}
                      </div>
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
