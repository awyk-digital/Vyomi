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

  const fetchLogs = () => {
    setLoading(true);
    fetch('/api/v1/admin/audit-logs')
      .then((res) => res.json())
      .then((data) => {
        if (data.logs) setLogs(data.logs);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
            Compliance & Access Security
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Security Operations & Access Audit Trail ({logs.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded-lg text-xs font-bold text-[#0F172A] transition shadow-sm"
        >
          🔄 Refresh Activity
        </button>
      </div>

      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F1F5F9] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-xs">
                <th className="py-3 px-4 font-black w-48 whitespace-nowrap">Timestamp (IST)</th>
                <th className="py-3 px-4 font-black w-44 whitespace-nowrap">Authorized Personnel</th>
                <th className="py-3 px-4 font-black w-44 whitespace-nowrap">Security Event</th>
                <th className="py-3 px-4 font-black w-40 whitespace-nowrap">Scope / Entity</th>
                <th className="py-3 px-4 font-black min-w-[200px]">Operational Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#0F172A] font-bold">
                    Loading security event trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#0F172A] font-bold">
                    No activity recorded in security ledger.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3.5 px-4 text-[#0F172A] whitespace-nowrap font-mono text-xs font-bold w-48">
                      {new Date(l.createdAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'medium',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#0F172A] w-44 whitespace-nowrap">
                      {l.adminName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-[#D97706] text-xs w-44 whitespace-nowrap">
                      {l.action}
                    </td>
                    <td className="py-3.5 px-4 uppercase text-xs font-black text-[#0F172A] w-40 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-[#F1F5F9] border border-[#CBD5E1]">
                        {l.entityType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-[#0F172A] font-bold min-w-[200px]">
                      {l.details ? (
                        <div className="space-y-0.5">
                          {Object.entries(l.details).map(([key, value]) => (
                            <span key={key} className="inline-block mr-3">
                              <span className="text-[#334155] font-extrabold">{key}:</span>{' '}
                              <span className="text-[#0F172A] font-black">{String(value)}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        '—'
                      )}
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
