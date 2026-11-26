'use client';

import { useEffect, useState } from 'react';

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'FRONT_DESK';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

function getRoleMeta(role: string): { label: string; badge: string; duties: string } {
  switch (role) {
    case 'SUPER_ADMIN':
      return {
        label: 'Super Administrator',
        badge: 'border-purple-300 text-purple-900 bg-purple-100',
        duties: 'Full System Privileges, Security Audits & Account Provisioning',
      };
    case 'MANAGER':
      return {
        label: 'Operations Manager',
        badge: 'border-blue-300 text-blue-900 bg-blue-100',
        duties: 'Registry Intake, Package Governance & Settlement Reconciliation',
      };
    case 'FRONT_DESK':
      return {
        label: 'Front Desk Concierge',
        badge: 'border-amber-300 text-amber-900 bg-amber-100',
        duties: 'Walk-in Member Intake, Cash Settlements & Card Dispatch',
      };
    default:
      return {
        label: role,
        badge: 'border-slate-300 text-slate-900 bg-slate-100',
        duties: 'General Club Operations',
      };
  }
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'MANAGER' | 'FRONT_DESK'>('FRONT_DESK');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const fetchStaff = () => {
    fetch('/api/v1/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data.admins) setStaff(data.admins);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'Failed to provision staff account');
      } else {
        setShowAdd(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchStaff();
      }
    } catch {
      setError('Connection failure');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <div>
          <span className="text-[11px] font-extrabold text-[#D97706] uppercase tracking-wider block">
            Access Governance & RBAC
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Personnel Directory & Concierge Accounts ({staff.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition shadow-sm"
        >
          {showAdd ? 'Cancel Provisioning' : '+ Provision Personnel Account'}
        </button>
      </div>

      {/* Role Responsibilities Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-purple-300 text-purple-900 bg-purple-100">
            Tier 1: Super Admin
          </span>
          <h3 className="font-extrabold text-[#0F172A] text-sm mt-1">Executive Administration</h3>
          <p className="text-[#475569] font-medium leading-relaxed">
            Full governance, security audit oversight, financial refund clearance, and staff account management.
          </p>
          <span className="text-[11px] font-mono text-[#D97706] font-bold block pt-1">
            Account: admin@vyomi.com
          </span>
        </div>

        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-blue-300 text-blue-900 bg-blue-100">
            Tier 2: Operations Manager
          </span>
          <h3 className="font-extrabold text-[#0F172A] text-sm mt-1">Club Management</h3>
          <p className="text-[#475569] font-medium leading-relaxed">
            Member registration reviews, package configuration, cash approvals, and daily executive telemetry.
          </p>
          <span className="text-[11px] font-mono text-[#D97706] font-bold block pt-1">
            Account: manager@vyomi.com
          </span>
        </div>

        <div className="bg-white border-2 border-[#CBD5E1] p-4 rounded-xl shadow-sm space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-amber-300 text-amber-900 bg-amber-100">
            Tier 3: Front Desk
          </span>
          <h3 className="font-extrabold text-[#0F172A] text-sm mt-1">Counter Concierge</h3>
          <p className="text-[#475569] font-medium leading-relaxed">
            Walk-in member enrollment, counter cash settlements, badge assignment, and digital VIP card delivery.
          </p>
          <span className="text-[11px] font-mono text-[#D97706] font-bold block pt-1">
            Account: frontdesk@vyomi.com
          </span>
        </div>
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreateStaff}
          className="bg-white border-2 border-[#CBD5E1] p-5 rounded-xl shadow-sm space-y-4 max-w-xl"
        >
          <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
            Provision Personnel Account
          </h3>

          {error && <div className="text-xs font-bold text-red-600">{error}</div>}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikramaditya Rao"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border-2 border-[#CBD5E1] rounded px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. staff.id@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border-2 border-[#CBD5E1] rounded px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                Permission Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'SUPER_ADMIN' | 'MANAGER' | 'FRONT_DESK')}
                className="w-full bg-white border-2 border-[#CBD5E1] rounded px-3 py-2 text-xs font-bold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
              >
                <option value="FRONT_DESK">FRONT_DESK (Intake & Counter Cash)</option>
                <option value="MANAGER">MANAGER (Operations & Approvals)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Governance & Security)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                Security Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border-2 border-[#CBD5E1] rounded px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#D97706]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-3.5 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded text-xs font-bold text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded text-xs font-bold shadow-sm"
            >
              Provision Account ✓
            </button>
          </div>
        </form>
      )}

      {/* Staff Directory Table */}
      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-extrabold">Staff Personnel</th>
              <th className="py-3 px-4 font-extrabold">Authentication Email</th>
              <th className="py-3 px-4 font-extrabold">Access Level</th>
              <th className="py-3 px-4 font-extrabold">Station Terminal</th>
              <th className="py-3 px-4 font-extrabold">Last Active Timestamp</th>
              <th className="py-3 px-4 font-extrabold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#64748B] font-medium">
                  Loading personnel directory...
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-[#64748B] font-medium">
                  No staff accounts configured.
                </td>
              </tr>
            ) : (
              staff.map((u) => {
                const meta = getRoleMeta(u.role);
                return (
                  <tr key={u.id} className="hover:bg-[#F8FAFC] transition">
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-[#0F172A] block text-xs">
                        {u.name}
                      </span>
                      <span className="text-[11px] text-[#64748B] font-medium block">
                        {meta.duties}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#334155] font-mono font-semibold">
                      {u.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#475569] font-medium">
                      Patamata Club Desk, Vijayawada
                    </td>
                    <td className="py-3.5 px-4 text-[#475569] font-mono text-[11px]">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-IN', {
                        timeZone: 'Asia/Kolkata',
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      }) : 'Awaiting First Login'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                          u.isActive
                            ? 'border-emerald-300 text-emerald-900 bg-emerald-100'
                            : 'border-red-300 text-red-900 bg-red-100'
                        }`}
                      >
                        {u.isActive ? 'Active Clearance' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
