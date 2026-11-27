'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface RegistrationItem {
  id: string;
  reference: string;
  pricePaise: number;
  totalPaise: number;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  client?: {
    fullName: string;
    phone: string;
    email: string;
    memberCode: string | null;
  };
  package?: {
    name: string;
    durationDays: number;
  };
  payment?: {
    method: string;
    status: string;
    razorpayPaymentId: string | null;
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

function formatStatus(status: string): { label: string; className: string } {
  if (status === 'CONFIRMED') {
    return {
      label: 'Active Member (Confirmed)',
      className: 'border-emerald-300 text-emerald-900 bg-emerald-100',
    };
  }
  if (status === 'PENDING_CASH_COLLECTION') {
    return {
      label: 'Awaiting Front Desk Settlement',
      className: 'border-amber-300 text-amber-900 bg-amber-100',
    };
  }
  if (status === 'PENDING') {
    return {
      label: 'Settlement Processing',
      className: 'border-amber-300 text-amber-900 bg-amber-100',
    };
  }
  if (status === 'CANCELLED') {
    return {
      label: 'Membership Terminated',
      className: 'border-red-300 text-red-900 bg-red-100',
    };
  }
  if (status === 'EXPIRED') {
    return {
      label: 'Membership Expired',
      className: 'border-[#CBD5E1] text-[#475569] bg-[#F1F5F9]',
    };
  }
  return {
    label: status,
    className: 'border-[#CBD5E1] text-[#0F172A] bg-[#F8FAFC]',
  };
}

export default function AdminRegistrationsPage() {
  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        page: page.toString(),
        pageSize: '15',
        ...(search.trim() && { q: search.trim() }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      });
      const res = await fetch(`/api/v1/admin/registrations?${q}`);
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleMarkPaid = async (ref: string) => {
    if (!confirm(`Confirm front desk cash clearance for registration ${ref}? This will activate the membership and email the official Digital VIP Card to member's Gmail.`)) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${ref}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'CASH' }),
      });
      if (res.ok) {
        alert('Front desk payment settled, membership activated, and Digital VIP Card sent to member Gmail!');
        fetchRegistrations();
      } else {
        const d = await res.json();
        alert(d.error?.message || 'Failed to settle front desk payment');
      }
    } catch {
      alert('Failed to settle payment');
    }
  };

  const handleRefund = async (id: string, ref: string) => {
    const reason = prompt(`Enter authorized termination / refund justification for ${ref}:`);
    if (!reason) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        alert('Membership termination recorded.');
        fetchRegistrations();
      } else {
        const d = await res.json();
        alert(d.error?.message || 'Refund failed');
      }
    } catch {
      alert('Failed to process termination');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
            Member Operations & Registry
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Certified Member Intake Records ({totalCount})
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href={`/api/v1/admin/registrations/export?${statusFilter !== 'ALL' ? `status=${statusFilter}&` : ''}${search ? `q=${encodeURIComponent(search)}` : ''}`}
            download
            className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded-lg text-xs font-bold text-[#0F172A] transition text-center shadow-sm"
          >
            📥 Export Registry CSV
          </a>
          <Link
            href="/register"
            target="_blank"
            className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition text-center shadow-sm"
          >
            + New Member Enrollment
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-[#CBD5E1] p-3 sm:p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
          <input
            type="text"
            placeholder="Search by member name, phone, email, Member Code, reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-white border-2 border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-semibold text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] flex-1 min-w-0"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-white border-2 border-[#CBD5E1] rounded-lg px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706] w-full sm:w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">Active Members (Confirmed)</option>
            <option value="PENDING_CASH_COLLECTION">Awaiting Front Desk Settlement</option>
            <option value="PENDING">Settlement Processing</option>
            <option value="CANCELLED">Terminated / Refunded</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => fetchRegistrations()}
          className="px-3.5 py-2 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded-lg text-xs font-bold text-[#0F172A] transition w-full sm:w-auto justify-center shadow-sm"
        >
          🔄 Synchronize Registry
        </button>
      </div>

      {/* Registrations Table */}
      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        {/* Mobile Swipe Hint */}
        <div className="sm:hidden px-3 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold text-[#334155] flex items-center justify-between">
          <span>Swipe sideways to view full record</span>
          <span>↔️</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-xs">
                <th className="py-3 px-4 font-black w-32 whitespace-nowrap">Reference ID</th>
                <th className="py-3 px-4 font-black w-36 whitespace-nowrap">Member Code</th>
                <th className="py-3 px-4 font-black min-w-[140px]">Member Name</th>
                <th className="py-3 px-4 font-black w-36 whitespace-nowrap">Mobile Contact</th>
                <th className="py-3 px-4 font-black w-40 whitespace-nowrap">Membership Tier</th>
                <th className="py-3 px-4 font-black w-32 whitespace-nowrap">Settlement Amount</th>
                <th className="py-3 px-4 font-black min-w-[180px]">Settlement Channel</th>
                <th className="py-3 px-4 font-black min-w-[170px]">Operational Status</th>
                <th className="py-3 px-4 font-black w-36 whitespace-nowrap">Term Validity</th>
                <th className="py-3 px-4 font-black w-48 text-center whitespace-nowrap">Concierge Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#0F172A] font-bold">
                    Synchronizing live member registry from Supabase...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#0F172A] font-bold">
                    No matching member enrollment records found.
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const statusInfo = formatStatus(r.status);
                  return (
                    <tr key={r.id} className="hover:bg-[#F8FAFC] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A] w-32 whitespace-nowrap">
                        <Link href={`/admin/registrations/${r.reference}`} className="hover:underline text-[#0F172A]">
                          {r.reference}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-black text-[#D97706] w-36 whitespace-nowrap">
                        {r.client?.memberCode ? (
                          <span className="nums tracking-wider">{r.client.memberCode}</span>
                        ) : (
                          <span className="text-[#334155] font-semibold">Pending Settlement</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#0F172A] min-w-[140px]">
                        {r.client?.fullName || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-[#0F172A] font-bold w-36 whitespace-nowrap">
                        <a href={`tel:${r.client?.phone}`} className="hover:underline">
                          +91 {r.client?.phone}
                        </a>
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#0F172A] w-40 whitespace-nowrap">
                        {r.package?.name} ({r.package?.durationDays}d)
                      </td>
                      <td className="py-3.5 px-4 font-black text-[#0F172A] w-32 whitespace-nowrap">
                        {formatINR(r.totalPaise)}
                      </td>
                      <td className="py-3.5 px-4 min-w-[180px]">
                        <span className="font-extrabold text-[#0F172A] block">
                          {formatPaymentMethod(r.payment?.method)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[170px]">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider border ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-[#0F172A] w-36 whitespace-nowrap">
                        {r.startDate} → {r.endDate || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-center w-48 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/registrations/${r.reference}`}
                            className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded text-xs font-extrabold text-[#0F172A] shadow-sm transition"
                          >
                            Dossier
                          </Link>
                          {(r.status === 'PENDING' || r.status === 'PENDING_CASH_COLLECTION') && (
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(r.reference)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-extrabold shadow-sm whitespace-nowrap transition"
                            >
                              Clear Cash ✓
                            </button>
                          )}
                          {r.status === 'CONFIRMED' && (
                            <button
                              type="button"
                              onClick={() => handleRefund(r.id, r.reference)}
                              className="px-3 py-1.5 text-red-800 bg-red-100 border border-red-300 rounded text-xs font-extrabold transition"
                            >
                              Terminate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs">
          <span className="text-[#334155] font-semibold">
            Registry Page {page} of {totalPages} ({totalCount} total entries)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-bold text-[#0F172A] disabled:opacity-40"
            >
              ← Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white border border-[#CBD5E1] rounded text-xs font-bold text-[#0F172A] disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
