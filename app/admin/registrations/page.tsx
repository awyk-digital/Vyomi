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
    if (!confirm(`Mark offline cash/terminal payment for ${ref} and activate membership?`)) return;
    try {
      const res = await fetch(`/api/v1/admin/registrations/${ref}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'POS' }),
      });
      if (res.ok) {
        alert('Payment verified and membership activated.');
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
      {/* Page Title & Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <span className="t-label text-[var(--bronze-text)] uppercase tracking-wider font-semibold">
            Member Registry
          </span>
          <h1 className="t-h2 text-[var(--text-strong)] font-semibold mt-1">
            Client Registrations & Access ({totalCount})
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/v1/admin/registrations/export?${statusFilter !== 'ALL' ? `status=${statusFilter}&` : ''}${search ? `q=${encodeURIComponent(search)}` : ''}`}
            download
            className="btn-line-light !h-9 !px-3.5 !text-xs"
          >
            📥 Export Filtered CSV
          </a>
          <Link
            href="/admin/registrations/new"
            className="btn-solid-light !h-9 !px-4 !text-xs"
          >
            + New Walk-in Registration
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface)] border border-[var(--line)] p-4 rounded-[2px] shadow-[var(--shadow-card)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <input
            type="text"
            placeholder="Search by name, phone, email, Member Code, reference..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="light-input !h-9 text-xs flex-1 min-w-[240px]"
          />

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="light-input !h-9 text-xs !w-auto"
          >
            <option value="ALL">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED (Active)</option>
            <option value="PENDING">PENDING (Awaiting Pay)</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED (Refunded)</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => fetchRegistrations()}
          className="btn-line-light !h-9 !px-3 text-xs"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Registrations Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[2px] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--surface-2)] border-b border-[var(--line)] text-[var(--text-faint)] uppercase tracking-wider text-[0.6875rem]">
                <th className="py-3 px-4 font-semibold">Reference</th>
                <th className="py-3 px-4 font-semibold">Member Code</th>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Tier</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Reg Status</th>
                <th className="py-3 px-4 font-semibold">Term Validity</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[var(--text-faint)]">
                    Loading registrations...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-[var(--text-faint)]">
                    No matching client records found.
                  </td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-[var(--text-strong)]">
                      <Link href={`/admin/registrations/${r.reference}`} className="hover:underline">
                        {r.reference}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--bronze-text)]">
                      {r.client?.memberCode ? (
                        <span className="nums tracking-wider">{r.client.memberCode}</span>
                      ) : (
                        <span className="text-[var(--text-faint)] italic">Pending Pay</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[var(--text-strong)]">
                      {r.client?.fullName || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 nums text-[var(--text)]">
                      <a href={`tel:${r.client?.phone}`} className="hover:underline">
                        +91 {r.client?.phone}
                      </a>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.package?.name} ({r.package?.durationDays}d)
                    </td>
                    <td className="py-3.5 px-4 nums font-semibold text-[var(--text-strong)]">
                      {formatINR(r.totalPaise)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[0.6875rem] font-medium text-[var(--text-strong)] block">
                        {r.payment?.method || 'N/A'}
                      </span>
                      <span className="text-[0.625rem] text-[var(--text-faint)]">
                        {r.payment?.status || 'CREATED'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-[0.6875rem] nums text-[var(--text-faint)]">
                      {r.startDate} → {r.endDate || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/registrations/${r.reference}`}
                          className="px-2 py-1 border border-[var(--line-2)] rounded hover:border-[var(--text-strong)] font-medium text-[0.6875rem]"
                        >
                          View
                        </Link>
                        <Link
                          href={`/admin/registrations/${r.reference}/edit`}
                          className="px-2 py-1 border border-[#D4AF37]/40 text-[#D4AF37] rounded hover:bg-[#D4AF37]/10 font-medium text-[0.6875rem]"
                          title="Correct Member Details"
                        >
                          ✏️ Edit
                        </Link>
                        {r.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(r.reference)}
                            className="px-2 py-1 bg-[var(--success)] text-white rounded font-medium text-[0.6875rem] hover:opacity-90"
                          >
                            Mark Paid
                          </button>
                        )}
                        {r.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => handleRefund(r.id, r.reference)}
                            className="px-2 py-1 text-[var(--burgundy)] border border-[var(--burgundy)]/40 rounded hover:bg-[var(--burgundy-wash)] font-medium text-[0.6875rem]"
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
        <div className="p-4 border-t border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-between text-xs">
          <span className="text-[var(--text-faint)]">
            Page {page} of {totalPages} ({totalCount} total entries)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-line-light !h-7 !px-2.5 !text-xs disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="btn-line-light !h-7 !px-2.5 !text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
