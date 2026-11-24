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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
        <div>
          <span className="t-label text-[var(--bronze-text)] uppercase tracking-wider font-semibold">
            Access Control & RBAC
          </span>
          <h1 className="t-h2 text-[var(--text-strong)] font-semibold mt-1">
            Staff & Concierge Accounts ({staff.length})
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowAdd(!showAdd)}
          className="btn-solid-light !h-9 !px-4 !text-xs"
        >
          {showAdd ? 'Cancel' : '+ Add Staff User'}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleCreateStaff}
          className="bg-[var(--surface)] border border-[var(--line-2)] p-6 rounded-[2px] shadow-[var(--shadow-card)] space-y-4 max-w-xl"
        >
          <h3 className="t-h3 text-[var(--text-strong)] font-semibold border-b border-[var(--line)] pb-2">
            Provision Staff User
          </h3>

          {error && <div className="text-xs text-[var(--burgundy)]">{error}</div>}

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="Staff name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="staff@vyomi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="light-input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
                Permission Role *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'SUPER_ADMIN' | 'MANAGER' | 'FRONT_DESK')}
                className="light-input"
              >
                <option value="FRONT_DESK">FRONT_DESK (Intake & Search)</option>
                <option value="MANAGER">MANAGER (Export & Mark Paid)</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN (Full Privileges & Refunds)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-strong)] mb-1 uppercase tracking-wider">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="light-input"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="btn-line-light !h-8 !px-3 text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn-solid-light !h-8 !px-4 text-xs">
              Create Account
            </button>
          </div>
        </form>
      )}

      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[2px] shadow-[var(--shadow-card)] overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-[var(--surface-2)] border-b border-[var(--line)] text-[var(--text-faint)] uppercase tracking-wider text-[0.6875rem]">
              <th className="py-3 px-4 font-semibold">Staff Member</th>
              <th className="py-3 px-4 font-semibold">Email</th>
              <th className="py-3 px-4 font-semibold">Access Level</th>
              <th className="py-3 px-4 font-semibold">Last Active</th>
              <th className="py-3 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[var(--text-faint)]">
                  Loading accounts...
                </td>
              </tr>
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-[var(--text-faint)]">
                  No staff accounts configured.
                </td>
              </tr>
            ) : (
              staff.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--surface-2)]/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-[var(--text-strong)]">
                    {u.name}
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text)]">{u.email}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[0.6875rem] text-[var(--bronze-text)]">
                    {u.role}
                  </td>
                  <td className="py-3.5 px-4 nums text-[var(--text-faint)]">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('en-GB') : 'Never'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[0.625rem] font-bold uppercase tracking-wider border ${
                        u.isActive
                          ? 'border-[var(--success)] text-[var(--success)] bg-[var(--surface)]'
                          : 'border-[var(--burgundy)] text-[var(--burgundy)] bg-[var(--surface)]'
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
