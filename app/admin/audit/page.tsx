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

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-5">
      <PageHeader title="Activity log" subtitle="Who did what, newest first. Updates automatically." />

      <section className="rounded-2xl bg-white ring-1 ring-[#E3E8F2] overflow-hidden">
        {loading ? (
          <p className="px-5 py-12 text-center text-sm text-[#64748B]">Loading activity…</p>
        ) : logs.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-[#64748B]">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[#EEF1F6]">
            {logs.map((l) => (
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
