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
        setError(data.error?.message || 'Failed to create staff account');
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
            Access Control & RBAC
          </span>
          <h1 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-0.5 tracking-tight">
            Staff & Concierge Accounts ({staff.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="px-3.5 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded-lg text-xs font-bold transition shadow-sm"
        >
          {showAdd ? 'Cancel' : '+ Add Staff User'}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreateStaff}
          className="bg-white border-2 border-[#CBD5E1] p-5 rounded-xl shadow-sm space-y-4 max-w-xl"
        >
          <h3 className="text-sm font-extrabold text-[#0F172A] border-b border-[#E2E8F0] pb-2">
            Provision Staff User
          </h3>

          {error && <div className="text-xs font-bold text-red-600">{error}</div>}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Staff name"
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
                placeholder="staff@vyomi.com"
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
                <option value="FRONT_DESK">FRONT_DESK (Intake & Search)</option>
                <option value="MANAGER">MANAGER (Export & Mark Paid)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Privileges & Refunds)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1 uppercase tracking-wider">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
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
              className="px-3 py-1.5 bg-white border border-[#CBD5E1] hover:border-[#D97706] rounded text-xs font-bold text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white rounded text-xs font-bold"
            >
              Create Account
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border-2 border-[#CBD5E1] rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[#F8FAFC] border-b-2 border-[#CBD5E1] text-[#0F172A] uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4 font-extrabold">Staff Member</th>
              <th className="py-3 px-4 font-extrabold">Email</th>
              <th className="py-3 px-4 font-extrabold">Access Level</th>
              <th className="py-3 px-4 font-extrabold">Last Active</th>
              <th className="py-3 px-4 font-extrabold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#64748B] font-medium">
                  Loading accounts...
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[#64748B] font-medium">
                  No staff accounts configured.
                </td>
              </tr>
            ) : (
              staff.map((u) => (
                <tr key={u.id} className="hover:bg-[#F8FAFC] transition">
                  <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                    {u.name}
                  </td>
                  <td className="py-3.5 px-4 text-[#334155] font-semibold">{u.email}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[11px] text-[#D97706]">
                    {u.role}
                  </td>
                  <td className="py-3.5 px-4 text-[#475569]">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-GB') : 'Never'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${
                        u.isActive
                          ? 'border-emerald-300 text-emerald-900 bg-emerald-100'
                          : 'border-red-300 text-red-900 bg-red-100'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </span>
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
