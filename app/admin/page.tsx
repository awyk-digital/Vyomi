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
    return 'Offline Cash (Front Desk)';
  }
  return 'Online Payment (UPI QR)';
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
    if (!confirm(`Confirm cash receipt for registration ${ref}? This will dispatch the Digital VIP Card to member's Gmail.`)) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${ref}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'CASH' }),
      });
      if (res.ok) {
        alert('Cash payment confirmed, membership activated, and Digital VIP Card sent to member Gmail!');
        fetchStats();
      }
    } catch {
      alert('Error updating payment');
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <span className="text-xs text-[#64748B] font-semibold">Loading club operations...</span>
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
            Club Operations
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Performance Overview & Intake
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/v1/admin/registrations/export"
            download
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded-lg text-xs font-bold text-[#0F172A] transition shadow-sm"
          >
            📥 Export CSV
          </a>
          <Link
            href="/register"
            target="_blank"
            className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            + New Membership Intake
          </Link>
        </div>
      </div>

      {/* 4 Essential KPI Cards (High Contrast & Clear) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Verified Monthly Revenue */}
        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider">
              Monthly Revenue
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
              Active Members
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-black text-[#0F172A]">
            {stats.activeMembers}
          </div>
          <span className="text-xs font-semibold text-[#475569] block">
            Patamata Club enrolled
          </span>
        </div>

        {/* Card 3: New Registrations MTD */}
        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider">
              New Intake
            </span>
            <span className="text-[10px] text-[#D97706] font-extrabold">MTD</span>
          </div>
          <div className="text-2xl font-black text-[#0F172A]">
            {stats.newMonth}
          </div>
          <span className="text-xs font-medium text-[#475569] block">
            Today: <strong className="text-[#0F172A] font-bold">+{stats.newToday} members</strong>
          </span>
        </div>

        {/* Card 4: Pending Cash Collections */}
        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-[#334155] uppercase tracking-wider">
              Pending Cash Desk
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-1.5 py-0.5 rounded">
              Action Req.
            </span>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {stats.pendingCount}
          </div>
          <span className="text-xs font-medium text-[#475569] block">
            Awaiting front desk collection
          </span>
        </div>
      </div>

      {/* Recent Member Intake Registry Table */}
      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-sm font-extrabold text-[#0F172A]">
              Recent Client Registrations & Onboarding
            </h2>
            <span className="text-xs font-semibold text-[#334155]">
              Live records synced with Supabase PostgreSQL
            </span>
          </div>
          <Link
            href="/admin/registrations"
            className="text-xs font-extrabold text-[#D97706] hover:underline"
          >
            View Full Registry ({stats.activeMembers + stats.pendingCount}) →
          </Link>
        </div>

        {/* Swipe hint on mobile */}
        <div className="sm:hidden px-3 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold text-[#334155] flex items-center justify-between">
          <span>Swipe sideways to view full record</span>
          <span>↔️</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 font-extrabold">Reference</th>
                <th className="py-3 px-4 font-extrabold">Member Code</th>
                <th className="py-3 px-4 font-extrabold">Client Name</th>
                <th className="py-3 px-4 font-extrabold">Phone</th>
                <th className="py-3 px-4 font-extrabold">Tier</th>
                <th className="py-3 px-4 font-extrabold">Amount</th>
                <th className="py-3 px-4 font-extrabold">Payment Mode</th>
                <th className="py-3 px-4 font-extrabold">Status</th>
                <th className="py-3 px-4 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {stats.recent.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-[#475569] font-medium">
                    No client records yet.
                  </td>
                </tr>
              ) : (
                stats.recent.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#0F172A]">
                      <Link href={`/admin/registrations/${r.reference}`} className="hover:underline">
                        {r.reference}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-[#D97706]">
                      {r.client?.memberCode || (
                        <span className="text-[#64748B] italic font-sans font-normal">Pending</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0F172A]">
                      {r.client?.fullName || 'Valued Member'}
                    </td>
                    <td className="py-3 px-4 text-[#334155] font-semibold">
                      +91 {r.client?.phone}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0F172A]">
                      {r.package?.name || 'Membership'}
                    </td>
                    <td className="py-3 px-4 font-black text-[#0F172A]">
                      {formatINR(r.totalPaise)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#0F172A]">
                        {formatPaymentMethod(r.payment?.method)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                          r.status === 'CONFIRMED'
                            ? 'border-emerald-300 bg-emerald-100 text-emerald-900'
                            : 'border-amber-300 bg-amber-100 text-amber-900'
                        }`}
                      >
                        {r.status === 'CONFIRMED' ? 'PAID' : 'CASH PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/registrations/${r.reference}`}
                          className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded text-[11px] font-bold text-[#0F172A] shadow-sm"
                        >
                          View
                        </Link>
                        {r.status !== 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(r.reference)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-sm"
                          >
                            Mark Paid
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
