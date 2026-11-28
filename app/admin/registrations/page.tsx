'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
  MemberAvatar,
} from '@/components/admin/ui';

interface RegistrationItem {
  id: string;
  reference: string;
  totalPaise: number;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  photoUrl?: string | null;
  client?: { fullName: string; phone: string; email: string; memberCode: string | null };
  package?: { name: string; durationDays: number };
  payment?: { method: string; status: string };
}

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Cash due' },
  { key: 'CONFIRMED', label: 'Paid' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

function MembersInner() {
  const params = useSearchParams();
  const initial = params.get('status') === 'PENDING_CASH_COLLECTION' ? 'PENDING' : params.get('status') || 'ALL';

  const [items, setItems] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(FILTERS.some((f) => f.key === initial) ? initial : 'ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [busyRef, setBusyRef] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; tone: 'ok' | 'error' } | null>(null);

  // Debounce typing so search runs as you type without hammering the server
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchRegistrations = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const q = new URLSearchParams({
        page: String(page),
        pageSize: '15',
        ...(query && { q: query }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
      });
      const res = await fetch(`/api/v1/admin/registrations?${q}`, { cache: 'no-store' });
      if (res.status === 401) {
        window.location.replace('/admin/login?next=/admin/registrations');
        return;
      }
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch {
      if (!quiet) setToast({ msg: 'Could not load members. Check the connection.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, query, statusFilter]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);
  useAutoRefresh(() => fetchRegistrations(true), 20000);

  const handleMarkPaid = async (r: RegistrationItem) => {
    setBusyRef(r.reference);
    const err = await markCashPaid(r.reference, r.client?.fullName, formatINR(r.totalPaise));
    setBusyRef(null);
    if (err === 'cancelled') return;
    if (err) setToast({ msg: err, tone: 'error' });
    else {
      setToast({ msg: `Marked as paid. Receipt emailed to ${r.client?.fullName || 'the member'}.`, tone: 'ok' });
      fetchRegistrations(true);
    }
  };

  const exportHref = `/api/v1/admin/registrations/export?${new URLSearchParams({
    ...(statusFilter !== 'ALL' && { status: statusFilter }),
    ...(query && { q: query }),
  })}`;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Members"
        subtitle={`${totalCount} ${totalCount === 1 ? 'registration' : 'registrations'}`}
        action={
          <div className="flex gap-2">
            <a href={exportHref} className="h-10 px-4 inline-flex items-center rounded-xl text-sm font-medium text-[#1E3A8A] bg-white ring-1 ring-[#C7D4F5] hover:ring-[#1E3A8A] transition">
              Download CSV
            </a>
            <Link href="/admin/registrations/new" className="h-10 px-4 inline-flex items-center rounded-xl text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] transition">
              + New walk-in
            </Link>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl bg-white ring-1 ring-[#E3E8F2] p-1 w-fit">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setStatusFilter(f.key);
                setPage(1);
              }}
              className={`h-8 px-3.5 rounded-lg text-sm transition-colors ${
                statusFilter === f.key ? 'bg-[#1E3A8A] text-white' : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, email or member ID"
          className="h-10 w-full sm:w-80 rounded-xl bg-white ring-1 ring-[#E3E8F2] px-3.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/30"
        />
      </div>

      <section className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] overflow-hidden">
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-[#64748B]">Loading members…</p>
        ) : items.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-[#64748B]">
            {query ? `No members match “${query}”.` : 'No members in this list.'}
          </p>
        ) : (
          <>
            <table className="hidden md:table w-full text-sm table-fixed">
              <thead>
                <tr className="text-left text-xs text-[#64748B] border-b border-[#EEF1F6]">
                  <th className="py-3 pl-5 pr-3 font-medium w-[28%]">Member</th>
                  <th className="py-3 px-3 font-medium">Plan</th>
                  <th className="py-3 px-3 font-medium w-[11%]">Amount</th>
                  <th className="py-3 px-3 font-medium w-[9%]">Payment</th>
                  <th className="py-3 px-3 font-medium w-[12%]">Status</th>
                  <th className="py-3 px-3 font-medium w-[11%]">Joined</th>
                  <th className="py-3 pl-3 pr-5 font-medium w-[17%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F6]">
                {items.map((r) => (
                  <tr key={r.id} className="hover:bg-[#F8FAFE] transition-colors">
                    <td className="py-3 pl-5 pr-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <MemberAvatar url={r.photoUrl} name={r.client?.fullName} />
                        <div className="min-w-0">
                          <span className="block font-medium text-[#0F172A] truncate">{r.client?.fullName || 'Member'}</span>
                          <span className="block text-xs text-[#64748B] truncate">{r.client?.memberCode || r.reference} · +91 {r.client?.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#334155] truncate">{r.package?.name || '—'}</td>
                    <td className="py-3 px-3 font-medium text-[#0F172A]">{formatINR(r.totalPaise)}</td>
                    <td className="py-3 px-3 text-[#334155]">{paymentLabel(r.payment?.method)}</td>
                    <td className="py-3 px-3"><StatusBadge status={r.status} /></td>
                    <td className="py-3 px-3 text-[#64748B] whitespace-nowrap">{formatDate(r.createdAt)}</td>
                    <td className="py-3 pl-3 pr-5">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/registrations/${r.reference}`}
                          className="h-8 px-3 inline-flex items-center rounded-lg text-sm text-[#334155] ring-1 ring-[#E2E8F0] hover:ring-[#94A3B8] transition"
                        >
                          View
                        </Link>
                        {isCashDue(r.status) && (
                          <button
                            type="button"
                            disabled={busyRef === r.reference}
                            onClick={() => handleMarkPaid(r)}
                            className="h-8 px-3 inline-flex items-center rounded-lg text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#172F73] disabled:opacity-60 transition whitespace-nowrap"
                          >
                            {busyRef === r.reference ? 'Saving…' : 'Mark paid'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="md:hidden divide-y divide-[#EEF1F6]">
              {items.map((r) => (
                <li key={r.id} className="px-4 py-3 space-y-2">
                  <Link href={`/admin/registrations/${r.reference}`} className="flex items-center gap-3">
                    <MemberAvatar url={r.photoUrl} name={r.client?.fullName} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#0F172A] truncate">{r.client?.fullName || 'Member'}</p>
                      <p className="text-xs text-[#64748B] truncate">{r.package?.name} · {formatINR(r.totalPaise)} · {paymentLabel(r.payment?.method)}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </Link>
                  {isCashDue(r.status) && (
                    <button
                      type="button"
                      disabled={busyRef === r.reference}
                      onClick={() => handleMarkPaid(r)}
                      className="w-full h-9 rounded-lg text-sm font-medium text-white bg-[#1E3A8A] disabled:opacity-60"
                    >
                      {busyRef === r.reference ? 'Saving…' : 'Mark paid'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#64748B]">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-9 px-3.5 rounded-lg ring-1 ring-[#E2E8F0] bg-white disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-9 px-3.5 rounded-lg ring-1 ring-[#E2E8F0] bg-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function AdminRegistrationsPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-sm text-[#64748B]">Loading members…</p>}>
      <MembersInner />
    </Suspense>
  );
}
