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
    return 'Offline Cash (Front Desk)';
  }
  return 'Online Payment (UPI QR)';
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
    if (!confirm(`Mark offline cash collected for ${ref}? This will activate the membership and email the Digital VIP Card to member's Gmail.`)) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${ref}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'CASH' }),
      });
      if (res.ok) {
        alert('Payment confirmed, membership activated, and Digital VIP Card sent to member Gmail!');
        fetchRegistrations();
      }
    } catch {
      alert('Failed to mark payment');
    }
  };

  const handleRefund = async (id: string, ref: string) => {
    const reason = prompt(`Enter refund justification reason for ${ref}:`);
    if (!reason) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        alert('Refund recorded and registration cancelled.');
        fetchRegistrations();
      } else {
        const d = await res.json();
        alert(d.error?.message || 'Refund failed');
      }
    } catch {
      alert('Failed to refund');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Top Actions - Refined Font Size */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
            Member Registry
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Client Registrations & Access ({totalCount})
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <a
            href={`/api/v1/admin/registrations/export?${statusFilter !== 'ALL' ? `status=${statusFilter}&` : ''}${search ? `q=${encodeURIComponent(search)}` : ''}`}
            download
            className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded-lg text-xs font-bold text-[#0F172A] transition text-center shadow-sm"
          >
            📥 Export CSV
          </a>
          <Link
            href="/register"
            target="_blank"
            className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition text-center shadow-sm"
          >
            + New Membership Intake
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-[#CBD5E1] p-3 sm:p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-1">
          <input
            type="text"
            placeholder="Search by name, phone, email, Member Code, reference..."
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
            <option value="CONFIRMED">CONFIRMED (Active)</option>
            <option value="PENDING_CASH_COLLECTION">PENDING CASH COLLECTION</option>
            <option value="PENDING">PENDING (Awaiting Pay)</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED (Refunded)</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => fetchRegistrations()}
          className="px-3 py-2 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded-lg text-xs font-bold text-[#0F172A] transition w-full sm:w-auto justify-center shadow-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Registrations Table */}
      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        {/* Mobile Swipe Hint */}
        <div className="sm:hidden px-3 py-1.5 bg-[#F8FAFC] border-b border-[#E2E8F0] text-xs font-bold text-[#334155] flex items-center justify-between">
          <span>Swipe sideways to view all columns</span>
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
                <th className="py-3 px-4 font-extrabold">Reg Status</th>
                <th className="py-3 px-4 font-extrabold">Term Validity</th>
                <th className="py-3 px-4 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#475569] font-medium">
                    Loading registrations...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[#475569] font-medium">
                    No matching client records found.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                      <Link href={`/admin/registrations/${r.reference}`} className="hover:underline">
                        {r.reference}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-[#D97706]">
                      {r.client?.memberCode ? (
                        <span className="nums tracking-wider">{r.client.memberCode}</span>
                      ) : (
                        <span className="text-[#64748B] italic font-sans font-normal">Pending Pay</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                      {r.client?.fullName || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-[#334155] font-semibold">
                      <a href={`tel:${r.client?.phone}`} className="hover:underline">
                        +91 {r.client?.phone}
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                      {r.package?.name} ({r.package?.durationDays}d)
                    </td>
                    <td className="py-3.5 px-4 font-black text-[#0F172A]">
                      {formatINR(r.totalPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#0F172A] block">
                        {formatPaymentMethod(r.payment?.method)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                          r.status === 'CONFIRMED'
                            ? 'border-emerald-300 text-emerald-900 bg-emerald-100'
                            : r.status === 'PENDING_CASH_COLLECTION'
                            ? 'border-amber-300 text-amber-900 bg-amber-100'
                            : r.status === 'PENDING'
                            ? 'border-amber-300 text-amber-900 bg-amber-100'
                            : 'border-red-300 text-red-900 bg-red-100'
                        }`}
                      >
                        {r.status === 'PENDING_CASH_COLLECTION' ? 'Cash Pending' : r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-[#334155]">
                      {r.startDate} → {r.endDate || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/registrations/${r.reference}`}
                          className="px-2.5 py-1 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded text-[11px] font-bold text-[#0F172A] shadow-sm"
                        >
                          View
                        </Link>
                        {(r.status === 'PENDING' || r.status === 'PENDING_CASH_COLLECTION') && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(r.reference)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-sm"
                          >
                            Mark Paid
                          </button>
                        )}
                        {r.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => handleRefund(r.id, r.reference)}
                            className="px-2.5 py-1 text-red-700 bg-red-50 border border-red-200 rounded text-[11px] font-bold"
                          >
                            Refund
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

        {/* Pagination Bar */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs">
          <span className="text-[#334155] font-semibold">
            Page {page} of {totalPages} ({totalCount} total entries)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded text-xs font-bold text-[#0F172A] disabled:opacity-40 shadow-sm"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded text-xs font-bold text-[#0F172A] disabled:opacity-40 shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
