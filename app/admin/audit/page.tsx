'use client';

import { useEffect, useState } from 'react';

interface AuditLogItem {
  id: string;
  adminId: string | null;
  adminName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Record<string, unknown> | null;
  createdAt: string;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <span className="t-label text-[var(--bronze-text)] uppercase tracking-wider font-semibold">
            Compliance & Security
          </span>
          <h1 className="t-h2 text-[var(--text-strong)] font-semibold mt-1">
            System Activity & Audit Trail ({logs.length})
          </h1>
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[2px] shadow-[var(--shadow-card)] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)] border-b border-[var(--line)] text-[var(--text-faint)] uppercase tracking-wider text-[0.6875rem]">
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Actor / Staff</th>
              <th className="py-3 px-4 font-semibold">Action</th>
              <th className="py-3 px-4 font-semibold">Entity Type</th>
              <th className="py-3 px-4 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[var(--text-faint)]">
                  Loading audit events...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[var(--text-faint)]">
                  No activity logged yet.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                  <td className="py-3 px-4 nums text-[var(--text-faint)] whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString('en-GB')}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[var(--text-strong)]">
                    {l.adminName}
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-[var(--bronze-text)]">
                    {l.action}
                  </td>
                  <td className="py-3 px-4 uppercase text-[0.625rem] font-semibold text-[var(--text-faint)]">
                    {l.entityType}
                  </td>
                  <td className="py-3 px-4 font-mono text-[0.6875rem] text-[var(--text)]">
                    {l.details ? JSON.stringify(l.details) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
