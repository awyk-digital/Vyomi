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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
            Compliance & Security
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            System Activity & Audit Trail ({logs.length})
          </h1>
        </div>
      </div>

      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-extrabold">Timestamp</th>
              <th className="py-3 px-4 font-extrabold">Actor / Staff</th>
              <th className="py-3 px-4 font-extrabold">Action</th>
              <th className="py-3 px-4 font-extrabold">Entity Type</th>
              <th className="py-3 px-4 font-extrabold">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#64748B] font-medium">
                  Loading audit events...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#64748B] font-medium">
                  No activity logged yet.
                </td>
              </tr>
            ) : (
              logs.map((l) => (
                <tr key={l.id} className="hover:bg-[#F8FAFC] transition">
                  <td className="py-3 px-4 text-[#475569] whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleString('en-GB')}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#0F172A]">
                    {l.adminName}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#D97706]">
                    {l.action}
                  </td>
                  <td className="py-3 px-4 uppercase text-[10px] font-bold text-[#475569]">
                    {l.entityType}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#1E293B]">
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
