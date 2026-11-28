'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatINR, PageHeader, useAutoRefresh } from '@/components/admin/ui';

interface AuditLogItem {
  id: string;
  adminName: string;
  adminRole?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

const str = (v: unknown) => (v === undefined || v === null ? '' : String(v));
const money = (v: unknown) => (v === undefined || v === null || v === '' ? '' : formatINR(Number(v) * 100));

/** Turn a raw log entry into one plain sentence. */
function describe(l: AuditLogItem): string {
  const d = l.details || {};
  switch (l.action) {
    case 'SIGNED_IN':
      return 'Signed in';
    case 'SIGNED_OUT':
      return 'Signed out';
    case 'MEMBER_REGISTERED':
      return `Registered ${str(d.member)} · ${str(d.plan)} · ${money(d.amountInr)} (${str(d.payment) === 'CASH' ? 'cash due' : 'UPI'})`;
    case 'CASH_COLLECTED':
      return `Collected cash ${money(d.amountInr)} · ${l.entityId}`;
    case 'MEMBERSHIP_CANCELLED':
      return `Cancelled membership ${l.entityId}${d.reason ? ` · “${str(d.reason)}”` : ''}`;
    case 'MEMBER_UPDATED':
      return `Edited member details · ${l.entityId}`;
    case 'NOTES_UPDATED':
      return `Updated desk notes · ${l.entityId}`;
    case 'PLAN_UPDATED':
      return `Changed plan “${str(d.plan)}”${d.price_inr ? ` · price ${money(d.price_inr)}` : ''}${d.is_active === false ? ' · hidden' : d.is_active === true ? ' · shown' : ''}`;
    case 'EXPORTED_CSV':
      return `Downloaded CSV (${str(d.count)} rows)`;
    default:
      return `${l.action.replace(/_/g, ' ').toLowerCase()}${l.entityId ? ` · ${l.entityId}` : ''}`;
  }
}

const ROLE: Record<string, string> = { SUPER_ADMIN: 'Super Admin', MANAGER: 'Manager', FRONT_DESK: 'Front desk' };

function toISTDateString(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
  } catch {
    return '';
  }
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const load = useCallback(() => {
    fetch('/api/v1/admin/audit-logs', { cache: 'no-store' })
      .then((r) => (r.status === 401 ? (window.location.replace('/admin/login?next=/admin/audit'), null) : r.json()))
      .then((d) => d?.logs && setLogs(d.logs))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useAutoRefresh(load, 30000);

  const filteredLogs = selectedDate
    ? logs.filter((l) => toISTDateString(l.createdAt) === selectedDate)
    : logs;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Activity log"
        subtitle="Who did what, newest first. Updates automatically."
        action={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative inline-flex items-center">
              <div className="absolute left-3 pointer-events-none text-[#64748B]">
                <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="14" height="13" rx="2" />
                  <path d="M3 8h14M7 2v3M13 2v3" />
                </svg>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-label="Filter logs by date"
                title="Filter logs by date"
                className="pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-[#CBD5E1] rounded-xl text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/15 focus:border-[#1E3A8A] transition shadow-xs cursor-pointer"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate('')}
              disabled={!selectedDate}
              title="Reset date filter"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-xl border transition shadow-xs ${
                selectedDate
                  ? 'bg-white border-[#CBD5E1] text-[#0F172A] hover:bg-[#F8FAFC] hover:border-[#94A3B8] cursor-pointer'
                  : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed opacity-60'
              }`}
            >
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 8a5.5 5.5 0 1 1 9.4 3.9M14 8h-3.5m0 0V4.5" />
              </svg>
              <span>Reset</span>
            </button>
          </div>
        }
      />

      <section className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] overflow-hidden">
        {selectedDate && (
          <div className="flex items-center justify-between px-5 py-2.5 bg-[#F5F8FF] border-b border-[#E3E8F2] text-xs text-[#1E3A8A]">
            <div className="flex items-center gap-1.5 font-medium">
              <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="12" height="11" rx="1.5" />
                <path d="M2 6h12M5 1.5v3M11 1.5v3" />
              </svg>
              <span>
                Filtered for{' '}
                <strong>
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </strong>{' '}
                ({filteredLogs.length} {filteredLogs.length === 1 ? 'event' : 'events'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDate('')}
              className="text-[#1E3A8A] font-semibold hover:underline text-xs"
            >
              Clear filter
            </button>
          </div>
        )}

        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-[#64748B]">Loading activity…</p>
        ) : filteredLogs.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-[#64748B] space-y-2">
            <p>{selectedDate ? `No activity recorded on ${selectedDate}.` : 'No activity recorded yet.'}</p>
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className="text-xs text-[#1E3A8A] font-semibold hover:underline"
              >
                Reset date filter
              </button>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-[#EEF1F6]">
            {filteredLogs.map((l) => (
              <li key={l.id} className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6">
                <span className="text-sm text-[#64748B] sm:w-44 shrink-0 whitespace-nowrap">
                  {new Date(l.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Asia/Kolkata',
                  })}
                </span>
                <span className="sm:w-48 shrink-0">
                  <span className="text-sm font-medium text-[#0F172A]">{l.adminName}</span>
                  {l.adminRole && <span className="text-xs text-[#94A3B8]"> · {ROLE[l.adminRole] || l.adminRole}</span>}
                </span>
                <span className="text-sm text-[#334155] min-w-0 break-words">{describe(l)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
